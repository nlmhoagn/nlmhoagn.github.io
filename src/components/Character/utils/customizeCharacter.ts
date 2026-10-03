import * as THREE from "three";

/**
 * Customizes the 3D character to match Hoang Nguyen (Nguyen Le Minh Hoang):
 * - Natural healthy warm radiant Asian skin tone (mặt, cổ, tai, tay)
 * - Matte black crewneck T-shirt (áo thun đen)
 * - Natural eyes with white sclera (tròng trắng) and deep pupils
 * - Oversized soft-rounded acetate glasses (kính to hơn, bo cong mềm mại không vuông vức)
 * - Two-block hairstyle bangs touching eyebrows (tóc mái two-block dài chạm lông mày)
 * - Golden blonde mullet nape hair (phần gáy tóc dài hơn màu vàng nổi bật)
 * - Silver hoop earrings (khuyên tai vòng):
 *   + Tai trái: 1st lobe, 2nd lobe, và conch
 *   + Tai phải: 1st lobe
 */
export function customizeCharacter(character: THREE.Object3D) {
  // 1. Color palette tailored to user's photo
  const skinColor = new THREE.Color("#fceee5"); // Fair, luminous, healthy radiant Asian skin tone
  const shirtColor = new THREE.Color("#131315"); // Deep matte black crewneck T-shirt
  const hairColor = new THREE.Color("#161418"); // Natural dark espresso black
  const browColor = new THREE.Color("#18161a"); // Refined dark eyebrows
  const pantsColor = new THREE.Color("#1c1b22"); // Dark denim pants

  // 2. Traverse all meshes and assign independent materials
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
          roughness: 0.45,
          metalness: 0.0,
          emissive: new THREE.Color("#35201b"),
          emissiveIntensity: 0.14, // Healthy vibrant glow for youthful skin
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
        // PRESERVE the original eye texture map which contains the white sclera (tròng trắng) and iris!
        if (mesh.material) {
          const eyeMat = (mesh.material as THREE.MeshStandardMaterial).clone();
          eyeMat.color.set(0xffffff); // Pure white tint so sclera renders crisp and clear
          eyeMat.roughness = 0.06;
          eyeMat.metalness = 0.02;
          mesh.material = eyeMat;
        }
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

  // Add oversized rounded acetate glasses (kính to hơn, bo cong mềm mại)
  const glasses = createOversizedGlasses();
  headBone.add(glasses);

  // Add two-block bangs touching eyebrows (tóc mái two-block dài chạm lông mày)
  const bangs = createTwoBlockBangs();
  headBone.add(bangs);

  // Add silver hoop earrings (khuyên tai vòng: trái 1st, 2nd, conch; phải 1st lobe)
  const earrings = createEarrings();
  headBone.add(earrings);

  // Add golden blonde mullet nape hair (phần gáy tóc dài hơn màu vàng)
  const blondeNape = createBlondeMulletNape();
  headBone.add(blondeNape);
}

/**
 * Creates stylish oversized acetate glasses matching user's photo:
 * - Generous fashionable size (width 0.52, height 0.42)
 * - Soft rounded lower contour (không vuông vức)
 * - Clear translucent acetate with bright glossy reflections
 * - Centered naturally in front of eyes
 * - Silver hinge rivets on outer temples
 */
