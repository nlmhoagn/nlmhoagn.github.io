import * as THREE from "three";

/**
 * Customizes the 3D character to authentically match Hoang Nguyen:
 * 1. Radiant, warm, healthy Asian skin tone with 3D facial depth
 * 2. Solid minimalist long-sleeve shirt (ao tron tay dai nhu cu, khong chu, khong day chuyen):
 *    - Solid matte black / dark minimalist aesthetic
 * 3. Clean natural original haircut (bo luon mai di)
 * 4. Original animated eyes from GLTF model
 * 5. Realistic human-proportioned ears
 * 6. Fashionable oversized clear acetate glasses with silver rivets
 * 7. Polished sterling silver hoop earrings:
 *    - Left ear: 1st lobe, 2nd lobe, and snug outer-rim conch hoop
 *    - Right ear: 1st lobe
 * 8. Seamless, dense golden blonde mullet nape hair connecting directly to upper hair
 */
export function customizeCharacter(character: THREE.Object3D) {
  // 1. Color palette tailored to user's photo
  const skinColor = new THREE.Color("#fff0e6"); // Fair, healthy, natural Asian skin tone
  const skinEmissive = new THREE.Color("#ffdad0"); // Warm radiant Asian subsurface glow
  const shirtColor = new THREE.Color("#1c1c20"); // Soft black plain long-sleeve shirt (lightened ~10%)
  const pantsColor = new THREE.Color("#182844"); // Deep dark blue indigo denim jeans
  const shoeColor = new THREE.Color("#dedbd4"); // Off-white cream sneakers
  const soleColor = new THREE.Color("#d2cfc7"); // Light neutral sneaker soles
  const hairColor = new THREE.Color("#141317"); // Natural silky dark espresso black
  const browColor = new THREE.Color("#1c1a22"); // Refined natural dark eyebrows

  // 2. Refine eyebrow bones (sleek and natural)
  const browL = character.getObjectByName("eyebrow_L");
  if (browL) browL.scale.set(0.70, 0.55, 0.70);
  const browR = character.getObjectByName("eyebrow_R");
  if (browR) browR.scale.set(0.70, 0.55, 0.70);

  // 3. Traverse all meshes and assign custom materials
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
        // Plain solid long-sleeve shirt (ao tron tay dai nguyen ban)
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
          roughness: 0.88,
          metalness: 0.02,
        });
      } else if (name.includes("Shoe")) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: shoeColor,
          roughness: 0.82,
          metalness: 0.04,
        });
      } else if (name.includes("Sole")) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: soleColor,
          roughness: 0.85,
          metalness: 0.02,
        });
      }
    }
  });

  // 4. Head Bone: Accessories & Hair
  const headBone =
    character.getObjectByName("spine006") ||
    character.getObjectByName("spine.006") ||
    character;

  headBone.add(createRealisticEars(skinColor, skinEmissive));
  headBone.add(createOversizedGlasses());
  headBone.add(createEarrings());
  headBone.add(createBlondeMulletNape());
}

