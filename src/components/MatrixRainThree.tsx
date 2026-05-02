import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

type Props = {
  className?: string;
  active?: boolean;
  /** Optional GLB in `public/` (e.g. `/models/hero.glb`) — same pattern as sector77’s GLTF/STL hero */
  modelUrl?: string;
};

function disposeHierarchy(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.geometry?.dispose();
      const mat = mesh.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    }
  });
}

function clearHeroGroup(group: THREE.Group) {
  while (group.children.length) {
    const ch = group.children[0];
    group.remove(ch);
    disposeHierarchy(ch);
  }
}

export function MatrixRainThree({
  className,
  active = true,
  modelUrl,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !mountRef.current) {
      return undefined;
    }

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05080c);
    scene.fog = new THREE.FogExp2(0x070a10, 0.045);

    const camera = new THREE.PerspectiveCamera(
      42,
      Math.max(1, mount.clientWidth) / Math.max(1, mount.clientHeight),
      0.08,
      200
    );
    camera.position.set(0, 0.95, 6.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = true;
    controls.zoomSpeed = 0.85;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;
    controls.minDistance = 2.6;
    controls.maxDistance = 16;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.target.set(0, 0.15, 0);
    controls.listenToKeyEvents(window);

    const hemi = new THREE.HemisphereLight(0x3a5068, 0x0a1008, 0.85);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(4.5, 6, 5);
    scene.add(key);

    const rimA = new THREE.PointLight(0x40ffa8, 2.2, 24, 1.8);
    rimA.position.set(-3.8, 1.2, 2.4);
    scene.add(rimA);

    const rimB = new THREE.PointLight(0xff5ec8, 1.35, 20, 1.6);
    rimB.position.set(4.2, 0.4, -2.8);
    scene.add(rimB);

    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    const buildProceduralHero = () => {
      clearHeroGroup(heroGroup);

      const knotGeom = new THREE.TorusKnotGeometry(0.62, 0.21, 280, 40);

      const bodyMat = new THREE.MeshPhysicalMaterial({
        color: 0x152218,
        metalness: 0.88,
        roughness: 0.32,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        emissive: 0x002a18,
        emissiveIntensity: 0.35,
      });

      const knot = new THREE.Mesh(knotGeom, bodyMat);
      heroGroup.add(knot);

      const wireGeom = knotGeom.clone();
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x5dff9a,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      });
      heroGroup.add(new THREE.Mesh(wireGeom, wireMat));

      for (let i = 0; i < 3; i++) {
        const ringGeom = new THREE.TorusGeometry(1.05 + i * 0.22, 0.018, 12, 96);
        const ringMat = new THREE.MeshBasicMaterial({
          color: i === 1 ? 0xff4db8 : 0x39ff8c,
          transparent: true,
          opacity: 0.22 - i * 0.05,
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 2 + (i - 1) * 0.12;
        ring.rotation.z = i * 0.4;
        heroGroup.add(ring);
      }

      for (let i = 0; i < 6; i++) {
        const satGeom = new THREE.IcosahedronGeometry(0.12, 1);
        const satMat = new THREE.MeshPhysicalMaterial({
          color: 0x0a1810,
          metalness: 0.7,
          roughness: 0.25,
          emissive: 0x00ff66,
          emissiveIntensity: 0.8,
        });
        const sat = new THREE.Mesh(satGeom, satMat);
        const a = (i / 6) * Math.PI * 2;
        sat.position.set(Math.cos(a) * 1.85, Math.sin(a * 2) * 0.35, Math.sin(a) * 1.85);
        heroGroup.add(sat);
      }
    };

    let cancelled = false;

    const applyGltf = (gltf: { scene: THREE.Object3D }) => {
      if (cancelled) return;
      clearHeroGroup(heroGroup);

      const root = gltf.scene.clone(true);

      const box = new THREE.Box3().setFromObject(root);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z, 1e-6);
      const scale = 2.35 / maxDim;
      root.scale.setScalar(scale);

      const c = box.getCenter(new THREE.Vector3()).multiplyScalar(scale);
      root.position.sub(c);

      heroGroup.add(root);
    };

    if (modelUrl) {
      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        applyGltf,
        undefined,
        () => {
          if (!cancelled) buildProceduralHero();
        }
      );
    } else {
      buildProceduralHero();
    }

    const grid = new THREE.GridHelper(48, 48, 0x1a3328, 0x0d1812);
    grid.position.y = -2.35;
    const gridMats = grid.material;
    if (Array.isArray(gridMats)) {
      gridMats.forEach((m) => {
        (m as THREE.LineBasicMaterial).transparent = true;
        (m as THREE.LineBasicMaterial).opacity = 0.35;
      });
    } else {
      (gridMats as THREE.LineBasicMaterial).transparent = true;
      (gridMats as THREE.LineBasicMaterial).opacity = 0.35;
    }
    scene.add(grid);

    const starCount = 1800;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 42 + Math.random() * 58;
      const u = Math.random() * 2 - 1;
      const a = Math.random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      starPos[i * 3] = r * s * Math.cos(a);
      starPos[i * 3 + 1] = r * u * 0.65 + 8;
      starPos[i * 3 + 2] = r * s * Math.sin(a);
    }
    const starsGeom = new THREE.BufferGeometry();
    starsGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0x9ecfff,
      size: 0.035,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starsGeom, starsMat);
    scene.add(stars);

    let rafId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      heroGroup.rotation.y = t * 0.09;
      heroGroup.rotation.x = Math.sin(t * 0.31) * 0.06;

      heroGroup.children.forEach((ch, i) => {
        if (ch instanceof THREE.Mesh && ch.geometry?.type === 'TorusGeometry') {
          ch.rotation.z = t * (0.22 + i * 0.05);
        }
      });

      rimA.intensity = 2.0 + Math.sin(t * 1.7) * 0.35;
      stars.rotation.y = t * 0.018;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = Math.max(1, w) / Math.max(1, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      controls.dispose();

      clearHeroGroup(heroGroup);
      scene.remove(heroGroup);

      scene.remove(grid);
      grid.geometry.dispose();
      const gm = grid.material;
      if (Array.isArray(gm)) gm.forEach((m) => m.dispose());
      else gm.dispose();

      scene.remove(stars);
      starsGeom.dispose();
      starsMat.dispose();

      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [active, modelUrl]);

  return <div ref={mountRef} className={className} />;
}
