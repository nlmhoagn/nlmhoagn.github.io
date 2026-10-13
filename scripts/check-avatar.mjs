import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as THREE from "three";
import { createDecipheriv, createHash } from "node:crypto";

function loadSource(path, window = {}) {
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  const require = createRequire(import.meta.url);
  runInNewContext(code, { module, exports: module.exports, require: (name) => name === "./layeredHair" ? loadSource("../src/components/Character/utils/layeredHair.ts") : require(name), window });
  return module.exports;
}

const mouse = loadSource("../src/components/Character/utils/mouseUtils.ts", { scrollY: 0, innerWidth: 1440 });
const rotations = [30, 60, 120].map((fps) => {
  const head = new THREE.Object3D(), rotation = new THREE.Euler(-0.28, 0, 0);
  for (let frame = 0; frame < fps; frame++) mouse.handleHeadRotation(head, 0.5, 0.15, 0.1, 0.2, 1 / fps, rotation);
  return [rotation.x, rotation.y];
});
rotations.slice(1).forEach((rotation) => rotation.forEach((value, axis) => assert(Math.abs(value - rotations[0][axis]) < 1e-8, "Head movement depends on refresh rate")));

const hair = loadSource("../src/components/Character/utils/layeredHair.ts").createLayeredHair();
let vertices = 0, triangles = 0;
hair.traverse((object) => {
  if (!object.isMesh) return;
  const positions = object.geometry.getAttribute("position"), normals = object.geometry.getAttribute("normal");
  assert.equal(positions.count, normals.count);
  for (const value of [...positions.array, ...normals.array]) assert(Number.isFinite(value), "Invalid hair geometry");
  for (const index of object.geometry.index.array) assert(index < positions.count, "Invalid triangle index");
  const anchors = object.userData.scalpAnchors ?? [];
  for (let i = 0; i < anchors.length; i += 4) {
    assert(new THREE.Vector3().fromBufferAttribute(positions, anchors[i]).distanceTo(new THREE.Vector3(anchors[i + 1], anchors[i + 2], anchors[i + 3])) < 1e-6, "Hair lock has detached scalp edges");
  }
  // The front UV seam must be closed even after applying the swept direction.
  if (object.name === "hoangLayeredScalp") {
    const uv = object.geometry.getAttribute("uv");
    const firstEdges = new Map();
    for (let vertex = 0; vertex < uv.count; vertex++) {
      if (uv.getX(vertex) === 0) firstEdges.set(uv.getY(vertex), vertex);
      if (uv.getX(vertex) === 1) {
        const first = firstEdges.get(uv.getY(vertex));
        assert(first !== undefined);
        const a = new THREE.Vector3().fromBufferAttribute(positions, first);
        const b = new THREE.Vector3().fromBufferAttribute(positions, vertex);
        assert(a.distanceTo(b) < 1e-6, "Open forehead seam in the haircut");
      }
    }
  }
  vertices += positions.count;
  triangles += object.geometry.index.count / 3;
});
assert(triangles < 40000, "Hair exceeds the intended geometry budget");
assert.equal(hair.children.filter((object) => object.name === "hoangLayeredScalp").length, 1);
assert.equal(hair.children.filter((object) => object.name.startsWith("hoangHairLock")).length, 12);

const character = new THREE.Object3D();
loadSource("../src/components/Character/utils/customizeCharacter.ts").customizeCharacter(character);
const nape = character.getObjectByName("hoangBlondeNape");
assert.equal(nape.children.length, 1, "Nape must have continuous coverage");
const scalp = character.getObjectByName("hoangLayeredScalp");
const scalpPositions = scalp.geometry.getAttribute("position"), scalpNormals = scalp.geometry.getAttribute("normal"), scalpUV = scalp.geometry.getAttribute("uv");
const napePositions = nape.children[0].geometry.getAttribute("position"), napeNormals = nape.children[0].geometry.getAttribute("normal");
const border = [];
for (let i = 0; i < scalpUV.count; i++) {
  if (scalpUV.getY(i) === 1 && scalpUV.getX(i) >= 0.25 && scalpUV.getX(i) <= 0.75) border.push(i);
}
border.forEach((vertex, column) => {
  assert(new THREE.Vector3().fromBufferAttribute(scalpPositions, vertex).distanceTo(new THREE.Vector3().fromBufferAttribute(napePositions, column)) < 1e-6, "Gap between black hair and blonde roots");
  assert(new THREE.Vector3().fromBufferAttribute(scalpNormals, vertex).distanceTo(new THREE.Vector3().fromBufferAttribute(napeNormals, column)) < 1e-6, "Broken shading at the nape join");
});
assert.equal(scalp.material.bumpMap, null, "Carbon-like strand texture must be removed");
assert.equal(character.getObjectByName("hoangEarrings").children.length, 4);
const ears = character.getObjectByName("hoangRealisticEars");
ears.children.forEach((ear) => assert.equal(ear.children.length, 2, "Cartilage must be integrated into the ear backing"));
[nape, ears].forEach((group) => group.traverse((object) => {
  if (!object.isMesh) return;
  const positions = object.geometry.getAttribute("position");
  for (const value of [...positions.array, ...object.geometry.getAttribute("normal").array]) assert(Number.isFinite(value));
  for (const index of object.geometry.index.array) assert(index < positions.count);
}));

