import * as THREE from "three";

/**
 * Customizes the 3D character to match Hoang Nguyen (Nguyen Le Minh Hoang):
 * - Natural healthy warm radiant Asian skin tone (mặt, cổ, tai, tay)
 * - Matte black crewneck T-shirt (áo thun đen)
 * - Transparent acetate square glasses (kính gọng vuông trong suốt, viền sáng bóng)
 * - Middle-parted curtain bangs hairstyle (tóc hai mái rẽ ngôi tự nhiên)
 * - Golden blonde mullet nape hair (phần gáy tóc dài hơn màu vàng nổi bật, ôm nhẹ hai bên cổ)
 * - Clean natural eyes and eyebrows
 */
export function customizeCharacter(character: THREE.Object3D) {
  // 1. Color palette tailored to user's photo
  const skinColor = new THREE.Color("#fae4d7"); // Fair, luminous, healthy Asian skin tone
  const shirtColor = new THREE.Color("#131315"); // Deep matte black crewneck T-shirt
  const hairColor = new THREE.Color("#161418"); // Natural dark espresso black
  const browColor = new THREE.Color("#18161a"); // Refined dark eyebrows
  const eyesColor = new THREE.Color("#1a1820"); // Natural deep dark eyes
  const pantsColor = new THREE.Color("#1c1b22"); // Dark denim pants

  // 2. Traverse all meshes and assign independent materials
  // Note: Three.js GLTFLoader sanitizes dots in node names (e.g. Plane.007 -> Plane007, BODY.SHIRT -> BODYSHIRT)
  character.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const name = mesh.name;

      if (
        name.includes("Plane007") ||
        name.includes("Plane.007") ||
        name.includes("Face") ||
        name.includes("Ear") ||
        name.includes("Neck") ||
        name.includes("Hand")
      ) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: skinColor,
          roughness: 0.48,
          metalness: 0.0,
          emissive: new THREE.Color("#221411"),
          emissiveIntensity: 0.08, // Subtle subsurface glow for lively skin
        });
      } else if (name.includes("SHIRT") || name.includes("BODY")) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: shirtColor,
          roughness: 0.90,
          metalness: 0.02,
        });
      } else if (name.includes("hair") || name.includes("Hair")) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: hairColor,
          roughness: 0.70,
          metalness: 0.04,
        });
      } else if (name.includes("Eyebrow") || name.includes("eyebrow")) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: browColor,
          roughness: 0.8,
          metalness: 0.0,
        });
      } else if (name.includes("EYEs") || name.includes("Eyes")) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: eyesColor,
          roughness: 0.15,
          metalness: 0.1,
        });
      } else if (name.includes("Pant")) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: pantsColor,
          roughness: 0.85,
          metalness: 0.02,
        });
      }
    }
  });

  // 3. Find head bone to attach head accessories and hairstyles
  const headBone =
    character.getObjectByName("spine006") ||
    character.getObjectByName("spine.006") ||
    character;

  // Add stylish transparent square glasses matching user's photo
  const glasses = createTransparentGlasses();
  headBone.add(glasses);

  // Add golden blonde mullet nape hair (phần gáy tóc dài hơn màu vàng)
  const blondeNape = createBlondeMulletNape();
  headBone.add(blondeNape);
}

/**
 * Creates stylish clear transparent acetate glasses matching user's photo:
 * - Square frame with smooth rounded corners
 * - Luminous translucent clear acetate with glossy reflections
 * - Precise eye center positioning (y = 1.28)
 * - Silver hinge rivets on outer temples
 */
