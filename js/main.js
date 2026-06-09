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
  const whatsappMeta = document.querySelector('meta[name="sns-whatsapp"]');
  const whatsappFloat = document.getElementById("whatsapp-float");
  const contactWhatsapp = document.getElementById("contact-whatsapp");
  const FORM_ENDPOINT = "https://formsubmit.co/ajax/sammydgreat13@gmail.com";
  const WHATSAPP_MESSAGE = encodeURIComponent(
    "Hi SnS Lens, I'd like to enquire about a photography session."
  );

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* WhatsApp chat — set content on meta[name="sns-whatsapp"] e.g. 447911123456 */
  const whatsappNumber = (whatsappMeta && whatsappMeta.content || "").replace(/\D/g, "");
  if (whatsappNumber) {
    const whatsappUrl = "https://wa.me/" + whatsappNumber + "?text=" + WHATSAPP_MESSAGE;
    [whatsappFloat, contactWhatsapp].forEach((el) => {
      if (!el) return;
      el.href = whatsappUrl;
      el.hidden = false;
    });
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

  /* Contact form → FormSubmit */
  if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const successMsg = document.getElementById("form-success");
    const errorMsg = document.getElementById("form-error");

    if (new URLSearchParams(window.location.search).get("sent") === "1" && successMsg) {
      successMsg.hidden = false;
      window.history.replaceState({}, "", window.location.pathname + "#contact");
    }

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      submitBtn.classList.add("loading");
      submitBtn.disabled = true;
      if (errorMsg) errorMsg.hidden = true;
      if (successMsg) successMsg.hidden = true;

      const formData = new FormData(contactForm);

      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });

        const result = await response.json();

        if (!response.ok || result.success !== "true") {
          throw new Error(result.message || "Form submit failed");
        }

        contactForm.reset();
        if (successMsg) {
          successMsg.hidden = false;
        }
      } catch (err) {
        if (errorMsg) errorMsg.hidden = false;
      } finally {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
      }
    });
  }

  /* Portfolio strip — JS-driven scroll (reliable across browsers) */
  const portfolioStrip = document.querySelector(".portfolio-strip");
  const portfolioTrack = document.getElementById("portfolio-strip-track");
  const portfolioSet = portfolioTrack && portfolioTrack.querySelector(".portfolio-strip-set");

  if (portfolioStrip && portfolioTrack && portfolioSet) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reduceMotion) {
      let offset = 0;
      let paused = false;
      let lastTime = 0;
      const loopDuration = 28000;

      portfolioStrip.addEventListener("mouseenter", () => {
        paused = true;
        portfolioStrip.classList.add("is-paused");
      });

      portfolioStrip.addEventListener("mouseleave", () => {
        paused = false;
        portfolioStrip.classList.remove("is-paused");
      });

      function tick(now) {
        if (!lastTime) lastTime = now;
        const dt = now - lastTime;
        lastTime = now;

        if (!paused) {
          const setWidth = portfolioSet.offsetWidth;
          if (setWidth > 0) {
            offset += (setWidth / loopDuration) * dt;
            if (offset >= setWidth) offset -= setWidth;
            portfolioTrack.style.transform = "translateX(" + -offset + "px)";
          }
        }

        requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }
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
