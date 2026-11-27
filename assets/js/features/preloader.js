(() => {
  const loader = document.getElementById("tcs-intro-loader");
  if (!loader) return;

  const counter = loader.querySelector("[data-intro-count]");
  const progress = loader.querySelector("[data-intro-progress]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dynamicPage = Boolean(document.getElementById("site-main"));
  let siteReady = !dynamicPage;
  let loadReady = document.readyState === "complete";
  let started = false;
  let finished = false;
  let raf = 0;
  let startedAt = 0;

  const render = value => {
    const amount = Math.max(0, Math.min(100, Math.round(value)));
    if (counter) counter.textContent = String(amount);
    if (progress) progress.style.transform = "scaleX(" + amount / 100 + ")";
  };

  const open = () => {
    if (finished) return;
    finished = true;
    window.cancelAnimationFrame(raf);
    render(100);
    loader.classList.add("is-complete");
    const reveal = () => {
      loader.classList.add("is-opening");
      document.querySelector(".site-shell")?.removeAttribute("inert");
      window.setTimeout(() => { loader.hidden = true; }, reducedMotion ? 40 : 1120);
    };
    if (reducedMotion) reveal();
    else window.setTimeout(reveal, 380);
  };

  const animate = timestamp => {
    if (finished) return;
    if (!startedAt) startedAt = timestamp;
    const elapsed = timestamp - startedAt;
    const value = Math.min(100, elapsed / 2450 * 100);
    render(value);
    if (value >= 100) open();
    else raf = window.requestAnimationFrame(animate);
  };

  const start = () => {
    if (started || finished || !siteReady || !loadReady) return;
    started = true;
    if (reducedMotion) { open(); return; }
    const fontsReady = document.fonts?.ready;
    if (fontsReady) {
      Promise.race([fontsReady, new Promise(resolve => window.setTimeout(resolve, 650))])
        .then(() => { raf = window.requestAnimationFrame(animate); }, () => { raf = window.requestAnimationFrame(animate); });
    } else raf = window.requestAnimationFrame(animate);
  };

  document.addEventListener("tcs:site-ready", () => { siteReady = true; start(); }, { once: true });
  if (loadReady) start();
  else window.addEventListener("load", () => { loadReady = true; start(); }, { once: true });

  window.setTimeout(() => {
    if (dynamicPage) siteReady = true;
    loadReady = true;
    if (!started) start();
    if (!finished) open();
  }, 5600);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") open();
  });
})();
