import * as THREE from "three";

/**
 * Customizes the 3D character to match Hoang Nguyen:
 * - Natural healthy skin tone
 * - Matte black T-shirt (áo thun đen)
 * - Transparent acetate glasses (kính gọng vuông trong suốt)
 * - Deep dark eyes and refined eyebrows
 * - Natural dark hair on top
 * - Extended golden blonde nape hair (phần gáy tóc dài hơn có màu vàng - mullet/wolf-cut)
 */
export function customizeCharacter(character: THREE.Object3D) {
  // 1. Natural warm Asian skin tone
  const skinColor = new THREE.Color("#edd0c2");
  ["Face.002", "Ear.001", "Neck", "Hand"].forEach((partName) => {
    const part = character.getObjectByName(partName) as THREE.Mesh;
    if (part && part.material) {
      part.material = (part.material as THREE.MeshStandardMaterial).clone();
      const mat = part.material as THREE.MeshStandardMaterial;
      mat.color.copy(skinColor);
      mat.roughness = 0.65;
      mat.metalness = 0.02;
    }
  });

  // 2. Black crewneck T-shirt
  const shirt = character.getObjectByName("BODY.SHIRT") as THREE.Mesh;
  if (shirt && shirt.material) {
    shirt.material = (shirt.material as THREE.MeshStandardMaterial).clone();
    const shirtMat = shirt.material as THREE.MeshStandardMaterial;
    shirtMat.color.set("#131315");
    shirtMat.roughness = 0.85;
    shirtMat.metalness = 0.05;
  }

  // 3. Hair on top (Natural dark espresso black)
  const hair = character.getObjectByName("hair") as THREE.Mesh;
  if (hair && hair.material) {
    hair.material = (hair.material as THREE.MeshStandardMaterial).clone();
    const hairMat = hair.material as THREE.MeshStandardMaterial;
    hairMat.color.set("#19161a");
    hairMat.roughness = 0.72;
    hairMat.metalness = 0.05;
  }

  // 4. Eyebrows
  const eyebrow = character.getObjectByName("Eyebrow") as THREE.Mesh;
  if (eyebrow && eyebrow.material) {
    eyebrow.material = (eyebrow.material as THREE.MeshStandardMaterial).clone();
    const eyeMat = eyebrow.material as THREE.MeshStandardMaterial;
    eyeMat.color.set("#18151c");
  }

  // 5. Eyes (Deep dark natural eyes with focused reflection)
  const eyes = character.getObjectByName("EYEs.001") as THREE.Mesh;
  if (eyes && eyes.material) {
    eyes.material = (eyes.material as THREE.MeshStandardMaterial).clone();
    const eyeMat = eyes.material as THREE.MeshStandardMaterial;
    eyeMat.color.set("#1c1822");
    eyeMat.roughness = 0.2;
    eyeMat.metalness = 0.1;
  }

  // 6. Find head bone to attach glasses and blonde mullet nape
  const headBone =
    character.getObjectByName("spine006") ||
    character.getObjectByName("spine.006") ||
    character;

  // Add transparent square glasses
  const glasses = createTransparentGlasses();
  headBone.add(glasses);

  // Add golden blonde nape hair locks (gáy dài màu vàng)
  const blondeNape = createBlondeMulletNape();
  headBone.add(blondeNape);
}

/**
 * Creates stylish clear transparent acetate glasses
 */
