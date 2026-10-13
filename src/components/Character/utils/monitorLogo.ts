import * as THREE from "three";

/** A nearly flush metallic mark on the rear shell, following the monitor's reveal. */
export function addMonitorLogo(character: THREE.Object3D): THREE.Mesh | undefined {
  const monitor = character.getObjectByName("Plane004") || character.getObjectByName("Plane.004");
  const shell = monitor?.children.find((object) => (object as THREE.Mesh).isMesh && ((object as THREE.Mesh).material as THREE.Material).name === "Material.027") as THREE.Mesh | undefined;
  if (!shell || shell.getObjectByName("imacAppleLogo")) return;

  // Apple brand silhouette from Font Awesome Free / react-icons (CC BY 4.0).
  const body = new THREE.Shape();
  body.moveTo(318.7, 268.7);
  body.bezierCurveTo(318.5, 232, 335.1, 204.3, 368.7, 183.9);
  body.bezierCurveTo(349.9, 157, 321.5, 142.2, 284, 139.3);
  body.bezierCurveTo(248.5, 136.5, 209.7, 160, 195.5, 160);
  body.bezierCurveTo(180.5, 160, 146.1, 140.3, 119.1, 140.3);
  body.bezierCurveTo(63.3, 141.2, 4, 184.8, 4, 273.5);
  body.quadraticCurveTo(4, 312.8, 18.4, 354.7);
  body.bezierCurveTo(31.2, 391.4, 77.4, 481.4, 125.6, 479.9);
  body.bezierCurveTo(150.8, 479.3, 168.6, 462, 201.4, 462);
  body.bezierCurveTo(233.2, 462, 249.7, 479.9, 277.8, 479.9);
  body.bezierCurveTo(326.4, 479.2, 368.2, 397.4, 380.4, 360.6);
  body.bezierCurveTo(315.2, 329.9, 318.7, 270.6, 318.7, 268.7);
  body.closePath();
  const leaf = new THREE.Shape();
  leaf.moveTo(262.1, 104.5);
  leaf.bezierCurveTo(289.4, 72.1, 286.9, 42.6, 286.1, 32);
  leaf.bezierCurveTo(262, 33.4, 234.1, 48.4, 218.2, 66.9);
  leaf.bezierCurveTo(200.7, 86.7, 190.4, 111.2, 192.6, 138.8);
  leaf.bezierCurveTo(218.7, 140.8, 242.5, 127.4, 262.1, 104.5);
  leaf.closePath();
  const geometry = new THREE.ExtrudeGeometry([body, leaf], { depth: 1.2, bevelEnabled: true, bevelSize: 0.6, bevelThickness: 0.5, bevelSegments: 2, steps: 1, curveSegments: 20 });
  const scale = 0.66 / 448;
  geometry.translate(-192, -256, 0);
  geometry.scale(scale, -scale, scale);
  // Reverse the winding after the vertical SVG-axis flip.
  const positions = geometry.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < positions.count; i += 3) {
    const first = new THREE.Vector3().fromBufferAttribute(positions, i);
    positions.setXYZ(i, positions.getX(i + 2), positions.getY(i + 2), positions.getZ(i + 2));
    positions.setXYZ(i + 2, first.x, first.y, first.z);
  }
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({ name: "imacInsetMetal", color: "#b1adb6", metalness: 0.95, roughness: 0.28, envMapIntensity: 1, transparent: true });
  const logo = new THREE.Mesh(geometry, material);
  logo.name = "imacAppleLogo";
  logo.position.set(0, 2.74, -0.075);
  logo.onBeforeRender = () => {
    material.opacity = (shell.material as THREE.MeshStandardMaterial).opacity;
    material.depthWrite = material.opacity > 0.99;
  };
  shell.add(logo);
  return logo;
}
