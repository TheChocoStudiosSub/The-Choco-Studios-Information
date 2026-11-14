export function initEditorialEffects(){
  const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer=window.matchMedia("(pointer: fine) and (hover: hover)").matches;
  const root=document.documentElement;
  const staggerPattern=[0,90,350,470,830,940,1120];
  document.querySelectorAll(".intro-fact,.about-purpose-card,.about-bottom-card,.project-row,.technology-entry,.safety-entry,.contact-method").forEach(element=>element.dataset.reveal="stagger-uneven");
  document.querySelectorAll(".about-fact-card,.product-entry").forEach(element=>element.dataset.reveal="wipe");
  document.querySelectorAll(".section-number").forEach(element=>{element.dataset.reveal="counter";element.dataset.drift="";});
  document.querySelectorAll(".section-rule").forEach(element=>element.dataset.reveal="rule");
  document.querySelectorAll(".section-head h2,.contact-heading h2").forEach(element=>{
    element.dataset.reveal="mask-lines";
    element.dataset.drift="";
    if(!element.querySelector(".reveal-line")){
      const lines=element.innerHTML.split(/<br\s*\/?\s*>/i);
      element.innerHTML=lines.map(line=>'<span class="reveal-line"><span>'+line+'</span></span>').join("");
    }
  });
  const statement=document.querySelector("#about .section-intro");
  if(statement)statement.dataset.reveal="words";
  const revealTargets=Array.from(document.querySelectorAll("[data-reveal]"));
  document.querySelectorAll("[data-reveal='words']").forEach(element=>{
    const fragments=element.textContent.match(/\s+|[^\s]+/g)||[];
    const fragment=document.createDocumentFragment();
    let index=0;
    for(const part of fragments){
      if(/^\s+$/.test(part))fragment.append(document.createTextNode(part));
      else{
        const word=document.createElement("span");
        word.className="reveal-word";
        word.textContent=part;
        word.dataset.wordIndex=String(index++);
        fragment.append(word);
      }
    }
    element.replaceChildren(fragment);
  });
  document.querySelectorAll("[data-reveal='counter']").forEach(element=>{
    const digits=element.textContent.trim();
    if(!/^\d+$/.test(digits)||element.querySelector(".counter-window"))return;
    const fragment=document.createDocumentFragment();
    for(const digit of digits){
      const windowElement=document.createElement("span");
      const track=document.createElement("span");
      windowElement.className="counter-window";
      track.className="counter-track";
      track.style.setProperty("--counter-digit",digit);
      for(let number=0;number<=9;number++){
        const item=document.createElement("span");
        item.textContent=String(number);
        track.append(item);
      }
      windowElement.append(track);
      fragment.append(windowElement);
    }
    element.replaceChildren(fragment);
  });
  document.querySelectorAll("[data-reveal='stagger-uneven']").forEach((element,index)=>{
    element.style.setProperty("--reveal-delay",staggerPattern[index%staggerPattern.length]+"ms");
  });
  if(reduceMotion){
    revealTargets.forEach(element=>element.classList.add("is-visible"));
    document.querySelectorAll("[data-reveal='words'] .reveal-word").forEach(word=>word.classList.add("is-lit"));
  }else{
    root.classList.add("reveal-ready");
    const scrollTimeline=window.CSS&&CSS.supports&&CSS.supports("animation-timeline:view()");
    if(scrollTimeline)root.classList.add("has-scroll-timeline");
    else if("IntersectionObserver" in window){
      const observer=new IntersectionObserver((entries,currentObserver)=>{
        entries.forEach(entry=>{
          if(!entry.isIntersecting)return;
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        });
      },{root:null,rootMargin:"0px 0px -9% 0px",threshold:.08});
      revealTargets.forEach(element=>{if(element.dataset.reveal!=="words")observer.observe(element);});
    }else revealTargets.forEach(element=>element.classList.add("is-visible"));
  }
  if(reduceMotion)return;
  const wordTargets=Array.from(document.querySelectorAll("[data-reveal='words']"));
  const updateWords=()=>{
    const height=window.innerHeight||document.documentElement.clientHeight;
    for(const element of wordTargets){
      const words=element.querySelectorAll(".reveal-word");
      if(!words.length)continue;
      const rect=element.getBoundingClientRect();
      const progress=Math.max(0,Math.min(1,(height*.9-rect.top)/(height*.72+rect.height)));
      const lit=Math.round(progress*words.length);
      words.forEach((word,index)=>word.classList.toggle("is-lit",index<lit));
    }
  };
  let wordFrame=0;
  const scheduleWords=()=>{
    if(wordFrame)return;
    wordFrame=requestAnimationFrame(()=>{wordFrame=0;updateWords();});
  };
  if(wordTargets.length){
    window.addEventListener("scroll",scheduleWords,{passive:true});
    window.addEventListener("resize",scheduleWords,{passive:true});
    updateWords();
  }
  const driftItems=Array.from(document.querySelectorAll("[data-drift]"));
  let driftFrame=0;
  const updateDrift=()=>{
    const center=window.innerHeight*.5;
    for(const item of driftItems){
      const rect=item.getBoundingClientRect();
      const progress=(rect.top+rect.height*.5-center)/Math.max(1,window.innerHeight);
      const amplitude=item.classList.contains("section-number")?12:8;
      const offset=Math.max(-amplitude,Math.min(amplitude,progress*amplitude));
      item.style.setProperty("--drift-x",offset.toFixed(2)+"px");
    }
    driftFrame=0;
  };
  const scheduleDrift=()=>{
    if(driftFrame)return;
    driftFrame=requestAnimationFrame(updateDrift);
  };
  if(driftItems.length){
    window.addEventListener("scroll",scheduleDrift,{passive:true});
    window.addEventListener("resize",scheduleDrift,{passive:true});
    updateDrift();
  }
  if(!finePointer)return;
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
  const trail=document.createElement("canvas");
  trail.id="tcs-cursor-trail";
  trail.setAttribute("aria-hidden","true");
  document.body.append(trail);
  const context=trail.getContext("2d",{alpha:true});
  const points=[];
  const trailLifetime=760;
  const maxPoints=40;
  let trailFrame=0;
  let pixelRatio=1;
  let viewportWidth=window.innerWidth;
  let viewportHeight=window.innerHeight;
  const resizeTrail=()=>{
    pixelRatio=Math.min(window.devicePixelRatio||1,2);
    viewportWidth=window.innerWidth;
    viewportHeight=window.innerHeight;
    trail.width=Math.round(viewportWidth*pixelRatio);
    trail.height=Math.round(viewportHeight*pixelRatio);
    trail.style.width=viewportWidth+"px";
    trail.style.height=viewportHeight+"px";
    if(context)context.setTransform(pixelRatio,0,0,pixelRatio,0,0);
  };
  const drawTrail=now=>{
    trailFrame=0;
    if(!context||document.hidden)return;
    while(points.length&&now-points[0].time>trailLifetime)points.shift();
    context.clearRect(0,0,viewportWidth,viewportHeight);
    context.globalCompositeOperation="lighter";
    context.lineCap="round";
    context.lineJoin="round";
    for(let index=1;index<points.length;index++){
      const previous=points[index-1];
      const current=points[index];
      const age=Math.max(0,Math.min(1,(now-current.time)/trailLifetime));
      const opacity=(1-age)*(current.hover?.18:.105);
      if(opacity<=.002)continue;
      context.beginPath();
      context.moveTo(previous.x,previous.y);
      context.lineTo(current.x,current.y);
      context.lineWidth=Math.max(.35,2.2*(1-age));
      context.strokeStyle="rgba(200,169,106,"+opacity+")";
      context.shadowColor="rgba(227,203,148,"+(opacity*.72)+")";
      context.shadowBlur=4*(1-age);
      context.stroke();
    }
    context.globalCompositeOperation="source-over";
    context.shadowBlur=0;
    if(points.length)trailFrame=requestAnimationFrame(drawTrail);
  };
  const scheduleTrail=()=>{
    if(!trailFrame&&!document.hidden)trailFrame=requestAnimationFrame(drawTrail);
  };
  resizeTrail();
  window.addEventListener("resize",resizeTrail,{passive:true});
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden){
      if(trailFrame)cancelAnimationFrame(trailFrame);
      trailFrame=0;
      points.length=0;
      if(context)context.clearRect(0,0,viewportWidth,viewportHeight);
    }
  });
  const cursor=document.createElement("span");
  cursor.className="cursor-orbit";
  cursor.setAttribute("aria-hidden","true");
  document.body.append(cursor);
  document.addEventListener("pointermove",event=>{
    cursor.style.transform="translate3d("+event.clientX+"px,"+event.clientY+"px,0) translate(-50%,-50%)";
    cursor.classList.add("is-visible");
    document.body.classList.add("has-custom-cursor");
    if(!context||document.hidden||event.pointerType==="touch")return;
    const interactive=Boolean(event.target?.closest?.("a,button,summary"));
    let samples=[event];
    if(typeof event.getCoalescedEvents==="function"){
      try{const coalesced=event.getCoalescedEvents();if(coalesced.length)samples=coalesced.slice(-5);}catch{}
    }
    const now=performance.now();
    for(const sample of samples){
      points.push({x:sample.clientX,y:sample.clientY,time:now,hover:interactive});
      if(points.length>maxPoints)points.splice(0,points.length-maxPoints);
    }
    scheduleTrail();
  },{passive:true});
  document.addEventListener("pointerout",event=>{if(!event.relatedTarget)cursor.classList.remove("is-visible");});
  document.querySelectorAll("a,button,summary").forEach(element=>{
    element.addEventListener("pointerenter",()=>cursor.classList.add("is-hovering"));
    element.addEventListener("pointerleave",()=>cursor.classList.remove("is-hovering"));
  });
}