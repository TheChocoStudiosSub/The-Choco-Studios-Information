export function initEditorialEffects(){
  const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer=window.matchMedia("(pointer: fine) and (hover: hover)").matches;
  const targets=document.querySelectorAll("[data-reveal],.section-head,.intro-fact,.about-fact-card,.about-purpose-card,.about-bottom-card,.project-row,.technology-entry,.safety-entry,.contact-method");
  if(reduceMotion||!("IntersectionObserver" in window)){
    targets.forEach(element=>element.classList.add("is-visible"));
    document.querySelectorAll(".section-rule").forEach(rule=>rule.classList.add("is-visible"));
  }else{
    const observer=new IntersectionObserver((entries,currentObserver)=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },{root:null,rootMargin:"0px 0px -9% 0px",threshold:.08});
    targets.forEach((element,index)=>{
      element.classList.add("motion-reveal");
      element.style.setProperty("--reveal-delay",String(Math.min(index%4,3)*90)+"ms");
      observer.observe(element);
    });
    document.querySelectorAll(".section-rule").forEach(rule=>observer.observe(rule));
  }
  if(!finePointer||reduceMotion)return;
  document.querySelectorAll(".spotlight-surface,.contact-method").forEach(element=>{
    element.addEventListener("pointermove",event=>{
      const rect=element.getBoundingClientRect();
      element.style.setProperty("--spot-x",(event.clientX-rect.left)+"px");
      element.style.setProperty("--spot-y",(event.clientY-rect.top)+"px");
    },{passive:true});
  });
  document.querySelectorAll(".magnetic").forEach(button=>{
    button.addEventListener("pointermove",event=>{
      const rect=button.getBoundingClientRect();
      const x=(event.clientX-(rect.left+rect.width/2))/rect.width;
      const y=(event.clientY-(rect.top+rect.height/2))/rect.height;
      button.style.setProperty("--magnet-x",Math.max(-8,Math.min(8,x*8))+"px");
      button.style.setProperty("--magnet-y",Math.max(-8,Math.min(8,y*8))+"px");
    },{passive:true});
    button.addEventListener("pointerleave",()=>{
      button.style.setProperty("--magnet-x","0px");
      button.style.setProperty("--magnet-y","0px");
    });
  });
  const cursor=document.createElement("span");
  cursor.className="cursor-orbit";
  cursor.setAttribute("aria-hidden","true");
  document.body.append(cursor);
  let pointerX=-100,pointerY=-100,frame=0;
  const moveCursor=()=>{
    cursor.style.setProperty("--cursor-x",pointerX+"px");
    cursor.style.setProperty("--cursor-y",pointerY+"px");
    frame=0;
  };
  document.addEventListener("pointermove",event=>{
    pointerX=event.clientX;pointerY=event.clientY;
    cursor.classList.add("is-visible");
    document.body.classList.add("has-custom-cursor");
    if(!frame)frame=requestAnimationFrame(moveCursor);
  },{passive:true});
  document.addEventListener("pointerout",event=>{
    if(!event.relatedTarget)cursor.classList.remove("is-visible");
  });
  document.querySelectorAll("a,button,summary").forEach(element=>{
    element.addEventListener("pointerenter",()=>cursor.classList.add("is-hovering"));
    element.addEventListener("pointerleave",()=>cursor.classList.remove("is-hovering"));
  });
  const parallaxItems=Array.from(document.querySelectorAll("[data-parallax]"));
  let scrollFrame=0;
  const updateParallax=()=>{
    const center=window.innerHeight*.5;
    for(const item of parallaxItems){
      const rect=item.getBoundingClientRect();
      const offset=(rect.top+rect.height*.5-center)*-.035;
      item.style.transform="translate3d(0,"+Math.max(-16,Math.min(16,offset))+"px,0)";
    }
    scrollFrame=0;
  };
  const scheduleParallax=()=>{
    if(!scrollFrame)scrollFrame=requestAnimationFrame(updateParallax);
  };
  window.addEventListener("scroll",scheduleParallax,{passive:true});
  window.addEventListener("resize",scheduleParallax,{passive:true});
  scheduleParallax();
}