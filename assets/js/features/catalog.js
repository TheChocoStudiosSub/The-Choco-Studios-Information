function createFallbackLogo(product,className){
  const fallback=document.createElement("span");
  fallback.className=className+" product-logo-fallback";
  fallback.setAttribute("aria-hidden","true");
  fallback.textContent="";
  return fallback;
}
function createProductAction(label,url,productName,primary=false){
  const link=document.createElement("a");
  link.className="button "+(primary?"button-primary":"button-secondary")+" button-small";
  link.href=url;
  link.textContent=label;
  link.setAttribute("aria-label",label+": "+productName);
  if(/^https?:\/\//i.test(url)){link.target="_blank";link.rel="noopener noreferrer";}
  return link;
}
export function renderCatalog(products){
  const list=document.getElementById("product-list");
  if(!list)return;
  list.replaceChildren();
  products.forEach((product,index)=>{
    const article=document.createElement("article");
    article.className="product-entry spotlight-surface";
    article.setAttribute("data-reveal","");
    const number=document.createElement("span");
    number.className="entry-number";
    number.setAttribute("aria-hidden","true");
    number.textContent=String(index+1).padStart(2,"0");
    const main=document.createElement("div");
    main.className="product-entry-main";
    const identity=document.createElement("div");
    identity.className="product-entry-identity";
    const category=document.createElement("span");
    category.className="product-label";
    category.textContent=product.category;
    const title=document.createElement("h3");
    title.textContent=product.name;
    identity.append(category,title);
    let symbol;
    const logoClass="product-logo product-logo-"+String(product.logo||"default").replace(/[^a-z0-9_-]/gi,"");
    const logoUrl = typeof product.logoUrl === "string" ? product.logoUrl.trim() : "";
    if(logoUrl){
      const image=document.createElement("img");
      image.className=logoClass;
      image.alt="Logo "+product.name;
      image.width=54;image.height=54;
      image.loading="lazy";image.decoding="async";
      image.addEventListener("load",()=>image.classList.add("is-loaded"),{once:true});
      image.addEventListener("error",()=>image.replaceWith(createFallbackLogo(product,logoClass)),{once:true});
      image.src=logoUrl;
      symbol=image;
    }else{symbol=createFallbackLogo(product,logoClass);}
    const disclosure=document.createElement("details");
    disclosure.className="product-disclosure";
    const summary=document.createElement("summary");
    summary.textContent="Informasi produk";
    const description=document.createElement("p");
    description.className="product-description";
    description.textContent=product.description;
    const footer=document.createElement("div");
    footer.className="product-card-footer";
    const status=document.createElement("span");
    status.className="status-tag";
    status.textContent=product.status;
    const actions=document.createElement("div");
    actions.className="product-actions";
    if(product.productUrl)actions.append(createProductAction(product.actionLabel||"Buka produk",product.productUrl,product.name,true));
    if(product.detailsUrl && product.detailsUrl !== product.productUrl){
      const detailsLink=createProductAction("Lihat detail",product.detailsUrl,product.name);
      actions.append(detailsLink);
    }
    footer.append(status,actions);
    disclosure.append(summary,description,footer);
    main.append(identity);
    if(symbol&&symbol.tagName==="IMG")main.append(symbol);
    main.append(disclosure);
    article.append(number,main);
    list.append(article);
  });
}