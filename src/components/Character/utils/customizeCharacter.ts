import * as THREE from "three";
import { createLayeredHair } from "./layeredHair";
import { addMonitorLogo } from "./monitorLogo";

/** Keeps the original rounded character and finishes its layered hair and accessories. */
export function customizeCharacter(character: THREE.Object3D) {
  // 1. Color palette tailored to user's photo
  const skinColor = new THREE.Color("#f1dacb");
  const skinEmissive = new THREE.Color("#cfab94");
  const shirtColor = new THREE.Color("#1c1c20"); // Soft black plain long-sleeve shirt (lightened ~10%)
  const pantsColor = new THREE.Color("#182844"); // Deep dark blue indigo denim jeans
  const shoeColor = new THREE.Color("#dedbd4"); // Off-white cream sneakers
  const soleColor = new THREE.Color("#d2cfc7"); // Light neutral sneaker soles
  const hairColor = new THREE.Color("#141317"); // Natural silky dark espresso black
  const browColor = new THREE.Color("#1c1a22"); // Refined natural dark eyebrows

  // 2. Refine eyebrow bones (sleek and natural)
  const browL = character.getObjectByName("eyebrow_L");
  if (browL) { browL.scale.set(1, 1, 1); browL.add(createNaturalBrow(1, browColor)); }
  const browR = character.getObjectByName("eyebrow_R");
  if (browR) { browR.scale.set(1, 1, 1); browR.add(createNaturalBrow(-1, browColor)); }

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
          roughness: 0.62,
          metalness: 0.0,
          emissive: skinEmissive,
          emissiveIntensity: 0.025,
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
        mesh.visible = false;
        mesh.material = new THREE.MeshStandardMaterial({
          color: hairColor,
          roughness: 0.62,
          metalness: 0.04,
        });
      } else if (name.startsWith("EYEs")) {
        const material = (mesh.material as THREE.MeshStandardMaterial).clone();
        if (material.map) material.map = createBrownEyeTexture(material.map);
        material.roughness = 0.25;
        mesh.material = material;
      } else if (name.includes("Eyebrow") || name.includes("eyebrow")) {
        mesh.visible = false;
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

  addMonitorLogo(character);

  // 4. Head Bone: Accessories & Hair
  const headBone =
    character.getObjectByName("spine006") ||
    character.getObjectByName("spine.006") ||
    character;

  const ears = createRealisticEars(skinColor, skinEmissive);
  headBone.add(ears);
  headBone.add(createOversizedGlasses());
  const earrings = createEarrings();
  headBone.add(earrings);
  const hair = createLayeredHair();
  headBone.add(createBlondeMulletNape(hair.getObjectByName("hoangLayeredScalp") as THREE.Mesh));
  headBone.add(hair);
}

function createBrownEyeTexture(source: THREE.Texture): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = source.image.width;
  canvas.height = source.image.height;
  const context = canvas.getContext("2d")!;
  context.drawImage(source.image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const r = pixels.data[i], g = pixels.data[i + 1], b = pixels.data[i + 2];
    if (b > g * 1.3 && r > g * 1.2) {
      const shade = (r + g + b) / 3;
      pixels.data[i] = shade * 0.92;
      pixels.data[i + 1] = shade * 0.68;
      pixels.data[i + 2] = shade * 0.43;
    }
  }
  context.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = source.flipY;
  texture.colorSpace = source.colorSpace;
  texture.wrapS = source.wrapS;
  texture.wrapT = source.wrapT;
  return texture;
}

function createNaturalBrow(side: number, color: THREE.Color): THREE.Group {
  const group = new THREE.Group();
  group.name = `hoangBrow${side === 1 ? "L" : "R"}`;
  group.position.set(0, -0.09, 0.075);
  const shape = new THREE.Shape();
  shape.moveTo(-0.28 * side, -0.006);
  shape.quadraticCurveTo(-0.10 * side, 0.040, 0.09 * side, 0.034);
  shape.quadraticCurveTo(0.23 * side, 0.022, 0.30 * side, -0.018);
  shape.quadraticCurveTo(0.17 * side, -0.003, 0.06 * side, -0.010);
  shape.quadraticCurveTo(-0.11 * side, -0.004, -0.28 * side, -0.035);
  shape.closePath();
  const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.005, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.004, bevelSegments: 4, steps: 1, curveSegments: 24 }), new THREE.MeshStandardMaterial({ color, roughness: 0.88 }));
  group.add(mesh);
  return group;
}

/**
 * Creates realistic human-proportioned ears positioned naturally on the sides of the head.
 */
