import * as THREE from "three";
import { GLTFLoader, GLTFExporter, RGBELoader } from "three-stdlib";
import { decryptFile } from "./components/Character/utils/decrypt";
import { customizeCharacter } from "./components/Character/utils/customizeCharacter";
import setAnimations from "./components/Character/utils/animationUtils";

const host = document.getElementById("viewer")!;
const status = document.getElementById("status")!;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
host.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
const target = new THREE.Vector3(0, 13.05, 0.2);
const key = new THREE.DirectionalLight(0xfff4e9, 2.1);
key.position.set(-4, 17, 8);
scene.add(key);
const fill = new THREE.DirectionalLight(0xe2e9ff, 0.85);
fill.position.set(5, 14, 5);
scene.add(fill, new THREE.AmbientLight(0xffffff, 0.45));
const rim = new THREE.DirectionalLight(0xc2a4ff, 1.3);
rim.position.set(2, 15, -5);
scene.add(rim);
new RGBELoader().load("/models/char_enviorment.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  scene.environmentIntensity = 0.35;
});

function resize() {
  renderer.setSize(host.clientWidth, host.clientHeight);
  camera.aspect = host.clientWidth / host.clientHeight;
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener("resize", resize);

let angle = 0;
let desiredAngle = 0;
let turning = false;
let moving = true;
let pointerX = 0;
let pointerY = 0;
let resetExpression = () => {};
host.addEventListener("pointermove", (event) => {
  pointerX = (event.clientX / host.clientWidth - 0.5) * 0.4;
  pointerY = (event.clientY / host.clientHeight - 0.5) * 0.2;
});
host.addEventListener("pointerleave", () => { pointerX = 0; pointerY = 0; });
const angleButtons = document.querySelectorAll<HTMLButtonElement>("[data-angle]");
angleButtons.forEach((button) => button.addEventListener("click", () => {
  desiredAngle = Number(button.dataset.angle);
  turning = false;
  document.getElementById("rotate")!.setAttribute("aria-pressed", "false");
  angleButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
}));
document.getElementById("rotate")!.addEventListener("click", (event) => {
  turning = !turning;
  (event.currentTarget as HTMLElement).setAttribute("aria-pressed", String(turning));
});
document.getElementById("motion")!.addEventListener("click", (event) => {
  moving = !moving;
  if (!moving) resetExpression();
  const button = event.currentTarget as HTMLElement;
  button.setAttribute("aria-pressed", String(moving));
  button.textContent = `Motion: ${moving ? "on" : "off"}`;
});

async function loadAvatar() {
try {
  const bytes = await decryptFile("/models/character.enc", "Character3D#@");
  const gltf = await new GLTFLoader().parseAsync(bytes, "/models/");
  const model = gltf.scene;
  // The website scroll scene also contains a desk, keyboard and room props.
  model.traverse((object) => {
    if ((object as THREE.Mesh).isMesh && !(object as THREE.SkinnedMesh).isSkinnedMesh && object.name !== "hair") object.visible = false;
  });
  customizeCharacter(model);
  scene.add(model);
  const animations = setAnimations(gltf);
  const earrings = model.getObjectByName("hoangEarrings")?.children.length ?? 0;
  const skinned = model.getObjectByName("Plane007") as THREE.SkinnedMesh;
  resetExpression = () => skinned.morphTargetInfluences?.fill(0);
  status.dataset.earrings = String(earrings);
  status.dataset.bones = String(skinned.skeleton.bones.length);
  status.dataset.clips = String(gltf.animations.length);
  animations.startIntro();
  const head = model.getObjectByName("spine006")!;
  const clock = new THREE.Clock();
  let headX = -0.28;
  let headY = 0;
  let frames = 0;
  let elapsed = 0;
  renderer.setAnimationLoop(() => {
    const delta = Math.min(clock.getDelta(), 0.05);
    if (moving) animations.mixer.update(delta);
    if (head && moving && !animations.isIntroPlaying()) {
      headY = THREE.MathUtils.damp(headY, pointerX, 7, delta);
      headX = THREE.MathUtils.damp(headX, -0.28 + pointerY, 7, delta);
      head.rotation.y = headY;
      head.rotation.x = headX;
    }
    if (turning) desiredAngle += delta * 0.35;
    angle = THREE.MathUtils.damp(angle, desiredAngle, 7, delta);
    const distance = camera.aspect < 0.8 ? 10.3 : 8.5;
    camera.position.set(Math.sin(angle) * distance, 13.45, Math.cos(angle) * distance);
    camera.lookAt(target);
    renderer.render(scene, camera);
    elapsed += delta;
    frames++;
    if (elapsed >= 1) {
      status.textContent = `${gltf.animations.length} animation clips · ${earrings} earrings · ${Math.round(frames / elapsed)} fps`;
      frames = 0;
      elapsed = 0;
    }
  });

  document.getElementById("export")!.addEventListener("click", async () => {
    const button = document.getElementById("export") as HTMLButtonElement;
    button.disabled = true;
    status.textContent = "Exporting rigged GLB…";
    const wasMoving = moving, wasTurning = turning;
    const expression = skinned.morphTargetInfluences?.slice();
    moving = false;
    turning = false;
    skinned.morphTargetInfluences?.fill(0);
    const poses: { object: THREE.Object3D; position: THREE.Vector3; quaternion: THREE.Quaternion; scale: THREE.Vector3 }[] = [];
    model.traverse((object) => poses.push({ object, position: object.position.clone(), quaternion: object.quaternion.clone(), scale: object.scale.clone() }));
    model.traverse((object) => { if ((object as THREE.SkinnedMesh).isSkinnedMesh) (object as THREE.SkinnedMesh).skeleton.pose(); });
    model.updateMatrixWorld(true);
    try {
      const result = await new GLTFExporter().parseAsync(model, { binary: true, animations: gltf.animations.filter((clip) => !clip.name.startsWith("key")), onlyVisible: true });
      const url = URL.createObjectURL(new Blob([result as ArrayBuffer], { type: "model/gltf-binary" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "hoang-avatar.glb";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      poses.forEach(({ object, position, quaternion, scale }) => { object.position.copy(position); object.quaternion.copy(quaternion); object.scale.copy(scale); });
      moving = wasMoving;
      turning = wasTurning;
      expression?.forEach((value, index) => { skinned.morphTargetInfluences![index] = value; });
      button.disabled = false;
    }
  });
} catch (error) {
  status.textContent = `Avatar failed to load: ${String(error)}`;
  console.error(error);
}
}
void loadAvatar();