function createOversizedGlasses(): THREE.Group {
  const group = new THREE.Group();
  group.name = "hoangGlasses";

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.60,
    roughness: 0.06,
    metalness: 0.08,
    emissive: 0xffffff,
    emissiveIntensity: 0.22,
  });

  const lensMat = new THREE.MeshStandardMaterial({
    color: 0xf4f8ff,
    transparent: true,
    opacity: 0.12,
    roughness: 0.02,
    metalness: 0.02,
    emissive: 0xedf4ff,
    emissiveIntensity: 0.08,
  });

  const silverHingeMat = new THREE.MeshStandardMaterial({
    color: 0xe5e5e5,
    metalness: 0.98,
    roughness: 0.10,
  });

  const rimWidth = 0.52; // Oversized width
  const rimHeight = 0.42; // Oversized height
  const rimThick = 0.026; // Refined translucent rim thickness

  // Soft rounded contour: gentle brow line on top, smooth generous round curve on bottom
  function makeSoftRoundedRimShape() {
    const shape = new THREE.Shape();
    const halfW = rimWidth / 2;
    const halfH = rimHeight / 2;
    const topRadius = 0.10;
    const botRadius = 0.20; // Deep generous curve gives the soft rounded bottom

    // Outer contour
    shape.moveTo(-halfW + topRadius, halfH);
    shape.lineTo(halfW - topRadius, halfH);
    shape.quadraticCurveTo(halfW, halfH, halfW, halfH - topRadius);
    shape.lineTo(halfW * 0.92, -halfH + botRadius);
    shape.quadraticCurveTo(halfW * 0.92, -halfH, halfW * 0.92 - botRadius, -halfH);
    shape.lineTo(-halfW * 0.92 + botRadius, -halfH);
    shape.quadraticCurveTo(-halfW * 0.92, -halfH, -halfW * 0.92, -halfH + botRadius);
    shape.lineTo(-halfW, halfH - topRadius);
    shape.quadraticCurveTo(-halfW, halfH, -halfW + topRadius, halfH);

    // Inner hole for lens
    const hole = new THREE.Path();
    const iHalfW = halfW - rimThick;
    const iHalfH = halfH - rimThick;
    const iTopR = Math.max(0.02, topRadius - rimThick);
    const iBotR = Math.max(0.04, botRadius - rimThick);

    hole.moveTo(-iHalfW + iTopR, iHalfH);
    hole.lineTo(iHalfW - iTopR, iHalfH);
    hole.quadraticCurveTo(iHalfW, iHalfH, iHalfW, iHalfH - iTopR);
    hole.lineTo(iHalfW * 0.92, -iHalfH + iBotR);
    hole.quadraticCurveTo(iHalfW * 0.92, -iHalfH, iHalfW * 0.92 - iBotR, -iHalfH);
    hole.lineTo(-iHalfW * 0.92 + iBotR, -iHalfH);
    hole.quadraticCurveTo(-iHalfW * 0.92, -iHalfH, -iHalfW * 0.92, -iHalfH + iBotR);
    hole.lineTo(-iHalfW, iHalfH - iTopR);
    hole.quadraticCurveTo(-iHalfW, iHalfH, -iHalfW + iTopR, iHalfH);

    shape.holes.push(hole);

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.030,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.006,
      bevelThickness: 0.006,
    });
  }

  function makeSoftRoundedLensShape() {
    const shape = new THREE.Shape();
    const halfW = rimWidth / 2 - rimThick * 0.5;
    const halfH = rimHeight / 2 - rimThick * 0.5;
    const topRadius = 0.09;
    const botRadius = 0.18;

    shape.moveTo(-halfW + topRadius, halfH);
    shape.lineTo(halfW - topRadius, halfH);
    shape.quadraticCurveTo(halfW, halfH, halfW, halfH - topRadius);
    shape.lineTo(halfW * 0.92, -halfH + botRadius);
    shape.quadraticCurveTo(halfW * 0.92, -halfH, halfW * 0.92 - botRadius, -halfH);
    shape.lineTo(-halfW * 0.92 + botRadius, -halfH);
    shape.quadraticCurveTo(-halfW * 0.92, -halfH, -halfW * 0.92, -halfH + botRadius);
    shape.lineTo(-halfW, halfH - topRadius);
    shape.quadraticCurveTo(-halfW, halfH, -halfW + topRadius, halfH);

    return new THREE.ShapeGeometry(shape);
  }

  const rimGeo = makeSoftRoundedRimShape();
  const lensGeo = makeSoftRoundedLensShape();

  // Eye centers are at x = ±0.36, y = 1.25, z = 1.10
  // Left Eye Rim & Lens
  const leftRim = new THREE.Mesh(rimGeo, frameMat);
  leftRim.position.set(0.36, 1.25, 1.10);
  leftRim.rotation.x = -0.04;
  group.add(leftRim);

  const leftLens = new THREE.Mesh(lensGeo, lensMat);
  leftLens.position.set(0.36, 1.25, 1.115);
  leftLens.rotation.x = -0.04;
  group.add(leftLens);

  // Right Eye Rim & Lens
  const rightRim = new THREE.Mesh(rimGeo, frameMat);
  rightRim.position.set(-0.36, 1.25, 1.10);
  rightRim.rotation.x = -0.04;
  group.add(rightRim);

  const rightLens = new THREE.Mesh(lensGeo, lensMat);
  rightLens.position.set(-0.36, 1.25, 1.115);
  rightLens.rotation.x = -0.04;
  group.add(rightLens);

  // Sleek arched bridge connecting frames over nose
  const bridgeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.10, 1.35, 1.11),
    new THREE.Vector3(0.00, 1.38, 1.12),
    new THREE.Vector3(0.10, 1.35, 1.11),
  ]);
  const bridgeGeo = new THREE.TubeGeometry(bridgeCurve, 12, 0.014, 8, false);
  const bridge = new THREE.Mesh(bridgeGeo, frameMat);
  group.add(bridge);

  // Temple Arms going back to the ears
  const templeArmGeo = new THREE.BoxGeometry(0.020, 0.028, 1.05);

  const leftArm = new THREE.Mesh(templeArmGeo, frameMat);
  leftArm.position.set(0.61, 1.35, 0.55);
  leftArm.rotation.y = -0.07;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(templeArmGeo, frameMat);
  rightArm.position.set(-0.61, 1.35, 0.55);
  rightArm.rotation.y = 0.07;
  group.add(rightArm);

  // Silver metal hinge rivets on outer front corners
  const hingeGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.024, 8);
  const leftHinge = new THREE.Mesh(hingeGeo, silverHingeMat);
  leftHinge.rotation.x = Math.PI / 2;
  leftHinge.position.set(0.60, 1.37, 1.12);
  group.add(leftHinge);

  const rightHinge = new THREE.Mesh(hingeGeo, silverHingeMat);
  rightHinge.rotation.x = Math.PI / 2;
  rightHinge.position.set(-0.60, 1.37, 1.12);
  group.add(rightHinge);

  return group;
}

