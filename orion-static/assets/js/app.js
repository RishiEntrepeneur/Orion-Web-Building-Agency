/* ==========================================================================
   ORION — application script
   --------------------------------------------------------------------------
   Vanilla ES6+, no dependencies. Every module is self-contained and exits
   quietly if the markup it needs is absent, so the same file can be shared
   across index.html, services.html and contact.html without guarding each
   include.
   ========================================================================== */

(() => {
  "use strict";

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ====================================================== sticky header === */

  const initHeader = () => {
    const header = $(".site-header");
    if (!header) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      header.dataset.scrolled = String(window.scrollY > 16);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
  };

  /* ======================================================= mobile menu === */

  const initMobileMenu = () => {
    const toggle = $("#menu-toggle");
    const menu = $("#mobile-menu");
    if (!toggle || !menu) return;

    const openIcon = $("[data-icon='open']", toggle);
    const closeIcon = $("[data-icon='close']", toggle);

    let open = false;
    let restoreOverflow = "";

    const focusables = () =>
      $$('a[href], button:not([disabled])', menu).filter((el) => el.offsetParent !== null);

    const setOpen = (next) => {
      open = next;
      menu.dataset.open = String(next);
      toggle.setAttribute("aria-expanded", String(next));
      toggle.setAttribute("aria-label", next ? "Close navigation menu" : "Open navigation menu");
      if (openIcon) openIcon.hidden = next;
      if (closeIcon) closeIcon.hidden = !next;

      if (next) {
        // <html> is the scrolling element, so locking <body> alone does nothing.
        restoreOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = "hidden";
        focusables()[0]?.focus();
      } else {
        document.documentElement.style.overflow = restoreOverflow;
      }
    };

    toggle.addEventListener("click", () => setOpen(!open));

    // Any navigation closes the drawer.
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (!open) return;

      if (event.key === "Escape") {
        setOpen(false);
        toggle.focus();
        return;
      }

      // Trap Tab inside the drawer while it is open.
      if (event.key !== "Tab") return;
      const nodes = focusables();
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && (document.activeElement === first || !menu.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    // Returning to a desktop width must not leave the page scroll-locked.
    window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => {
      if (e.matches && open) setOpen(false);
    });
  };

  /* ==================================================== smooth scrolling === */

  const initSmoothScroll = () => {
    // CSS scroll-behavior handles the easing and scroll-padding-top handles the
    // fixed header. This only intercepts so the URL hash updates without the
    // browser's instant jump fighting the smooth scroll.
    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;

      const id = link.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start",
      });
      history.pushState(null, "", id);

      // Move focus for keyboard and screen-reader users, not just the viewport.
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  };

  /* ========================================================== scrollspy === */

  const initScrollSpy = () => {
    const links = $$('[data-nav-link][href^="#"]');
    if (links.length === 0) return;

    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);
    if (sections.length === 0) return;

    const setCurrent = (id) => {
      links.forEach((link) => {
        const active = link.getAttribute("href") === `#${id}`;
        if (active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setCurrent(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((section) => observer.observe(section));
  };

  /* ============================================= scroll-driven reveals === */

  const initReveals = () => {
    const items = $$(".reveal");
    if (items.length === 0) return;

    if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
      items.forEach((el) => (el.dataset.visible = "true"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = Number(el.dataset.revealDelay || 0);
          if (delay) el.style.transitionDelay = `${delay}ms`;
          el.dataset.visible = "true";
          observer.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    items.forEach((el) => {
      // Anything already on screen is shown with no transition at all —
      // fading in content the visitor can already see only delays LCP.
      if (el.getBoundingClientRect().top < window.innerHeight * 0.95) {
        el.classList.add("is-instant");
        el.dataset.visible = "true";
        return;
      }
      observer.observe(el);
    });
  };

  /* =========================================================== timeline === */

  const initTimeline = () => {
    const timeline = $(".timeline");
    if (!timeline) return;

    const steps = $$(".timeline-step", timeline);

    if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
      timeline.dataset.visible = "true";
      steps.forEach((s) => (s.dataset.visible = "true"));
      return;
    }

    // The rail draws first, then each node lights in sequence behind it.
    const railObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        timeline.dataset.visible = "true";
        railObserver.disconnect();
      },
      { threshold: 0.2 },
    );
    railObserver.observe(timeline);

    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = steps.indexOf(entry.target);
          window.setTimeout(() => (entry.target.dataset.visible = "true"), index * 140);
          stepObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.4 },
    );
    steps.forEach((step) => stepObserver.observe(step));
  };

  /* ========================================================== spotlight === */

  const initSpotlight = () => {
    const cards = $$(".spotlight");
    if (cards.length === 0) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    cards.forEach((card) => {
      card.addEventListener(
        "pointermove",
        (event) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
          card.style.setProperty("--my", `${event.clientY - rect.top}px`);
        },
        { passive: true },
      );
    });
  };

  /* ========================================================== particles === */

  const initParticles = () => {
    const canvas = $("#particle-canvas");
    if (!canvas) return;
    if (prefersReducedMotion()) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const host = canvas.parentElement;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars = [];
    let frame = 0;
    let running = false;
    const pointer = { x: -9999, y: -9999, active: false };

    const build = () => {
      const rect = host.getBoundingClientRect();
      // Cap DPR at 2: beyond that the cost doubles for no visible gain.
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density scales with area, capped so a large monitor does not pay for
      // thousands of particles nobody can distinguish.
      const target = Math.round((width * height) / 12000);
      const count = Math.max(28, Math.min(150, target));

      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.35,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.14,
        // A handful of violet stars against mostly blue-white ones.
        violet: Math.random() < 0.22,
        twinkle: Math.random() * Math.PI * 2,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const linkDist = Math.min(150, Math.max(90, width * 0.09));

      for (const star of stars) {
        star.x += star.vx;
        star.y += star.vy;
        star.twinkle += 0.014;

        // Wrap rather than bounce, so the field never develops visible edges.
        if (star.x < -10) star.x = width + 10;
        if (star.x > width + 10) star.x = -10;
        if (star.y < -10) star.y = height + 10;
        if (star.y > height + 10) star.y = -10;

        const pulse = 0.55 + Math.sin(star.twinkle) * 0.28;
        let alpha = pulse * 0.8;

        // Stars near the cursor brighten and link up.
        if (pointer.active) {
          const dx = star.x - pointer.x;
          const dy = star.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkDist) {
            const strength = 1 - dist / linkDist;
            alpha = Math.min(1, alpha + strength * 0.8);

            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.strokeStyle = star.violet
              ? `rgba(139, 92, 246, ${(strength * 0.34).toFixed(3)})`
              : `rgba(59, 130, 246, ${(strength * 0.34).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = star.violet
          ? `rgba(182, 156, 255, ${alpha.toFixed(3)})`
          : `rgba(190, 214, 255, ${alpha.toFixed(3)})`;
        ctx.fill();
      }

      frame = window.requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = window.requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      window.cancelAnimationFrame(frame);
    };

    build();
    start();

    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 180);
    });

    host.addEventListener(
      "pointermove",
      (event) => {
        const rect = host.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
        pointer.active = true;
      },
      { passive: true },
    );
    host.addEventListener("pointerleave", () => {
      pointer.active = false;
    });

    // Do not burn frames on a hidden tab, or once the hero has scrolled away.
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? start() : stop()),
        { threshold: 0 },
      ).observe(host);
    }
  };

  /* =============================================== contact form handling === */

  const initForm = () => {
    const form = $("#project-form");
    if (!form) return;

    const status = $("#form-status");
    const success = $("#form-success");

    const rules = {
      name: (v) => (v.trim().length >= 2 ? "" : "Please enter your name."),
      email: (v) => {
        if (!v.trim()) return "We need an email address to reply to.";
        // Deliberately permissive: the only authority on a valid address is
        // whether mail to it is delivered. This catches typos, not edge cases.
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return "That does not look like a valid email.";
        const free = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
        const domain = v.trim().split("@")[1]?.toLowerCase();
        if (free.includes(domain)) return "A business email helps us route your enquiry — personal addresses are fine if that is all you use.";
        return "";
      },
      budget: (v) => (v ? "" : "Choose a budget tier so we can scope properly."),
      details: (v) => (v.trim().length >= 20 ? "" : "A couple of sentences about the project, please."),
    };

    // The free-email rule is advisory, not blocking.
    const isBlocking = (field, message) =>
      message !== "" && !(field === "email" && message.startsWith("A business email helps"));

    const fieldEls = Object.keys(rules).map((name) => form.elements.namedItem(name)).filter(Boolean);

    const showError = (field, message) => {
      const el = form.elements.namedItem(field);
      const errorEl = $(`#${field}-error`);
      if (!el || !errorEl) return;
      const blocking = isBlocking(field, message);
      errorEl.textContent = message;
      el.setAttribute("aria-invalid", blocking ? "true" : "false");
    };

    const validateField = (field) => {
      const el = form.elements.namedItem(field);
      if (!el) return true;
      const message = rules[field](el.value);
      showError(field, message);
      return !isBlocking(field, message);
    };

    fieldEls.forEach((el) => {
      el.addEventListener("blur", () => validateField(el.name));
      el.addEventListener("input", () => {
        // Clear an error as soon as the visitor fixes it, but do not shout at
        // them for a field they have not finished typing.
        if (el.getAttribute("aria-invalid") === "true") validateField(el.name);
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const results = Object.keys(rules).map((field) => validateField(field));
      const ok = results.every(Boolean);

      if (!ok) {
        if (status) {
          status.textContent = "Some fields need attention before this can be sent.";
          status.hidden = false;
        }
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        firstInvalid?.focus();
        return;
      }

      if (status) status.hidden = true;

      // No backend in this build: the brief is assembled into a mail draft
      // rather than posted to an endpoint that does not exist.
      const data = new FormData(form);
      const body = [
        `Name: ${data.get("name")}`,
        `Email: ${data.get("email")}`,
        `Budget: ${data.get("budget")}`,
        "",
        "Project details:",
        `${data.get("details")}`,
      ].join("\n");

      const mailto = `mailto:hello@orion.studio?subject=${encodeURIComponent(
        `Project enquiry — ${data.get("name")}`,
      )}&body=${encodeURIComponent(body)}`;

      if (success) {
        const link = $("#form-mailto", success);
        if (link) link.href = mailto;
        const preview = $("#form-preview", success);
        if (preview) preview.textContent = body;
        form.hidden = true;
        success.hidden = false;
        success.focus();
      }
    });

    const reset = $("#form-reset");
    if (reset && success) {
      reset.addEventListener("click", () => {
        success.hidden = true;
        form.hidden = false;
        form.reset();
        fieldEls.forEach((el) => el.setAttribute("aria-invalid", "false"));
        $$(".field-error", form).forEach((el) => (el.textContent = ""));
        form.elements.namedItem("name")?.focus();
      });
    }
  };

  /* ============================================================= footer === */

  const initYear = () => {
    $$("[data-year]").forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  };

  /* =============================================================== boot === */

  const boot = () => {
    initHeader();
    initMobileMenu();
    initSmoothScroll();
    initScrollSpy();
    initReveals();
    initTimeline();
    initSpotlight();
    initParticles();
    initForm();
    initYear();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
