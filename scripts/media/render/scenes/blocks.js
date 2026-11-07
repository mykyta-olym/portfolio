// Hero loop: a field of dark columns lifted by slow travelling waves. Every temporal term
// completes a whole number of cycles per loop, so the last frame flows into the first.
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const TAU = Math.PI * 2;

// calm: z beyond which the waves reach full height. Columns nearer the camera stay low,
// so the foreground reads as soft out-of-focus texture instead of a wall.
const framings = {
  landscape: {
    fov: 25,
    position: [-6, 6.4, 25],
    target: [5, 1.7, -4],
    cols: 120,
    rows: 100,
    focus: 33,
    aperture: 46,
    fog: 0.022,
    calm: [16, -6],
  },
  portrait: {
    fov: 38,
    position: [-2, 7.6, 21],
    target: [2, 1.2, -5],
    cols: 90,
    rows: 110,
    focus: 28,
    aperture: 40,
    fog: 0.024,
    calm: [13, -7],
  },
  overhead: {
    fov: 30,
    position: [0, 17, 21],
    target: [0, 0, -3],
    cols: 110,
    rows: 100,
    focus: 27,
    aperture: 24,
    fog: 0.03,
    calm: [40, 39],
  },
};

function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lift(x, z, t) {
  return (
    Math.sin(x * 0.12 + z * 0.045 + TAU * t) * 1.9 +
    Math.sin(z * 0.15 - x * 0.035 - TAU * t) * 1.5 +
    Math.sin((x - z) * 0.065 + TAU * 2 * t) * 0.7 +
    Math.sin(x * 0.27 + z * 0.21 - TAU * t) * 0.25
  );
}

export async function create(THREE, { variant, width, height }) {
  const framing = framings[variant] ?? framings.landscape;
  const aspect = width / height;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, framing.fog);

  const camera = new THREE.PerspectiveCamera(framing.fov, aspect, 0.5, 260);
  camera.position.set(...framing.position);
  camera.lookAt(...framing.target);
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();

  // Keep only the columns the camera can see (with margin for drift and the lens).
  const { cols, rows } = framing;
  const probe = new THREE.Vector3();
  const visible = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col - cols / 2;
      const z = row - rows * 0.72;
      let seen = false;
      for (const y of [-4, 0, 4]) {
        probe.set(x, y, z).project(camera);
        if (Math.abs(probe.x) < 1.3 && Math.abs(probe.y) < 1.3 && probe.z < 1) seen = true;
      }
      if (seen) visible.push([x, z]);
    }
  }
  // Nearest columns first: early depth rejection then skips most hidden fragments.
  visible.reverse();

  const material = new THREE.MeshStandardMaterial({ color: 0x48484c, roughness: 0.5, metalness: 0.08 });
  // Tall enough that no column ever shows its base between neighbours, and no taller.
  const geometry = new RoundedBoxGeometry(0.93, 6, 0.93, 2, 0.07);
  const mesh = new THREE.InstancedMesh(geometry, material, visible.length);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  scene.add(mesh);

  const key = new THREE.DirectionalLight(0xeef1f6, 4.4);
  key.position.set(26, 22, -18);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  const reach = 48;
  Object.assign(key.shadow.camera, { left: -reach, right: reach, top: reach, bottom: -reach, near: 1, far: 130 });
  key.shadow.bias = -0.0009;
  key.shadow.normalBias = 0.05;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x9aa6b4, 0.9);
  rim.position.set(-30, 10, -40);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight(0x8a96a6, 0x050505, 0.35));

  // Fixed per-column relief, so the surface reads as built from parts, not a sheet.
  const relief = visible.map((_, i) => {
    const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    return (s - Math.floor(s)) * 0.42;
  });

  const dummy = new THREE.Object3D();
  return {
    scene,
    camera,
    focusDistance: framing.focus,
    aperture: framing.aperture,
    exposure: 1.05,
    vignette: 0.42,
    grain: 0.03,
    samples: 12,
    maxRadius: 40,
    update(t) {
      const [calmNear, calmFar] = framing.calm;
      visible.forEach(([x, z], index) => {
        const amplitude = 0.16 + 0.84 * smoothstep(calmNear, calmFar, z);
        dummy.position.set(x, lift(x, z, t) * amplitude + relief[index] - 3.6, z);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      const drift = Math.sin(TAU * t);
      const [px, py, pz] = framing.position;
      const [tx, ty, tz] = framing.target;
      camera.position.set(px + drift * 0.6, py + Math.cos(TAU * t) * 0.15, pz);
      camera.lookAt(tx + drift * 0.3, ty, tz);
      camera.updateMatrixWorld(true);
      camera.updateProjectionMatrix();
    },
    count: visible.length,
  };
}