function createTransparentGlasses(): THREE.Group {
  const group = new THREE.Group();
  group.name = "hoangGlasses";

  const frameMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.58,
    roughness: 0.08,
    transmission: 0.88,
    ior: 1.48,
    reflectivity: 0.6,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });

  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0xf5f8ff,
    transparent: true,
    opacity: 0.18,
    roughness: 0.03,
    transmission: 0.96,
    ior: 1.5,
  });

  const silverHingeMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.9,
    roughness: 0.2,
  });

  const rimWidth = 0.44;
  const rimHeight = 0.35;
  const rimRadius = 0.08;
  const rimThick = 0.036;

  // Rim geometry helper
  function makeRimGeometry() {
    const shape = new THREE.Shape();
    const x = -rimWidth / 2;
    const y = -rimHeight / 2;
    shape.moveTo(x + rimRadius, y);
    shape.lineTo(x + rimWidth - rimRadius, y);
    shape.quadraticCurveTo(x + rimWidth, y, x + rimWidth, y + rimRadius);
    shape.lineTo(x + rimWidth, y + rimHeight - rimRadius);
    shape.quadraticCurveTo(x + rimWidth, y + rimHeight, x + rimWidth - rimRadius, y + rimHeight);
    shape.lineTo(x + rimRadius, y + rimHeight);
    shape.quadraticCurveTo(x, y + rimHeight, x, y + rimHeight - rimRadius);
    shape.lineTo(x, y + rimRadius);
    shape.quadraticCurveTo(x, y, x + rimRadius, y);

    const hole = new THREE.Path();
    const iw = rimWidth - rimThick * 2;
    const ih = rimHeight - rimThick * 2;
    const ir = Math.max(0.01, rimRadius - rimThick);
    const ix = -iw / 2;
    const iy = -ih / 2;
    hole.moveTo(ix + ir, iy);
    hole.lineTo(ix + iw - ir, iy);
    hole.quadraticCurveTo(ix + iw, iy, ix + iw, iy + ir);
    hole.lineTo(ix + iw, iy + ih - ir);
    hole.quadraticCurveTo(ix + iw, iy + ih, ix + iw - ir, iy + ih);
    hole.lineTo(ix + ir, iy + ih);
    hole.quadraticCurveTo(ix, iy + ih, ix, iy + ih - ir);
    hole.lineTo(ix + ir, iy + ir);
    hole.quadraticCurveTo(ix, iy, ix + ir, iy);

    shape.holes.push(hole);

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.008,
      bevelThickness: 0.008,
    });
  }

  function makeLensGeometry() {
    const shape = new THREE.Shape();
    const x = -rimWidth / 2;
    const y = -rimHeight / 2;
    shape.moveTo(x + rimRadius, y);
    shape.lineTo(x + rimWidth - rimRadius, y);
    shape.quadraticCurveTo(x + rimWidth, y, x + rimWidth, y + rimRadius);
    shape.lineTo(x + rimWidth, y + rimHeight - rimRadius);
    shape.quadraticCurveTo(x + rimWidth, y + rimHeight, x + rimWidth - rimRadius, y + rimHeight);
    shape.lineTo(x + rimRadius, y + rimHeight);
    shape.quadraticCurveTo(x, y + rimHeight, x, y + rimHeight - rimRadius);
    shape.lineTo(x, y + rimRadius);
    shape.quadraticCurveTo(x, y, x + rimRadius, y);
    return new THREE.ShapeGeometry(shape);
  }

  const rimGeo = makeRimGeometry();
  const lensGeo = makeLensGeometry();

  // Left Eye Rim & Lens
  const leftRim = new THREE.Mesh(rimGeo, frameMat);
  leftRim.position.set(0.38, 1.48, 1.07);
  leftRim.rotation.x = -0.05;
  group.add(leftRim);

  const leftLens = new THREE.Mesh(lensGeo, lensMat);
  leftLens.position.set(0.38, 1.48, 1.085);
  leftLens.rotation.x = -0.05;
  group.add(leftLens);

  // Right Eye Rim & Lens
  const rightRim = new THREE.Mesh(rimGeo, frameMat);
  rightRim.position.set(-0.38, 1.48, 1.07);
  rightRim.rotation.x = -0.05;
  group.add(rightRim);

  const rightLens = new THREE.Mesh(lensGeo, lensMat);
  rightLens.position.set(-0.38, 1.48, 1.085);
  rightLens.rotation.x = -0.05;
  group.add(rightLens);

  // Nose Bridge
  const bridgeGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.30, 8);
  const bridge = new THREE.Mesh(bridgeGeo, frameMat);
  bridge.rotation.z = Math.PI / 2;
  bridge.position.set(0, 1.54, 1.08);
  group.add(bridge);

  // Temple Arms (Càng kính 2 bên tai)
  const templeArmGeo = new THREE.BoxGeometry(0.024, 0.035, 1.15);

  const leftArm = new THREE.Mesh(templeArmGeo, frameMat);
  leftArm.position.set(0.61, 1.50, 0.52);
  leftArm.rotation.y = -0.08;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(templeArmGeo, frameMat);
  rightArm.position.set(-0.61, 1.50, 0.52);
  rightArm.rotation.y = 0.08;
  group.add(rightArm);

  // Silver metal hinge rivets
  const hingeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.03, 8);
  const leftHinge = new THREE.Mesh(hingeGeo, silverHingeMat);
  leftHinge.rotation.x = Math.PI / 2;
  leftHinge.position.set(0.61, 1.50, 1.09);
  group.add(leftHinge);

  const rightHinge = new THREE.Mesh(hingeGeo, silverHingeMat);
  rightHinge.rotation.x = Math.PI / 2;
  rightHinge.position.set(-0.61, 1.50, 1.09);
  group.add(rightHinge);

  return group;
}

