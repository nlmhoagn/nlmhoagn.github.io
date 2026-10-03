import * as THREE from "three";

const BASE_URL = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : import.meta.env.BASE_URL + "/";

/**
 * Customizes the 3D character to authentically and handsomely match Hoang Nguyen:
 * 1. Radiant, warm, healthy Asian skin tone with 3D facial depth (sculpted nose, lips, jawline)
 * 2. Solid matte black crewneck T-shirt (ao thun den)
 * 3. Realistic human-proportioned ears (completely hides the cartoon dumbo ears)
 * 4. Realistic Asian eyes:
 *    - Crisp, radiant white sclera (trong trang mat)
 *    - Natural deep espresso brown iris with black pupil
 * 5. Authentic Korean Two-Block haircut:
 *    - Curving curtain bangs parted near center with forehead gap
 *    - Cascading soft layered locks that graze eyebrows and touch the top glasses rim
 *    - Sleek temple locks and volumetric crown volume
 * 6. Fashionable oversized clear acetate glasses:
 *    - Oversized Pantos / Wellington shape (soft curved rounded bottom, never boxy/square)
 *    - Translucent clear crystal acetate frame with glossy reflections and silver rivets
 * 7. Polished sterling silver hoop earrings:
 *    - Left ear: 1st lobe, 2nd lobe, and conch
 *    - Right ear: 1st lobe
 * 8. Golden blonde mullet nape hair (gay toc dai mau vang):
 *    - Layers cascading down the neck and flaring prominently around jaw and collar
 */
export function customizeCharacter(character: THREE.Object3D) {
  // 1. Color palette tailored to user's photo
  const skinColor = new THREE.Color("#fff0e6"); // Fair, healthy, natural Asian skin tone
  const skinEmissive = new THREE.Color("#ffdad0"); // Warm radiant Asian subsurface glow
  const shirtColor = new THREE.Color("#111113"); // Solid matte black crewneck T-shirt
  const hairColor = new THREE.Color("#141317"); // Natural silky dark espresso black
  const browColor = new THREE.Color("#1c1a22"); // Refined natural dark eyebrows
  const pantsColor = new THREE.Color("#18171f"); // Dark denim pants

  // 2. Refine eyebrow bones (make them sleek and natural, not giant cartoon caterpillars)
  const browL = character.getObjectByName("eyebrow_L");
  if (browL) browL.scale.set(0.65, 0.45, 0.65);
  const browR = character.getObjectByName("eyebrow_R");
  if (browR) browR.scale.set(0.65, 0.45, 0.65);

  // Load custom Asian eye texture (bright white sclera, natural dark brown iris)
  const textureLoader = new THREE.TextureLoader();
  const eyeTexture = textureLoader.load(`${BASE_URL}models/eye_asian.png`);
  eyeTexture.colorSpace = THREE.SRGBColorSpace;

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
          emissiveIntensity: 0.22, // Radiant fair skin that keeps 3D nose, lips, and jaw shadows visible
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
      } else if (name.includes("EYEs") || name.includes("Eyes")) {
        // Natural Asian eyes with bright white sclera and dark espresso iris
        mesh.material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: eyeTexture,
          roughness: 0.04,
          metalness: 0.0,
          emissive: 0x444444,
          emissiveIntensity: 0.25, // Ensures white sclera stays crisp and radiant
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

  // Add Korean Two-Block sleek curtain bangs touching eyebrows
  const bangs = createTwoBlockCurtainBangs(hairColor);
  headBone.add(bangs);

  // Add oversized clear acetate glasses
  const glasses = createOversizedGlasses();
  headBone.add(glasses);

  // Add silver hoop earrings (Left: 1st, 2nd, conch; Right: 1st)
  const earrings = createEarrings();
  headBone.add(earrings);

  // Add golden blonde mullet nape hair (gay vang)
  const blondeNape = createBlondeMulletNape();
  headBone.add(blondeNape);
}

/**
 * Creates realistic human-proportioned ears positioned naturally on the sides of the head.
 * In spine006 coordinates: Head sides sit at x = +-0.98.
 * Realistic ears extend outward gently to +-1.16 (natural human width).
 */
