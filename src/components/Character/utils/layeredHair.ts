import * as THREE from "three";

/** Raised crossing locks anchored to a continuous scalp with a pointed fringe. */
export function createLayeredHair(): THREE.Group {
  const hair = new THREE.Group();
  hair.name = "hoangLayeredHair";
  const material = new THREE.MeshPhysicalMaterial({ color: "#18151b", roughness: 0.72, clearcoat: 0.08, clearcoatRoughness: 0.52 });
  const positions: number[] = [], uvs: number[] = [], indices: number[] = [];
  const rings = 64, columns = 192;
  const hairline = [[0, 1.30], [0.16, 1.41], [0.26, 1.33], [0.39, 1.48], [0.53, 1.40], [0.65, 1.42], [0.86, 1.57], [1.04, 1.53], [1.23, 1.68], [1.57, 1.72], [2.1, 1.86], [Math.PI, 1.93]];
  const paths = [
    [[0.03, 0.12], [0.18, 0.45], [0.32, 0.83], [0.39, 1.49]],
    [[0.07, 0.17], [0.43, 0.55], [0.68, 1.0], [0.86, 1.65]],
    [[0.5, 0.25], [0.85, 0.65], [1.09, 1.2], [1.23, 1.80]],
    [[1.05, 0.20], [1.4, 0.70], [1.57, 1.30], [1.68, 1.87]],
    [[1.8, 0.25], [2.15, 0.80], [2.30, 1.40], [2.40, 2.0]],
    [[2.8, 0.22], [2.9, 0.80], [3.04, 1.45], [Math.PI, 2.04]],
  ].map((path) => {
    const points = path.map(([theta, phi]) => new THREE.Vector3(theta, phi, 0));
    return new THREE.CubicBezierCurve3(points[0], points[1], points[2], points[3]).getPoints(32).map((point) => [point.y, point.x]);
  });
  function interpolate(points: number[][], value: number, smooth = false) {
    for (let i = 1; i < points.length; i++) {
      if (value <= points[i][0]) {
        const t = THREE.MathUtils.clamp((value - points[i - 1][0]) / (points[i][0] - points[i - 1][0]), 0, 1);
        return THREE.MathUtils.lerp(points[i - 1][1], points[i][1], smooth ? t * t * (3 - 2 * t) : t);
      }
    }
    return points[points.length - 1][1];
  }
  function surfacePoint(theta: number, phi: number) {
      const angle = Math.abs(Math.atan2(Math.sin(theta), Math.cos(theta)));
      const v = phi / interpolate(hairline, angle, true);
      const fringe = Math.exp(-Math.pow(angle / 0.95, 4));
      let relief = (0.075 + 0.025 * fringe) * Math.sin(phi) * (0.60 + 0.40 * Math.sin(Math.PI * v));
      paths.forEach((path, index) => {
        const end = path[path.length - 1][0];
        if (phi > end) return;
        const center = interpolate(path, phi);
        const width = (index === 0 ? 0.14 : 0.18) * Math.max(0.12, 1 - Math.pow(phi / end, 4));
        const distance = Math.atan2(Math.sin(angle - center), Math.cos(angle - center));
        const layer = Math.exp(-((distance / width) ** 2)) * Math.sin(Math.PI * phi / end);
        const ripple = Math.cos(distance / width * Math.PI * 3 + 0.35 * Math.sin(phi * 4));
        relief += (0.045 + fringe * (0.018 + 0.005 * ripple)) * layer;
      });
      const part = 0.016 * Math.exp(-((Math.sin(theta) * Math.sin(phi) / 0.065) ** 2)) * Math.sin(phi);
      const x = Math.sin(theta) * Math.pow(Math.sin(phi), 0.7) * 1.065;
      const z = Math.cos(theta) * Math.pow(Math.sin(phi), 0.55) * 1.25;
      const crown = 0.16 * Math.exp(-Math.pow(phi / 0.45, 2));
      const y = 1.49 + Math.sign(Math.cos(phi)) * Math.pow(Math.abs(Math.cos(phi)), 0.65) * 0.87 - part + crown;
      const normal = new THREE.Vector3(x / 1.134, (y - 1.49) / 0.757, z / 1.5625).normalize();
      return new THREE.Vector3(x, y, z + 0.025).addScaledVector(normal, relief);
  }
  for (let row = 0; row <= rings; row++) {
    for (let col = 0; col <= columns; col++) {
      const theta = col / columns * Math.PI * 2;
      const angle = Math.abs(Math.atan2(Math.sin(theta), Math.cos(theta)));
      const point = surfacePoint(theta, row / rings * interpolate(hairline, angle, true));
      positions.push(point.x, point.y, point.z);
      uvs.push(col / columns, row / rings);
      if (row < rings && col < columns) {
        const a = row * (columns + 1) + col;
        indices.push(a, a + columns + 1, a + 1, a + 1, a + columns + 1, a + columns + 2);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const normals = geometry.getAttribute("normal") as THREE.BufferAttribute;
  for (let row = 0; row <= rings; row++) {
    const first = row * (columns + 1), last = first + columns;
    const normal = new THREE.Vector3().fromBufferAttribute(normals, first).add(new THREE.Vector3().fromBufferAttribute(normals, last)).normalize();
    normals.setXYZ(first, normal.x, normal.y, normal.z);
    normals.setXYZ(last, normal.x, normal.y, normal.z);
  }
  const scalp = new THREE.Mesh(geometry, material);
  scalp.name = "hoangLayeredScalp";
  hair.add(scalp);

  // Broad curved locks cross over one another, with all four edges returning to the scalp.
  const locks = [
    { points: [[0.025, 0.18], [0.12, 0.60], [0.34, 0.94], [0.39, 1.40]], width: 0.18, lift: 0.09 },
    { points: [[0.15, 0.22], [0.36, 0.45], [0.72, 1.02], [0.81, 1.47]], width: 0.20, lift: 0.085 },
    { points: [[0.60, 0.25], [0.90, 0.62], [1.15, 1.10], [1.23, 1.65]], width: 0.19, lift: 0.08 },
    { points: [[0.50, 0.38], [0.58, 0.67], [0.26, 0.99], [0.18, 1.17]], width: 0.17, lift: 0.10 },
    { points: [[0.98, 0.43], [0.99, 0.74], [0.62, 1.15], [0.69, 1.35]], width: 0.17, lift: 0.095 },
    { points: [[1.15, 0.32], [1.55, 0.66], [1.76, 1.16], [1.85, 1.72]], width: 0.18, lift: 0.08 },
  ];
  for (const side of [-1, 1]) locks.forEach(({ points, width, lift }, index) => {
    const controls = points.map(([theta, phi]) => new THREE.Vector3(theta * side, phi, 0));
    const curve = new THREE.CubicBezierCurve3(controls[0], controls[1], controls[2], controls[3]);
    const vertices: number[] = [], faces: number[] = [], anchors: number[] = [];
    const segments = 40, across = 12;
    for (let row = 0; row <= segments; row++) {
      const t = row / segments, center = curve.getPoint(t), tangent = curve.getTangent(t);
      const taper = 0.12 + 0.88 * Math.pow(Math.sin(Math.PI * t), 0.6);
      for (let column = 0; column <= across; column++) {
        const u = column / across, offset = (u * 2 - 1) * width * taper;
        const theta = center.x + tangent.y * offset;
        const phi = Math.min(center.y - tangent.x * offset, interpolate(hairline, Math.abs(theta), true) - 0.008);
        const point = surfacePoint(theta, phi);
        if (row === 0 || row === segments || column === 0 || column === across) anchors.push(vertices.length / 3, point.x, point.y, point.z);
        const normal = new THREE.Vector3(point.x / 1.134, (point.y - 1.49) / 0.757, (point.z - 0.025) / 1.5625).normalize();
        const height = lift * Math.pow(Math.sin(Math.PI * t), 0.75) * Math.pow(Math.sin(Math.PI * u), 1.4);
        point.addScaledVector(normal, height);
        vertices.push(point.x, point.y, point.z);
        if (row < segments && column < across) {
          const a = row * (across + 1) + column;
          faces.push(a, a + across + 1, a + 1, a + 1, a + across + 1, a + across + 2);
        }
      }
    }
    const lockGeometry = new THREE.BufferGeometry();
    lockGeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    lockGeometry.setIndex(faces);
    lockGeometry.computeVertexNormals();
    const lock = new THREE.Mesh(lockGeometry, material);
    lock.name = `hoangHairLock${index}${side === 1 ? "L" : "R"}`;
    lock.userData.scalpAnchors = anchors;
    hair.add(lock);
  });
  return hair;
}
