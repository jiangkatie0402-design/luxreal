'use client';
import { useEffect, useRef } from 'react';
import { usePerfStore } from '@/lib/perf';

/** Public asset base: "/" in the app, overridable for static previews. */
const BASE = process.env.NEXT_PUBLIC_ASSET_BASE ?? '/';

/**
 * The Aholo mascot (from the logo .blend, decimated, WebP textures) on a slow
 * turntable with a gentle float. three.js is loaded on demand; rendering pauses
 * off-screen, and reduced motion shows a still three-quarter view.
 */
export function Mascot({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const reduced = usePerfStore((s) => s.reducedMotion);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
      scene.add(new THREE.HemisphereLight(0xe9e2ff, 0x1a1238, 1.6));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(2, 3, 4);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xa78bfa, 3);
      rim.position.set(-3, 1.5, -3);
      scene.add(rim);

      const pivot = new THREE.Group();
      scene.add(pivot);
      const gltf = await new GLTFLoader().loadAsync(`${BASE}models/mascot.glb`);
      if (disposed) return;
      const model = gltf.scene;
      // centre the model and frame it
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const centre = box.getCenter(new THREE.Vector3());
      model.position.sub(centre);
      pivot.add(model);
      const radius = size.length() / 2;
      camera.position.set(
        0,
        radius * 0.15,
        (radius / Math.tan((camera.fov * Math.PI) / 360)) * 1.05,
      );
      camera.lookAt(0, 0, 0);

      const fit = () => {
        const w = el.clientWidth || 1;
        const h = el.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      fit();
      const ro = new ResizeObserver(fit);
      ro.observe(el);

      let raf = 0;
      let visible = false;
      const t0 = performance.now();
      const draw = (now: number) => {
        const t = reduced ? 0 : (now - t0) / 1000;
        pivot.rotation.y = -0.5 + t * 0.35;
        pivot.position.y = Math.sin(t * 1.2) * radius * 0.03;
        renderer.render(scene, camera);
        if (!reduced && visible && !document.hidden) raf = requestAnimationFrame(draw);
      };
      const resume = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      };
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible) resume();
      });
      io.observe(el);
      const onVis = () => !document.hidden && visible && resume();
      document.addEventListener('visibilitychange', onVis);
      resume();

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [reduced]);

  return <div ref={host} aria-hidden className={className} />;
}
