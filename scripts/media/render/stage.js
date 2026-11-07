// Offline frame renderer, driven by render.mjs through window.renderFrame.
// 1. Several sub-pixel jittered renders are averaged into a sharp, anti-aliased image.
// 2. A gather depth-of-field pass blurs it: each tap counts only if its own circle of
//    confusion reaches the pixel, and background taps cannot blur over sharper foreground.
// 3. Tone mapping, vignette and grain produce the 8-bit frame.
import * as THREE from 'three';

const params = new URLSearchParams(location.search);
const sceneName = params.get('scene') ?? 'blocks';
const variant = params.get('variant') ?? 'landscape';
const width = Number(params.get('w') ?? 1920);
const height = Number(params.get('h') ?? 1080);

const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
document.body.append(canvas);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false,
  preserveDrawingBuffer: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(1);
renderer.setSize(width, height, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
// Lights do not move between sub-frames, so one shadow pass per frame is enough.
renderer.shadowMap.autoUpdate = false;
renderer.autoClear = false;

const depthTexture = new THREE.DepthTexture(width, height);
depthTexture.type = THREE.FloatType;
const sampleTarget = new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType, depthTexture });
const accumTarget = new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType, depthBuffer: false });
const dofTarget = new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType, depthBuffer: false });

const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const quadGeometry = new THREE.PlaneGeometry(2, 2);
const vertexShader = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';

const accumulate = new THREE.ShaderMaterial({
  uniforms: { map: { value: null }, weight: { value: 1 } },
  vertexShader,
  fragmentShader:
    'uniform sampler2D map; uniform float weight; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(map, vUv).rgb * weight, 1.0); }',
  blending: THREE.AdditiveBlending,
  depthTest: false,
  depthWrite: false,
  transparent: true,
});

const TAPS = 360;
const dof = new THREE.ShaderMaterial({
  uniforms: {
    map: { value: accumTarget.texture },
    depth: { value: depthTexture },
    near: { value: 0.5 },
    far: { value: 260 },
    focus: { value: 20 },
    aperture: { value: 40 },
    maxRadius: { value: 36 },
    resolution: { value: new THREE.Vector2(width, height) },
  },
  vertexShader,
  fragmentShader: /* glsl */ `
    uniform sampler2D map; uniform sampler2D depth;
    uniform float near; uniform float far; uniform float focus; uniform float aperture; uniform float maxRadius;
    uniform vec2 resolution;
    varying vec2 vUv;
    const int TAPS = ${TAPS};
    float viewZ(vec2 uv){ float d = texture2D(depth, uv).x; return near * far / (far - d * (far - near)); }
    float coc(float z){ return min(abs(z - focus) / z * aperture, maxRadius); }
    void main(){
      float z0 = viewZ(vUv);
      float c0 = coc(z0);
      vec3 sum = texture2D(map, vUv).rgb;
      float total = 1.0;
      for (int i = 0; i < TAPS; i++) {
        float r = sqrt((float(i) + 0.5) / float(TAPS)) * maxRadius;
        float a = float(i) * 2.399963229728653;
        vec2 uv = vUv + vec2(cos(a), sin(a)) * r / resolution;
        float zi = viewZ(uv);
        float ci = coc(zi);
        // A sharper surface in front must not be covered by a blurred one behind it.
        if (zi > z0) ci = min(ci, c0);
        float w = smoothstep(r - 1.0, r + 1.0, ci);
        sum += texture2D(map, uv).rgb * w;
        total += w;
      }
      gl_FragColor = vec4(sum / total, 1.0);
    }
  `,
  depthTest: false,
  depthWrite: false,
});

