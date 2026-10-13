import * as THREE from "three";

/** Continuous swept layers: ridges and pointed fringe share one scalp surface. */
export function createLayeredHair(): THREE.Group {
  const hair = new THREE.Group();
  hair.name = "hoangLayeredHair";
  const material = new THREE.MeshPhysicalMaterial({ color: "#1b191e", roughness: 0.76, clearcoat: 0.02, clearcoatRoughness: 0.7 });
  const positions: number[] = [], uvs: number[] = [], indices: number[] = [];
  const rings = 64, columns = 192;
  const hairline = [[0, 1.18], [0.16, 1.37], [0.26, 1.25], [0.39, 1.49], [0.53, 1.36], [0.65, 1.39], [0.86, 1.65], [1.04, 1.57], [1.23, 1.80], [1.57, 1.83], [2.1, 1.97], [Math.PI, 2.04]];
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
  for (let row = 0; row <= rings; row++) {
    for (let col = 0; col <= columns; col++) {
      const theta = col / columns * Math.PI * 2;
      const angle = Math.abs(Math.atan2(Math.sin(theta), Math.cos(theta)));
      const phi = row / rings * interpolate(hairline, angle, true);
      let relief = 0;
      paths.forEach((path, index) => {
        const end = path[path.length - 1][0];
        if (phi > end) return;
        const center = interpolate(path, phi);
        const width = (index === 0 ? 0.14 : 0.18) * Math.max(0.12, 1 - Math.pow(phi / end, 4));
        const distance = Math.atan2(Math.sin(angle - center), Math.cos(angle - center));
        relief += 0.045 * Math.exp(-((distance / width) ** 2)) * Math.sin(Math.PI * phi / end);
      });
      const part = 0.016 * Math.exp(-((Math.sin(theta) * Math.sin(phi) / 0.065) ** 2)) * Math.sin(phi);
      const x = Math.sin(theta) * Math.pow(Math.sin(phi), 0.7) * 1.065;
      const z = Math.cos(theta) * Math.pow(Math.sin(phi), 0.55) * 1.25;
      const y = 1.49 + Math.sign(Math.cos(phi)) * Math.pow(Math.abs(Math.cos(phi)), 0.65) * 0.87 - part;
      const normal = new THREE.Vector3(x / 1.134, (y - 1.49) / 0.757, z / 1.5625).normalize();
      const point = new THREE.Vector3(x, y, z + 0.025).addScaledVector(normal, relief);
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
  return hair;
}
