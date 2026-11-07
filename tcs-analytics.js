(() => {
"use strict";
const ENDPOINT="https://choco-ai-independent-seven.vercel.app/api/public/track";
const SITE=document.currentScript?.dataset.site||"tcs-website";
function id(key,store){
 try{let value=store.getItem(key);if(!value){value=crypto.randomUUID();store.setItem(key,value);}return value;}catch{return crypto.randomUUID();}
}
const visitorId=id("tcs_analytics_visitor_v1",localStorage);
const sessionId=id("tcs_analytics_session_v1",sessionStorage);
function send(payload){
 const data=JSON.stringify({siteKey:SITE,visitorId,sessionId,...payload});
 try{
  if(navigator.sendBeacon){const blob=new Blob([data],{type:"application/json"});if(navigator.sendBeacon(ENDPOINT,blob))return;}
 }catch{}
 fetch(ENDPOINT,{method:"POST",mode:"cors",credentials:"omit",keepalive:true,headers:{"Content-Type":"application/json"},body:data}).catch(()=>{});
}
send({event:"visit",path:location.pathname,referrer:document.referrer||""});
document.addEventListener("click",event=>{
 const link=event.target?.closest?.("a[data-tcs-download],a[download],a[href*='/releases/download/']");
 if(!link)return;
 const url=link.href;if(!/^https:\/\//i.test(url))return;
 const label=(link.dataset.tcsProductName||link.textContent||"Unduhan produk").trim().replace(/\s+/g," ").slice(0,180);
 const inferred=link.dataset.tcsProductCode||url.split("/").filter(Boolean).slice(-2,-1)[0]||label.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80);
 send({event:"download",productCode:inferred,productName:label,version:link.dataset.tcsVersion||"",url});
});
})();