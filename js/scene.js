import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

const canvas = document.querySelector("#hero-canvas");

if (canvas) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isMobile = window.matchMedia("(max-width: 800px)").matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
  const maxPixelRatio = isMobile ? 1.25 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(null);

  // Fewer geometry segments on mobile reduce GPU/CPU work with almost no visual loss.
  const geometry = new THREE.TorusKnotGeometry(1.05, 0.3, isMobile ? 96 : 180, isMobile ? 20 : 32);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x202020,
    metalness: 0.95,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
  });

  const object = new THREE.Mesh(geometry, material);
  object.position.set(1.45, 0, 0);
  object.rotation.set(0.5, 0.4, 0);
  scene.add(object);

  const keyLight = new THREE.DirectionalLight(0xffffff, 5);
  keyLight.position.set(4, 4, 6);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x777777, 4);
  rimLight.position.set(-4, -2, -2);
  scene.add(rimLight);

  const softLight = new THREE.PointLight(0xffffff, 8, 15);
  softLight.position.set(0, 1, 3);
  scene.add(softLight);
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  let mouseX = 0;
  let mouseY = 0;
  let scrollY = window.scrollY;
  let frameId = null;
  const clock = new THREE.Clock();

  if (finePointer && !reduceMotion) {
    window.addEventListener(
      "pointermove",
      (event) => {
        mouseX = event.clientX / window.innerWidth - 0.5;
        mouseY = event.clientY / window.innerHeight - 0.5;
      },
      { passive: true }
    );
  }

  window.addEventListener(
    "scroll",
    () => {
      scrollY = window.scrollY;
    },
    { passive: true }
  );

  const renderStaticFrame = () => {
    object.rotation.set(0.5, 0.4, 0);
    object.position.set(1.45, 0, 0);
    renderer.render(scene, camera);
  };

  const animate = () => {
    if (document.hidden) {
      frameId = null;
      return;
    }

    const elapsed = clock.getElapsedTime();
    const interactionX = finePointer ? mouseX : 0;
    const interactionY = finePointer ? mouseY : 0;

    object.rotation.x = elapsed * 0.08 + interactionY * 0.4;
    object.rotation.y = elapsed * 0.12 + interactionX * 0.6;
    object.rotation.z = elapsed * 0.04;
    object.position.y = Math.sin(elapsed * 0.7) * 0.08;
    object.position.x += (1.45 + interactionX * 0.25 - object.position.x) * 0.03;

    const scrollProgress = Math.min(scrollY / window.innerHeight, 1);
    object.scale.setScalar(1 - scrollProgress * 0.25);
    object.rotation.z += scrollProgress * 0.002;

    renderer.render(scene, camera);
    frameId = requestAnimationFrame(animate);
  };

  const startRendering = () => {
    if (reduceMotion) {
      renderStaticFrame();
      return;
    }
    if (!frameId) {
      clock.start();
      frameId = requestAnimationFrame(animate);
    }
  };

  startRendering();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && frameId) {
      cancelAnimationFrame(frameId);
      frameId = null;
      clock.stop();
    } else if (!document.hidden) {
      startRendering();
    }
  });

  let resizeFrame = null;
  window.addEventListener(
    "resize",
    () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
        if (reduceMotion) renderStaticFrame();
        resizeFrame = null;
      });
    },
    { passive: true }
  );
}