/**
 * Creates realistic human-proportioned ears positioned naturally and gaplessly on the sides of the head:
 * - Anchored deep into the temporal bone (zero gap / không hở)
 * - Volumetric anatomical 3D ear with helix, concha cavity, tragus, and ear backing
 * - 100% mathematical symmetry via sagittal mirror (scale.x = -1) (không lệch)
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

  const innerEarMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(skinColor).lerp(new THREE.Color("#e8b4a0"), 0.30),
    roughness: 0.50,
    metalness: 0.0,
    emissive: skinEmissive,
    emissiveIntensity: 0.15,
    side: THREE.DoubleSide,
  });

  function makeSingleEar(): THREE.Group {
    const ear = new THREE.Group();

    // 1. ANATOMICAL OUTER HELIX & LOBE
    // Points start deep inside the skull (x = 0.84),
    // loop out to form the helix and lobe, and anchor back inside the jawline (x = 0.85).
    const helixCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.85, 1.16, 0.24), // Crus helicis root inside skull
      new THREE.Vector3(0.92, 1.24, 0.21), // Ascending helix
      new THREE.Vector3(1.02, 1.25, 0.15), // Superior crest
      new THREE.Vector3(1.07, 1.18, 0.09), // Helix apex
      new THREE.Vector3(1.08, 1.05, 0.05), // Posterior margin
      new THREE.Vector3(1.05, 0.93, 0.08), // Lower margin / antihelix transition
      new THREE.Vector3(1.00, 0.82, 0.14), // Lobe apex (1st lobe)
      new THREE.Vector3(0.93, 0.81, 0.18), // Lobe bottom curve
      new THREE.Vector3(0.86, 0.86, 0.22), // Lobule junction anchoring deep into jaw
    ]);
    const helixGeo = new THREE.TubeGeometry(helixCurve, 32, 0.038, 12, false);
    ear.add(new THREE.Mesh(helixGeo, earMat));

    // 2. RETROAURICULAR WEDGE (Ear backing connecting seamlessly into head & hair)
    // Completely fills the space between the back of the ear and the skull.
    const backCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.84, 1.22, 0.18),
      new THREE.Vector3(0.98, 1.21, 0.12),
      new THREE.Vector3(1.02, 1.08, 0.04),
      new THREE.Vector3(0.98, 0.95, 0.06),
      new THREE.Vector3(0.86, 0.88, 0.16),
    ]);
    const backGeo = new THREE.TubeGeometry(backCurve, 24, 0.035, 10, false);
    ear.add(new THREE.Mesh(backGeo, earMat));

    // 3. SOLID 3D EAR BASE (Penetrating deep into the head from x = 0.78 to 1.00)
    // Eliminates any open seams or holes between the ear and skull
    const earBaseGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.32, 16);
    const earBase = new THREE.Mesh(earBaseGeo, earMat);
    earBase.rotation.z = Math.PI / 2; // Extends along X axis
    earBase.rotation.y = 0.18;
    earBase.position.set(0.88, 1.04, 0.14);
    earBase.scale.set(0.65, 0.50, 0.85);
    ear.add(earBase);

    // 4. INNER CONCHA & ANTIHELIX DISK (Inner ear bowl with realistic depth)
    const conchaShape = new THREE.Shape();
    conchaShape.moveTo(-0.06, 0.14);
    conchaShape.quadraticCurveTo(0.08, 0.15, 0.10, 0.04);
    conchaShape.quadraticCurveTo(0.11, -0.06, 0.05, -0.15);
    conchaShape.quadraticCurveTo(-0.02, -0.20, -0.07, -0.10);
    conchaShape.quadraticCurveTo(-0.08, 0.02, -0.06, 0.14);

    const conchaGeo = new THREE.ExtrudeGeometry(conchaShape, {
      depth: 0.025,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.012,
      bevelThickness: 0.012,
    });
    const conchaMesh = new THREE.Mesh(conchaGeo, innerEarMat);
    conchaMesh.position.set(0.97, 1.05, 0.14);
    conchaMesh.rotation.y = Math.PI / 2 + 0.15;
    conchaMesh.rotation.x = -0.05;
    ear.add(conchaMesh);

    // 5. TRAGUS (Cartilage nodule guarding the ear canal)
    const tragusGeo = new THREE.SphereGeometry(0.034, 12, 12);
    const tragusMesh = new THREE.Mesh(tragusGeo, earMat);
    tragusMesh.position.set(0.95, 1.04, 0.22);
    tragusMesh.scale.set(0.8, 1.4, 1.0);
    ear.add(tragusMesh);

    return ear;
  }

  // Left ear (canonical)
  const leftEar = makeSingleEar();
  leftEar.name = "leftEar";
  group.add(leftEar);

  // Right ear (perfect mirror across sagittal plane)
  const rightEar = makeSingleEar();
  rightEar.name = "rightEar";
  rightEar.scale.set(-1, 1, 1);
  group.add(rightEar);

  return group;
}

/**
 * Creates fashionable oversized clear acetate glasses matching user's photo:
 * - Generous proportions: width 0.58, height 0.46
 * - Distinctive soft rounded pantos bottom (eliminating boxiness/squareness)
 * - Translucent crystal clear acetate frame with glossy reflections and silver rivets
 * - Front frame only (temple arms removed as requested to avoid poking into the eyes)
 * - Centered right over eye pupils
 */
