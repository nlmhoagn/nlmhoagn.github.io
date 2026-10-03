import * as THREE from "three";

/**
 * Customizes the 3D character to authentically match Hoang Nguyen:
 * 1. Radiant, warm, healthy Asian skin tone with 3D facial depth
 * 2. Solid matte black crewneck T-shirt (ao thun den)
 * 3. Clean natural original haircut (bo luon mai di)
 * 4. Original animated eyes from GLTF model
 * 5. Realistic human-proportioned ears
 * 6. Fashionable oversized clear acetate glasses with silver rivets
 * 7. Polished sterling silver hoop earrings:
 *    - Left ear: 1st lobe, 2nd lobe, and snug outer-rim conch hoop
 *    - Right ear: 1st lobe
 * 8. Lush, dense, layered golden blonde mullet nape hair (gay mullet vang day dan, soi min tu nhien)
 */
export function customizeCharacter(character: THREE.Object3D) {
  // 1. Color palette tailored to user's photo
  const skinColor = new THREE.Color("#fff0e6"); // Fair, healthy, natural Asian skin tone
  const skinEmissive = new THREE.Color("#ffdad0"); // Warm radiant Asian subsurface glow
  const shirtColor = new THREE.Color("#111113"); // Solid matte black crewneck T-shirt
  const hairColor = new THREE.Color("#141317"); // Natural silky dark espresso black
  const browColor = new THREE.Color("#1c1a22"); // Refined natural dark eyebrows
  const pantsColor = new THREE.Color("#18171f"); // Dark denim pants

  // 2. Refine eyebrow bones (sleek and natural)
  const browL = character.getObjectByName("eyebrow_L");
  if (browL) browL.scale.set(0.70, 0.55, 0.70);
  const browR = character.getObjectByName("eyebrow_R");
  if (browR) browR.scale.set(0.70, 0.55, 0.70);

  // 3. Traverse all meshes and assign custom materials (eyes are left as original)
  character.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const name = mesh.name;

      if (
        name.includes("Plane007") ||
        name.includes("Plane.007") ||
        name.includes("Face") ||
        name.includes("Neck") ||
        name.includes("Hand")
      ) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: skinColor,
          roughness: 0.44,
          metalness: 0.0,
          emissive: skinEmissive,
          emissiveIntensity: 0.20,
        });
      } else if (name.includes("Ear")) {
        // Completely hide the cartoon dumbo ears!
        mesh.visible = false;
      } else if (name.includes("SHIRT") || name.includes("BODY")) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: shirtColor,
          roughness: 0.92,
          metalness: 0.02,
        });
      } else if (name.includes("hair") || name.includes("Hair")) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: hairColor,
          roughness: 0.62,
          metalness: 0.04,
        });
      } else if (name.includes("Eyebrow") || name.includes("eyebrow")) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: browColor,
          roughness: 0.78,
          metalness: 0.0,
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

  // 4. Find head bone to attach accessories and hairstyles
  const headBone =
    character.getObjectByName("spine006") ||
    character.getObjectByName("spine.006") ||
    character;

  // Add realistic human-proportioned ears
  const realisticEars = createRealisticEars(skinColor, skinEmissive);
  headBone.add(realisticEars);

  // Add oversized clear acetate glasses
  const glasses = createOversizedGlasses();
  headBone.add(glasses);

  // Add silver hoop earrings (Left: 1st, 2nd, conch; Right: 1st)
  const earrings = createEarrings();
  headBone.add(earrings);

  // Add dense, layered golden blonde mullet nape hair (gay vang day dan)
  const blondeNape = createBlondeMulletNape();
  headBone.add(blondeNape);
}

/**
 * Creates realistic human-proportioned ears positioned naturally on the sides of the head.
 * In spine006 coordinates: Head sides sit at x = +-0.98.
 * Outer helix ridge runs vertically at x = +-1.15, z = 0.23, y = 0.86 to 1.25.
 */
