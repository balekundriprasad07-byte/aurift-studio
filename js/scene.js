const canvas = document.querySelector("#hero-canvas");
const heroWrapper = document.querySelector(".hero-canvas-wrap");

function showHeroFallback() {
  if (canvas) {
    canvas.style.display = "none";
  }

  if (heroWrapper) {
    heroWrapper.setAttribute("data-webgl-fallback", "true");
    heroWrapper.style.background =
      "radial-gradient(circle at 70% 45%, rgba(255,255,255,0.12), rgba(255,255,255,0.03) 28%, transparent 58%)";
  }

  document.documentElement.classList.add("no-webgl");
}

function supportsWebGL() {
  try {
    const testCanvas = document.createElement("canvas");

    return Boolean(
      window.WebGLRenderingContext &&
        (
          testCanvas.getContext("webgl2") ||
          testCanvas.getContext("webgl") ||
          testCanvas.getContext("experimental-webgl")
        )
    );
  } catch (error) {
    return false;
  }
}

async function initHeroScene() {
  if (!canvas) {
    return;
  }

  if (!supportsWebGL()) {
    console.info("Aurift: WebGL unavailable. Using hero fallback.");
    showHeroFallback();
    return;
  }

  let THREE;

  try {
    THREE = await import(
      "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js"
    );
  } catch (error) {
    console.warn(
      "Aurift: Three.js could not be loaded. Using hero fallback.",
      error
    );

    showHeroFallback();
    return;
  }

  const isTouchDevice =
    window.matchMedia("(pointer: coarse)").matches ||
    "ontouchstart" in window;

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  camera.position.z = 6;

  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !isTouchDevice,
      powerPreference: "high-performance"
    });
  } catch (error) {
    console.warn(
      "Aurift: WebGL renderer failed to initialize. Using hero fallback.",
      error
    );

    showHeroFallback();
    return;
  }

  const maxPixelRatio = isTouchDevice ? 1.25 : 1.75;

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, maxPixelRatio)
  );

  renderer.setSize(
    window.innerWidth,
    window.innerHeight,
    false
  );

  const tubularSegments = isTouchDevice ? 110 : 160;
  const radialSegments = isTouchDevice ? 20 : 28;

  let geometry;
  let material;
  let object;

  try {
    geometry = new THREE.TorusKnotGeometry(
      1.05,
      0.3,
      tubularSegments,
      radialSegments
    );

    material = new THREE.MeshPhysicalMaterial({
      color: 0x202020,
      metalness: 0.95,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.15
    });

    object = new THREE.Mesh(
      geometry,
      material
    );

    object.position.set(
      isTouchDevice ? 0.9 : 1.45,
      0,
      0
    );

    object.rotation.set(
      0.5,
      0.4,
      0
    );

    scene.add(object);

    const keyLight = new THREE.DirectionalLight(
      0xffffff,
      5
    );

    keyLight.position.set(4, 4, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(
      0x777777,
      4
    );

    rimLight.position.set(-4, -2, -2);
    scene.add(rimLight);

    const softLight = new THREE.PointLight(
      0xffffff,
      8,
      15
    );

    softLight.position.set(0, 1, 3);
    scene.add(softLight);

    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      0.4
    );

    scene.add(ambientLight);
  } catch (error) {
    console.warn(
      "Aurift: Hero scene creation failed. Using fallback.",
      error
    );

    renderer.dispose();
    showHeroFallback();
    return;
  }

  let mouseX = 0;
  let mouseY = 0;
  let scrollY = window.scrollY;

  if (!isTouchDevice && !prefersReducedMotion) {
    window.addEventListener(
      "pointermove",
      (event) => {
        mouseX =
          event.clientX / window.innerWidth -
          0.5;

        mouseY =
          event.clientY / window.innerHeight -
          0.5;
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

  const clock = new THREE.Clock();

  let animationFrameId = null;
  let running = false;

  function renderStaticFrame() {
    const scrollProgress = Math.min(
      scrollY / window.innerHeight,
      1
    );

    object.scale.setScalar(
      1 - scrollProgress * 0.25
    );

    renderer.render(
      scene,
      camera
    );
  }

  function animate() {
    if (!running) {
      return;
    }

    const elapsed =
      clock.getElapsedTime();

    object.rotation.x =
      elapsed * 0.08 +
      mouseY * 0.4;

    object.rotation.y =
      elapsed * 0.12 +
      mouseX * 0.6;

    object.rotation.z =
      elapsed * 0.04;

    object.position.y =
      Math.sin(
        elapsed * 0.7
      ) * 0.08;

    object.position.x +=
      (
        (isTouchDevice ? 0.9 : 1.45) +
        mouseX * 0.25 -
        object.position.x
      ) * 0.03;

    const scrollProgress = Math.min(
      scrollY / window.innerHeight,
      1
    );

    object.scale.setScalar(
      1 - scrollProgress * 0.25
    );

    object.rotation.z +=
      scrollProgress * 0.002;

    renderer.render(
      scene,
      camera
    );

    animationFrameId =
      requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (
      running ||
      document.hidden ||
      prefersReducedMotion
    ) {
      return;
    }

    running = true;
    clock.start();
    animate();
  }

  function stopAnimation() {
    running = false;

    if (animationFrameId !== null) {
      cancelAnimationFrame(
        animationFrameId
      );

      animationFrameId = null;
    }
  }

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        stopAnimation();
      } else if (prefersReducedMotion) {
        renderStaticFrame();
      } else {
        startAnimation();
      }
    }
  );

  let resizeFrame = null;

  window.addEventListener(
    "resize",
    () => {
      if (resizeFrame !== null) {
        cancelAnimationFrame(
          resizeFrame
        );
      }

      resizeFrame =
        requestAnimationFrame(() => {
          camera.aspect =
            window.innerWidth /
            window.innerHeight;

          camera.updateProjectionMatrix();

          renderer.setSize(
            window.innerWidth,
            window.innerHeight,
            false
          );

          renderer.setPixelRatio(
            Math.min(
              window.devicePixelRatio || 1,
              maxPixelRatio
            )
          );

          if (prefersReducedMotion) {
            renderStaticFrame();
          }

          resizeFrame = null;
        });
    },
    { passive: true }
  );

  if (prefersReducedMotion) {
    renderStaticFrame();
  } else {
    startAnimation();
  }

  window.addEventListener(
    "pagehide",
    () => {
      stopAnimation();

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
    { once: true }
  );
}

initHeroScene().catch((error) => {
  console.warn(
    "Aurift: Unexpected hero initialization error. Using fallback.",
    error
  );

  showHeroFallback();
});
