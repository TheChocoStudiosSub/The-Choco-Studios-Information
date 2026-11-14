const logoMarkup = {
  ai: '<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="32" rx="24" ry="10" transform="rotate(45 32 32)"/><ellipse cx="32" cy="32" rx="24" ry="10" transform="rotate(-45 32 32)"/><circle cx="32" cy="32" r="5" class="solid"/></svg>',
  help: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 13h44v30H32L19 54v-11h-9z"/><path d="M25 25c1-6 13-7 15 0 1 4-3 6-7 9v3"/><circle cx="33" cy="44" r="1.8" class="solid"/></svg>',
  cash: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M16 8h32v48l-5-3-5 3-5-3-5 3-5-3-7 3z"/><path d="M23 22h18M23 31h18M23 40h10"/></svg>',
  scan: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="27" cy="27" r="17"/><path d="m40 40 15 15M18 27h18M27 18v18"/></svg>',
  stock: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="m8 20 24-12 24 12v27L32 59 8 47z"/><path d="m8 20 24 13 24-13M32 33v26"/><path d="M19 38h8v10h-8zM31 35h8v13h-8zM43 31h5v17h-5z"/></svg>',
  bot: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 5 53 13v16c0 15-8 24-21 30C19 53 11 44 11 29V13z"/><rect x="20" y="23" width="24" height="18" rx="5"/><circle cx="27" cy="31" r="2" class="solid"/><circle cx="37" cy="31" r="2" class="solid"/><path d="M27 37h10"/></svg>',
  privacy: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="12" y="28" width="40" height="29" rx="6"/><path d="M21 28v-8a11 11 0 0 1 22 0v8"/><circle cx="32" cy="41" r="3" class="solid"/><path d="M32 44v6"/></svg>'
};

function createFallbackLogo(product, className) {
  const fallback = document.createElement("span");
  fallback.className = className + " product-logo-fallback";
  fallback.setAttribute("aria-hidden", "true");

  const markup = logoMarkup[product.logo];
  if (markup) {
    fallback.innerHTML = markup;
  } else {
    const label = String(product.symbol || product.name?.trim()?.charAt(0) || "?");
    fallback.textContent = label.slice(0, 2).toUpperCase();
  }
  return fallback;
}

export function renderCatalog(products) {
  const list = document.getElementById("product-list");
  if (!list) return;
  list.replaceChildren();

  for (const product of products) {
    const article = document.createElement("article");
    article.className = "product-card";

    const top = document.createElement("div");
    top.className = "product-top";

    const logoClass = `product-logo product-logo-${product.logo || "default"}`;
    const logoUrl = typeof product.logoUrl === "string" ? product.logoUrl.trim() : "";
    let symbol;

    if (logoUrl) {
      const image = document.createElement("img");
      image.className = logoClass;
      image.alt = `Logo ${product.name}`;
      image.width = 54;
      image.height = 54;
      image.loading = "lazy";
      image.decoding = "async";
      image.src = logoUrl;
      image.addEventListener("error", () => {
        image.replaceWith(createFallbackLogo(product, logoClass));
      }, { once: true });
      symbol = image;
    } else {
      symbol = createFallbackLogo(product, logoClass);
    }

    const identity = document.createElement("div");
    identity.className = "product-identity";

    const title = document.createElement("h3");
    title.textContent = product.name;

    const category = document.createElement("span");
    category.className = "product-label";
    category.textContent = product.category;
    identity.append(title, category);
    top.append(symbol, identity);

    const description = document.createElement("p");
    description.className = "card-copy product-description";
    description.textContent = product.description;

    const footer = document.createElement("div");
    footer.className = "product-card-footer";

    const status = document.createElement("span");
    status.className = "status-tag";
    status.textContent = product.status;
    if (product.status === "Tersedia") status.classList.add("status-available");
    else if (product.status.toLowerCase().includes("pengembangan")) status.classList.add("status-development");
    else status.classList.add("status-pending");

    const actions = document.createElement("div");
    actions.className = "product-actions";

    if (product.productUrl) {
      const openProduct = document.createElement("a");
      openProduct.className = "button button-primary button-small";
      openProduct.href = product.productUrl;
      openProduct.target = "_blank";
      openProduct.rel = "noopener noreferrer";
      openProduct.textContent = product.actionLabel || "Buka produk";
      openProduct.setAttribute("aria-label", `${openProduct.textContent}: ${product.name}`);
      actions.append(openProduct);
    }

    const detailsLink = document.createElement("a");
    detailsLink.className = "button button-secondary button-small";
    detailsLink.href = product.detailsUrl;
    detailsLink.setAttribute("aria-label", `Lihat detail ${product.name}`);
    detailsLink.textContent = "Lihat detail";
    actions.append(detailsLink);

    footer.append(status, actions);
    article.append(top, description, footer);
    list.append(article);
  }
}
