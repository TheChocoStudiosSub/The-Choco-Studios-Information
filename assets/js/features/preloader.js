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
  const finish=()=>{
    if(closed)return;
    closed=true;
    clearTimeout(minimumTimer);
    clearTimeout(maximumTimer);
    loader.classList.add("is-opening");
    window.setTimeout(()=>{
      loader.remove();
      document.body.classList.remove("preloader-active");
      document.body.classList.add("preloader-done");
    },760);
  };
  const checkReady=()=>{
    if(minimumElapsed&&siteReady)finish();
  };
  minimumTimer=window.setTimeout(()=>{
    minimumElapsed=true;
    checkReady();
  },1900);
  maximumTimer=window.setTimeout(finish,1980);
  document.addEventListener("tcs:site-ready",()=>{
    siteReady=true;
    checkReady();
  },{once:true});
  loader.addEventListener("click",finish);
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&!closed)finish();
  });
})();