function createRealisticEars(skinColor: THREE.Color, skinEmissive: THREE.Color): THREE.Group {
  const group = new THREE.Group();
  group.name = "hoangRealisticEars";

  const earMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.44,
    metalness: 0.0,
    emissive: skinEmissive,
    emissiveIntensity: 0.22,
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
 * Creates authentic Korean Two-Block haircut matching user's photo:
 * - Natural 5:5 middle-part curtain bangs
 * - Hugs the forehead contour smoothly and drapes down to graze the eyebrows
 * - Soft layered locks sweeping outward toward temples
 * - Volumetric crown blending seamlessly into top of head
 */
function createTwoBlockCurtainBangs(baseHairColor: THREE.Color): THREE.Group {
  const group = new THREE.Group();
  group.name = "hoangTwoBlockCurtainBangs";

  const hairMat = new THREE.MeshStandardMaterial({
    color: baseHairColor,
    roughness: 0.58,
    metalness: 0.06,
  });

  const hairHighlightMat = new THREE.MeshStandardMaterial({
    color: "#222028",
    roughness: 0.50,
    metalness: 0.08,
  });

  function makeLock(points: THREE.Vector3[], radius: number, material: THREE.Material = hairMat) {
    const curve = new THREE.CatmullRomCurve3(points);
    const geom = new THREE.TubeGeometry(curve, 20, radius, 8, false);
    return new THREE.Mesh(geom, material);
  }

  // --- LEFT CURTAIN (x > 0) ---
  // Lock 1: Center parting inner strand, falls straight then soft flick outward
  group.add(makeLock([
    new THREE.Vector3(0.03, 1.98, 1.04),
    new THREE.Vector3(0.05, 1.82, 1.08),
    new THREE.Vector3(0.09, 1.64, 1.10),
    new THREE.Vector3(0.14, 1.48, 1.11),
    new THREE.Vector3(0.18, 1.42, 1.09),
  ], 0.032, hairHighlightMat));

  // Lock 2: Mid-inner drape, covering mid-forehead down to eyebrow
  group.add(makeLock([
    new THREE.Vector3(0.10, 1.98, 1.02),
    new THREE.Vector3(0.14, 1.80, 1.08),
    new THREE.Vector3(0.20, 1.62, 1.10),
    new THREE.Vector3(0.26, 1.47, 1.11),
    new THREE.Vector3(0.31, 1.41, 1.09),
  ], 0.035, hairMat));

  // Lock 3: Main body of curtain, sweeping down and slightly outward
  group.add(makeLock([
    new THREE.Vector3(0.20, 1.96, 0.99),
    new THREE.Vector3(0.26, 1.78, 1.06),
    new THREE.Vector3(0.33, 1.58, 1.08),
    new THREE.Vector3(0.39, 1.46, 1.09),
    new THREE.Vector3(0.44, 1.40, 1.06),
  ], 0.036, hairHighlightMat));

  // Lock 4: Outer temple sweep, framing the cheekbone and temple
  group.add(makeLock([
    new THREE.Vector3(0.30, 1.94, 0.94),
    new THREE.Vector3(0.40, 1.74, 1.02),
    new THREE.Vector3(0.50, 1.54, 1.03),
    new THREE.Vector3(0.58, 1.40, 0.98),
    new THREE.Vector3(0.64, 1.30, 0.88),
  ], 0.036, hairMat));

  // Lock 5: Sideburn lock framing in front of the left ear
  group.add(makeLock([
    new THREE.Vector3(0.45, 1.86, 0.88),
    new THREE.Vector3(0.58, 1.62, 0.93),
    new THREE.Vector3(0.68, 1.38, 0.82),
    new THREE.Vector3(0.76, 1.15, 0.62),
    new THREE.Vector3(0.80, 0.98, 0.44),
  ], 0.034, hairMat));

  // --- RIGHT CURTAIN (x < 0) ---
  // Lock 1: Center parting inner strand
  group.add(makeLock([
    new THREE.Vector3(-0.03, 1.98, 1.04),
    new THREE.Vector3(-0.05, 1.82, 1.08),
    new THREE.Vector3(-0.09, 1.64, 1.10),
    new THREE.Vector3(-0.14, 1.48, 1.11),
    new THREE.Vector3(-0.18, 1.42, 1.09),
  ], 0.032, hairHighlightMat));

  // Lock 2: Mid-inner drape
  group.add(makeLock([
    new THREE.Vector3(-0.10, 1.98, 1.02),
    new THREE.Vector3(-0.14, 1.80, 1.08),
    new THREE.Vector3(-0.20, 1.62, 1.10),
    new THREE.Vector3(-0.26, 1.47, 1.11),
    new THREE.Vector3(-0.31, 1.41, 1.09),
  ], 0.035, hairMat));

  // Lock 3: Main body of curtain
  group.add(makeLock([
    new THREE.Vector3(-0.20, 1.96, 0.99),
    new THREE.Vector3(-0.26, 1.78, 1.06),
    new THREE.Vector3(-0.33, 1.58, 1.08),
    new THREE.Vector3(-0.39, 1.46, 1.09),
    new THREE.Vector3(-0.44, 1.40, 1.06),
  ], 0.036, hairHighlightMat));

  // Lock 4: Outer temple sweep
  group.add(makeLock([
    new THREE.Vector3(-0.30, 1.94, 0.94),
    new THREE.Vector3(-0.40, 1.74, 1.02),
    new THREE.Vector3(-0.50, 1.54, 1.03),
    new THREE.Vector3(-0.58, 1.40, 0.98),
    new THREE.Vector3(-0.64, 1.30, 0.88),
  ], 0.036, hairMat));

  // Lock 5: Sideburn lock framing in front of the right ear
  group.add(makeLock([
    new THREE.Vector3(-0.45, 1.86, 0.88),
    new THREE.Vector3(-0.68, 1.38, 0.82),
    new THREE.Vector3(-0.76, 1.15, 0.62),
    new THREE.Vector3(-0.80, 0.98, 0.44),
  ], 0.034, hairMat));

  // --- CROWN ARCH (Top of head volume) ---
  const crownCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.60, 1.92, 0.80),
    new THREE.Vector3(-0.32, 2.03, 0.96),
    new THREE.Vector3(0.00, 2.06, 1.01),
    new THREE.Vector3(0.32, 2.03, 0.96),
    new THREE.Vector3(0.60, 1.92, 0.80),
  ]);
  group.add(new THREE.Mesh(
    new THREE.TubeGeometry(crownCurve, 20, 0.060, 8, false),
    hairMat
  ));

  return group;
}

