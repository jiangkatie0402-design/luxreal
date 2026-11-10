import * as THREE from 'three';
import { Viewer, RenderMode, SceneRevealMode, SceneFormat } from './vendor/gaussian-splats-3d-0.4.7/gaussian-splats-3d.module.js';

const english = new URLSearchParams(location.search).get('lang') === 'en';
document.documentElement.lang = english ? 'en' : 'zh-CN';
const labels = english ? {
  title: 'Sports park · 3D preview', canvas: 'Interactive 3D sports park. Drag to orbit; arrow keys to rotate; plus and minus to zoom.',
  loading: 'Loading the 3D scene…', error: '3D preview unavailable. Showing the reference image.',
  reset: 'Reset view', fullscreen: 'Full screen', zoomIn: 'Zoom in', zoomOut: 'Zoom out', hint: 'Drag to orbit · Use + / − to zoom'
} : {
  title: '运动公园 · 3D 预览', canvas: '可交互的球场三维场景。拖动旋转，方向键调整视角，加减键缩放。',
  loading: '正在载入 3D 场景…', error: '3D 预览暂不可用，已显示场景参考图。',
  reset: '重置视角', fullscreen: '全屏查看', zoomIn: '放大', zoomOut: '缩小', hint: '拖动旋转 · 点按 + / − 缩放'
};
document.title = labels.title;
document.getElementById('hint').textContent = labels.hint;
document.getElementById('loading').textContent = labels.loading;
for (const [id, label] of [['reset', labels.reset], ['fullscreen', labels.fullscreen], ['zoom-in', labels.zoomIn], ['zoom-out', labels.zoomOut]]) {
  const button = document.getElementById(id);
  button.title = label;
  button.setAttribute('aria-label', label);
}
const root = document.getElementById('scene');
const poster = document.getElementById('poster');
const initialPosition = new THREE.Vector3(185, -320, 330);
const initialTarget = new THREE.Vector3(0, 3, 0);
let viewer;
let ready = false;
let active = true;
let failed = false;
let loadWatchdog;

function notify(type) {
  if (parent !== window) parent.postMessage({ type }, location.origin);
}
function renderAgain() {
  if (viewer && ready) viewer.forceRenderNextFrame();
}
function setActive(value) {
  active = value;
  if (!ready || !viewer) return;
  if (value && !document.hidden) {
    if (!viewer.selfDrivenModeRunning) viewer.start();
    renderAgain();
  } else {
    viewer.stop();
  }
}
function zoom(factor) {
  if (!ready) return;
  const offset = viewer.camera.position.clone().sub(viewer.controls.target);
  const distance = THREE.MathUtils.clamp(offset.length() * factor, 220, 1000);
  offset.setLength(distance);
  viewer.camera.position.copy(viewer.controls.target).add(offset);
  viewer.controls.update();
  renderAgain();
}
function reset() {
  if (!ready) return;
  viewer.camera.position.copy(initialPosition);
  viewer.controls.target.copy(initialTarget);
  viewer.camera.up.set(0, -1, 0);
  viewer.camera.lookAt(initialTarget);
  viewer.controls.update();
  renderAgain();
}
function showError(error) {
  if (failed) return;
  failed = true;
  clearTimeout(loadWatchdog);
  document.documentElement.dataset.sceneState = 'error';
  document.body.classList.remove('is-loading');
  poster.classList.remove('is-ready');
  document.getElementById('loading').textContent = labels.error;
  console.error('Stadium preview could not load:', error);
  notify('aholo-scene-error');
}