// Tone mapping, sRGB encoding, a soft vignette and a little film grain. The grain also
// dithers the dark gradients so the 8-bit output does not band.
const finish = new THREE.ShaderMaterial({
  uniforms: {
    map: { value: dofTarget.texture },
    exposure: { value: 1 },
    vignette: { value: 0.35 },
    grain: { value: 0.025 },
    seed: { value: 0 },
    lift: { value: 0 },
  },
  vertexShader,
  fragmentShader: /* glsl */ `
    uniform sampler2D map; uniform float exposure; uniform float vignette; uniform float grain; uniform float seed; uniform float lift;
    varying vec2 vUv;
    vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
    float hash(vec2 p){ p = fract(p*vec2(443.897, 441.423) + seed); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
    vec3 toSrgb(vec3 c){ return mix(c*12.92, 1.055*pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }
    void main(){
      vec3 c = texture2D(map, vUv).rgb * exposure;
      c = aces(c);
      vec2 d = vUv - 0.5;
      c *= 1.0 - vignette * smoothstep(0.25, 0.85, length(d * vec2(1.0, 0.85)));
      c = toSrgb(c) + lift;
      float n = hash(gl_FragCoord.xy) + hash(gl_FragCoord.xy + 17.0) - 1.0;
      c += n * grain * (0.35 + 0.65 * (1.0 - c));
      c += (hash(gl_FragCoord.yx + 3.1) - 0.5) / 255.0;
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }
  `,
  depthTest: false,
  depthWrite: false,
});

function quadScene(material) {
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(quadGeometry, material));
  return scene;
}
const accumulateScene = quadScene(accumulate);
const dofScene = quadScene(dof);
const finishScene = quadScene(finish);

function halton(index, base) {
  let f = 1;
  let r = 0;
  let i = index;
  while (i > 0) {
    f /= base;
    r += f * (i % base);
    i = Math.floor(i / base);
  }
  return r;
}

const { create } = await import(`./scenes/${sceneName}.js`);
const shot = await create(THREE, { width, height, variant, renderer });
finish.uniforms.exposure.value = shot.exposure ?? 1;
finish.uniforms.vignette.value = shot.vignette ?? 0.35;
finish.uniforms.grain.value = shot.grain ?? 0.025;
finish.uniforms.lift.value = shot.lift ?? 0;
dof.uniforms.near.value = shot.camera.near;
dof.uniforms.far.value = shot.camera.far;

function renderSample(index, count) {
  const camera = shot.camera;
  camera.updateProjectionMatrix();
  const e = camera.projectionMatrix.elements;
  e[8] -= (2 * (halton(index + 1, 2) - 0.5)) / width;
  e[9] -= (2 * (halton(index + 1, 3) - 0.5)) / height;
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();

  renderer.setRenderTarget(sampleTarget);
  renderer.setClearColor(shot.background ?? 0x000000, 1);
  renderer.clear(true, true, true);
  renderer.render(shot.scene, camera);

  accumulate.uniforms.map.value = sampleTarget.texture;
  accumulate.uniforms.weight.value = 1 / count;
  renderer.setRenderTarget(accumTarget);
  renderer.render(accumulateScene, quadCamera);
  camera.updateProjectionMatrix();
}

window.renderFrame = async (frame, total) => {
  const t = frame / total;
  shot.update(t, frame);
  renderer.shadowMap.needsUpdate = true;
  renderer.setRenderTarget(accumTarget);
  renderer.setClearColor(0x000000, 1);
  renderer.clear(true, false, false);
  const count = shot.samples ?? 12;
  const gl = renderer.getContext();
  const t0 = performance.now();
  for (let i = 0; i < count; i += 1) renderSample(i, count);

  dof.uniforms.focus.value = shot.focusDistance;
  dof.uniforms.aperture.value = shot.aperture ?? 0;
  dof.uniforms.maxRadius.value = shot.maxRadius ?? 36;
  renderer.setRenderTarget(dofTarget);
  renderer.render(dofScene, quadCamera);

  finish.uniforms.seed.value = (frame * 0.6180339887) % 1;
  renderer.setRenderTarget(null);
  renderer.clear(true, true, true);
  renderer.render(finishScene, quadCamera);
  gl.finish();
  window.lastTiming = { ms: Math.round(performance.now() - t0), instances: shot.count };
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  const buffer = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (let i = 0; i < buffer.length; i += 0x8000) binary += String.fromCharCode(...buffer.subarray(i, i + 0x8000));
  return btoa(binary);
};

const gl = renderer.getContext();
const info = gl.getExtension('WEBGL_debug_renderer_info');
window.renderInfo = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : 'unknown';
window.renderReady = true;
