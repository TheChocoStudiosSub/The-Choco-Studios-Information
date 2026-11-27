(() => {
  "use strict";
  let initialized = false;

  function init() {
    if (initialized) return true;
    const toggle = document.querySelector("#tcs-menu-toggle");
    const sidebar = document.querySelector("#tcs-sidebar");
    const backdrop = document.querySelector("#tcs-menu-backdrop");
    if (!toggle || !sidebar || !backdrop) return false;
    initialized = true;

    const mobile = window.matchMedia("(max-width: 850px)");
    const icon = (open) => open
      ? '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
      : '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="5" cy="12" r="1.55" fill="currentColor"/><circle cx="12" cy="12" r="1.55" fill="currentColor"/><circle cx="19" cy="12" r="1.55" fill="currentColor"/></svg>';

    function setMenu(open, restoreFocus = false) {
      const visible = Boolean(open) && mobile.matches;
      document.body.classList.toggle("tcs-menu-open", visible);
      toggle.setAttribute("aria-expanded", String(visible));
      toggle.setAttribute("aria-label", visible ? "Tutup navigasi" : "Buka navigasi");
      toggle.innerHTML = icon(visible);
      backdrop.hidden = !visible;

      if (mobile.matches) {
        sidebar.setAttribute("aria-hidden", String(!visible));
        sidebar.toggleAttribute("inert", !visible);
      } else {
        sidebar.removeAttribute("aria-hidden");
        sidebar.removeAttribute("inert");
      }

      if (restoreFocus) toggle.focus({ preventScroll: true });
    }

    setMenu(false);
    toggle.addEventListener("click", () => {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    backdrop.addEventListener("click", () => setMenu(false, true));
    sidebar.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        if (mobile.matches) setMenu(false);
      });
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && document.body.classList.contains("tcs-menu-open")) {
        setMenu(false, true);
      }
    });

    const onViewportChange = () => setMenu(false);
    if (typeof mobile.addEventListener === "function") mobile.addEventListener("change", onViewportChange);
    else mobile.addListener(onViewportChange);
    return true;
  }

  if (!init()) {
    const retry = () => {
      if (init()) observer?.disconnect();
    };
    document.addEventListener("tcs:site-ready", retry, { once: true });
    document.addEventListener("DOMContentLoaded", retry, { once: true });
    if (document.documentElement.dataset.tcsSiteReady === "true") requestAnimationFrame(retry);

    const mount = document.getElementById("site-header");
    const observer = mount ? new MutationObserver(retry) : null;
    if (observer && mount) observer.observe(mount, { childList: true, subtree: true });
  }
})();
