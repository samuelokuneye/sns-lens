(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const cursorGlow = document.querySelector(".cursor-glow");
  const reveals = document.querySelectorAll(".reveal");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");
  const contactForm = document.getElementById("contact-form");
  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* Fallback for broken remote images */
  const imageFallback =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000"><rect fill="#1a1a1a" width="800" height="1000"/><text x="400" y="500" text-anchor="middle" fill="#9a9488" font-family="Georgia,serif" font-size="28">Image unavailable</text></svg>'
    );

  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = "true";
      img.src = imageFallback;
      img.classList.add("img-fallback");
    }, { once: true });
  });

  /* Header scroll state */
  function onScroll() {
    if (window.scrollY > 60) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile navigation */
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.classList.toggle("active");
      navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.classList.remove("active");
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* Cursor glow (desktop only) */
  if (cursorGlow && window.matchMedia("(hover: hover)").matches) {
    let rafId = null;
    let targetX = 0;
    let targetY = 0;

    document.addEventListener("mousemove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          cursorGlow.style.left = targetX + "px";
          cursorGlow.style.top = targetY + "px";
          rafId = null;
        });
      }
    });
  }

  /* Scroll reveal */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  reveals.forEach((el) => revealObserver.observe(el));

  /* Hero reveals on load */
  requestAnimationFrame(() => {
    document.querySelectorAll(".hero .reveal").forEach((el) => {
      el.classList.add("visible");
    });
    const heroStats = document.querySelector(".hero-stats");
    if (heroStats) heroStats.classList.add("visible");
  });

  /* Animated counters */
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 2000;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll(".stat-number").forEach(animateCounter);
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  const heroStats = document.querySelector(".hero-stats");
  if (heroStats) statsObserver.observe(heroStats);

  /* Gallery filters */
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      galleryItems.forEach((item) => {
        const category = item.dataset.category;
        const show = filter === "all" || category === filter;
        item.classList.toggle("hidden", !show);

        if (show) {
          item.style.animation = "none";
          item.offsetHeight;
          item.style.animation = "";
          item.classList.remove("visible");
          revealObserver.observe(item);
        }
      });
    });
  });

  /* Contact form */
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const successMsg = document.getElementById("form-success");

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      submitBtn.classList.add("loading");
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
        contactForm.reset();
        if (successMsg) {
          successMsg.hidden = false;
          setTimeout(() => {
            successMsg.hidden = true;
          }, 5000);
        }
      }, 1500);
    });
  }

  /* Smooth anchor offset for fixed header */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (id === "#" || id === "#top") return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-height"), 10) || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: "smooth" });
    });
  });
})();