/**
 * Creates stylish Korean two-block haircut bangs (tóc mái two-block)
 * falling from the hairline and touching right on the eyebrows.
 */
function createTwoBlockBangs(): THREE.Group {
  const group = new THREE.Group();
  group.name = "hoangTwoBlockBangs";

  const hairMat = new THREE.MeshStandardMaterial({
    color: "#161418", // Natural dark espresso black
    roughness: 0.70,
    metalness: 0.04,
  });

  function makeHairStrand(points: THREE.Vector3[], radius: number) {
    const curve = new THREE.CatmullRomCurve3(points);
    const geom = new THREE.TubeGeometry(curve, 20, radius, 8, false);
    return new THREE.Mesh(geom, hairMat);
  }

  // --- Volumetric Two-Block Fringe (Tóc mái Two-block phủ trán chạm lông mày) ---
  // Forehead surface is at z ~ 0.98 - 1.04. Hair arches forward to z ~ 1.10 - 1.16,
  // then drops down to touch the eyebrows at y ~ 1.58 - 1.62.

  // Primary Bottom Layer (Touches Eyebrows!)
  // Left side:
  group.add(makeHairStrand([
    new THREE.Vector3(0.04, 1.88, 0.90),
    new THREE.Vector3(0.07, 1.76, 1.10),
    new THREE.Vector3(0.10, 1.66, 1.14),
    new THREE.Vector3(0.14, 1.58, 1.12),
  ], 0.056));

  group.add(makeHairStrand([
    new THREE.Vector3(0.12, 1.88, 0.88),
    new THREE.Vector3(0.16, 1.76, 1.11),
    new THREE.Vector3(0.20, 1.66, 1.14),
    new THREE.Vector3(0.25, 1.58, 1.11),
  ], 0.058));

  group.add(makeHairStrand([
    new THREE.Vector3(0.20, 1.86, 0.86),
    new THREE.Vector3(0.26, 1.74, 1.09),
    new THREE.Vector3(0.32, 1.65, 1.12),
    new THREE.Vector3(0.38, 1.58, 1.09),
  ], 0.056));

  group.add(makeHairStrand([
    new THREE.Vector3(0.30, 1.84, 0.82),
    new THREE.Vector3(0.38, 1.72, 1.06),
    new THREE.Vector3(0.44, 1.63, 1.09),
    new THREE.Vector3(0.50, 1.56, 1.05),
  ], 0.052));

  group.add(makeHairStrand([
    new THREE.Vector3(0.40, 1.80, 0.78),
    new THREE.Vector3(0.48, 1.68, 1.00),
    new THREE.Vector3(0.54, 1.59, 1.03),
    new THREE.Vector3(0.60, 1.50, 0.98),
  ], 0.048));

  // Right side:
  group.add(makeHairStrand([
    new THREE.Vector3(-0.04, 1.88, 0.90),
    new THREE.Vector3(-0.07, 1.76, 1.10),
    new THREE.Vector3(-0.10, 1.66, 1.14),
    new THREE.Vector3(-0.14, 1.58, 1.12),
  ], 0.056));

  group.add(makeHairStrand([
    new THREE.Vector3(-0.12, 1.88, 0.88),
    new THREE.Vector3(-0.16, 1.76, 1.11),
    new THREE.Vector3(-0.20, 1.66, 1.14),
    new THREE.Vector3(-0.25, 1.58, 1.11),
  ], 0.058));

  group.add(makeHairStrand([
    new THREE.Vector3(-0.20, 1.86, 0.86),
    new THREE.Vector3(-0.26, 1.74, 1.09),
    new THREE.Vector3(-0.32, 1.65, 1.12),
    new THREE.Vector3(-0.38, 1.58, 1.09),
  ], 0.056));

  group.add(makeHairStrand([
    new THREE.Vector3(-0.30, 1.84, 0.82),
    new THREE.Vector3(-0.38, 1.72, 1.06),
    new THREE.Vector3(-0.44, 1.63, 1.09),
    new THREE.Vector3(-0.50, 1.56, 1.05),
  ], 0.052));

  group.add(makeHairStrand([
    new THREE.Vector3(-0.40, 1.80, 0.78),
    new THREE.Vector3(-0.48, 1.68, 1.00),
    new THREE.Vector3(-0.54, 1.59, 1.03),
    new THREE.Vector3(-0.60, 1.50, 0.98),
  ], 0.048));

  // Secondary Upper Layer (Adds stylish texture & natural volume)
  group.add(makeHairStrand([
    new THREE.Vector3(0.06, 1.92, 0.82),
    new THREE.Vector3(0.12, 1.82, 1.02),
    new THREE.Vector3(0.20, 1.72, 1.12),
    new THREE.Vector3(0.28, 1.63, 1.10),
  ], 0.052));

  group.add(makeHairStrand([
    new THREE.Vector3(0.18, 1.90, 0.80),
    new THREE.Vector3(0.26, 1.80, 1.00),
    new THREE.Vector3(0.34, 1.70, 1.10),
    new THREE.Vector3(0.42, 1.62, 1.08),
  ], 0.050));

  group.add(makeHairStrand([
    new THREE.Vector3(-0.06, 1.92, 0.82),
    new THREE.Vector3(-0.12, 1.82, 1.02),
    new THREE.Vector3(-0.20, 1.72, 1.12),
    new THREE.Vector3(-0.28, 1.63, 1.10),
  ], 0.052));

  group.add(makeHairStrand([
    new THREE.Vector3(-0.18, 1.90, 0.80),
    new THREE.Vector3(-0.26, 1.80, 1.00),
    new THREE.Vector3(-0.34, 1.70, 1.10),
    new THREE.Vector3(-0.42, 1.62, 1.08),
  ], 0.050));

  // Volumetric upper crown base seamlessly bridging top hair to bangs
  const crownBaseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.55, 1.80, 0.76),
    new THREE.Vector3(-0.28, 1.85, 0.90),
    new THREE.Vector3(0.00, 1.87, 0.94),
    new THREE.Vector3(0.28, 1.85, 0.90),
    new THREE.Vector3(0.55, 1.80, 0.76),
  ]);
  group.add(new THREE.Mesh(
    new THREE.TubeGeometry(crownBaseCurve, 24, 0.075, 8, false),
    hairMat
  ));

  // Mid-forehead volume filler to eliminate any exposed forehead gap
  const midBaseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.52, 1.74, 0.86),
    new THREE.Vector3(-0.26, 1.78, 1.02),
    new THREE.Vector3(0.00, 1.80, 1.05),
    new THREE.Vector3(0.26, 1.78, 1.02),
    new THREE.Vector3(0.52, 1.74, 0.86),
  ]);
  group.add(new THREE.Mesh(
    new THREE.TubeGeometry(midBaseCurve, 24, 0.065, 8, false),
    hairMat
  ));

  return group;
}