function createRealisticEars(skinColor: THREE.Color, skinEmissive: THREE.Color): THREE.Group {
  const group = new THREE.Group();
  group.name = "hoangRealisticEars";

  const earMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.44,
    metalness: 0.0,
    emissive: skinEmissive,
    emissiveIntensity: 0.20,
    side: THREE.DoubleSide,
  });

  function makeEar(isLeft: boolean) {
    const earGroup = new THREE.Group();
    const s = isLeft ? 1 : -1;

    // Smooth C-curve for outer helix and earlobe:
    const helixCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.99, 1.25, 0.32), // Top attachment to temple
      new THREE.Vector3(s * 1.08, 1.28, 0.26), // Superior crest
      new THREE.Vector3(s * 1.16, 1.18, 0.22), // Outer helix
      new THREE.Vector3(s * 1.15, 1.00, 0.23), // Mid ear margin
      new THREE.Vector3(s * 1.08, 0.86, 0.26), // Lobe curve
      new THREE.Vector3(s * 1.02, 0.80, 0.28), // 1st Lobe bottom tip
      new THREE.Vector3(s * 0.99, 0.86, 0.30), // Lobe junction with jaw
    ]);
    const helixGeo = new THREE.TubeGeometry(helixCurve, 24, 0.038, 8, false);
    earGroup.add(new THREE.Mesh(helixGeo, earMat));

    // Inner concha / ear backing filling
    const conchaShape = new THREE.Shape();
    conchaShape.moveTo(0, 0.18);
    conchaShape.quadraticCurveTo(0.12, 0.18, 0.15, 0.06);
    conchaShape.quadraticCurveTo(0.16, -0.06, 0.09, -0.16);
    conchaShape.quadraticCurveTo(0.00, -0.22, -0.04, -0.10);
    conchaShape.lineTo(-0.04, 0.08);

    const conchaGeo = new THREE.ShapeGeometry(conchaShape);
    const conchaMesh = new THREE.Mesh(conchaGeo, earMat);
    conchaMesh.position.set(s * 1.04, 1.04, 0.26);
    conchaMesh.rotation.y = s * 0.26;
    earGroup.add(conchaMesh);

    return earGroup;
  }

  group.add(makeEar(true));
  group.add(makeEar(false));

  return group;
}

/**
 * Creates fashionable oversized clear acetate glasses matching user's photo:
 * - Generous proportions: width 0.58, height 0.46
 * - Distinctive soft rounded pantos bottom (eliminating boxiness/squareness)
 * - Translucent crystal clear acetate frame with glossy reflections and silver rivets
 * - Centered right over eye pupils
 */