function createOversizedGlasses(): THREE.Group {
  const group = new THREE.Group();
  group.name = "hoangGlasses";

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x9cb4d8,
    transparent: true,
    opacity: 0.85,
    roughness: 0.05,
    metalness: 0.16,
    depthWrite: true,
  });

  const lensMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.08,
    roughness: 0.02,
    metalness: 0.02,
    depthWrite: false,
  });

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
    const botRadius = 0.24;

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

  const leftRim = new THREE.Mesh(rimGeo, frameMat);
  leftRim.position.set(0.38, 1.18, 1.13);
  leftRim.rotation.x = -0.04;
  group.add(leftRim);

  const leftLens = new THREE.Mesh(lensGeo, lensMat);
  leftLens.position.set(0.38, 1.18, 1.145);
  leftLens.rotation.x = -0.04;
  group.add(leftLens);

  const rightRim = new THREE.Mesh(rimGeo, frameMat);
  rightRim.position.set(-0.38, 1.18, 1.13);
  rightRim.rotation.x = -0.04;
  group.add(rightRim);

  const rightLens = new THREE.Mesh(lensGeo, lensMat);
  rightLens.position.set(-0.38, 1.18, 1.145);
  rightLens.rotation.x = -0.04;
  group.add(rightLens);

  const bridgeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.11, 1.30, 1.14),
    new THREE.Vector3(0.00, 1.34, 1.16),
    new THREE.Vector3(0.11, 1.30, 1.14),
  ]);
  const bridgeGeo = new THREE.TubeGeometry(bridgeCurve, 14, 0.018, 8, false);
  group.add(new THREE.Mesh(bridgeGeo, frameMat));

  // Front corner rivet pins
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
 * - Left ear:
 *   1. 1st lobe: bottom lobe
 *   2. 2nd lobe: above 1st lobe along outer ear rim
 *   3. Conch: compact hoop hugging the ear helix cartilage
 * - Right ear:
 *   1. 1st lobe: bottom lobe
 */
function createEarrings(): THREE.Group {
  const group = new THREE.Group();
  group.name = "hoangEarrings";

  const silverMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.98,
    roughness: 0.04,
    emissive: 0x666666,
    emissiveIntensity: 0.40,
  });

  function makeHoop(radius: number, tube: number) {
    const geo = new THREE.TorusGeometry(radius, tube, 16, 32);
    return new THREE.Mesh(geo, silverMat);
  }

  // --- LEFT EAR (x > 0) ---
  const left1stLobe = makeHoop(0.065, 0.011);
  left1stLobe.position.set(1.00, 0.81, 0.15);
  left1stLobe.rotation.set(0.15, 1.50, 0);
  group.add(left1stLobe);

  const left2ndLobe = makeHoop(0.054, 0.0095);
  left2ndLobe.position.set(1.04, 0.88, 0.10);
  left2ndLobe.rotation.set(0.10, 1.45, 0.15);
  group.add(left2ndLobe);

  const leftConch = makeHoop(0.046, 0.009);
  leftConch.position.set(1.08, 1.04, 0.05);
  leftConch.rotation.set(Math.PI / 2 - 0.16, 0.15, -0.22);
  group.add(leftConch);

  // --- RIGHT EAR (x < 0) ---
  const right1stLobe = makeHoop(0.065, 0.011);
  right1stLobe.position.set(-1.00, 0.81, 0.15);
  right1stLobe.rotation.set(0.15, -1.50, 0);
  group.add(right1stLobe);

  return group;
}

/**
 * Creates lush, dense, seamless golden blonde mullet nape hair:
 * - CONNECTS DIRECTLY TO THE UPPER BLACK HAIR MASS (tucked under the black hair rim from y = 1.28)
 * - Completely covers the skull and neck behind the ears, eliminating the split/gap
 * - Cascading fine-stranded wavy layers flowing over the collar
 */