/**
 * Creates silver hoop earrings (khuyên tai vòng) matching user request:
 * - Tai trái: 1st lobe, 2nd lobe, và conch
 * - Tai phải: 1st lobe
 */
function createEarrings(): THREE.Group {
  const group = new THREE.Group();
  group.name = "hoangEarrings";

  const silverMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, // Bright polished sterling silver
    metalness: 0.98,
    roughness: 0.08,
    emissive: 0x555555,
    emissiveIntensity: 0.25, // Brilliant specular shine
  });

  // Helper to build a hoop ring
  function makeHoop(radius: number, tube: number) {
    const geo = new THREE.TorusGeometry(radius, tube, 16, 32);
    return new THREE.Mesh(geo, silverMat);
  }

  // --- TAI TRÁI (LEFT EAR, x > 0) ---
  // 1. Left 1st Lobe (dưới cùng của dái tai trái)
  const left1stLobe = makeHoop(0.065, 0.010);
  left1stLobe.position.set(1.12, 0.72, 0.35);
  left1stLobe.rotation.set(0.15, 1.50, 0);
  group.add(left1stLobe);

  // 2. Left 2nd Lobe (ngay trên 1st lobe dọc vành dái tai trái)
  const left2ndLobe = makeHoop(0.054, 0.0085);
  left2ndLobe.position.set(1.18, 0.80, 0.32);
  left2ndLobe.rotation.set(0.10, 1.45, 0.15);
  group.add(left2ndLobe);

  // 3. Left Conch (vòng sụn conch ôm qua vành tai giữa)
  const leftConch = makeHoop(0.085, 0.011);
  leftConch.position.set(1.34, 1.02, 0.23);
  leftConch.rotation.set(-0.25, 1.25, 0.20);
  group.add(leftConch);

  // --- TAI PHẢI (RIGHT EAR, x < 0) ---
  // 1. Right 1st Lobe (dưới cùng của dái tai phải)
  const right1stLobe = makeHoop(0.065, 0.010);
  right1stLobe.position.set(-1.12, 0.72, 0.35);
  right1stLobe.rotation.set(0.15, -1.50, 0);
  group.add(right1stLobe);

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
