const TAU=Math.PI*2;
const REDUCED_MOTION=window.matchMedia("(prefers-reduced-motion: reduce)");
const random=(min,max)=>min+Math.random()*(max-min);
const integer=(min,max)=>Math.floor(random(min,max+1));
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

function makeStars(width,height){
 const mobile=width<680;
 const count=mobile?380:Math.min(1400,Math.max(850,Math.round(width*height/1200)));
 const stars=[];
 for(let index=0;index<count;index+=1){
  const depth=Math.random();
  stars.push({
   x:Math.random(),y:Math.random(),depth,
   radius:.22+depth*random(.12,.82),
   alpha:random(.12,.43)*(.35+depth*.65),
   phase:random(0,TAU),
   frequency:random(.22,.85),
   drift:random(.00008,.00042)*(depth+.2),
   warm:Math.random()>.72,
   emphasis:Math.random()<.38?.42:1
  });
 }
 return stars;
}

function createTcsSpaceBackground(){
 if(!document.body)return null;

 const starsCanvas=document.createElement("canvas");
 starsCanvas.className="tcs-space-canvas";
 starsCanvas.setAttribute("aria-hidden","true");
 const starsContext=starsCanvas.getContext("2d",{alpha:true,desynchronized:true});
 if(!starsContext)return null;

 const meteorCanvas=document.createElement("canvas");
 meteorCanvas.className="tcs-starfield-canvas";
 meteorCanvas.setAttribute("aria-hidden","true");
 const meteorContext=meteorCanvas.getContext("2d",{alpha:true,desynchronized:true});
 if(!meteorContext)return null;

 document.body.append(starsCanvas,meteorCanvas);

 let width=1,height=1,dpr=1,stars=[];
 let starsFrame=0,meteorFrame=0,meteorTimer=0;
 let starsLastFrame=0,meteorLastFrame=0,elapsed=0;
 let meteorShower=[],meteorDust=[];
 let disposed=false;

 const METEOR_OPACITY_KEYFRAMES=[0,.10,.15,.20,.40,.20,.15,.10,0];
 function meteorOpacityAt(progress){
  const scaled=clamp(progress,0,1)*(METEOR_OPACITY_KEYFRAMES.length-1);
  const index=Math.min(Math.floor(scaled),METEOR_OPACITY_KEYFRAMES.length-2);
  const localProgress=scaled-index;
  const start=METEOR_OPACITY_KEYFRAMES[index];
  const end=METEOR_OPACITY_KEYFRAMES[index+1];
  return start+(end-start)*localProgress;
 }

 function drawNebula(){
  starsContext.save();
  starsContext.globalCompositeOperation="screen";
  starsContext.globalAlpha=.86;
  const clouds=[
   {x:.73,y:.48,rx:.34,ry:.43,strength:.11},
   {x:.86,y:.22,rx:.23,ry:.27,strength:.075},
   {x:.59,y:.83,rx:.27,ry:.20,strength:.055},
   {x:.96,y:.71,rx:.18,ry:.28,strength:.045}
  ];
  for(const cloud of clouds){
   const radius=Math.max(width*cloud.rx,height*cloud.ry);
   const gradient=starsContext.createRadialGradient(
    width*cloud.x,height*cloud.y,radius*.025,
    width*cloud.x,height*cloud.y,radius
   );
   gradient.addColorStop(0,"rgba(190,146,78,"+cloud.strength+")");
   gradient.addColorStop(.28,"rgba(126,91,48,"+(cloud.strength*.53)+")");
   gradient.addColorStop(.62,"rgba(70,53,33,"+(cloud.strength*.18)+")");
   gradient.addColorStop(1,"rgba(36,29,20,0)");
   starsContext.fillStyle=gradient;
   starsContext.fillRect(0,0,width,height);
  }
  const glow=starsContext.createRadialGradient(
   width*.68,height*.51,0,
   width*.68,height*.51,Math.max(width,height)*.52
  );
  glow.addColorStop(0,"rgba(200,158,91,.045)");
  glow.addColorStop(.5,"rgba(111,82,46,.025)");
  glow.addColorStop(1,"rgba(50,39,26,0)");
  starsContext.fillStyle=glow;
  starsContext.fillRect(0,0,width,height);
  starsContext.restore();
 }

 function drawStars(now,staticFrame=false){
  if(disposed)return;
  const delta=starsLastFrame?Math.min(.05,(now-starsLastFrame)/1000):0;
  starsLastFrame=now;
  if(!staticFrame)elapsed+=delta;
  starsContext.clearRect(0,0,width,height);
  drawNebula();
  starsContext.save();
  starsContext.globalCompositeOperation="lighter";
  for(const star of stars){
   const twinkle=staticFrame?1:.72+.28*Math.sin(elapsed*star.frequency+star.phase);
   star.x=(star.x+star.drift*delta)%1;
   const x=star.x*width,y=star.y*height;
   const alpha=star.alpha*twinkle*star.emphasis;
   const color=star.warm?"239,218,177":"228,225,215";
   starsContext.beginPath();
   starsContext.fillStyle="rgba("+color+","+alpha+")";
   starsContext.arc(x,y,star.radius,0,TAU);
   starsContext.fill();
   if(star.depth>.94&&star.radius>.86){
    starsContext.beginPath();
    starsContext.fillStyle="rgba("+color+","+(alpha*.09)+")";
    starsContext.arc(x,y,star.radius*3.8,0,TAU);
    starsContext.fill();
   }
  }
  starsContext.restore();
 }

 function animateStars(now){
  if(disposed||document.hidden){starsFrame=0;return;}
  if(now-starsLastFrame>=28)drawStars(now);
  starsFrame=requestAnimationFrame(animateStars);
 }

 function startStars(){
  if(disposed||document.hidden)return;
  if(REDUCED_MOTION.matches){
   drawStars(performance.now(),true);
   return;
  }
  if(!starsFrame){
   starsLastFrame=performance.now();
   starsFrame=requestAnimationFrame(animateStars);
  }
 }

 function createMeteor(delay=0){
  const angle=random(37,51)*Math.PI/180;
  const directionX=Math.cos(angle),directionY=Math.sin(angle);
  const startX=random(-width*.08,width*.48);
  const startY=random(-height*.2,height*.12);
  const edgeX=(width+startX+180)/directionX;
  const edgeY=(height+startY+180)/directionY;
  const travelDistance=Math.min(edgeX,edgeY)*random(.78,.92);
  const duration=random(620,880);
  const speed=travelDistance/duration;
  return {
   x:startX,y:startY,startX,startY,
   vx:directionX*speed,vy:directionY*speed,angle,
   length:random(190,310),
   thickness:random(.85,1.5),
   sparkleSize:random(4.8,6.3),
   glow:random(26,40),
   duration,bornAt:performance.now()+delay,
   elapsed:0,alpha:0,dustClock:0
  };
 }

 function resize(){
  if(disposed)return;
  width=Math.max(1,Math.round(window.innerWidth));
  height=Math.max(1,Math.round(window.innerHeight));
  dpr=Math.min(window.devicePixelRatio||1,2);
  for(const canvas of [starsCanvas,meteorCanvas]){
   canvas.width=Math.round(width*dpr);
   canvas.height=Math.round(height*dpr);
   canvas.style.width="100vw";
   canvas.style.height="100vh";
  }
  starsContext.setTransform(dpr,0,0,dpr,0,0);
  meteorContext.setTransform(dpr,0,0,dpr,0,0);
  stars=makeStars(width,height);
  drawStars(performance.now(),true);
  meteorContext.clearRect(0,0,width,height);
 }

 function emitMeteorDust(meteor,delta){
  meteor.dustClock+=delta;
  while(meteor.dustClock>=.105){
   meteor.dustClock-=.105;
   if(meteorDust.length>90)meteorDust.splice(0,meteorDust.length-90);
   const trailOffset=random(5,meteor.length*.82);
   meteorDust.push({
    x:meteor.x-meteor.vx*(trailOffset/Math.max(.08,Math.hypot(meteor.vx,meteor.vy))),
    y:meteor.y-meteor.vy*(trailOffset/Math.max(.08,Math.hypot(meteor.vx,meteor.vy))),
    vx:-meteor.vx*random(.08,.32)+random(-.025,.025),
    vy:-meteor.vy*random(.08,.32)+random(-.025,.025),
    radius:random(.25,.85),
    life:random(.18,.42),
    age:0,alpha:random(.12,.46)
   });
  }
 }

 function drawMeteor(meteor,progress){
  const directionX=Math.cos(meteor.angle),directionY=Math.sin(meteor.angle);
  const tailX=meteor.x-directionX*meteor.length;
  const tailY=meteor.y-directionY*meteor.length;
  const gradient=meteorContext.createLinearGradient(tailX,tailY,meteor.x,meteor.y);
  gradient.addColorStop(0,"rgba(255,246,218,0)");
  gradient.addColorStop(.3,"rgba(224,198,148,.045)");
  gradient.addColorStop(.68,"rgba(239,220,181,.24)");
  gradient.addColorStop(.9,"rgba(255,245,218,.72)");
  gradient.addColorStop(1,"rgba(255,255,255,1)");

  meteorContext.save();
  meteorContext.globalAlpha=meteor.alpha;
  meteorContext.lineCap="round";
  meteorContext.lineWidth=meteor.thickness;
  meteorContext.strokeStyle=gradient;
  meteorContext.shadowBlur=meteor.glow*.72;
  meteorContext.shadowColor="rgba(255,240,205,.72)";
  meteorContext.beginPath();
  meteorContext.moveTo(tailX,tailY);
  meteorContext.lineTo(meteor.x,meteor.y);
  meteorContext.stroke();

  const size=meteor.sparkleSize;
  const burst=Math.pow(1-clamp(progress/.24,0,1),2);
  meteorContext.translate(meteor.x,meteor.y);
  meteorContext.rotate(meteor.angle);

  if(burst>.008){
   const rays=[0,Math.PI/4,Math.PI/2,Math.PI*3/4,Math.PI,Math.PI*1.25,Math.PI*1.5,Math.PI*1.75];
   meteorContext.save();
   meteorContext.globalAlpha=meteor.alpha*burst*.78;
   meteorContext.lineCap="round";
   meteorContext.lineWidth=.65;
   meteorContext.strokeStyle="rgba(255,248,225,.96)";
   meteorContext.shadowBlur=meteor.glow*1.8;
   meteorContext.shadowColor="rgba(255,237,197,.95)";
   for(const ray of rays){
    const inner=size*.55,outer=size*(2.2+burst*2.7);
    meteorContext.beginPath();
    meteorContext.moveTo(Math.cos(ray)*inner,Math.sin(ray)*inner);
    meteorContext.lineTo(Math.cos(ray)*outer,Math.sin(ray)*outer);
    meteorContext.stroke();
   }
   meteorContext.restore();
  }

  const auraRadius=meteor.glow*(1.7+burst*1.2);
  const aura=meteorContext.createRadialGradient(0,0,0,0,0,auraRadius);
  aura.addColorStop(0,"rgba(255,255,255,.9)");
  aura.addColorStop(.12,"rgba(255,246,221,.62)");
  aura.addColorStop(.38,"rgba(244,218,171,.2)");
  aura.addColorStop(1,"rgba(244,218,171,0)");
  meteorContext.save();
  meteorContext.globalAlpha=meteor.alpha*(.62+burst*.38);
  meteorContext.fillStyle=aura;
  meteorContext.beginPath();
  meteorContext.arc(0,0,auraRadius,0,TAU);
  meteorContext.fill();
  meteorContext.restore();

  const sparkle=meteorContext.createLinearGradient(0,-size*3.8,0,size*3.8);
  sparkle.addColorStop(0,"rgba(255,255,250,1)");
  sparkle.addColorStop(.48,"rgba(255,248,226,1)");
  sparkle.addColorStop(1,"rgba(226,194,137,1)");
  meteorContext.shadowBlur=meteor.glow*1.25;
  meteorContext.shadowColor="rgba(255,239,201,1)";
  meteorContext.fillStyle=sparkle;
  meteorContext.beginPath();
  meteorContext.moveTo(0,-size*3.8);
  meteorContext.bezierCurveTo(size*.24,-size*.9,size*.9,-size*.24,size*3.8,0);
  meteorContext.bezierCurveTo(size*.9,size*.24,size*.24,size*.9,0,size*3.8);
  meteorContext.bezierCurveTo(-size*.24,size*.9,-size*.9,size*.24,-size*3.8,0);
  meteorContext.bezierCurveTo(-size*.9,-size*.24,-size*.24,-size*.9,0,-size*3.8);
  meteorContext.closePath();
  meteorContext.fill();
  meteorContext.restore();
 }

 function drawDust(delta){
  for(let index=meteorDust.length-1;index>=0;index--){
   const particle=meteorDust[index];
   particle.age+=delta;
   if(particle.age>=particle.life){
    meteorDust.splice(index,1);
    continue;
   }
   particle.x+=particle.vx*delta*1000;
   particle.y+=particle.vy*delta*1000;
   const fade=1-particle.age/particle.life;
   meteorContext.save();
   meteorContext.globalAlpha=particle.alpha*fade*fade;
   meteorContext.fillStyle="rgba(255,236,195,1)";
   meteorContext.shadowBlur=4;
   meteorContext.shadowColor="rgba(255,226,173,.7)";
   meteorContext.beginPath();
   meteorContext.arc(particle.x,particle.y,particle.radius*fade,0,TAU);
   meteorContext.fill();
   meteorContext.restore();
  }
 }

 function animateMeteors(now){
  if(disposed||document.hidden||REDUCED_MOTION.matches){
   meteorFrame=0;
   return;
  }
  const delta=Math.min(.05,Math.max(0,(now-meteorLastFrame)/1000));
  meteorLastFrame=now;
  meteorContext.clearRect(0,0,width,height);
  meteorContext.save();
  meteorContext.globalCompositeOperation="lighter";
  for(let index=meteorShower.length-1;index>=0;index--){
   const meteor=meteorShower[index];
   if(now<meteor.bornAt)continue;
   meteor.elapsed=now-meteor.bornAt;
   const progress=clamp(meteor.elapsed/meteor.duration,0,1);
   meteor.x=meteor.startX+meteor.vx*meteor.elapsed;
   meteor.y=meteor.startY+meteor.vy*meteor.elapsed;
   meteor.alpha=meteorOpacityAt(progress);
   if(meteor.alpha>0){
    drawMeteor(meteor,progress);
    if(Math.random()<delta*8)emitMeteorDust(meteor,delta);
   }
   if(progress>=1)meteorShower.splice(index,1);
  }
  drawDust(delta);
  meteorContext.restore();
  if(meteorShower.length||meteorDust.length)meteorFrame=requestAnimationFrame(animateMeteors);
  else meteorFrame=0;
 }

 function stopMeteors(){
  window.clearTimeout(meteorTimer);
  if(meteorFrame)cancelAnimationFrame(meteorFrame);
  meteorFrame=0;
  meteorShower=[];
  meteorDust=[];
  meteorContext.clearRect(0,0,width,height);
 }

 function launchMeteor(){
  if(disposed||document.hidden||REDUCED_MOTION.matches)return;
  meteorShower.push(createMeteor());
  if(!meteorFrame){
   meteorLastFrame=performance.now();
   meteorFrame=requestAnimationFrame(animateMeteors);
  }
  meteorTimer=window.setTimeout(launchMeteor,integer(18000,32000));
 }

 function scheduleFirstMeteor(){
  window.clearTimeout(meteorTimer);
  if(disposed||document.hidden||REDUCED_MOTION.matches)return;
  meteorTimer=window.setTimeout(launchMeteor,integer(5200,9000));
 }

 function handleVisibility(){
  if(document.hidden){
   if(starsFrame)cancelAnimationFrame(starsFrame);
   starsFrame=0;
   stopMeteors();
   return;
  }
  startStars();
  scheduleFirstMeteor();
 }

 function handleMotionChange(){
  if(REDUCED_MOTION.matches){
   if(starsFrame)cancelAnimationFrame(starsFrame);
   starsFrame=0;
   stopMeteors();
   drawStars(performance.now(),true);
  }else{
   startStars();
   scheduleFirstMeteor();
  }
 }

 function dispose(){
  if(disposed)return;
  disposed=true;
  if(starsFrame)cancelAnimationFrame(starsFrame);
  stopMeteors();
  window.removeEventListener("resize",resize);
  document.removeEventListener("visibilitychange",handleVisibility);
  REDUCED_MOTION.removeEventListener?.("change",handleMotionChange);
  window.removeEventListener("pagehide",dispose);
  starsCanvas.remove();
  meteorCanvas.remove();
 }

 window.addEventListener("resize",resize,{passive:true});
 document.addEventListener("visibilitychange",handleVisibility);
 REDUCED_MOTION.addEventListener?.("change",handleMotionChange);
 window.addEventListener("pagehide",dispose,{once:true});

 resize();
 startStars();
 scheduleFirstMeteor();
 return {dispose};
}

createTcsSpaceBackground();
export {createTcsSpaceBackground};