function createRealisticEars(skinColor: THREE.Color, skinEmissive: THREE.Color): THREE.Group {
  const group = new THREE.Group();
  group.name = "hoangRealisticEars";

  const earMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.62,
    metalness: 0.0,
    emissive: skinEmissive,
    emissiveIntensity: 0.025,
    side: THREE.DoubleSide,
  });

  function makeEar(isLeft: boolean) {
    const earGroup = new THREE.Group();
    const s = isLeft ? 1 : -1;

    // Use the same contour for the rim and its thin backing.
    const helixCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.99, 1.25, 0.32), // Top attachment to temple
      new THREE.Vector3(s * 1.08, 1.28, 0.26), // Superior crest
      new THREE.Vector3(s * 1.16, 1.18, 0.22), // Outer helix
      new THREE.Vector3(s * 1.15, 1.00, 0.23), // Mid ear margin
      new THREE.Vector3(s * 1.08, 0.86, 0.26), // Lobe curve
      new THREE.Vector3(s * 1.02, 0.80, 0.28), // 1st Lobe bottom tip
      new THREE.Vector3(s * 0.99, 0.86, 0.30), // Lobe junction with jaw
    ]);
    const helixGeo = new THREE.TubeGeometry(helixCurve, 40, 0.028, 16, false);
    earGroup.add(new THREE.Mesh(helixGeo, earMat));

    const contour = helixCurve.getPoints(64);
    const last = contour[contour.length - 1], first = contour[0];
    for (let i = 1; i < 16; i++) contour.push(last.clone().lerp(first, i / 16));
    const innerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 1.035, 1.22, 0),
      new THREE.Vector3(s * 1.080, 1.16, 0),
      new THREE.Vector3(s * 1.070, 1.07, 0),
      new THREE.Vector3(s * 1.035, 0.98, 0),
    ]).getPoints(32);
    // Sculpt the cartilage into a shallow ear surface instead of a floating tube.
    const center = new THREE.Vector3(s * 1.062, 1.055, 0.25);
    const positions: number[] = [], indices: number[] = [];
    const rings = 16, columns = contour.length;
    for (let row = 0; row <= rings; row++) {
      const radius = row / rings;
      for (let column = 0; column <= columns; column++) {
        const point = center.clone().lerp(contour[column % columns], radius);
        const projected = new THREE.Vector3(point.x, point.y, 0);
        const closest = innerCurve.reduce((best, candidate) => candidate.distanceToSquared(projected) < best.distanceToSquared(projected) ? candidate : best);
        const distance = Math.hypot(point.x - closest.x, point.y - closest.y);
        const fade = Math.sin(Math.PI * innerCurve.indexOf(closest) / 32);
        point.z -= 0.003 + 0.008 * (1 - radius * radius);
        point.z += 0.018 * Math.exp(-((distance / 0.023) ** 2)) * fade * Math.sin(Math.PI * radius);
        positions.push(point.x, point.y, point.z);
        if (row < rings && column < columns) {
          const a = row * (columns + 1) + column;
          indices.push(a, a + 1, a + columns + 1, a + 1, a + columns + 2, a + columns + 1);
        }
      }
    }
    const backing = new THREE.BufferGeometry();
    backing.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    backing.setIndex(indices);
    backing.computeVertexNormals();
    const body = new THREE.Mesh(backing, earMat);
    body.name = isLeft ? "hoangEarBodyL" : "hoangEarBodyR";
    earGroup.add(body);

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

  const frameMat = new THREE.MeshPhysicalMaterial({
    color: 0xede3d5,
    transparent: true,
    opacity: 0.7,
    transmission: 0.55,
    thickness: 0.035,
    ior: 1.46,
    roughness: 0.12,
    metalness: 0.0,
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

  const rimWidth = 0.73;
  const rimHeight = 0.50;
  const rimThick = 0.020;

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
  leftRim.position.set(0.41, 1.25, 1.19);
  leftRim.rotation.x = -0.04;
  group.add(leftRim);

  const leftLens = new THREE.Mesh(lensGeo, lensMat);
  leftLens.position.set(0.41, 1.25, 1.205);
  leftLens.rotation.x = -0.04;
  group.add(leftLens);

  const rightRim = new THREE.Mesh(rimGeo, frameMat);
  rightRim.position.set(-0.41, 1.25, 1.19);
  rightRim.rotation.x = -0.04;
  group.add(rightRim);

  const rightLens = new THREE.Mesh(lensGeo, lensMat);
  rightLens.position.set(-0.41, 1.25, 1.205);
  rightLens.rotation.x = -0.04;
  group.add(rightLens);

  const bridgeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.06, 1.37, 1.20),
    new THREE.Vector3(0.00, 1.40, 1.22),
    new THREE.Vector3(0.06, 1.37, 1.20),
  ]);
  const bridgeGeo = new THREE.TubeGeometry(bridgeCurve, 14, 0.018, 8, false);
  group.add(new THREE.Mesh(bridgeGeo, frameMat));

  for (const side of [-1, 1]) {
    const arm = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.78, 1.38, 1.19),
      new THREE.Vector3(side * 0.88, 1.37, 0.92),
      new THREE.Vector3(side * 0.98, 1.31, 0.55),
      new THREE.Vector3(side * 1.04, 1.17, 0.28),
      new THREE.Vector3(side * 1.04, 1.02, 0.20),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(arm, 32, 0.014, 12, false), frameMat));
  }

  const pinGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.028, 8);
  const leftPin = new THREE.Mesh(pinGeo, silverRivetsMat);
  leftPin.rotation.x = Math.PI / 2;
  leftPin.position.set(0.77, 1.40, 1.21);
  group.add(leftPin);

  const rightPin = new THREE.Mesh(pinGeo, silverRivetsMat);
  rightPin.rotation.x = Math.PI / 2;
  rightPin.position.set(-0.77, 1.40, 1.21);
  group.add(rightPin);

  return group;
}

