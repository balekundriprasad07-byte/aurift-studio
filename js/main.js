const navbar = document.getElementById("navbar");
const hero = document.querySelector(".hero");
const heroContent = document.querySelector(".hero-content");
const glow = document.querySelector(".cursor-glow");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// Lightweight navbar state. Passive scroll avoids blocking the main thread.
const updateNavbar = () => {
  if (!navbar) return;
  navbar.classList.toggle("scrolled", window.scrollY > 50);
};

updateNavbar();
window.addEventListener("scroll", updateNavbar, { passive: true });

// Reveal content only when motion is allowed.
const revealTargets = document.querySelectorAll(".service, .project, .process-row");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealTargets.forEach((element) => {
    element.style.opacity = "1";
    element.style.transform = "none";
  });
} else {
  const observer = new IntersectionObserver(
    (entries, revealObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
  );

  revealTargets.forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(40px)";
    element.style.transition = "opacity 0.8s ease, transform 0.8s ease";
    observer.observe(element);
  });
}

// Cursor glow and parallax are desktop-pointer effects. Skip all related work
// on touch devices and when the user asks for reduced motion.
if (finePointer && !reduceMotion) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let glowX = mouseX;
  let glowY = mouseY;
  let glowFrame = null;

  document.addEventListener(
    "pointermove",
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    },
    { passive: true }
  );

  const animateGlow = () => {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;

    if (glow) {
      glow.style.left = `${glowX}px`;
      glow.style.top = `${glowY}px`;
    }

    glowFrame = requestAnimationFrame(animateGlow);
  };

  if (glow) glowFrame = requestAnimationFrame(animateGlow);

  if (hero && heroContent) {
    hero.addEventListener(
      "pointermove",
      (event) => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        heroContent.style.transform = `translate3d(${x * 10}px, ${y * 7}px, 0)`;
      },
      { passive: true }
    );

    hero.addEventListener("pointerleave", () => {
      heroContent.style.transform = "translate3d(0,0,0)";
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (!glow) return;
    if (document.hidden && glowFrame) {
      cancelAnimationFrame(glowFrame);
      glowFrame = null;
    } else if (!document.hidden && !glowFrame) {
      glowFrame = requestAnimationFrame(animateGlow);
    }
  });
} else {
  if (glow) glow.hidden = true;
  if (heroContent) heroContent.style.transform = "none";
}


// Issue #2 — accessible navigation and FAQ behaviour
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    navLinks.classList.remove("open");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    navLinks.classList.toggle("open", !isOpen);
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuToggle.focus();
    }
  });
}

document.querySelectorAll(".faq-question").forEach((button) => {
  const answerId = button.getAttribute("aria-controls");
  const answer = answerId ? document.getElementById(answerId) : null;
  if (!answer) return;

  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    answer.hidden = expanded;
  });
});