// Compare the actual skull vertices with the blonde envelope in head-bone coordinates.
const encrypted = readFileSync(new URL("../public/models/character.enc", import.meta.url));
const decipher = createDecipheriv("aes-256-cbc", createHash("sha256").update("Character3D#@").digest(), encrypted.subarray(0, 16));
const glb = Buffer.concat([decipher.update(encrypted.subarray(16)), decipher.final()]);
const length = glb.readUInt32LE(12), json = JSON.parse(glb.subarray(20, 20 + length).toString()), bin = glb.subarray(28 + length);
const nodes = json.nodes.map((node) => {
  const object = new THREE.Object3D();
  if (node.matrix) object.applyMatrix4(new THREE.Matrix4().fromArray(node.matrix));
  else {
    if (node.translation) object.position.fromArray(node.translation);
    if (node.rotation) object.quaternion.fromArray(node.rotation);
    if (node.scale) object.scale.fromArray(node.scale);
  }
  return object;
});
json.nodes.forEach((node, index) => (node.children ?? []).forEach((child) => nodes[index].add(nodes[child])));
nodes.forEach((node) => node.updateMatrixWorld(true));
const headIndex = json.nodes.findIndex((node) => node.name === "spine.006");
const meshIndex = json.nodes.findIndex((node) => node.name === "Plane.007");
const transform = nodes[headIndex].matrixWorld.clone().invert().multiply(nodes[meshIndex].matrixWorld);
const primitive = json.meshes[json.nodes[meshIndex].mesh].primitives[0];
const accessor = json.accessors[primitive.attributes.POSITION], view = json.bufferViews[accessor.bufferView];
let covered = 0;
for (let i = 0; i < accessor.count; i++) {
  const offset = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0) + i * (view.byteStride ?? 12);
  const point = new THREE.Vector3(bin.readFloatLE(offset), bin.readFloatLE(offset + 4), bin.readFloatLE(offset + 8)).applyMatrix4(transform);
  if (point.z >= -0.05 || point.y > 1.28 || point.y < -0.15) continue;
  let theta = Math.atan2(point.x, point.z);
  if (theta < 0) theta += Math.PI * 2;
  const column = THREE.MathUtils.clamp((theta - Math.PI / 2) / Math.PI * (border.length - 1), 0, border.length - 1);
  function surface(row) {
    const first = row * border.length + Math.floor(column), last = row * border.length + Math.ceil(column);
    return new THREE.Vector3().fromBufferAttribute(napePositions, first).lerp(new THREE.Vector3().fromBufferAttribute(napePositions, last), column % 1);
  }
  for (let row = 1; row < napePositions.count / border.length; row++) {
    const top = surface(row - 1), bottom = surface(row);
    if (point.y > top.y || point.y < bottom.y) continue;
    const outer = top.lerp(bottom, (top.y - point.y) / (top.y - bottom.y));
    assert(Math.hypot(point.x, point.z) < Math.hypot(outer.x, outer.z), `Skull intersects the actual nape at ${point.toArray()}`);
    covered++;
    break;
  }
}
assert(covered > 100, "Rear skull coverage was not checked");
console.log(`PASS: attached crossing locks (${vertices} vertices, ${triangles} triangles), ${border.length} joined nape vertices and normals, ${covered} rear skull vertices covered, integrated ears, four earrings and head follow at 30/60/120 Hz.`);
