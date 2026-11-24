(() => {
  "use strict";

  const maxEntries = 12;
  const entries = [];
  let panel;
  let summary;
  let list;
  let closeButton;
  let copyButton;
  let copyStatus;
  let totalEntries = 0;
  const currentScript = document.currentScript;
  const reportEndpoint = currentScript?.dataset.endpoint || "https://chocoai.thechocostudios.bond/api/license?feature=tcs-public";
  const reportSite = currentScript?.dataset.site || "tcs-information";
  let visitorId;
  let sessionId;

  function storedId(key) {
    try {
      let value = sessionStorage.getItem(key);
      if (!value) {
        value = typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
              const r = Math.random() * 16 | 0;
              return (c === "x" ? r : (r & 3 | 8)).toString(16);
            });
        sessionStorage.setItem(key, value);
      }
      return value;
    } catch {
      return typeof crypto.randomUUID === "function" ? crypto.randomUUID() : String(Date.now());
    }
  }

  function reportFingerprint(entry) {
    const source = [
      entry.classification.code,
      entry.source,
      entry.resource,
      entry.status,
      entry.message
    ].join("|").toLowerCase();
    let hash = 2166136261;
    for (let i = 0; i < source.length; i++) hash = Math.imul(hash ^ source.charCodeAt(i), 16777619);
    return (hash >>> 0).toString(16);
  }

  function isDuplicate(entry) {
    const now = Date.now();
    const fingerprint = reportFingerprint(entry);
    let records = [];
    try {
      const stored = JSON.parse(sessionStorage.getItem("tcs_diagnostics_seen_v1") || "[]");
      if (Array.isArray(stored)) records = stored.filter(row => Array.isArray(row) && typeof row[0] === "string" && Number.isFinite(row[1]) && now - row[1] < 1800000);
      if (records.some(row => row[0] === fingerprint)) {
        sessionStorage.setItem("tcs_diagnostics_seen_v1", JSON.stringify(records.slice(-60)));
        return true;
      }
      records.push([fingerprint, now]);
      sessionStorage.setItem("tcs_diagnostics_seen_v1", JSON.stringify(records.slice(-60)));
    } catch {}
    return false;
  }

  function sendRemote(entry) {
    try {
      visitorId ||= storedId("tcs_analytics_visitor_v1");
      sessionId ||= storedId("tcs_analytics_session_v1");
      const payload = {
        action: "track",
        event: "client_error",
        siteKey: reportSite,
        visitorId,
        sessionId,
        errorCode: entry.classification.code,
        errorLayer: entry.classification.layer,
        source: entry.source,
        pagePath: location.pathname,
        resourceUrl: entry.resource,
        httpStatus: Number(entry.status) || null,
        message: entry.message
      };
      fetch(reportEndpoint, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (error) {
      console.warn("[TCS Diagnostics] Laporan tidak dapat dikirim:", error);
    }
  }

  function getResourceStatus(resource) {
    try {
      const resources = performance.getEntriesByName(resource, "resource");
      const item = resources[resources.length - 1];
      const status = Number(item?.responseStatus);
      return Number.isInteger(status) && status >= 100 && status <= 599 ? status : "";
    } catch {
      return "";
    }
  }


  function describeError(error) {
    if (error instanceof Error) {
      return {
        message: error.message || error.name || "Kesalahan tidak memiliki pesan.",
        stack: typeof error.stack === "string" ? error.stack.slice(0, 5000) : ""
      };
    }
    if (typeof error === "string") return { message: error, stack: "" };
    try {
      return { message: JSON.stringify(error) || String(error), stack: "" };
    } catch {
      return { message: String(error), stack: "" };
    }
  }

  function classify(input) {
    const status = Number(input.status);
    if (Number.isInteger(status) && status >= 500) {
      return {
        code: "SERVER_HTTP",
        label: "Respons server (HTTP " + status + ")",
        layer: "Server / hosting",
        advice: "Server atau lapisan hosting mengembalikan status 5xx. Periksa log hosting/CDN, konfigurasi publikasi, dan layanan yang diminta."
      };
    }
    if (status === 404) {
      return {
        code: "HTTP_NOT_FOUND",
        label: "Berkas atau rute tidak ditemukan (HTTP 404)",
        layer: "Path aset / routing hosting",
        advice: "Pastikan berkas benar-benar ada di commit yang dipublikasikan, path cocok persis termasuk huruf besar-kecil, dan folder publikasi hosting benar."
      };
    }
    if (status === 401 || status === 403) {
      return {
        code: "HTTP_ACCESS",
        label: "Akses ditolak (HTTP " + status + ")",
        layer: "Izin / autentikasi / aturan hosting",
        advice: "Periksa autentikasi, izin akses, header, serta aturan keamanan atau redirect di hosting/CDN. Jangan menaruh kredensial dalam laporan."
      };
    }
    if (status === 429) {
      return {
        code: "HTTP_RATE_LIMIT",
        label: "Batas permintaan tercapai (HTTP 429)",
        layer: "Rate limit / kuota layanan",
        advice: "Periksa batas permintaan, kuota, dan aturan rate limit layanan yang dituju sebelum mencoba kembali."
      };
    }
    if (status === 408) {
      return {
        code: "HTTP_TIMEOUT",
        label: "Permintaan kehabisan waktu (HTTP 408)",
        layer: "Jaringan / server tujuan",
        advice: "Periksa kestabilan jaringan, waktu respons origin, dan konfigurasi timeout pada proxy atau hosting."
      };
    }
    if (Number.isInteger(status) && status >= 400) {
      return {
        code: "HTTP_REQUEST",
        label: "Permintaan ditolak (HTTP " + status + ")",
        layer: "Permintaan / routing / aset",
        advice: "Periksa alamat dan nama berkas, parameter permintaan, huruf besar-kecil path, aturan routing, serta konfigurasi folder publikasi. Status ini saja belum membuktikan pengguna yang salah."
      };
    }
    if (input.kind === "network") {
      return {
        code: "NO_HTTP_RESPONSE",
        label: "Koneksi atau host tidak memberi respons HTTP",
        layer: "Jaringan / browser / DNS / hosting",
        advice: "Browser tidak menerima respons HTTP. Periksa koneksi perangkat, DNS, sertifikat, CDN, hosting, dan apakah host masih dapat dijangkau. Penyebab pastinya belum bisa dipisahkan tanpa log tambahan."
      };
    }
    if (input.kind === "asset") {
      return {
        code: "ASSET_LOAD",
        label: "Aset halaman gagal dimuat",
        layer: "Browser / jaringan / hosting",
        advice: "Periksa apakah berkas tersedia di hosting, alamat berkas benar, dan permintaan tidak diblokir kebijakan browser atau jaringan."
      };
    }
    return {
      code: "CLIENT_RUNTIME",
      label: "Kesalahan JavaScript sisi client",
      layer: "Browser / kode frontend",
      advice: "Periksa file, baris, dan kolom yang dilaporkan. Muat ulang halaman; jika berulang, reproduksi masalah pada browser yang sama dan periksa konsol pengembang."
    };
  }

  function addField(container, label, value) {
    if (value === undefined || value === null || value === "") return;
    const row = document.createElement("div");
    row.className = "diagnostic-field";
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.textContent = String(value);
    row.append(term, description);
    container.append(row);
  }

  function ensurePanel() {
    if (panel || !document.body) return;

    panel = document.createElement("aside");
    panel.className = "diagnostic-panel";
    panel.hidden = true;
    panel.setAttribute("aria-labelledby", "diagnostic-title");

    const header = document.createElement("div");
    header.className = "diagnostic-header";

    const headingWrap = document.createElement("div");
    const kicker = document.createElement("p");
    kicker.className = "diagnostic-kicker";
    kicker.textContent = "Laporan kesalahan";
    const title = document.createElement("h2");
    title.id = "diagnostic-title";
    title.textContent = "Detail masalah situs";
    headingWrap.append(kicker, title);

    const actions = document.createElement("div");
    actions.className = "diagnostic-actions";

    copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "diagnostic-copy";
    copyButton.textContent = "Salin laporan";
    copyButton.addEventListener("click", async () => {
      const reportText = entries.map(entry => [
        entry.id,
        "Jenis: " + entry.classification.label,
        "Lapisan: " + entry.classification.layer,
        "Waktu: " + entry.time,
        "Sumber: " + entry.source,
        "Berkas/URL: " + entry.resource,
        "HTTP: " + (entry.status || "-") + (entry.statusText ? " " + entry.statusText : ""),
        "Lokasi: " + (entry.line ? entry.line + ":" + (entry.column || 0) : "-"),
        "Pesan: " + entry.message,
        "Langkah pemeriksaan: " + entry.classification.advice,
        entry.stack ? "Jejak JavaScript:\n" + entry.stack : ""
      ].filter(Boolean).join("\n")).join("\n\n--------------------\n\n");

      try {
        if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
          throw new Error("Clipboard API tidak tersedia pada konteks ini.");
        }
        await navigator.clipboard.writeText(reportText);
        copyStatus.textContent = "Laporan berhasil disalin ke clipboard.";
      } catch (error) {
        copyStatus.textContent = "Browser menolak penyalinan otomatis. Detail tetap tersedia di panel untuk disalin manual.";
        console.warn("[TCS Diagnostics] Tidak dapat menyalin laporan:", error);
      }
    });

    closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "diagnostic-close";
    closeButton.textContent = "Tutup";
    closeButton.setAttribute("aria-label", "Tutup panel detail kesalahan");
    closeButton.addEventListener("click", () => {
      panel.hidden = true;
    });

    actions.append(copyButton, closeButton);
    header.append(headingWrap, actions);
    summary = document.createElement("p");
    summary.className = "diagnostic-summary";
    summary.setAttribute("aria-live", "polite");
    copyStatus = document.createElement("p");
    copyStatus.className = "diagnostic-copy-status";
    copyStatus.setAttribute("role", "status");
    copyStatus.setAttribute("aria-live", "polite");
    list = document.createElement("ol");
    list.className = "diagnostic-list";
    panel.append(header, summary, copyStatus, list);
    document.body.append(panel);
  }

  function renderEntries() {
    ensurePanel();
    if (!panel) return;

    panel.hidden = false;
    summary.textContent = entries.length + (entries.length === 1
      ? " kejadian tercatat di browser ini."
      : " kejadian tercatat di browser ini.");
    list.replaceChildren();

    for (const entry of entries) {
      const item = document.createElement("li");
      item.className = "diagnostic-item";

      const disclosure = document.createElement("details");
      disclosure.open = entries.length === 1;

      const heading = document.createElement("summary");
      heading.textContent = entry.id + " · " + entry.classification.label;

      const fields = document.createElement("dl");
      fields.className = "diagnostic-fields";
      addField(fields, "Kategori", entry.classification.layer);
      addField(fields, "Waktu lokal", entry.time);
      addField(fields, "Sumber / konteks", entry.source);
      addField(fields, "Berkas atau URL", entry.resource);
      addField(fields, "Kode HTTP", entry.status ? entry.status + (entry.statusText ? " " + entry.statusText : "") : "");
      addField(fields, "Baris / kolom", entry.line ? entry.line + (entry.column ? ":" + entry.column : "") : "");
      addField(fields, "Pesan teknis", entry.message);
      addField(fields, "Langkah pemeriksaan", entry.classification.advice);

      disclosure.append(heading, fields);
      if (entry.stack) {
        const stackDetails = document.createElement("details");
        const stackSummary = document.createElement("summary");
        stackSummary.textContent = "Jejak JavaScript";
        const stack = document.createElement("pre");
        stack.className = "diagnostic-stack";
        stack.textContent = entry.stack;
        stackDetails.append(stackSummary, stack);
        disclosure.append(stackDetails);
      }
      item.append(disclosure);
      list.append(item);
    }
  }

  function report(input = {}) {
    const errorInfo = describeError(input.error ?? input.message ?? "Kesalahan tidak diketahui.");
    const classification = classify(input);
    const sequence = ++totalEntries;
    const now = new Date();
    const entry = {
      id: "TCS-ERR-" + now.getTime().toString(36).toUpperCase() + "-" + String(sequence).padStart(2, "0"),
      classification,
      time: now.toLocaleString(),
      source: input.source || "Tidak diketahui",
      resource: input.resource || input.filename || "",
      status: input.status || "",
      statusText: input.statusText || "",
      line: input.line || "",
      column: input.column || "",
      message: errorInfo.message,
      stack: input.stack || errorInfo.stack
    };

    if (isDuplicate(entry)) return null;

    entries.push(entry);
    while (entries.length > maxEntries) entries.shift();

    console.error("[TCS Diagnostics]", {
      id: entry.id,
      category: classification.code,
      layer: classification.layer,
      source: entry.source,
      resource: entry.resource,
      status: entry.status || null,
      time: entry.time,
      message: entry.message,
      stack: entry.stack || undefined
    });
    sendRemote(entry);
    renderEntries();
    return entry.id;
  }

  window.TCSDiagnostics = Object.freeze({ report });

  function getFailedResource(target) {
    if (!(target instanceof Element)) return null;

    const tagName = target.tagName.toUpperCase();
    const linkResourceRels = new Set([
      "stylesheet",
      "preload",
      "modulepreload",
      "icon",
      "apple-touch-icon",
      "mask-icon",
      "manifest",
      "prefetch"
    ]);

    if (tagName === "LINK") {
      const rels = String(target.rel || "").toLowerCase().split(/\s+/).filter(Boolean);
      if (!rels.some(rel => linkResourceRels.has(rel))) return null;
    } else if (![
      "SCRIPT",
      "IMG",
      "IFRAME",
      "SOURCE",
      "VIDEO",
      "AUDIO",
      "OBJECT",
      "EMBED",
      "TRACK"
    ].includes(tagName)) {
      // A normal hyperlink or metadata link is not a failed page asset.
      return null;
    }

    // An empty IMG src resolves to the current document URL in browsers.
    // It is not a real asset request and must not be reported as a broken image.
    if (tagName === "IMG") {
      const source = String(target.getAttribute("src") || "").trim();
      const sourceSet = String(target.getAttribute("srcset") || "").trim();
      if (!source && !sourceSet) return null;
    }

    const resource = target.currentSrc || target.src || (tagName === "LINK" ? target.href : "");
    if (!resource) return null;

    return {
      resource,
      tagName,
      rel: tagName === "LINK" ? String(target.rel || "") : "",
      status: getResourceStatus(resource)
    };
  }

  window.addEventListener("error", event => {
    if (event.target instanceof Element) {
      const failedResource = getFailedResource(event.target);
      if (!failedResource) return;

      report({
        kind: "asset",
        source: "Pemuatan aset browser",
        resource: failedResource.resource,
        status: failedResource.status,
        message: "Browser gagal memuat elemen " + failedResource.tagName +
          (failedResource.rel ? " (rel=" + failedResource.rel + ")" : "") +
          ". Periksa permintaan di tab Network untuk mengetahui status HTTP."
      });
      return;
    }

    report({
      kind: "client",
      source: "window.error",
      resource: event.filename || "",
      line: event.lineno || "",
      column: event.colno || "",
      message: event.message || "Kesalahan JavaScript tanpa pesan.",
      error: event.error,
      stack: event.error && event.error.stack
    });
  }, true);

  window.addEventListener("unhandledrejection", event => {
    report({
      kind: "client",
      source: "unhandledrejection",
      message: "Promise gagal dan tidak ditangani: " + describeError(event.reason).message,
      error: event.reason
    });
  });
})();