function createOversizedGlasses(): THREE.Group {
  const group = new THREE.Group();
  group.name = "hoangGlasses";

  // Translucent clear crystal acetate frame with distinct visibility
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x9cb4d8, // Cool transparent acetate tint
    transparent: true,
    opacity: 0.85,
    roughness: 0.05,
    metalness: 0.16,
    depthWrite: true,
  });

  // Clear optical lenses
  const lensMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.08,
    roughness: 0.02,
    metalness: 0.02,
    depthWrite: false,
  });

  // Silver metal rivets on temple corners
  const silverRivetsMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.98,
    roughness: 0.04,
    emissive: 0x888888,
    emissiveIntensity: 0.40,
  });

  const rimWidth = 0.58;
  const rimHeight = 0.46;
  const rimThick = 0.034;

  function buildPantosRimGeometry() {
    const shape = new THREE.Shape();
    const halfW = rimWidth / 2;
    const halfH = rimHeight / 2;
    const topRadius = 0.10;
    const botRadius = 0.24; // Deep soft curve at bottom eliminates all squareness

    shape.moveTo(-halfW + topRadius, halfH);
    shape.lineTo(halfW - topRadius, halfH);
    shape.quadraticCurveTo(halfW, halfH, halfW, halfH - topRadius);
    shape.lineTo(halfW * 0.92, -halfH + botRadius);
    shape.quadraticCurveTo(halfW * 0.92, -halfH, halfW * 0.92 - botRadius, -halfH);
    shape.lineTo(-halfW * 0.92 + botRadius, -halfH);
    shape.quadraticCurveTo(-halfW * 0.92, -halfH, -halfW * 0.92, -halfH + botRadius);
    shape.lineTo(-halfW, halfH - topRadius);
    shape.quadraticCurveTo(-halfW, halfH, -halfW + topRadius, halfH);

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
      depth: 0.032,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.007,
      bevelThickness: 0.007,
    });
  }

  function makePantosLensGeometry() {
    const shape = new THREE.Shape();
    const halfW = rimWidth / 2 - rimThick * 0.5;
    const halfH = rimHeight / 2 - rimThick * 0.5;
    const topRadius = 0.09;
    const botRadius = 0.22;

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

  const rimGeo = buildPantosRimGeometry();
  const lensGeo = makePantosLensGeometry();

  // Left Eye Rim & Lens
  const leftRim = new THREE.Mesh(rimGeo, frameMat);
  leftRim.position.set(0.38, 1.18, 1.13);
  leftRim.rotation.x = -0.04;
  group.add(leftRim);

  const leftLens = new THREE.Mesh(lensGeo, lensMat);
  leftLens.position.set(0.38, 1.18, 1.145);
  leftLens.rotation.x = -0.04;
  group.add(leftLens);

  // Right Eye Rim & Lens
  const rightRim = new THREE.Mesh(rimGeo, frameMat);
  rightRim.position.set(-0.38, 1.18, 1.13);
  rightRim.rotation.x = -0.04;
  group.add(rightRim);

  const rightLens = new THREE.Mesh(lensGeo, lensMat);
  rightLens.position.set(-0.38, 1.18, 1.145);
  rightLens.rotation.x = -0.04;
  group.add(rightLens);

  // High arched bridge over nose
  const bridgeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.11, 1.30, 1.14),
    new THREE.Vector3(0.00, 1.34, 1.16),
    new THREE.Vector3(0.11, 1.30, 1.14),
  ]);
  const bridgeGeo = new THREE.TubeGeometry(bridgeCurve, 14, 0.018, 8, false);
  group.add(new THREE.Mesh(bridgeGeo, frameMat));

  // Temple Arms going back toward the ears
  const templeArmGeo = new THREE.BoxGeometry(0.024, 0.032, 0.95);

  const leftArm = new THREE.Mesh(templeArmGeo, frameMat);
  leftArm.position.set(0.66, 1.30, 0.65);
  leftArm.rotation.y = -0.10;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(templeArmGeo, frameMat);
  rightArm.position.set(-0.66, 1.30, 0.65);
  rightArm.rotation.y = 0.10;
  group.add(rightArm);

  // Silver metal pin rivets on outer temple corners (as seen in photo)
  const pinGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.028, 8);
  const leftPin = new THREE.Mesh(pinGeo, silverRivetsMat);
  leftPin.rotation.x = Math.PI / 2;
  leftPin.position.set(0.65, 1.33, 1.15);
  group.add(leftPin);

  const rightPin = new THREE.Mesh(pinGeo, silverRivetsMat);
  rightPin.rotation.x = Math.PI / 2;
  rightPin.position.set(-0.65, 1.33, 1.15);
  group.add(rightPin);

  return group;
}

/**
 * Creates silver hoop earrings matching user's exact specification:
 * - Tai trái:
 *   1. 1st lobe: dưới cùng dái tai
 *   2. 2nd lobe: trên 1st lobe dọc vành dái tai
 *   3. Conch: nhỏ gọn, đẩy sát ra ngoài bo tròn ôm khít phần viền tai nhô lên (theo đúng ảnh mẫu media_1791023980600.png)
 * - Tai phải:
 *   1. 1st lobe: dưới cùng dái tai
 */