/**
 * Creates silver hoop earrings matching user's exact specification:
 * - Left ear:
 *   1. 1st lobe: bottom lobe
 *   2. 2nd lobe: above 1st lobe along outer ear rim
 *   3. Conch: compact hoop (radius 0.046) hugging the ear helix cartilage
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
  left1stLobe.position.set(1.03, 0.79, 0.28);
  left1stLobe.rotation.set(0.15, 1.50, 0);
  group.add(left1stLobe);

  const left2ndLobe = makeHoop(0.054, 0.0095);
  left2ndLobe.position.set(1.07, 0.84, 0.26);
  left2ndLobe.rotation.set(0.10, 1.45, 0.15);
  group.add(left2ndLobe);

  const leftConch = makeHoop(0.046, 0.009);
  leftConch.position.set(1.138, 0.99, 0.232);
  leftConch.rotation.set(Math.PI / 2 - 0.16, 0.15, -0.22);
  group.add(leftConch);

  // --- RIGHT EAR (x < 0) ---
  const right1stLobe = makeHoop(0.065, 0.011);
  right1stLobe.position.set(-1.03, 0.79, 0.28);
  right1stLobe.rotation.set(0.15, -1.50, 0);
  group.add(right1stLobe);

  return group;
}

/** A separate black nape layer leaves the original crown and fringe untouched. */
function createBlondeMulletNape(scalp: THREE.Mesh): THREE.Group {
  const group = new THREE.Group();
  group.name = "hoangBlondeNape";
  const scalpPositions = scalp.geometry.getAttribute("position");
  const scalpNormals = scalp.geometry.getAttribute("normal");
  const uv = scalp.geometry.getAttribute("uv");
  const stride = Math.round(1 / (uv.getX(1) - uv.getX(0))) + 1;
  const border: number[] = [];
  for (let i = 0; i < uv.count; i++) {
    if (uv.getY(i) === 1 && uv.getX(i) >= 0.25 && uv.getX(i) <= 0.75) border.push(i);
  }
  const columns = border.length - 1, rows = 40;
  function napePoint(column: number, v: number) {
    const theta = Math.PI / 2 + column / columns * Math.PI;
    const root = new THREE.Vector3().fromBufferAttribute(scalpPositions, border[column]);
    const ridge = Math.pow(0.5 + 0.5 * Math.cos(theta * 18 + 0.45 * Math.sin(v * Math.PI * 1.5)), 3);
    const radius = 0.026 * ridge * Math.sin(Math.PI * Math.min(1, v * 1.5));
    const y = THREE.MathUtils.lerp(root.y, -0.27, v) + 0.12 * Math.pow(v, 8) * (0.5 + 0.5 * Math.cos(theta * 18));
    const height = (1.28 - y) / 1.55, rootHeight = (1.28 - root.y) / 1.55;
    const join = 1 - THREE.MathUtils.smoothstep(v, 0, 0.55);
    return new THREE.Vector3(
      Math.sin(theta) * (1.055 - 0.32 * height * height + radius) + (root.x - Math.sin(theta) * (1.055 - 0.32 * rootHeight * rootHeight)) * join,
      y,
      Math.cos(theta) * (0.91 - 0.33 * height * height + radius) + (root.z - Math.cos(theta) * (0.91 - 0.33 * rootHeight * rootHeight)) * join
    );
  }

  const blackPositions: number[] = [], blackIndices: number[] = [];
  const overlapRows = 8, blackRows = 32;
  for (let row = 0; row <= blackRows; row++) {
    for (let column = 0; column <= columns; column++) {
      let point: THREE.Vector3;
      if (row <= overlapRows) {
        point = new THREE.Vector3().fromBufferAttribute(scalpPositions, border[column] - (overlapRows - row) * stride);
        point.addScaledVector(new THREE.Vector3(point.x, 0, point.z).normalize(), THREE.MathUtils.lerp(-0.003, 0.003, row / overlapRows));
      } else {
        const theta = Math.PI / 2 + column / columns * Math.PI;
        const phase = theta * 15 + 0.8 * Math.sin(theta * 3);
        const tooth = 1 - Math.abs(Math.atan2(Math.sin(phase), Math.cos(phase))) / Math.PI;
        const length = 0.30 + 0.20 * Math.sin(theta - Math.PI / 2) + 0.15 * Math.pow(tooth, 1.6);
        const root = new THREE.Vector3().fromBufferAttribute(scalpPositions, border[column]);
        const previous = new THREE.Vector3().fromBufferAttribute(scalpPositions, border[column] - stride);
        const tangent = root.clone().sub(previous).normalize();
        root.addScaledVector(new THREE.Vector3(root.x, 0, root.z).normalize(), 0.003);
        const tip = napePoint(column, length);
        tip.addScaledVector(new THREE.Vector3(tip.x, 0, tip.z).normalize(), 0.02);
        const curve = new THREE.CubicBezierCurve3(root, root.clone().addScaledVector(tangent, root.distanceTo(tip) / 3), tip.clone().add(new THREE.Vector3(tip.x * 0.08, 0.20, tip.z * 0.08)), tip);
        point = curve.getPoint((row - overlapRows) / (blackRows - overlapRows));
      }
      blackPositions.push(point.x, point.y, point.z);
      if (row < blackRows && column < columns) {
        const a = row * (columns + 1) + column;
        blackIndices.push(a, a + columns + 1, a + 1, a + 1, a + columns + 1, a + columns + 2);
      }
    }
  }
  const blackGeometry = new THREE.BufferGeometry();
  blackGeometry.setAttribute("position", new THREE.Float32BufferAttribute(blackPositions, 3));
  blackGeometry.setIndex(blackIndices);
  blackGeometry.computeVertexNormals();
  const blackNormals = blackGeometry.getAttribute("normal") as THREE.BufferAttribute;
  for (let row = 0; row <= overlapRows; row++) {
    for (let column = 0; column <= columns; column++) {
      const normal = new THREE.Vector3().fromBufferAttribute(scalpNormals, border[column] - (overlapRows - row) * stride);
      blackNormals.setXYZ(row * (columns + 1) + column, normal.x, normal.y, normal.z);
    }
  }

  const positions: number[] = [], colors: number[] = [], indices: number[] = [];
  const blackSurface = blackGeometry.getAttribute("position");
  const honey = new THREE.Color("#cda02f"), wheat = new THREE.Color("#f1cb64");
  for (let row = 0; row <= rows; row++) {
    const v = row / rows;
    for (let column = 0; column <= columns; column++) {
      const theta = Math.PI / 2 + column / columns * Math.PI;
      const point = napePoint(column, v);
      for (let blackRow = 1; blackRow <= blackRows; blackRow++) {
        const upper = (blackRow - 1) * (columns + 1) + column, lower = blackRow * (columns + 1) + column;
        const upperY = blackSurface.getY(upper), lowerY = blackSurface.getY(lower);
        if (point.y > upperY || point.y < lowerY) continue;
        point.copy(new THREE.Vector3().fromBufferAttribute(blackSurface, upper).lerp(new THREE.Vector3().fromBufferAttribute(blackSurface, lower), (upperY - point.y) / (upperY - lowerY)));
        point.addScaledVector(new THREE.Vector3(point.x, 0, point.z).normalize(), -0.025);
        break;
      }
      positions.push(point.x, point.y, point.z);
      const ridge = Math.pow(0.5 + 0.5 * Math.cos(theta * 18 + 0.45 * Math.sin(v * Math.PI * 1.5)), 3);
      const color = honey.clone().lerp(wheat, 0.28 + 0.45 * ridge);
      colors.push(color.r, color.g, color.b);
      if (row < rows && column < columns) {
        const a = row * (columns + 1) + column;
        indices.push(a, a + columns + 1, a + 1, a + 1, a + columns + 1, a + columns + 2);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const backing = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.58, metalness: 0, side: THREE.DoubleSide }));
  backing.name = "hoangNapeBacking";
  group.add(backing);
  const overlay = new THREE.Mesh(blackGeometry, scalp.material);
  overlay.name = "hoangBlackNapeLayer";
  group.add(overlay);
  return group;
}
