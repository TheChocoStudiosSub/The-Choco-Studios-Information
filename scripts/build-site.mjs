import { cpSync, copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "dist");

const publicFiles = [
  "index.html",
  "404.html",
  "favicon.svg",
  "robots.txt",
  "sitemap.xml",
  "tcs-analytics.js",
  "_headers"
];

const publicDirectories = [
  "assets",
  "components",
  "data",
  "products"
];

const requiredOutput = [
  ...publicFiles,
  "assets/js/main.js",
  "assets/images/the-choco-studios-logo.png",
  "assets/js/diagnostics.js",
  "assets/css/space-background.css",
  "assets/js/features/space-background.js",
  "components/header.html",
  "components/products.html",
  "data/site.js",
  "data/navigation.js",
  "data/products.js",
  "products/choco-ai.html",
  "products/kasirkita.html",
  "products/chocobot-guardian.html",
  "products/privacy-guardian.html",
  "products/choco-ai-help-center.html",
  "products/chocoscan.html",
  "products/tcs-umkm-stock-sales-tracker.html",
  "products/tcs-business-document-kit.html",
  "products/tcs-professional-cv-kit.html",
  "products/tcs-social-media-business-kit.html",
  "products/tcs-business-presentation-kit.html",
  "products/tcs-finance-cashflow-pro.html",
  "products/tcs-umkm-website-kit.html",
  "products/tcs-admin-dashboard-ui-kit.html",
  "products/tcs-business-management-system.html",
  "products/tcs-complete-umkm-suite.html"
];

for (const source of [...publicFiles, ...publicDirectories]) {
  if (!existsSync(path.join(root, source))) {
    throw new Error(`Sumber publik wajib tidak ditemukan: ${source}`);
  }
}

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (const file of publicFiles) {
  copyFileSync(path.join(root, file), path.join(output, file));
}

for (const directory of publicDirectories) {
  cpSync(path.join(root, directory), path.join(output, directory), { recursive: true });
}

const missing = requiredOutput.filter(file => !existsSync(path.join(output, file)));
if (missing.length) {
  rmSync(output, { recursive: true, force: true });
  throw new Error("Hasil build tidak lengkap: " + missing.join(", "));
}


function collectProductHtml(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectProductHtml(fullPath));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) files.push(fullPath);
  }
  return files;
}

function injectGlobalSpaceBackground() {
  const pages = [
    path.join(output, "index.html"),
    path.join(output, "404.html"),
    ...collectProductHtml(path.join(output, "products"))
  ];
  const stylesheet = '<link rel="stylesheet" href="/assets/css/space-background.css" data-tcs-space-background-style>';
  const script = '<script type="module" src="/assets/js/features/space-background.js" data-tcs-space-background-script></script>';
  let injected = 0;

  for (const file of pages) {
    let html = readFileSync(file, "utf8");
    if (!html.includes("data-tcs-space-background-style")) {
      if (!/<\/head>/i.test(html)) throw new Error(`Tag </head> tidak ditemukan pada ${path.relative(output, file)}`);
      html = html.replace(/<\/head>/i, `  ${stylesheet}\n</head>`);
    }
    if (!html.includes("data-tcs-space-background-script")) {
      if (!/<\/body>/i.test(html)) throw new Error(`Tag </body> tidak ditemukan pada ${path.relative(output, file)}`);
      html = html.replace(/<\/body>/i, `  ${script}\n</body>`);
    }
    if (!html.includes("data-tcs-space-background-style") || !html.includes("data-tcs-space-background-script")) {
      throw new Error(`Background global gagal dipasang pada ${path.relative(output, file)}`);
    }
    writeFileSync(file, html, "utf8");
    injected += 1;
  }

  if (pages.length !== injected || injected < 3) {
    throw new Error(`Pemasangan background global tidak lengkap: ${injected} dari ${pages.length} halaman.`);
  }
  console.log(`BACKGROUND GLOBAL LULUS: efek bintang dan meteor dipasang pada ${injected} halaman HTML.`);
}

injectGlobalSpaceBackground();

const forbiddenPaths = ["README.md", "package.json", "docs", "scripts", ".github", "netlify.toml"];
const leaked = forbiddenPaths.filter(file => existsSync(path.join(output, file)));
if (leaked.length) {
  rmSync(output, { recursive: true, force: true });
  throw new Error("File/ folder internal tidak boleh masuk hasil deploy: " + leaked.join(", "));
}

const htmlPages = [
  "index.html",
  "404.html",
  "products/choco-ai.html",
  "products/kasirkita.html",
  "products/chocobot-guardian.html",
  "products/privacy-guardian.html"
];
const htmlCount = htmlPages.filter(file => existsSync(path.join(output, file))).length;

console.log(`BUILD LULUS: ${requiredOutput.length} path wajib tersedia; ${htmlCount} halaman HTML utama terbit.`);
console.log("Isi deploy: assets, components, data, products, index, 404, favicon, robots, sitemap, analytics, dan headers.");
console.log("Dokumentasi, bank pertanyaan, script validasi, dan konfigurasi build tidak ikut diterbitkan.");