function createEarrings(): THREE.Group {
  const group = new THREE.Group();
  group.name = "hoangEarrings";

  const silverMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.98,
    roughness: 0.04,
    emissive: 0x666666,
    emissiveIntensity: 0.40, // Brilliant metallic specular shine
  });

  function makeHoop(radius: number, tube: number) {
    const geo = new THREE.TorusGeometry(radius, tube, 16, 32);
    return new THREE.Mesh(geo, silverMat);
  }

  // --- TAI TRÁI (LEFT EAR, x > 0) ---
  // 1. Left 1st Lobe (dưới cùng dái tai trái)
  const left1stLobe = makeHoop(0.065, 0.011);
  left1stLobe.position.set(1.03, 0.79, 0.28);
  left1stLobe.rotation.set(0.15, 1.50, 0);
  group.add(left1stLobe);

  // 2. Left 2nd Lobe (trên 1st lobe dọc vành dái tai)
  const left2ndLobe = makeHoop(0.054, 0.0095);
  left2ndLobe.position.set(1.07, 0.89, 0.26);
  left2ndLobe.rotation.set(0.10, 1.45, 0.15);
  group.add(left2ndLobe);

  // 3. Left Conch: Nhỏ hơn (radius 0.046, tube 0.009), đẩy sát ra ngoài (x = 1.138, z = 0.232)
  // ôm tròn khít phần viền tai nhô lên chuẩn theo ảnh media_1791023980600.png
  const leftConch = makeHoop(0.046, 0.009);
  leftConch.position.set(1.138, 0.99, 0.232);
  leftConch.rotation.set(Math.PI / 2 - 0.16, 0.15, -0.22);
  group.add(leftConch);

  // --- TAI PHẢI (RIGHT EAR, x < 0) ---
  // 1. Right 1st Lobe (dưới cùng dái tai phải)
  const right1stLobe = makeHoop(0.065, 0.011);
  right1stLobe.position.set(-1.03, 0.79, 0.28);
  right1stLobe.rotation.set(0.15, -1.50, 0);
  group.add(right1stLobe);

  return group;
}

/**
 * Creates lush, layered, fine-stranded golden blonde mullet nape hair:
 * - Natural, dense texture with multiple fine strands (not giant chunky tubes)
 * - Layered feathered flow cascading down the back of the neck and shoulders (theo anh media_1791023945330.png)
 * - Peeks out gracefully around the jaw/neck with subtle flicked tips
 */