function createBlondeMulletNape(): THREE.Group {
  const group = new THREE.Group();
  group.name = "hoangBlondeNape";

  const goldenBlonde = new THREE.MeshStandardMaterial({
    color: "#edbe3b",
    roughness: 0.54,
    metalness: 0.08,
    side: THREE.DoubleSide,
  });

  const sunlitBlonde = new THREE.MeshStandardMaterial({
    color: "#fad86b",
    roughness: 0.50,
    metalness: 0.10,
    side: THREE.DoubleSide,
  });

  const lightWheatBlonde = new THREE.MeshStandardMaterial({
    color: "#fae79d",
    roughness: 0.48,
    metalness: 0.08,
    side: THREE.DoubleSide,
  });

  const richHoneyBlonde = new THREE.MeshStandardMaterial({
    color: "#cf9223",
    roughness: 0.60,
    metalness: 0.06,
    side: THREE.DoubleSide,
  });

  function makeLock(
    points: THREE.Vector3[],
    radius: number,
    material: THREE.Material
  ) {
    const curve = new THREE.CatmullRomCurve3(points);
    const geom = new THREE.TubeGeometry(curve, 22, radius, 8, false);
    return new THREE.Mesh(geom, material);
  }

  // --- 0. SEAMLESS CONNECTING ROOT COLLAR ---
  function buildConnectingCollar(): THREE.Mesh {
    const uSegments = 24;
    const vSegments = 8;
    const geom = new THREE.BufferGeometry();
    const positions: number[] = [];
    const indices: number[] = [];

    for (let iv = 0; iv <= vSegments; iv++) {
      const v = iv / vSegments;
      const y = 1.28 - v * 0.60;
      const rx = 0.95 - v * 0.16;
      const rz = 0.52 - v * 0.10;

      for (let iu = 0; iu <= uSegments; iu++) {
        const u = iu / uSegments;
        const theta = -0.15 + u * (Math.PI + 0.30);
        const x = Math.cos(theta) * rx;
        const z = -Math.sin(theta) * rz;

        positions.push(x, y, z);
      }
    }

    const stride = uSegments + 1;
    for (let iv = 0; iv < vSegments; iv++) {
      for (let iu = 0; iu < uSegments; iu++) {
        const a = iv * stride + iu;
        const b = (iv + 1) * stride + iu;
        const c = a + 1;
        const d = b + 1;

        indices.push(a, b, c);
        indices.push(c, b, d);
      }
    }

    geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    return new THREE.Mesh(geom, goldenBlonde);
  }

  group.add(buildConnectingCollar());

  // --- 1. LEFT SIDE CONNECTING & FLOWING MULLET WAVES ---
  group.add(makeLock([
    new THREE.Vector3(0.93, 1.28, 0.12),
    new THREE.Vector3(0.96, 1.04, 0.08),
    new THREE.Vector3(0.92, 0.76, 0.00),
    new THREE.Vector3(0.82, 0.44, -0.08),
    new THREE.Vector3(0.72, 0.10, -0.16),
    new THREE.Vector3(0.66, -0.22, -0.20),
  ], 0.030, sunlitBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.88, 1.26, 0.04),
    new THREE.Vector3(0.91, 1.00, -0.01),
    new THREE.Vector3(0.87, 0.72, -0.08),
    new THREE.Vector3(0.78, 0.40, -0.16),
    new THREE.Vector3(0.69, 0.06, -0.22),
    new THREE.Vector3(0.63, -0.25, -0.24),
  ], 0.030, lightWheatBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.80, 1.24, -0.08),
    new THREE.Vector3(0.83, 0.96, -0.12),
    new THREE.Vector3(0.80, 0.66, -0.18),
    new THREE.Vector3(0.73, 0.35, -0.24),
    new THREE.Vector3(0.65, 0.02, -0.28),
    new THREE.Vector3(0.59, -0.28, -0.28),
  ], 0.032, goldenBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.70, 1.22, -0.18),
    new THREE.Vector3(0.74, 0.92, -0.22),
    new THREE.Vector3(0.72, 0.62, -0.26),
    new THREE.Vector3(0.67, 0.30, -0.30),
    new THREE.Vector3(0.60, -0.02, -0.32),
    new THREE.Vector3(0.55, -0.30, -0.32),
  ], 0.032, sunlitBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.62, 1.20, -0.26),
    new THREE.Vector3(0.66, 0.90, -0.30),
    new THREE.Vector3(0.65, 0.58, -0.34),
    new THREE.Vector3(0.61, 0.25, -0.36),
    new THREE.Vector3(0.55, -0.06, -0.36),
    new THREE.Vector3(0.50, -0.32, -0.34),
  ], 0.034, richHoneyBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.84, 1.15, 0.02),
    new THREE.Vector3(0.88, 0.86, -0.04),
    new THREE.Vector3(0.83, 0.55, -0.12),
    new THREE.Vector3(0.76, 0.22, -0.20),
    new THREE.Vector3(0.70, -0.10, -0.24),
  ], 0.028, lightWheatBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.52, 1.18, -0.34),
    new THREE.Vector3(0.56, 0.86, -0.38),
    new THREE.Vector3(0.55, 0.52, -0.42),
    new THREE.Vector3(0.51, 0.20, -0.42),
    new THREE.Vector3(0.45, -0.10, -0.40),
  ], 0.034, goldenBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.40, 1.16, -0.40),
    new THREE.Vector3(0.44, 0.82, -0.44),
    new THREE.Vector3(0.45, 0.48, -0.46),
    new THREE.Vector3(0.41, 0.16, -0.46),
    new THREE.Vector3(0.36, -0.14, -0.42),
  ], 0.032, richHoneyBlonde));

  // --- 2. RIGHT SIDE CONNECTING & FLOWING MULLET WAVES ---
  group.add(makeLock([
    new THREE.Vector3(-0.93, 1.28, 0.12),
    new THREE.Vector3(-0.96, 1.04, 0.08),
    new THREE.Vector3(-0.92, 0.76, 0.00),
    new THREE.Vector3(-0.82, 0.44, -0.08),
    new THREE.Vector3(-0.72, 0.10, -0.16),
    new THREE.Vector3(-0.66, -0.22, -0.20),
  ], 0.030, sunlitBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.88, 1.26, 0.04),
    new THREE.Vector3(-0.91, 1.00, -0.01),
    new THREE.Vector3(-0.87, 0.72, -0.08),
    new THREE.Vector3(-0.78, 0.40, -0.16),
    new THREE.Vector3(-0.69, 0.06, -0.22),
    new THREE.Vector3(-0.63, -0.25, -0.24),
  ], 0.030, lightWheatBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.80, 1.24, -0.08),
    new THREE.Vector3(-0.83, 0.96, -0.12),
    new THREE.Vector3(-0.80, 0.66, -0.18),
    new THREE.Vector3(-0.73, 0.35, -0.24),
    new THREE.Vector3(-0.65, 0.02, -0.28),
    new THREE.Vector3(-0.59, -0.28, -0.28),
  ], 0.032, goldenBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.70, 1.22, -0.18),
    new THREE.Vector3(-0.74, 0.92, -0.22),
    new THREE.Vector3(-0.72, 0.62, -0.26),
    new THREE.Vector3(-0.67, 0.30, -0.30),
    new THREE.Vector3(-0.60, -0.02, -0.32),
    new THREE.Vector3(-0.55, -0.30, -0.32),
  ], 0.032, sunlitBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.62, 1.20, -0.26),
    new THREE.Vector3(-0.66, 0.90, -0.30),
    new THREE.Vector3(-0.65, 0.58, -0.34),
    new THREE.Vector3(-0.61, 0.25, -0.36),
    new THREE.Vector3(-0.55, -0.06, -0.36),
    new THREE.Vector3(-0.50, -0.32, -0.34),
  ], 0.034, richHoneyBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.84, 1.15, 0.02),
    new THREE.Vector3(-0.88, 0.86, -0.04),
    new THREE.Vector3(-0.83, 0.55, -0.12),
    new THREE.Vector3(-0.76, 0.22, -0.20),
    new THREE.Vector3(-0.70, -0.10, -0.24),
  ], 0.028, lightWheatBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.52, 1.18, -0.34),
    new THREE.Vector3(-0.56, 0.86, -0.38),
    new THREE.Vector3(-0.55, 0.52, -0.42),
    new THREE.Vector3(-0.51, 0.20, -0.42),
    new THREE.Vector3(-0.45, -0.10, -0.40),
  ], 0.034, goldenBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.40, 1.16, -0.40),
    new THREE.Vector3(-0.44, 0.82, -0.44),
    new THREE.Vector3(-0.45, 0.48, -0.46),
    new THREE.Vector3(-0.41, 0.16, -0.46),
    new THREE.Vector3(-0.36, -0.14, -0.42),
  ], 0.032, richHoneyBlonde));

  // --- 3. CENTER WATERFALL CASCADING DOWN NAPE & COLLAR ---
  group.add(makeLock([
    new THREE.Vector3(0.00, 1.20, -0.46),
    new THREE.Vector3(0.00, 0.85, -0.52),
    new THREE.Vector3(0.00, 0.45, -0.58),
    new THREE.Vector3(0.00, 0.05, -0.58),
    new THREE.Vector3(0.00, -0.32, -0.52),
  ], 0.036, sunlitBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.12, 1.18, -0.44),
    new THREE.Vector3(0.14, 0.82, -0.50),
    new THREE.Vector3(0.15, 0.42, -0.55),
    new THREE.Vector3(0.12, 0.02, -0.54),
    new THREE.Vector3(0.08, -0.34, -0.48),
  ], 0.034, goldenBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.12, 1.18, -0.44),
    new THREE.Vector3(-0.14, 0.82, -0.50),
    new THREE.Vector3(-0.15, 0.42, -0.55),
    new THREE.Vector3(-0.12, 0.02, -0.54),
    new THREE.Vector3(-0.08, -0.34, -0.48),
  ], 0.034, goldenBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.24, 1.16, -0.42),
    new THREE.Vector3(0.28, 0.78, -0.47),
    new THREE.Vector3(0.28, 0.38, -0.51),
    new THREE.Vector3(0.24, -0.02, -0.50),
    new THREE.Vector3(0.18, -0.35, -0.44),
  ], 0.032, richHoneyBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.24, 1.16, -0.42),
    new THREE.Vector3(-0.28, 0.78, -0.47),
    new THREE.Vector3(-0.28, 0.38, -0.51),
    new THREE.Vector3(-0.24, -0.02, -0.50),
    new THREE.Vector3(-0.18, -0.35, -0.44),
  ], 0.032, richHoneyBlonde));

  return group;
}
