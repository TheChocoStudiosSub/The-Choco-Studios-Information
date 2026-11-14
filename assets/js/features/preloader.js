(() => {
  const loader=document.getElementById("tcs-preloader");
  if(!loader)return;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let seen=false;
  try{seen=sessionStorage.getItem("tcs-information-preloader-v1")==="seen";}catch{}
  const remove=()=>{
    loader.remove();
    document.body.classList.remove("preloader-active");
    document.body.classList.add("preloader-skip");
  };
  if(seen||reduced){remove();return;}
  try{sessionStorage.setItem("tcs-information-preloader-v1","seen");}catch{}
  loader.classList.add("is-managed");
  let closed=false;
  let minimumElapsed=false;
  let siteReady=false;
  let minimumTimer;
  let maximumTimer;
  const openingDelay=800;
  const timeout=760;
  const finish=()=>{
    if(closed)return;
    closed=true;
    clearTimeout(minimumTimer);
    clearTimeout(maximumTimer);
    loader.classList.add("is-finishing");
    window.setTimeout(()=>{
      if(!loader.isConnected)return;
      loader.classList.add("is-opening");
      window.setTimeout(remove,timeout);
    },openingDelay);
  };
  const bypass=()=>{
    if(closed)return;
    closed=true;
    clearTimeout(minimumTimer);
    clearTimeout(maximumTimer);
    remove();
  };
  const checkReady=()=>{if(minimumElapsed&&siteReady)finish();};
  minimumTimer=window.setTimeout(()=>{minimumElapsed=true;checkReady();},1900);
  maximumTimer=window.setTimeout(finish,1980);
  document.addEventListener("tcs:site-ready",()=>{siteReady=true;checkReady();},{once:true});
  const skip=loader.querySelector(".preloader-skip");
  skip?.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();bypass();});
  document.addEventListener("keydown",event=>{if(event.key==="Escape")bypass();});
})();