try {
  document.body.classList.add('is-loading');
  document.documentElement.dataset.sceneState = 'loading';
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#121116');
  viewer = new Viewer({
    rootElement: root,
    threeScene: scene,
    cameraUp: [0, -1, 0],
    initialCameraPosition: initialPosition.toArray(),
    initialCameraLookAt: initialTarget.toArray(),
    sharedMemoryForWorkers: false,
    gpuAcceleratedSort: false,
    integerBasedSort: false,
    sphericalHarmonicsDegree: 0,
    ignoreDevicePixelRatio: true,
    useBuiltInControls: true,
    selfDrivenMode: true,
    renderMode: RenderMode.OnChange,
    sceneRevealMode: SceneRevealMode.Instant,
    antialiased: false,
    dynamicScene: false,
    logLevel: 0
  });
  viewer.camera.fov = 41;
  viewer.camera.far = 2500;
  viewer.camera.updateProjectionMatrix();
  viewer.controls.enablePan = false;
  viewer.controls.enableZoom = false; // Do not trap page scrolling; use the explicit zoom controls.
  viewer.controls.minDistance = 220;
  viewer.controls.maxDistance = 1000;
  viewer.controls.minPolarAngle = .13;
  viewer.controls.maxPolarAngle = 1.4;
  viewer.controls.rotateSpeed = .45;
  viewer.controls.enableDamping = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  viewer.controls.stopListenToKeyEvents();
  const canvas = viewer.renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', labels.canvas);
  canvas.setAttribute('role', 'img');
  canvas.style.touchAction = 'pan-y';
  canvas.addEventListener('keydown', event => {
    if (!ready) return;
    if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(.88); return; }
    if (event.key === '-' || event.key === '_') { event.preventDefault(); zoom(1.13); return; }
    if (event.key.toLowerCase() === 'r') { event.preventDefault(); reset(); return; }
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const offset = viewer.camera.position.clone().sub(viewer.controls.target);
    const upRotation = new THREE.Quaternion().setFromUnitVectors(viewer.camera.up, new THREE.Vector3(0, 1, 0));
    offset.applyQuaternion(upRotation);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    if (event.key === 'ArrowLeft') spherical.theta -= .12;
    if (event.key === 'ArrowRight') spherical.theta += .12;
    if (event.key === 'ArrowUp') spherical.phi -= .08;
    if (event.key === 'ArrowDown') spherical.phi += .08;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi, .13, 1.4);
    offset.setFromSpherical(spherical).applyQuaternion(upRotation.invert());
    viewer.camera.position.copy(viewer.controls.target).add(offset);
    viewer.controls.update();
    renderAgain();
  });
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); showError(new Error('WebGL context lost')); });
  canvas.addEventListener('wheel', event => {
    if (event.ctrlKey || event.metaKey) { event.preventDefault(); zoom(event.deltaY > 0 ? 1.07 : .94); }
  }, { passive: false });
  loadWatchdog = setTimeout(() => showError(new Error('Model loading timed out')), 60000);
  // The model ships as assets/stadium.splat; hosts that cannot serve that file type get it as
  // three base64 script chunks instead.
  const splatUrl = await (async () => {
    try { const r = await fetch('assets/stadium.splat', { method: 'HEAD' }); if (r.ok && +(r.headers.get('content-length') || 0) > 1e6 && !/html/.test(r.headers.get('content-type') || '')) return 'assets/stadium.splat'; } catch {}
    await Promise.all([0, 1, 2].map(i => new Promise((ok, no) => { const sc = document.createElement('script'); sc.src = `assets/stadium-splat-${i}.js`; sc.onload = ok; sc.onerror = no; document.head.appendChild(sc); })));
    const parts = window.__AHOLO_SPLAT__.map(p => Uint8Array.from(atob(p), c => c.charCodeAt(0)));
    window.__AHOLO_SPLAT__ = null;
    return URL.createObjectURL(new Blob(parts));
  })();
  await viewer.addSplatScene(splatUrl, {
    format: SceneFormat.Splat,
    showLoadingUI: false,
    progressiveLoad: false,
    splatAlphaRemovalThreshold: 3
  });
  if (!failed) {
    clearTimeout(loadWatchdog);
    ready = true;
    document.documentElement.dataset.sceneState = 'ready';
    document.documentElement.dataset.splatCount = '654560';
    viewer.start();
    viewer.forceRenderNextFrame();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      poster.classList.add('is-ready');
      document.body.classList.remove('is-loading');
      notify('aholo-scene-ready');
      setActive(active);
    }));
  }
} catch (error) {
  showError(error);
}

document.getElementById('reset').addEventListener('click', reset);
document.getElementById('zoom-in').addEventListener('click', () => zoom(.87));
document.getElementById('zoom-out').addEventListener('click', () => zoom(1.15));
document.getElementById('fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { /* Fullscreen may be unavailable in an embedding host; the normal view stays usable. */ }
});
window.addEventListener('message', event => {
  if (event.source !== parent || event.origin !== location.origin) return;
  if (event.data?.type === 'aholo-scene-visibility') setActive(Boolean(event.data.active));
  if (event.data?.type === 'aholo-scene-reset') reset();
});
document.addEventListener('visibilitychange', () => setActive(active));
window.addEventListener('pagehide', () => {
  clearTimeout(loadWatchdog);
  viewer?.stop();
  viewer?.dispose().catch(() => {});
}, { once: true });
