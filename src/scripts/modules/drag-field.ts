// The reference's Infinite Drag Image pattern: wrapped textured planes, curvature and
// a 500 -> 450 camera move during a drag. Source and adaptations are in ASSETS.md.
import {
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from 'three';
import { damp } from '@/lib/math';
import { coarsePointer, reducedMotion, type Cleanup } from '@/scripts/core/motion';
import { gsap } from '@/scripts/core/gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(Draggable, InertiaPlugin);

export function initDragField(field: HTMLElement): Cleanup {
  if (reducedMotion()) {
    field.classList.add('is-static');
    return () => undefined;
  }
  const images = [...field.querySelectorAll<HTMLImageElement>('[data-field-tile] img')];
  const title = field.querySelector<HTMLElement>('[data-field-title]');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true });
  if (!context || images.length === 0) {
    field.classList.add('is-static');
    return () => undefined;
  }
  canvas.dataset['fieldCanvas'] = '';
  canvas.setAttribute('aria-hidden', 'true');
  const renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 1500);
  camera.position.z = 500;
  // The source paints its image layer after the heading: dragged planes can pass in front.
  field.append(canvas);
  const planes: Mesh<PlaneGeometry, MeshBasicMaterial>[] = [];
  const base: { x: number; y: number }[] = [];
  const normal = new Vector3();
  const front = new Vector3(0, 0, 1);
  const rotation = new Quaternion();
  const touch = coarsePointer();
  let gridW = 1,
    gridH = 1,
    radius = 1;
  let disposed = false,
    visible = true,
    frame = 0,
    previous = 0;
  let dragging = false;
  let targetX = 0,
    targetY = 0,
    offsetX = 0,
    offsetY = 0;
  let curve = 0;
  let titleX = 0,
    titleY = 0,
    titleTargetX = 0,
    titleTargetY = 0,
    blur = 0,
    targetBlur = 0;

  const measure = (): void => {
    const width = field.clientWidth,
      height = field.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    radius = Math.min(width, height) * 1.2;
    const planeW = width <= 1024 ? 135 : 200;
    const heights = images.map((image) => (planeW * image.height) / image.width);
    const cellW = planeW * 1.12;
    const cellH = Math.max(...heights) + planeW * 0.12;
    gridW = 4 * cellW;
    gridH = Math.ceil(images.length / 4) * cellH;
    planes.forEach((plane, i) => {
      plane.geometry.dispose();
      plane.geometry = new PlaneGeometry(planeW, heights[i]);
      // Bounded offsets leave breathing room between the photographs.
      base[i] = { x: ((i % 4) + 0.5) * cellW + Math.sin(i * 7) * 5, y: (Math.floor(i / 4) + 0.5) * cellH + Math.cos(i * 3) * 5 };
    });
  };
  const wrap = (value: number, size: number): number => (((value % size) + size) % size) - size / 2;
  const render = (now: number): void => {
    const dt = previous ? Math.min(0.064, (now - previous) / 1000) : 1 / 60;
    previous = now;
    offsetX += (targetX - offsetX) * damp(21, dt);
    offsetY += (targetY - offsetY) * damp(21, dt);
    curve += ((dragging ? 1 : 0) - curve) * damp(13, dt);
    camera.position.z += ((dragging ? 450 : 500) - camera.position.z) * damp(5, dt);
    planes.forEach((plane, i) => {
      const position = base[i];
      if (!position) return;
      const x = wrap(position.x + offsetX * 0.8, gridW);
      const y = wrap(position.y - offsetY * 0.8, gridH);
      const nx = x / (gridW / 2),
        ny = y / (gridH / 2);
      const distance = Math.hypot(nx, ny);
      const z = radius * 0.2 * curve * 0.45 * Math.max(0, 1 - distance * 0.9);
      plane.position.set(x, y, plane.position.z + (z - plane.position.z) * damp(6, dt));
      normal
        .set(nx, ny, 1)
        .normalize()
        .lerp(front, 1 - Math.max(0, 1 - distance * 0.8) * curve);
      rotation.setFromUnitVectors(front, normal.normalize());
      plane.quaternion.slerp(rotation, damp(3 + curve * 6, dt));
      plane.scale.setScalar(0.6);
    });
    titleX += (titleTargetX - titleX) * damp(10, dt);
    titleY += (titleTargetY - titleY) * damp(10, dt);
    blur += (targetBlur - blur) * damp(10, dt);
    if (title) {
      title.style.transform = `translate3d(${titleX.toFixed(2)}px, ${titleY.toFixed(2)}px, 0)`;
      title.style.filter = `blur(${blur.toFixed(2)}px)`;
    }
    renderer.render(scene, camera);
    const moving =
      dragging ||
      Math.hypot(targetX - offsetX, targetY - offsetY, titleX, titleY) > 0.02 ||
      curve > 0.001 ||
      blur > 0.01 ||
      Math.abs(camera.position.z - 500) > 0.05;
    frame = moving && visible && !document.hidden ? requestAnimationFrame(render) : 0;
  };
  const kick = (): void => {
    if (!frame && visible && !document.hidden && !disposed && planes.length) {
      previous = 0;
      frame = requestAnimationFrame(render);
    }
  };
  const stop = (): void => {
    cancelAnimationFrame(frame);
    frame = 0;
  };
  // A detached proxy lets Draggable own pointer capture and inertia without moving the canvas.
  const proxy = document.createElement('div');
  const syncDrag = function (this: Draggable): void {
    targetX = this.x * 1.2;
    targetY = touch ? 0 : this.y * 1.2;
    if (dragging) {
      titleTargetX = this.deltaX * 0.5;
      titleTargetY = touch ? 0 : this.deltaY * 0.5;
      targetBlur = Math.min(8, Math.hypot(this.deltaX, touch ? 0 : this.deltaY) * 0.3);
    }
    kick();
  };
  const [drag] = Draggable.create(proxy, {
    trigger: field,
    type: touch ? 'x' : 'x,y',
    inertia: true,
    throwResistance: 1800,
    maxDuration: 1.1,
    minimumMovement: 3,
    zIndexBoost: false,
    cursor: 'grab',
    activeCursor: 'grabbing',
    onPress() {
      dragging = true;
      field.classList.add('is-dragging');
      kick();
    },
    onDrag: syncDrag,
    onThrowUpdate: syncDrag,
    onRelease() {
      dragging = false;
      titleTargetX = titleTargetY = targetBlur = 0;
      field.classList.remove('is-dragging');
      kick();
    },
  });
  const onVisibility = (): void => {
    if (document.hidden) stop();
    else kick();
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    if (visible) kick();
    else stop();
  });
  observer.observe(field);
  const resize = new ResizeObserver(() => {
    measure();
    kick();
  });
  resize.observe(field);
  const loader = new TextureLoader();
  void Promise.all(images.map((image) => loader.loadAsync(image.currentSrc || image.src)))
    .then((textures) => {
      if (disposed) {
        textures.forEach((texture) => texture.dispose());
        return;
      }
      textures.forEach((texture) => {
        texture.colorSpace = SRGBColorSpace;
        const plane = new Mesh(new PlaneGeometry(), new MeshBasicMaterial({ map: texture, side: DoubleSide }));
        planes.push(plane);
        scene.add(plane);
      });
      measure();
      render(performance.now());
      field.classList.add('has-webgl');
    })
    .catch(() => {
      canvas.remove();
      field.classList.add('is-static');
    });
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    disposed = true;
    stop();
    observer.disconnect();
    resize.disconnect();
    drag?.tween?.kill();
    drag?.kill();
    document.removeEventListener('visibilitychange', onVisibility);
    planes.forEach((plane) => {
      plane.geometry.dispose();
      plane.material.map?.dispose();
      plane.material.dispose();
    });
    renderer.dispose();
    canvas.remove();
    field.classList.remove('has-webgl');
  };
}