function createTransparentGlasses(): THREE.Group {
  const group = new THREE.Group();
  group.name = "hoangGlasses";

  // Translucent glossy clear acetate material that stays bright and crystal-clear
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.68,
    roughness: 0.08,
    metalness: 0.15,
    emissive: 0xffffff,
    emissiveIntensity: 0.22, // Keeps the clear acetate bright and readable
  });

  const lensMat = new THREE.MeshStandardMaterial({
    color: 0xf0f7ff,
    transparent: true,
    opacity: 0.16,
    roughness: 0.04,
    metalness: 0.05,
    emissive: 0xeef6ff,
    emissiveIntensity: 0.10,
  });

  const silverHingeMat = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0,
    metalness: 0.95,
    roughness: 0.15,
  });

  const rimWidth = 0.38;
  const rimHeight = 0.30;
  const rimRadius = 0.06;
  const rimThick = 0.034;

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
      depth: 0.035,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.007,
      bevelThickness: 0.007,
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

  // Eye centers are at x = ±0.34, y = 1.28, z = 1.08
  // Left Eye Rim & Lens
  const leftRim = new THREE.Mesh(rimGeo, frameMat);
  leftRim.position.set(0.35, 1.28, 1.09);
  leftRim.rotation.x = -0.04;
  group.add(leftRim);

  const leftLens = new THREE.Mesh(lensGeo, lensMat);
  leftLens.position.set(0.35, 1.28, 1.105);
  leftLens.rotation.x = -0.04;
  group.add(leftLens);

  // Right Eye Rim & Lens
  const rightRim = new THREE.Mesh(rimGeo, frameMat);
  rightRim.position.set(-0.35, 1.28, 1.09);
  rightRim.rotation.x = -0.04;
  group.add(rightRim);

  const rightLens = new THREE.Mesh(lensGeo, lensMat);
  rightLens.position.set(-0.35, 1.28, 1.105);
  rightLens.rotation.x = -0.04;
  group.add(rightLens);

  // Nose Bridge connecting the two rims
  const bridgeGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.28, 8);
  const bridge = new THREE.Mesh(bridgeGeo, frameMat);
  bridge.rotation.z = Math.PI / 2;
  bridge.position.set(0, 1.32, 1.10);
  group.add(bridge);

  // Temple Arms going back towards the ears
  const templeArmGeo = new THREE.BoxGeometry(0.024, 0.032, 1.05);

  const leftArm = new THREE.Mesh(templeArmGeo, frameMat);
  leftArm.position.set(0.55, 1.30, 0.55);
  leftArm.rotation.y = -0.07;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(templeArmGeo, frameMat);
  rightArm.position.set(-0.55, 1.30, 0.55);
  rightArm.rotation.y = 0.07;
  group.add(rightArm);

  // Silver metal hinge rivets on the outer front corners
  const hingeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.025, 8);
  const leftHinge = new THREE.Mesh(hingeGeo, silverHingeMat);
  leftHinge.rotation.x = Math.PI / 2;
  leftHinge.position.set(0.55, 1.32, 1.11);
  group.add(leftHinge);

  const rightHinge = new THREE.Mesh(hingeGeo, silverHingeMat);
  rightHinge.rotation.x = Math.PI / 2;
  rightHinge.position.set(-0.55, 1.32, 1.11);
  group.add(rightHinge);

  return group;
}


/**
 * Creates golden blonde mullet/wolf-cut nape hair locks
 * extending gracefully down the back of the neck and
 * flaring visibly around the neck/ears when viewed from the front.
 */
