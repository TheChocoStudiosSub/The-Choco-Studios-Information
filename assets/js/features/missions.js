export function renderMissions(missions){
  const list=document.getElementById("mission-list");
  if(!list||!Array.isArray(missions))return;
  list.replaceChildren();
  missions.forEach((mission,index)=>{
    const article=document.createElement("article");
    article.className="overview-card";
    article.setAttribute("data-reveal","");
    const number=document.createElement("span");
    number.className="card-index";
    number.setAttribute("aria-hidden","true");
    number.textContent=String(index+1).padStart(2,"0");
    const title=document.createElement("h3");
    title.textContent=mission.title;
    const description=document.createElement("p");
    description.className="card-copy";
    description.textContent=mission.text;
    article.append(number,title,description);
    list.append(article);
  });
}