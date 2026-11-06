const STAR_COUNT = 72;
const MOBILE_STAR_COUNT = 38;

export function initStarfield() {
  if (document.getElementById("tcs-starfield")) return;

  const canvas = document.createElement("canvas");
  canvas.id = "tcs-starfield";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const stars = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let lastTime = 0;
  let running = false;
  let pixelRatio = 1;

  const random = (min, max) => Math.random() * (max - min) + min;

  function createStar(fromTop = false) {
    const depth = random(.45, 1.35);
    return {
      x: random(0, width),
      y: fromTop ? random(-height * .15, 0) : random(0, height),
      length: random(5, 17) * depth,
      speed: random(10, 28) * depth,
      drift: random(-5, 5),
      alpha: random(.24, .78),
      radius: random(.55, 1.25) * depth,
      phase: random(0, Math.PI * 2),
      twinkle: random(.7, 1.8)
    };
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const target = width < 640 ? MOBILE_STAR_COUNT : STAR_COUNT;
    stars.length = 0;
    for (let i = 0; i < target; i += 1) stars.push(createStar());
    draw(0, false);
  }

  function draw(time, advance = true) {
    context.clearRect(0, 0, width, height);
    for (const star of stars) {
      if (advance) {
        star.y += star.speed * (Math.min(time, 40) / 1000);
        star.x += star.drift * (Math.min(time, 40) / 1000);
        if (star.y - star.length > height || star.x < -20 || star.x > width + 20) {
          Object.assign(star, createStar(true));
        }
      }
      const shimmer = .72 + Math.sin((performance.now() / 1000) * star.twinkle + star.phase) * .28;
      const alpha = star.alpha * shimmer;
      context.beginPath();
      context.moveTo(star.x, star.y);
      context.lineTo(star.x - star.drift * .16, star.y - star.length);
      context.strokeStyle = `rgba(190, 207, 255, ${alpha * .46})`;
      context.lineWidth = star.radius;
      context.stroke();
      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(232, 239, 255, ${alpha})`;
      context.fill();
    }
  }

  function animate(timestamp) {
    if (!running) return;
    const delta = lastTime ? timestamp - lastTime : 16;
    lastTime = timestamp;
    draw(delta);
    frame = window.requestAnimationFrame(animate);
  }

  function start() {
    if (running || reducedMotion.matches || document.hidden) return;
    running = true;
    lastTime = 0;
    frame = window.requestAnimationFrame(animate);
  }

  function stop() {
    running = false;
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
  }

  function syncMotion() {
    if (reducedMotion.matches) {
      stop();
      draw(0, false);
    } else start();
  }

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : syncMotion());
  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", syncMotion);
  }

  resize();
  syncMotion();
}
