(()=>{
  const loader=document.getElementById("luxury-loader");
  if(!loader)return;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pageHasDynamicComponents=Boolean(document.getElementById("site-main"));
  const started=performance.now();
  let siteReady=!pageHasDynamicComponents;
  let loadReady=document.readyState==="complete";
  let dismissed=false;
  let minimumTimer=0;
  let maximumTimer=0;

  const remove=()=>{
    if(!loader.isConnected)return;
    loader.remove();
  };
  const finish=()=>{
    if(dismissed)return;
    dismissed=true;
    window.clearTimeout(minimumTimer);
    window.clearTimeout(maximumTimer);
    loader.classList.add("is-dismissed");
    loader.setAttribute("aria-hidden","true");
    window.setTimeout(remove,reduced?180:1200);
  };
  const check=()=>{
    if(!dismissed&&siteReady&&loadReady&&performance.now()-started>=(reduced?100:1050))finish();
  };
  minimumTimer=window.setTimeout(check,reduced?120:1100);
  maximumTimer=window.setTimeout(finish,4800);
  if(document.documentElement.dataset.tcsSiteReady==="true")siteReady=true;
  document.addEventListener("tcs:site-ready",()=>{siteReady=true;check();},{once:true});
  if(loadReady)check();
  else window.addEventListener("load",()=>{loadReady=true;check();},{once:true});
  document.addEventListener("keydown",event=>{if(event.key==="Escape")finish();});
})();
