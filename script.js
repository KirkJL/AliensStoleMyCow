(() => {
  const reduceMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  function isSafeHash(hash) {
    return /^#[A-Za-z][A-Za-z0-9_-]*$/.test(hash);
  }

  function smoothScrollToHash(hash) {
    if (!isSafeHash(hash)) return;
    const el = document.getElementById(hash.slice(1));
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  const burger = document.getElementById("burger");
  const nav = document.getElementById("navPanel");

  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      burger.setAttribute("aria-expanded", String(!open));
    });

    document.addEventListener("click", (e) => {
      const inside = nav.contains(e.target) || burger.contains(e.target);
      if (!inside) {
        nav.setAttribute("data-open", "false");
        burger.setAttribute("aria-expanded", "false");
      }
    });

    nav.querySelectorAll("a[href^='#']").forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || !isSafeHash(href)) return;
        e.preventDefault();
        nav.setAttribute("data-open", "false");
        burger.setAttribute("aria-expanded", "false");
        smoothScrollToHash(href);
        history.replaceState(null, "", href);
      });
    });
  }

  const glyphPool = "⟟⎅⎍⌇⍜⎎⏃⏚⌖⟒⟂◧▣▭𓂀";
  const isTouch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia?.("(pointer: coarse)")?.matches === true;

  function scrambleText(text) {
    return text
      .split("")
      .map((ch) => (ch === " " ? " " : glyphPool[Math.floor(Math.random() * glyphPool.length)]))
      .join("");
  }

  function glitchScramble(el, original, duration = 220) {
    if (reduceMotion) return;
    const start = performance.now();
    let raf = null;

    const frame = (now) => {
      const t = (now - start) / duration;
      if (t >= 1) {
        el.textContent = original;
        return;
      }
      el.textContent = scrambleText(original);
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => raf && cancelAnimationFrame(raf);
  }

  const armed = new WeakMap();
  const ARM_WINDOW_MS = 1800;

  document.querySelectorAll(".hudBtn").forEach((btn) => {
    const alien = btn.querySelector(".hudBtn__alien");
    if (!alien) return;

    const href = btn.getAttribute("href") || "#";
    const originalAlien = alien.textContent;

    btn.addEventListener("mouseenter", () => {
      glitchScramble(alien, originalAlien, 200);
      btn.classList.add("is-primed");
    });
    btn.addEventListener("mouseleave", () => btn.classList.remove("is-primed"));
    btn.addEventListener("focus", () => {
      glitchScramble(alien, originalAlien, 200);
      btn.classList.add("is-primed");
    });
    btn.addEventListener("blur", () => btn.classList.remove("is-primed"));

    btn.addEventListener("click", (e) => {
      if (!href.startsWith("#")) return;
      if (!isSafeHash(href)) return;

      if (!isTouch) {
        e.preventDefault();
        smoothScrollToHash(href);
        history.replaceState(null, "", href);
        return;
      }

      const now = Date.now();
      const last = armed.get(btn) || 0;
      const within = now - last <= ARM_WINDOW_MS;

      if (!within) {
        e.preventDefault();
        armed.set(btn, now);
        btn.classList.add("is-armed");
        setTimeout(() => btn.classList.remove("is-armed"), 260);
        btn.classList.add("show-alien");
        glitchScramble(alien, originalAlien, 240);
        setTimeout(() => {
          btn.classList.remove("show-alien");
        }, 900);
        return;
      }

      e.preventDefault();
      armed.set(btn, 0);
      btn.classList.remove("show-alien");
      smoothScrollToHash(href);
      history.replaceState(null, "", href);
    });
  });

  const anchors = Array.from(document.querySelectorAll("a[href^='#']"));
  const sections = ["#games", "#studio", "#news", "#contact"]
    .map((id) => document.getElementById(id.slice(1)))
    .filter(Boolean);

  if (sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((ent) => {
          if (!ent.isIntersecting) return;
          const id = `#${ent.target.id}`;
          anchors.forEach((a) => {
            const match = a.getAttribute("href") === id;
            a.classList.toggle("is-active", match);
          });
        });
      },
      { root: null, threshold: 0.45 }
    );

    sections.forEach((s) => io.observe(s));
  }
})();