/**
 * Creates golden blonde mullet/wolf-cut nape hair locks
 * extending gracefully down the back of the neck
 */
function createBlondeMulletNape(): THREE.Group {
  const group = new THREE.Group();
  group.name = "hoangBlondeNape";

  const blondeMat = new THREE.MeshStandardMaterial({
    color: "#e2ad40", // Warm golden blonde
    roughness: 0.62,
    metalness: 0.12,
  });

  const blondeLightMat = new THREE.MeshStandardMaterial({
    color: "#ecc15a", // Sunlight blonde highlight
    roughness: 0.58,
    metalness: 0.15,
  });

  // Helper to create a curved, tapered hair lock
  function createHairLock(
    length: number,
    topRadius: number,
    _botRadius: number,
    material: THREE.Material
  ) {
    const geom = new THREE.ConeGeometry(topRadius, length, 8);
    // Invert cone so base is at top and tip points down
    geom.rotateX(Math.PI);
    geom.translate(0, -length / 2, 0);
    return new THREE.Mesh(geom, material);
  }

  // Layered locks at the nape (x, y, z, rotX, rotY, rotZ, scale)
  const hairStrands = [
    // Center back locks (longest)
    { x: 0, y: 1.25, z: -0.62, rx: 0.22, ry: 0, rz: 0, len: 0.65, r: 0.16, mat: blondeMat },
    { x: 0, y: 1.15, z: -0.66, rx: 0.30, ry: 0, rz: 0, len: 0.75, r: 0.18, mat: blondeLightMat },
    { x: 0, y: 0.95, z: -0.60, rx: 0.15, ry: 0, rz: 0, len: 0.60, r: 0.14, mat: blondeLightMat },

    // Left nape locks
    { x: 0.22, y: 1.22, z: -0.58, rx: 0.24, ry: -0.15, rz: -0.12, len: 0.62, r: 0.15, mat: blondeMat },
    { x: 0.40, y: 1.18, z: -0.52, rx: 0.22, ry: -0.28, rz: -0.25, len: 0.68, r: 0.16, mat: blondeLightMat },
    { x: 0.58, y: 1.12, z: -0.42, rx: 0.18, ry: -0.40, rz: -0.35, len: 0.58, r: 0.14, mat: blondeMat },
    { x: 0.28, y: 0.98, z: -0.54, rx: 0.18, ry: -0.18, rz: -0.15, len: 0.62, r: 0.15, mat: blondeLightMat },

    // Right nape locks
    { x: -0.22, y: 1.22, z: -0.58, rx: 0.24, ry: 0.15, rz: 0.12, len: 0.62, r: 0.15, mat: blondeMat },
    { x: -0.40, y: 1.18, z: -0.52, rx: 0.22, ry: 0.28, rz: 0.25, len: 0.68, r: 0.16, mat: blondeLightMat },
    { x: -0.58, y: 1.12, z: -0.42, rx: 0.18, ry: 0.40, rz: 0.35, len: 0.58, r: 0.14, mat: blondeMat },
    { x: -0.28, y: 0.98, z: -0.54, rx: 0.18, ry: 0.18, rz: 0.15, len: 0.62, r: 0.15, mat: blondeLightMat },

    // Flared side wings (peeking out behind ears when viewed from front)
    { x: 0.72, y: 1.20, z: -0.28, rx: 0.12, ry: -0.55, rz: -0.40, len: 0.52, r: 0.13, mat: blondeLightMat },
    { x: -0.72, y: 1.20, z: -0.28, rx: 0.12, ry: 0.55, rz: 0.40, len: 0.52, r: 0.13, mat: blondeLightMat },
  ];

  hairStrands.forEach((s) => {
    const lock = createHairLock(s.len, s.r, 0.02, s.mat);
    lock.position.set(s.x, s.y, s.z);
    lock.rotation.set(s.rx, s.ry, s.rz);
    group.add(lock);
  });

  return group;
}
