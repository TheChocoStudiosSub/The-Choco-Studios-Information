export function initPanelNavigation(){
  const panels=[...document.querySelectorAll("#site-main > [data-panel]")];
  const links=[...document.querySelectorAll("[data-panel-link]")];
  if(!panels.length)return;

  const panelForHash=value=>{
    const id=decodeURIComponent(String(value||"").replace(/^#/,""));
    return panels.find(panel=>panel.id===id||panel.dataset.panel===id)||
      document.getElementById(id)?.closest("[data-panel]")||null;
  };

  const ornamentDesigns={
    home:[["orbital","orbital-home"],["orbital-reverse","orbital-reverse-home"],["constellation","constellation-home"],["crosshair","crosshair-home"],["spark","spark-one"]],
    overview:[["coordinate-grid","grid-overview"],["orbital","orbital-overview"],["orbital-reverse","orbital-reverse-overview"],["constellation","constellation-overview"],["crosshair","crosshair-overview"],["spark","spark-one"]],
    about:[["portrait-frame","portrait-frame-about"],["orbital","orbital-about"],["orbital-reverse","orbital-reverse-about"],["constellation","constellation-about"],["crosshair","crosshair-about"],["spark","spark-one"]],
    projects:[["index-grid","grid-projects"],["orbital","orbital-projects"],["orbital-reverse","orbital-reverse-projects"],["constellation","constellation-projects"],["crosshair","crosshair-projects"],["spark","spark-one"]],
    products:[["coordinate-grid","grid-products"],["orbital","orbital-products"],["orbital-reverse","orbital-reverse-products"],["constellation","constellation-products"],["crosshair","crosshair-products"],["spark","spark-one"]],
    technology:[["index-grid","grid-technology"],["orbital","orbital-technology"],["orbital-reverse","orbital-reverse-technology"],["constellation","constellation-technology"],["crosshair","crosshair-technology"],["spark","spark-one"]],
    safety:[["coordinate-grid","grid-safety"],["orbital","orbital-safety"],["orbital-reverse","orbital-reverse-safety"],["constellation","constellation-safety"],["crosshair","crosshair-safety"],["spark","spark-one"]],
    updates:[["index-grid","grid-updates"],["orbital","orbital-updates"],["orbital-reverse","orbital-reverse-updates"],["constellation","constellation-updates"],["crosshair","crosshair-updates"],["spark","spark-one"]],
    contact:[["portrait-frame","portrait-frame-contact"],["orbital","orbital-contact"],["orbital-reverse","orbital-reverse-contact"],["constellation","constellation-contact"],["crosshair","crosshair-contact"],["spark","spark-one"]]
  };

  function mountPanelOrnaments(){
    panels.forEach(panel=>{
      if(panel.querySelector(":scope > .tcs-ornament-layer"))return;
      const layer=document.createElement("div");
      layer.className="tcs-ornament-layer tcs-ornament-layer--"+panel.dataset.panel;
      layer.setAttribute("aria-hidden","true");
      (ornamentDesigns[panel.dataset.panel]||ornamentDesigns.home).forEach(names=>{
        const ornament=document.createElement("span");
        ornament.className="tcs-ornament "+names.map(name=>"tcs-ornament--"+name).join(" ");
        layer.append(ornament);
      });
      panel.append(layer);
    });
  }
  mountPanelOrnaments();

  function revealPanel(panel){
    panel.classList.remove("is-entered");
    void panel.offsetWidth;
    requestAnimationFrame(()=>{
      panel.classList.add("is-entered");
      panel.querySelectorAll(".section-rule,[data-reveal]").forEach(element=>{
        if(element.dataset.reveal==="rule")element.classList.remove("is-visible");
      });
    });
  }

  function activatePanel(panel,options={}){
    if(typeof panel==="string")panel=panelForHash(panel);
    if(!panel)return false;
    panels.forEach(item=>{
      const active=item===panel;
      item.classList.toggle("is-active",active);
      item.setAttribute("aria-hidden",String(!active));
      if("inert" in item)item.inert=!active;
    });
    links.forEach(link=>{
      const active=link.dataset.panelLink===panel.dataset.panel;
      link.classList.toggle("is-current",active);
      if(active)link.setAttribute("aria-current","page");
      else link.removeAttribute("aria-current");
    });
    if(options.updateHash!==false){
      const nextHash="#"+panel.id;
      if(location.hash!==nextHash)history.replaceState(null,"",nextHash);
    }
    if(options.scroll!==false)panel.scrollTop=0;
    revealPanel(panel);
    if(options.focus)panel.focus({preventScroll:true});
    document.dispatchEvent(new CustomEvent("tcs:panel-change",{detail:{panel:panel.dataset.panel}}));
    return true;
  }

  links.forEach(link=>link.addEventListener("click",event=>{
    const target=panelForHash(link.dataset.panelLink||link.getAttribute("href"));
    if(!target)return;
    event.preventDefault();
    activatePanel(target,{focus:true});
  }));

  document.querySelectorAll('a[href^="#"]').forEach(link=>{
    if(link.hasAttribute("data-panel-link"))return;
    link.addEventListener("click",event=>{
      const target=panelForHash(link.getAttribute("href"));
      if(!target)return;
      event.preventDefault();
      activatePanel(target,{focus:true});
    });
  });

  panels.forEach(panel=>{
    if(!panel.hasAttribute("tabindex"))panel.setAttribute("tabindex","-1");
  });

  const initial=panelForHash(location.hash)||panelForHash("home")||panels[0];
  activatePanel(initial,{updateHash:false,scroll:true,focus:false});
  window.addEventListener("hashchange",()=>{
    const target=panelForHash(location.hash);
    if(target)activatePanel(target,{updateHash:false,scroll:true,focus:false});
  });
}
