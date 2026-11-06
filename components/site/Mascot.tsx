'use client';
import { useEffect, useRef } from 'react';
import { usePerfStore } from '@/lib/perf';

/** Public asset base: "/" in the app, overridable for static previews. */
const BASE = process.env.NEXT_PUBLIC_ASSET_BASE ?? '/';

/**
 * The Aholo mascot (from the logo .blend, decimated, WebP textures), facing the
 * viewer with a gentle sway and float. three.js is loaded on demand; rendering pauses
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
      const { RoomEnvironment } =
        await import('three/examples/jsm/environments/RoomEnvironment.js');
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.toneMappingExposure = 1;
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
      // soft studio light: a room environment for reflections, plus a key and a violet rim
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environmentIntensity = 0.9;
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(-2, 3, 4);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xc4b5fd, 2.2);
      rim.position.set(3, 2, -3);
      scene.add(rim);

      const pivot = new THREE.Group();
      scene.add(pivot);
      const gltf = await new GLTFLoader().loadAsync(`${BASE}models/mascot.glb`);
      if (disposed) return;
      const model = gltf.scene;
      // The export maps the colour texture to emission at full strength, which
      // flattens the body into neon. Keep only a faint glow (eyes, orb, brush tip
      // are the lightest texels, so they still read as lit) and a soft satin finish.
      model.traverse((o) => {
        const mesh = o as import('three').Mesh;
        const m = mesh.material as import('three').MeshStandardMaterial | undefined;
        if (!m || !('emissiveIntensity' in m)) return;
        m.emissiveIntensity = 0.12;
        m.envMapIntensity = 0.8;
      });
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
        // face the viewer and sway gently instead of turning its back
        pivot.rotation.y = Math.sin(t * 0.45) * 0.5;
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
        pmrem.dispose();
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
