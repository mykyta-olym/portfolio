// Stills: one column rising out of a calm field of blocks under a single top light.
// 'monolith' is the showcase picture, 'grid' a top-down field for the contact page.
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const shots = {
  monolith: { fov: 28, position: [3, 5.4, 27], target: [0, 4.6, 0], focus: 27.2, aperture: 30, size: 30, rise: 9 },
  grid: { fov: 34, position: [6, 26, 18], target: [0, 0, -2], focus: 31, aperture: 18, size: 40, rise: 0 },
};

export async function create(THREE, { variant, width, height }) {
  const shot = shots[variant] ?? shots.monolith;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.028);

  const camera = new THREE.PerspectiveCamera(shot.fov, width / height, 0.5, 260);
  camera.position.set(...shot.position);
  camera.lookAt(...shot.target);
  camera.updateMatrixWorld(true);

  const half = shot.size;
  const cells = [];
  for (let x = -half; x <= half; x += 1) for (let z = -half * 1.6; z <= half * 0.6; z += 1) cells.push([x, z]);
  // Nearest first for early depth rejection.
  cells.sort((a, b) => b[1] - a[1]);

  const material = new THREE.MeshStandardMaterial({ color: 0x47474b, roughness: 0.55, metalness: 0.08 });
  const geometry = new RoundedBoxGeometry(0.93, 24, 0.93, 2, 0.07);
  const mesh = new THREE.InstancedMesh(geometry, material, cells.length);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  const dummy = new THREE.Object3D();
  cells.forEach(([x, z], index) => {
    const distance = Math.hypot(x, z);
    const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
    const relief = (s - Math.floor(s)) * 0.35;
    const swell = Math.sin(x * 0.18 + z * 0.07) * 0.5 + Math.sin(z * 0.21 - x * 0.05) * 0.4;
    const isCentre = x === 0 && z === 0;
    const near = Math.max(0, 1 - distance / 2.2);
    const lift = isCentre ? shot.rise : near * shot.rise * 0.12;
    dummy.position.set(x, swell + relief + lift - 12, z);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  });
  scene.add(mesh);

  const key = new THREE.SpotLight(0xf1f3f7, 5200, 0, Math.PI / 7, 0.6, 2);
  key.position.set(-14, 26, 16);
  key.target.position.set(0, 0, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.04;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xc9d3e0, 3.2);
  rim.position.set(6, 9, -40);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0x8090a4, 0.5);
  fill.position.set(30, 6, 20);
  scene.add(fill);
  scene.add(new THREE.HemisphereLight(0x7d8796, 0x020202, 0.22));

  return {
    scene,
    camera,
    focusDistance: shot.focus,
    aperture: shot.aperture,
    maxRadius: 34,
    exposure: shot === shots.grid ? 1.5 : 1.25,
    vignette: 0.48,
    grain: 0.026,
    samples: 24,
    count: cells.length,
    update() {
      camera.position.set(...shot.position);
      camera.lookAt(...shot.target);
      camera.updateMatrixWorld(true);
      camera.updateProjectionMatrix();
    },
  };
}
