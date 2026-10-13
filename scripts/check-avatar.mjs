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
assert.equal(hair.children.length, 1, "Black hair must be one continuous surface");

const character = new THREE.Object3D();
loadSource("../src/components/Character/utils/customizeCharacter.ts").customizeCharacter(character);
const nape = character.getObjectByName("hoangBlondeNape");
assert.equal(nape.children.length, 1, "Nape must have continuous coverage");
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
  const v = (1.28 - point.y) / 1.55;
  const root = 1 - THREE.MathUtils.smoothstep(v, 0, 0.20);
  const radiusX = 1.055 - 0.32 * v * v - 0.07 * root, radiusZ = 0.91 - 0.33 * v * v - 0.10 * root;
  assert((point.x / radiusX) ** 2 + (point.z / radiusZ) ** 2 < 1, `Skull intersects the nape at ${point.toArray()}`);
  covered++;
}
assert(covered > 100, "Rear skull coverage was not checked");
console.log(`PASS: continuous hair (${vertices} vertices, ${triangles} triangles), ${covered} rear skull vertices covered, integrated ears, four earrings and head follow at 30/60/120 Hz.`);