function createBlondeMulletNape(): THREE.Group {
  const group = new THREE.Group();
  group.name = "hoangBlondeNape";

  const goldenBlonde = new THREE.MeshStandardMaterial({
    color: "#e2ad35", // Warm radiant golden blonde
    roughness: 0.58,
    metalness: 0.08,
  });

  const sunlitBlonde = new THREE.MeshStandardMaterial({
    color: "#f5cc5a", // Bright sunlit blonde highlight
    roughness: 0.52,
    metalness: 0.10,
  });

  const richHoneyBlonde = new THREE.MeshStandardMaterial({
    color: "#d49a28", // Deep rich honey blonde for layered depth
    roughness: 0.62,
    metalness: 0.06,
  });

  function makeLock(
    points: THREE.Vector3[],
    radius: number,
    material: THREE.Material
  ) {
    const curve = new THREE.CatmullRomCurve3(points);
    const geom = new THREE.TubeGeometry(curve, 20, radius, 8, false);
    return new THREE.Mesh(geom, material);
  }

  // 1. Visible Side Flared Wings (peeking out from below ears, clearly visible from the front!)
  // Left side wings:
  const leftWing1 = makeLock([
    new THREE.Vector3(0.56, 0.90, -0.12),
    new THREE.Vector3(0.72, 0.60, -0.20),
    new THREE.Vector3(0.80, 0.28, -0.28),
    new THREE.Vector3(0.76, -0.08, -0.36),
    new THREE.Vector3(0.68, -0.32, -0.42),
  ], 0.082, sunlitBlonde);
  group.add(leftWing1);

  const leftWing2 = makeLock([
    new THREE.Vector3(0.48, 0.85, -0.20),
    new THREE.Vector3(0.66, 0.54, -0.28),
    new THREE.Vector3(0.76, 0.20, -0.36),
    new THREE.Vector3(0.72, -0.15, -0.44),
    new THREE.Vector3(0.64, -0.38, -0.48),
  ], 0.078, goldenBlonde);
  group.add(leftWing2);

  const leftWing3 = makeLock([
    new THREE.Vector3(0.62, 0.76, -0.16),
    new THREE.Vector3(0.78, 0.44, -0.24),
    new THREE.Vector3(0.84, 0.12, -0.32),
    new THREE.Vector3(0.78, -0.22, -0.40),
  ], 0.072, richHoneyBlonde);
  group.add(leftWing3);

  // Right side wings:
  const rightWing1 = makeLock([
    new THREE.Vector3(-0.56, 0.90, -0.12),
    new THREE.Vector3(-0.72, 0.60, -0.20),
    new THREE.Vector3(-0.80, 0.28, -0.28),
    new THREE.Vector3(-0.76, -0.08, -0.36),
    new THREE.Vector3(-0.68, -0.32, -0.42),
  ], 0.082, sunlitBlonde);
  group.add(rightWing1);

  const rightWing2 = makeLock([
    new THREE.Vector3(-0.48, 0.85, -0.20),
    new THREE.Vector3(-0.66, 0.54, -0.28),
    new THREE.Vector3(-0.76, 0.20, -0.36),
    new THREE.Vector3(-0.72, -0.15, -0.44),
    new THREE.Vector3(-0.64, -0.38, -0.48),
  ], 0.078, goldenBlonde);
  group.add(rightWing2);

  const rightWing3 = makeLock([
    new THREE.Vector3(-0.62, 0.76, -0.16),
    new THREE.Vector3(-0.78, 0.44, -0.24),
    new THREE.Vector3(-0.84, 0.12, -0.32),
    new THREE.Vector3(-0.78, -0.22, -0.40),
  ], 0.072, richHoneyBlonde);
  group.add(rightWing3);

  // 2. Full Nape Waterfall Locks (covering back of neck and draping over collar)
  const centerLock1 = makeLock([
    new THREE.Vector3(0.00, 0.90, -0.55),
    new THREE.Vector3(0.00, 0.55, -0.66),
    new THREE.Vector3(0.00, 0.18, -0.72),
    new THREE.Vector3(0.00, -0.22, -0.70),
    new THREE.Vector3(0.00, -0.45, -0.64),
  ], 0.092, sunlitBlonde);
  group.add(centerLock1);

  const centerLock2 = makeLock([
    new THREE.Vector3(0.12, 0.85, -0.54),
    new THREE.Vector3(0.15, 0.50, -0.64),
    new THREE.Vector3(0.16, 0.12, -0.70),
    new THREE.Vector3(0.14, -0.25, -0.68),
    new THREE.Vector3(0.10, -0.48, -0.62),
  ], 0.086, goldenBlonde);
  group.add(centerLock2);

  const centerLock3 = makeLock([
    new THREE.Vector3(-0.12, 0.85, -0.54),
    new THREE.Vector3(-0.15, 0.50, -0.64),
    new THREE.Vector3(-0.16, 0.12, -0.70),
    new THREE.Vector3(-0.14, -0.25, -0.68),
    new THREE.Vector3(-0.10, -0.48, -0.62),
  ], 0.086, goldenBlonde);
  group.add(centerLock3);

  const centerLock4 = makeLock([
    new THREE.Vector3(0.26, 0.80, -0.50),
    new THREE.Vector3(0.30, 0.44, -0.60),
    new THREE.Vector3(0.32, 0.08, -0.66),
    new THREE.Vector3(0.28, -0.28, -0.62),
  ], 0.080, richHoneyBlonde);
  group.add(centerLock4);

  const centerLock5 = makeLock([
    new THREE.Vector3(-0.26, 0.80, -0.50),
    new THREE.Vector3(-0.30, 0.44, -0.60),
    new THREE.Vector3(-0.32, 0.08, -0.66),
    new THREE.Vector3(-0.28, -0.28, -0.62),
  ], 0.080, richHoneyBlonde);
  group.add(centerLock5);

  const centerLock6 = makeLock([
    new THREE.Vector3(0.40, 0.75, -0.44),
    new THREE.Vector3(0.46, 0.38, -0.52),
    new THREE.Vector3(0.50, 0.02, -0.56),
    new THREE.Vector3(0.44, -0.32, -0.50),
  ], 0.076, sunlitBlonde);
  group.add(centerLock6);

  const centerLock7 = makeLock([
    new THREE.Vector3(-0.40, 0.75, -0.44),
    new THREE.Vector3(-0.46, 0.38, -0.52),
    new THREE.Vector3(-0.50, 0.02, -0.56),
    new THREE.Vector3(-0.44, -0.32, -0.50),
  ], 0.076, sunlitBlonde);
  group.add(centerLock7);

  return group;
}
