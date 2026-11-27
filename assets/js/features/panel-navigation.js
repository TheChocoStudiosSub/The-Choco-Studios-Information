export function initPanelNavigation() {
  const panels = [...document.querySelectorAll("#site-main > [data-panel]")];
  const links = [...document.querySelectorAll("[data-panel-link]")];
  if (!panels.length) return;

  const panelForHash = value => {
    let id = String(value || "").replace(/^#/, "");
    try { id = decodeURIComponent(id); } catch { id = ""; }
    return panels.find(panel => panel.id === id || panel.dataset.panel === id) ||
      document.getElementById(id)?.closest("[data-panel]") || null;
  };

  function activatePanel(panel, options = {}) {
    if (typeof panel === "string") panel = panelForHash(panel);
    if (!panel) return false;

    panels.forEach(item => {
      const active = item === panel;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-hidden", String(!active));
      if ("inert" in item) item.inert = !active;
    });

    links.forEach(link => {
      const active = link.dataset.panelLink === panel.dataset.panel;
      link.classList.toggle("is-current", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    if (options.updateHash !== false) {
      const nextHash = "#" + panel.id;
      if (location.hash !== nextHash) history.replaceState(null, "", nextHash);
    }
    if (options.scroll !== false) panel.scrollTop = 0;
    if (options.focus) panel.focus({ preventScroll: true });

    panel.classList.remove("is-entered");
    void panel.offsetWidth;
    requestAnimationFrame(() => panel.classList.add("is-entered"));
    document.dispatchEvent(new CustomEvent("tcs:panel-change", { detail: { panel: panel.dataset.panel } }));
    return true;
  }

  links.forEach(link => link.addEventListener("click", event => {
    const target = panelForHash(link.dataset.panelLink || link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    activatePanel(target, { focus: true });
  }));

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    if (link.hasAttribute("data-panel-link")) return;
    link.addEventListener("click", event => {
      const target = panelForHash(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      activatePanel(target, { focus: true });
    });
  });

  panels.forEach(panel => {
    if (!panel.hasAttribute("tabindex")) panel.setAttribute("tabindex", "-1");
  });

  const initial = panelForHash(location.hash) || panelForHash("home") || panels[0];
  activatePanel(initial, { updateHash: false, scroll: true });
  window.addEventListener("hashchange", () => {
    const target = panelForHash(location.hash);
    if (target) activatePanel(target, { updateHash: false, scroll: true });
  });
}