function createBlondeMulletNape(): THREE.Group {
  const group = new THREE.Group();
  group.name = "hoangBlondeNape";

  // Multi-tonal natural blonde palette
  const goldenBlonde = new THREE.MeshStandardMaterial({
    color: "#edbe3b", // Primary warm golden blonde
    roughness: 0.54,
    metalness: 0.08,
  });

  const sunlitBlonde = new THREE.MeshStandardMaterial({
    color: "#fad86b", // Bright sunlit blonde highlight
    roughness: 0.50,
    metalness: 0.10,
  });

  const lightWheatBlonde = new THREE.MeshStandardMaterial({
    color: "#fae79d", // Light champagne feathered tip highlight
    roughness: 0.48,
    metalness: 0.08,
  });

  const richHoneyBlonde = new THREE.MeshStandardMaterial({
    color: "#cf9223", // Rich amber/honey undertone for volume depth
    roughness: 0.60,
    metalness: 0.06,
  });

  function makeLock(
    points: THREE.Vector3[],
    radius: number,
    material: THREE.Material
  ) {
    const curve = new THREE.CatmullRomCurve3(points);
    const geom = new THREE.TubeGeometry(curve, 18, radius, 8, false);
    return new THREE.Mesh(geom, material);
  }

  // --- 1. LEFT SIDE FLOWERING MULLET WAVES (Fine, layered, dense) ---
  // Outer layer: soft feathered tips peeking out around jaw/ears
  group.add(makeLock([
    new THREE.Vector3(0.58, 0.85, -0.12),
    new THREE.Vector3(0.68, 0.56, -0.19),
    new THREE.Vector3(0.74, 0.26, -0.25),
    new THREE.Vector3(0.72, -0.04, -0.29),
    new THREE.Vector3(0.66, -0.26, -0.30),
  ], 0.028, sunlitBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.52, 0.88, -0.16),
    new THREE.Vector3(0.64, 0.58, -0.23),
    new THREE.Vector3(0.72, 0.28, -0.28),
    new THREE.Vector3(0.73, 0.00, -0.31),
    new THREE.Vector3(0.69, -0.24, -0.31),
  ], 0.030, lightWheatBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.55, 0.78, -0.14),
    new THREE.Vector3(0.66, 0.48, -0.22),
    new THREE.Vector3(0.73, 0.18, -0.26),
    new THREE.Vector3(0.70, -0.10, -0.30),
    new THREE.Vector3(0.63, -0.30, -0.28),
  ], 0.026, goldenBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.48, 0.82, -0.20),
    new THREE.Vector3(0.60, 0.52, -0.26),
    new THREE.Vector3(0.67, 0.22, -0.30),
    new THREE.Vector3(0.66, -0.08, -0.32),
    new THREE.Vector3(0.59, -0.28, -0.30),
  ], 0.030, sunlitBlonde));

  // Mid-layer: lush wavy body giving dense volume
  group.add(makeLock([
    new THREE.Vector3(0.42, 0.86, -0.28),
    new THREE.Vector3(0.52, 0.56, -0.34),
    new THREE.Vector3(0.60, 0.24, -0.38),
    new THREE.Vector3(0.59, -0.10, -0.38),
    new THREE.Vector3(0.53, -0.30, -0.36),
  ], 0.032, goldenBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.49, 0.80, -0.26),
    new THREE.Vector3(0.59, 0.50, -0.32),
    new THREE.Vector3(0.65, 0.18, -0.36),
    new THREE.Vector3(0.63, -0.14, -0.36),
    new THREE.Vector3(0.56, -0.32, -0.34),
  ], 0.030, richHoneyBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.36, 0.88, -0.36),
    new THREE.Vector3(0.46, 0.58, -0.42),
    new THREE.Vector3(0.52, 0.26, -0.46),
    new THREE.Vector3(0.50, -0.10, -0.44),
    new THREE.Vector3(0.44, -0.32, -0.40),
  ], 0.034, sunlitBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.43, 0.76, -0.33),
    new THREE.Vector3(0.53, 0.46, -0.38),
    new THREE.Vector3(0.57, 0.14, -0.42),
    new THREE.Vector3(0.53, -0.16, -0.42),
    new THREE.Vector3(0.47, -0.34, -0.38),
  ], 0.030, lightWheatBlonde));

  // Inner layer: deep neck coverage
  group.add(makeLock([
    new THREE.Vector3(0.30, 0.85, -0.40),
    new THREE.Vector3(0.38, 0.54, -0.46),
    new THREE.Vector3(0.43, 0.22, -0.50),
    new THREE.Vector3(0.41, -0.12, -0.48),
    new THREE.Vector3(0.35, -0.32, -0.44),
  ], 0.034, richHoneyBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.24, 0.82, -0.44),
    new THREE.Vector3(0.31, 0.50, -0.50),
    new THREE.Vector3(0.35, 0.18, -0.53),
    new THREE.Vector3(0.33, -0.14, -0.50),
    new THREE.Vector3(0.27, -0.33, -0.46),
  ], 0.032, goldenBlonde));

  // --- 2. RIGHT SIDE FLOWERING MULLET WAVES (Mirrored, fine, dense) ---
  group.add(makeLock([
    new THREE.Vector3(-0.58, 0.85, -0.12),
    new THREE.Vector3(-0.68, 0.56, -0.19),
    new THREE.Vector3(-0.74, 0.26, -0.25),
    new THREE.Vector3(-0.72, -0.04, -0.29),
    new THREE.Vector3(-0.66, -0.26, -0.30),
  ], 0.028, sunlitBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.52, 0.88, -0.16),
    new THREE.Vector3(-0.64, 0.58, -0.23),
    new THREE.Vector3(-0.72, 0.28, -0.28),
    new THREE.Vector3(-0.73, 0.00, -0.31),
    new THREE.Vector3(-0.69, -0.24, -0.31),
  ], 0.030, lightWheatBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.55, 0.78, -0.14),
    new THREE.Vector3(-0.66, 0.48, -0.22),
    new THREE.Vector3(-0.73, 0.18, -0.26),
    new THREE.Vector3(-0.70, -0.10, -0.30),
    new THREE.Vector3(-0.63, -0.30, -0.28),
  ], 0.026, goldenBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.48, 0.82, -0.20),
    new THREE.Vector3(-0.60, 0.52, -0.26),
    new THREE.Vector3(-0.67, 0.22, -0.30),
    new THREE.Vector3(-0.66, -0.08, -0.32),
    new THREE.Vector3(-0.59, -0.28, -0.30),
  ], 0.030, sunlitBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.42, 0.86, -0.28),
    new THREE.Vector3(-0.52, 0.56, -0.34),
    new THREE.Vector3(-0.60, 0.24, -0.38),
    new THREE.Vector3(-0.59, -0.10, -0.38),
    new THREE.Vector3(-0.53, -0.30, -0.36),
  ], 0.032, goldenBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.49, 0.80, -0.26),
    new THREE.Vector3(-0.59, 0.50, -0.32),
    new THREE.Vector3(-0.65, 0.18, -0.36),
    new THREE.Vector3(-0.63, -0.14, -0.36),
    new THREE.Vector3(-0.56, -0.32, -0.34),
  ], 0.030, richHoneyBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.36, 0.88, -0.36),
    new THREE.Vector3(-0.46, 0.58, -0.42),
    new THREE.Vector3(-0.52, 0.26, -0.46),
    new THREE.Vector3(-0.50, -0.10, -0.44),
    new THREE.Vector3(-0.44, -0.32, -0.40),
  ], 0.034, sunlitBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.43, 0.76, -0.33),
    new THREE.Vector3(-0.53, 0.46, -0.38),
    new THREE.Vector3(-0.57, 0.14, -0.42),
    new THREE.Vector3(-0.53, -0.16, -0.42),
    new THREE.Vector3(-0.47, -0.34, -0.38),
  ], 0.030, lightWheatBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.30, 0.85, -0.40),
    new THREE.Vector3(-0.38, 0.54, -0.46),
    new THREE.Vector3(-0.43, 0.22, -0.50),
    new THREE.Vector3(-0.41, -0.12, -0.48),
    new THREE.Vector3(-0.35, -0.32, -0.44),
  ], 0.034, richHoneyBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.24, 0.82, -0.44),
    new THREE.Vector3(-0.31, 0.50, -0.50),
    new THREE.Vector3(-0.35, 0.18, -0.53),
    new THREE.Vector3(-0.33, -0.14, -0.50),
    new THREE.Vector3(-0.27, -0.33, -0.46),
  ], 0.032, goldenBlonde));

  // --- 3. CENTER WATERFALL CASCADING DOWN NAPE & COLLAR ---
  group.add(makeLock([
    new THREE.Vector3(0.00, 0.92, -0.48),
    new THREE.Vector3(0.00, 0.60, -0.56),
    new THREE.Vector3(0.00, 0.25, -0.62),
    new THREE.Vector3(0.00, -0.14, -0.60),
    new THREE.Vector3(0.00, -0.36, -0.54),
  ], 0.036, sunlitBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.07, 0.90, -0.47),
    new THREE.Vector3(0.09, 0.58, -0.55),
    new THREE.Vector3(0.10, 0.22, -0.61),
    new THREE.Vector3(0.09, -0.15, -0.59),
    new THREE.Vector3(0.06, -0.37, -0.53),
  ], 0.034, goldenBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.07, 0.90, -0.47),
    new THREE.Vector3(-0.09, 0.58, -0.55),
    new THREE.Vector3(-0.10, 0.22, -0.61),
    new THREE.Vector3(-0.09, -0.15, -0.59),
    new THREE.Vector3(-0.06, -0.37, -0.53),
  ], 0.034, goldenBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.14, 0.87, -0.46),
    new THREE.Vector3(0.18, 0.54, -0.53),
    new THREE.Vector3(0.20, 0.18, -0.58),
    new THREE.Vector3(0.18, -0.16, -0.56),
    new THREE.Vector3(0.13, -0.36, -0.50),
  ], 0.032, richHoneyBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.14, 0.87, -0.46),
    new THREE.Vector3(-0.18, 0.54, -0.53),
    new THREE.Vector3(-0.20, 0.18, -0.58),
    new THREE.Vector3(-0.18, -0.16, -0.56),
    new THREE.Vector3(-0.13, -0.36, -0.50),
  ], 0.032, richHoneyBlonde));

  return group;
}