/**
 * Creates fashionable oversized clear acetate glasses matching user's photo:
 * - Generous proportions: width 0.58, height 0.46
 * - Distinctive soft rounded pantos bottom (eliminating boxiness/squareness)
 * - Translucent crystal clear acetate frame with glossy reflections and silver rivets
 * - Centered right over eye pupils, top rim resting comfortably under bangs
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
 * - Tai trái: 1st lobe, 2nd lobe, và conch
 * - Tai phải: 1st lobe
 * Note: Positioned precisely on the realistic ear anatomy (x = +-1.02 to +-1.09)
 * so they are prominently visible from front and 3/4 view!
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

  // 3. Left Conch (vòng sụn conch ôm qua vành tai giữa)
  const leftConch = makeHoop(0.075, 0.011);
  leftConch.position.set(1.09, 1.06, 0.24);
  leftConch.rotation.set(-0.25, 1.25, 0.20);
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
 * Creates golden blonde mullet nape hair locks:
 * - Extends down the back of the neck and drapes over the black T-shirt collar
 * - Flares out prominently below the ears so it is clearly visible from the front view
 */
function createBlondeMulletNape(): THREE.Group {
  const group = new THREE.Group();
  group.name = "hoangBlondeNape";

  const goldenBlonde = new THREE.MeshStandardMaterial({
    color: "#f5c538",
    roughness: 0.55,
    metalness: 0.08,
  });

  const sunlitBlonde = new THREE.MeshStandardMaterial({
    color: "#ffd966",
    roughness: 0.50,
    metalness: 0.10,
  });

  const richHoneyBlonde = new THREE.MeshStandardMaterial({
    color: "#df9e24",
    roughness: 0.60,
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

  // 1. Visible Side Flared Wings (peeking out prominently around jaw/ears, seen from front!)
  // Left side wings:
  group.add(makeLock([
    new THREE.Vector3(0.55, 0.90, -0.06),
    new THREE.Vector3(0.72, 0.60, -0.14),
    new THREE.Vector3(0.80, 0.28, -0.22),
    new THREE.Vector3(0.76, -0.08, -0.30),
    new THREE.Vector3(0.66, -0.32, -0.36),
  ], 0.088, sunlitBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.48, 0.85, -0.14),
    new THREE.Vector3(0.66, 0.54, -0.22),
    new THREE.Vector3(0.76, 0.20, -0.30),
    new THREE.Vector3(0.72, -0.16, -0.38),
  ], 0.082, goldenBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.60, 0.76, -0.10),
    new THREE.Vector3(0.78, 0.44, -0.18),
    new THREE.Vector3(0.84, 0.12, -0.26),
    new THREE.Vector3(0.78, -0.22, -0.34),
  ], 0.076, richHoneyBlonde));

  // Right side wings:
  group.add(makeLock([
    new THREE.Vector3(-0.55, 0.90, -0.06),
    new THREE.Vector3(-0.72, 0.60, -0.14),
    new THREE.Vector3(-0.80, 0.28, -0.22),
    new THREE.Vector3(-0.76, -0.08, -0.30),
    new THREE.Vector3(-0.66, -0.32, -0.36),
  ], 0.088, sunlitBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.48, 0.85, -0.14),
    new THREE.Vector3(-0.66, 0.54, -0.22),
    new THREE.Vector3(-0.76, 0.20, -0.30),
    new THREE.Vector3(-0.72, -0.16, -0.38),
  ], 0.082, goldenBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.60, 0.76, -0.10),
    new THREE.Vector3(-0.78, 0.44, -0.18),
    new THREE.Vector3(-0.84, 0.12, -0.26),
    new THREE.Vector3(-0.78, -0.22, -0.34),
  ], 0.076, richHoneyBlonde));

  // 2. Full Nape Waterfall Locks (covering back of neck and draping over collar)
  group.add(makeLock([
    new THREE.Vector3(0.00, 0.90, -0.55),
    new THREE.Vector3(0.00, 0.55, -0.66),
    new THREE.Vector3(0.00, 0.18, -0.72),
    new THREE.Vector3(0.00, -0.22, -0.70),
    new THREE.Vector3(0.00, -0.45, -0.64),
  ], 0.092, sunlitBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.12, 0.85, -0.54),
    new THREE.Vector3(0.15, 0.50, -0.64),
    new THREE.Vector3(0.16, 0.12, -0.70),
    new THREE.Vector3(0.14, -0.25, -0.68),
    new THREE.Vector3(0.10, -0.48, -0.62),
  ], 0.086, goldenBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.12, 0.85, -0.54),
    new THREE.Vector3(-0.15, 0.50, -0.64),
    new THREE.Vector3(-0.16, 0.12, -0.70),
    new THREE.Vector3(-0.14, -0.25, -0.68),
    new THREE.Vector3(-0.10, -0.48, -0.62),
  ], 0.086, goldenBlonde));

  group.add(makeLock([
    new THREE.Vector3(0.26, 0.80, -0.50),
    new THREE.Vector3(0.30, 0.44, -0.60),
    new THREE.Vector3(0.32, 0.08, -0.66),
    new THREE.Vector3(0.28, -0.28, -0.62),
  ], 0.080, richHoneyBlonde));

  group.add(makeLock([
    new THREE.Vector3(-0.26, 0.80, -0.50),
    new THREE.Vector3(-0.30, 0.44, -0.60),
    new THREE.Vector3(-0.32, 0.08, -0.66),
    new THREE.Vector3(-0.28, -0.28, -0.62),
  ], 0.080, richHoneyBlonde));

  return group;
}
