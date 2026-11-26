(() => {
  "use strict";

  const currentScript = document.currentScript;
  const theme = currentScript && currentScript.dataset && currentScript.dataset.theme
    ? currentScript.dataset.theme
    : "tcs";
  const hostname = window.location.hostname.toLowerCase();

  // The Web Development app also serves customer-owned wildcard subdomains.
  // Show TCS community links only on TCS's own portal hostnames.
  if (theme === "webdev" && !["webdev.thechocostudios.bond", "webdev.choco-ai.xyz"].includes(hostname)) {
    return;
  }

  if (document.getElementById("tcs-community-widget")) return;

  const palettes = {
    tcs: { bg: "#11100e", panel: "#191713", text: "#f4eee4", muted: "#aaa08f", accent: "#d8bd8d", accentText: "#17130d", border: "rgba(216,189,141,.22)" },
    helpcenter: { bg: "#11100e", panel: "#191713", text: "#f4eee4", muted: "#aaa08f", accent: "#d8bd8d", accentText: "#17130d", border: "rgba(216,189,141,.22)" },
    sheeblink: { bg: "#fffaf7", panel: "#fffdfb", text: "#332824", muted: "#856f68", accent: "#c28e91", accentText: "#fff", border: "#ead8d2" },
    vornika: { bg: "#111018", panel: "#1a1825", text: "#f4f0ff", muted: "#aaa4ba", accent: "#b9a3ff", accentText: "#171323", border: "rgba(185,163,255,.25)" },
    chocoai: { bg: "#15121f", panel: "#201b2c", text: "#f4efff", muted: "#b0a8c2", accent: "#b8a0ff", accentText: "#171323", border: "rgba(184,160,255,.24)" },
    linkguard: { bg: "#101a28", panel: "#142235", text: "#edf6fb", muted: "#a9bac8", accent: "#8ce6d1", accentText: "#10201f", border: "rgba(140,230,209,.25)" },
    template: { bg: "#f6f7f3", panel: "#fff", text: "#20251f", muted: "#687166", accent: "#687c64", accentText: "#fff", border: "#dfe4da" },
    webdev: { bg: "#12110f", panel: "#1d1a16", text: "#f4eee4", muted: "#aaa08f", accent: "#d8bd8d", accentText: "#17130d", border: "rgba(216,189,141,.22)" },
    gaming: { bg: "#17111f", panel: "#21182d", text: "#f7f0ff", muted: "#b7a9c8", accent: "#c4a2f4", accentText: "#1a1024", border: "rgba(196,162,244,.25)" },
    eji: { bg: "#f7fff8", panel: "#fff", text: "#173a36", muted: "#5c7770", accent: "#24aeb6", accentText: "#fff", border: "#d5ebe1" },
    legal: { bg: "#101827", panel: "#142033", text: "#edf2ff", muted: "#a8b4ca", accent: "#a8c7ff", accentText: "#13203a", border: "rgba(168,199,255,.24)" }
  };

  const colors = palettes[theme] || palettes.tcs;
  const root = document.createElement("div");
  root.id = "tcs-community-widget";
  root.dataset.theme = theme;
  Object.keys(colors).forEach((key) => root.style.setProperty("--tcsc-" + key, colors[key]));

  const style = document.createElement("style");
  style.textContent = [
    "#tcs-community-widget{position:fixed;right:clamp(14px,3vw,24px);bottom:clamp(14px,3vh,24px);z-index:2147483000;font-family:inherit;color:var(--tcsc-text);line-height:1.4;}",
    "#tcs-community-widget[data-theme='helpcenter']{left:clamp(14px,3vw,24px);right:auto;}",
    "#tcs-community-widget *{box-sizing:border-box;}",
    "#tcs-community-widget button,#tcs-community-widget a{font:inherit;}",
    "#tcs-community-widget .tcsc-trigger{display:flex;align-items:center;gap:10px;min-height:48px;padding:0 15px;border:1px solid var(--tcsc-border);border-radius:999px;background:var(--tcsc-accent);color:var(--tcsc-accentText);font-size:13px;font-weight:800;letter-spacing:.01em;box-shadow:0 8px 28px rgba(0,0,0,.18);cursor:pointer;transition:transform .18s ease,box-shadow .18s ease;}",
    "#tcs-community-widget .tcsc-trigger:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,.22);}",
    "#tcs-community-widget .tcsc-trigger:focus-visible,#tcs-community-widget a:focus-visible,#tcs-community-widget .tcsc-close:focus-visible{outline:3px solid var(--tcsc-accent);outline-offset:3px;}",
    "#tcs-community-widget .tcsc-trigger-icon{display:grid;place-items:center;width:23px;height:23px;border:1px solid currentColor;border-radius:50%;font-size:13px;line-height:1;}",
    "#tcs-community-widget .tcsc-chevron{font-size:15px;line-height:1;}",
    "#tcs-community-widget .tcsc-panel{position:absolute;right:0;bottom:calc(100% + 12px);width:min(366px,calc(100vw - 28px));max-height:min(72vh,570px);overflow:auto;padding:17px;border:1px solid var(--tcsc-border);border-radius:19px;background:var(--tcsc-panel);color:var(--tcsc-text);box-shadow:0 18px 58px rgba(0,0,0,.25);}",
    "#tcs-community-widget[data-theme='helpcenter'] .tcsc-panel{left:0;right:auto;}",
    "#tcs-community-widget .tcsc-panel[hidden]{display:none!important;}",
    "#tcs-community-widget .tcsc-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:13px;}",
    "#tcs-community-widget .tcsc-panel-title{margin:0;color:var(--tcsc-text);font-size:16px;font-weight:800;letter-spacing:-.02em;}",
    "#tcs-community-widget .tcsc-panel-description{margin:4px 0 0;color:var(--tcsc-muted);font-size:11px;line-height:1.55;}",
    "#tcs-community-widget .tcsc-close{display:grid;place-items:center;flex:0 0 30px;width:30px;height:30px;border:1px solid var(--tcsc-border);border-radius:50%;background:transparent;color:var(--tcsc-text);font-size:19px;line-height:1;cursor:pointer;}",
    "#tcs-community-widget .tcsc-group{margin-top:14px;}",
    "#tcs-community-widget .tcsc-group-title{margin:0 0 8px;color:var(--tcsc-muted);font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;}",
    "#tcs-community-widget .tcsc-list{display:grid;gap:7px;}",
    "#tcs-community-widget .tcsc-link{display:grid;grid-template-columns:34px minmax(0,1fr) 14px;align-items:center;gap:10px;min-height:51px;padding:8px 10px;border:1px solid var(--tcsc-border);border-radius:12px;background:var(--tcsc-bg);color:var(--tcsc-text);text-decoration:none;transition:border-color .18s ease,transform .18s ease,background .18s ease;}",
    "#tcs-community-widget .tcsc-link:hover{transform:translateY(-1px);border-color:var(--tcsc-accent);background:var(--tcsc-panel);}",
    "#tcs-community-widget .tcsc-mark{display:grid;place-items:center;width:32px;height:32px;border-radius:10px;background:var(--tcsc-accent);color:var(--tcsc-accentText);font-size:10px;font-weight:900;letter-spacing:-.03em;}",
    "#tcs-community-widget .tcsc-link-copy{display:grid;gap:2px;min-width:0;}",
    "#tcs-community-widget .tcsc-link-copy strong{overflow-wrap:anywhere;color:var(--tcsc-text);font-size:12px;font-weight:800;line-height:1.3;}",
    "#tcs-community-widget .tcsc-link-copy small{color:var(--tcsc-muted);font-size:10px;line-height:1.3;}",
    "#tcs-community-widget .tcsc-arrow{color:var(--tcsc-muted);font-size:14px;}",
    "@media(max-width:520px){#tcs-community-widget{right:12px;bottom:12px;}#tcs-community-widget[data-theme='helpcenter']{left:12px;right:auto;}#tcs-community-widget .tcsc-trigger{min-height:46px;padding:0 13px;}#tcs-community-widget .tcsc-panel{width:calc(100vw - 24px);max-height:70vh;padding:14px;}}",
    "@media(prefers-reduced-motion:reduce){#tcs-community-widget .tcsc-trigger,#tcs-community-widget .tcsc-link{transition:none;}}"
  ].join("\n");
  document.head.appendChild(style);

  root.innerHTML = "<button class='tcsc-trigger' type='button' aria-expanded='false' aria-controls='tcsc-community-panel'><span class='tcsc-trigger-icon' aria-hidden='true'>↗</span><span>Komunitas TCS</span><span class='tcsc-chevron' aria-hidden='true'>⌃</span></button><section class='tcsc-panel' id='tcsc-community-panel' role='dialog' aria-label='Komunitas TCS' hidden><div class='tcsc-panel-head'><div><h2 class='tcsc-panel-title'>Terhubung dengan komunitas</h2><p class='tcsc-panel-description'>Pilih saluran WhatsApp atau grup Facebook.</p></div><button class='tcsc-close' type='button' aria-label='Tutup panel komunitas'>×</button></div><div class='tcsc-groups'></div></section>";

  const whatsapp = [
    { name: "Arabia", url: "https://whatsapp.com/channel/0029VbEInjlJENxvx8QAow1V", type: "Saluran WhatsApp" },
    { name: "Global", url: "https://whatsapp.com/channel/0029VbANzQeDzgT6qV5P2623", type: "Saluran WhatsApp" },
    { name: "Amerika Latin", url: "https://whatsapp.com/channel/0029Vb9bJwx3QxRsTGxwgR0L", type: "Saluran WhatsApp" },
    { name: "Saluran resmi TCS", url: "https://whatsapp.com/channel/0029VbDj294CRs1s4uu2ZI3T", type: "Saluran WhatsApp" }
  ];
  const facebook = [
    { name: "The Choco Studios Sharing", url: "https://www.facebook.com/share/g/1GB8ivQdzy/", type: "Grup Facebook" },
    { name: "UMKM Bersatu Promosi Jual Beli", url: "https://www.facebook.com/share/g/19uLqnUvyk/", type: "Grup Facebook" }
  ];

  function addGroup(title, entries, mark) {
    const group = document.createElement("section");
    group.className = "tcsc-group";
    const heading = document.createElement("h3");
    heading.className = "tcsc-group-title";
    heading.textContent = title;
    const list = document.createElement("div");
    list.className = "tcsc-list";

    entries.forEach((entry) => {
      const link = document.createElement("a");
      link.className = "tcsc-link";
      link.href = entry.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", entry.name + " — " + entry.type + ", buka di tab baru");

      const badge = document.createElement("span");
      badge.className = "tcsc-mark";
      badge.setAttribute("aria-hidden", "true");
      badge.textContent = mark;

      const copy = document.createElement("span");
      copy.className = "tcsc-link-copy";
      const name = document.createElement("strong");
      name.textContent = entry.name;
      const kind = document.createElement("small");
      kind.textContent = entry.type;
      copy.append(name, kind);

      const arrow = document.createElement("span");
      arrow.className = "tcsc-arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "↗";

      link.append(badge, copy, arrow);
      list.appendChild(link);
    });

    group.append(heading, list);
    root.querySelector(".tcsc-groups").appendChild(group);
  }

  addGroup("Saluran WhatsApp", whatsapp, "WA");
  addGroup("Grup Facebook", facebook, "f");
  document.body.appendChild(root);

  const trigger = root.querySelector(".tcsc-trigger");
  const panel = root.querySelector(".tcsc-panel");
  const closeButton = root.querySelector(".tcsc-close");

  function setOpen(open, returnFocus) {
    panel.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
    trigger.querySelector(".tcsc-chevron").textContent = open ? "⌄" : "⌃";
    if (open) {
      closeButton.focus({ preventScroll: true });
    } else if (returnFocus) {
      trigger.focus({ preventScroll: true });
    }
  }

  trigger.addEventListener("click", () => setOpen(panel.hidden, false));
  closeButton.addEventListener("click", () => setOpen(false, true));
  panel.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false, false);
  });
  document.addEventListener("pointerdown", (event) => {
    if (!panel.hidden && !root.contains(event.target)) setOpen(false, false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) setOpen(false, true);
  });
})();