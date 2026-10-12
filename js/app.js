/* ==========================================================================
   Sara Aliscioni — sito statico a sezioni.
   I contenuti sono in /content/*.json (modificabili dal CMS): qui li leggiamo
   e costruiamo le pagine. Niente animazioni, tranne la dissolvenza della home.
   ========================================================================== */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $("#app");
  const PAGE = document.body.dataset.page;
  const params = new URLSearchParams(location.search);

  /* ---------- language ---------- */
  let stored = null;
  try { stored = localStorage.getItem("sa-lang"); } catch (e) { /* storage blocked */ }
  const qLang = params.get("lang");
  let lang = (qLang === "it" || qLang === "en") ? qLang
    : (stored === "it" || stored === "en") ? stored
    : ((navigator.language || "it").toLowerCase().startsWith("it") ? "it" : "en");

  const UI = {
    it: {
      role: "Fotografa", menu: "Menu", close: "Chiudi",
      "nav.home": "Home", "nav.serie": "Serie", "nav.impressioni": "Impressioni di viaggio", "nav.bio": "Bio",
      "nav.biography": "Biografia", "nav.exhibitions": "Mostre e premi", "nav.publications": "Pubblicazioni",
      "nav.news": "News", "nav.blog": "Blog", "nav.contact": "Contatti",
      rights: "Tutte le fotografie sono protette da diritto d'autore.",
      allSerie: "Tutte le serie", allImp: "Tutte le impressioni di viaggio",
      galleries: "Gallerie", all: "Tutte",
      "cat.serie": "Serie", "cat.impressioni": "Impressioni di viaggio",
      "intro.serie": "Progetti e ricerche tematiche, sviluppati nel tempo.",
      "intro.impressioni": "Taccuini di viaggio in bianco e nero: persone, strade e luoghi dimenticati.",
      "intro.all": "Tutte le gallerie fotografiche, serie e impressioni di viaggio.",
      photos: n => `${n} ${n === 1 ? "foto" : "foto"}`,
      prev: "Precedente", next: "Successiva",
      biography: "Biografia", education: "Formazione", languages: "Lingue",
      exhibitions: "Mostre e premi", solo: "Mostre personali", group: "Mostre collettive", awards: "Premi e riconoscimenti",
      publications: "Pubblicazioni", work: "Backstage e collaborazioni",
      news: "News", newsEmpty: "Nessuna news al momento.",
      blog: "Blog", blogEmpty: "Il blog è in preparazione: i primi articoli arriveranno presto.",
      readMore: "Leggi", backBlog: "← Tutti gli articoli", link: "Approfondisci",
      contact: "Contatti", email: "Email", phone: "Telefono",
      notFound: "Pagina non trovata", notFoundText: "La pagina che cerchi non esiste o è stata spostata.", home: "Torna alla home",
      galleryMissing: "Galleria non trovata.", loadError: "Impossibile caricare i contenuti. Riprova tra poco."
    },
    en: {
      role: "Photographer", menu: "Menu", close: "Close",
      "nav.home": "Home", "nav.serie": "Series", "nav.impressioni": "Travel impressions", "nav.bio": "Bio",
      "nav.biography": "Biography", "nav.exhibitions": "Exhibitions & awards", "nav.publications": "Publications",
      "nav.news": "News", "nav.blog": "Blog", "nav.contact": "Contact",
      rights: "All photographs are protected by copyright.",
      allSerie: "All series", allImp: "All travel impressions",
      galleries: "Galleries", all: "All",
      "cat.serie": "Series", "cat.impressioni": "Travel impressions",
      "intro.serie": "Thematic projects and research, developed over time.",
      "intro.impressioni": "Black and white travel notebooks: people, streets and forgotten places.",
      "intro.all": "All photo galleries, series and travel impressions.",
      photos: n => `${n} ${n === 1 ? "photo" : "photos"}`,
      prev: "Previous", next: "Next",
      biography: "Biography", education: "Education", languages: "Languages",
      exhibitions: "Exhibitions & awards", solo: "Solo exhibitions", group: "Group exhibitions", awards: "Awards & recognitions",
      publications: "Publications", work: "Backstage & collaborations",
      news: "News", newsEmpty: "No news at the moment.",
      blog: "Blog", blogEmpty: "The blog is being prepared: the first posts are coming soon.",
      readMore: "Read", backBlog: "← All posts", link: "Read more",
      contact: "Contact", email: "Email", phone: "Phone",
      notFound: "Page not found", notFoundText: "The page you are looking for doesn't exist or has moved.", home: "Back to home",
      galleryMissing: "Gallery not found.", loadError: "Couldn't load the content. Please try again shortly."
    }
  };
  const u = key => UI[lang][key] ?? UI.it[key] ?? "";
  /* bilingual field: tr(obj, "title") → obj.title_it / obj.title_en (falls back to Italian) */
  const tr = (o, f) => (o && (o[`${f}_${lang}`] || o[`${f}_it`])) || "";

  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const paras = text => String(text || "").split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
  const pad = n => String(n).padStart(2, "0");
  /* images/l/x.webp has a 720px sibling in images/s/ */
  const small = src => (src && src.startsWith("images/l/")) ? src.replace("images/l/", "images/s/") : src;
  const imgAttrs = (src, sizes) => {
    const s = small(src);
    return s !== src ? `src="${esc(s)}" srcset="${esc(s)} 720w, ${esc(src)} 1600w" sizes="${sizes}"` : `src="${esc(src)}"`;
  };

  /* ---------- data ---------- */
  const cache = {};
  const load = name => cache[name] || (cache[name] = fetch(`content/${name}.json`, { cache: "no-cache" }).then(r => {
    if (!r.ok) throw new Error(name);
    return r.json();
  }));

  /* ==========================================================================
     Header: menus, current page, mobile
     ========================================================================== */
  function applyUI() {
    document.documentElement.lang = lang;
    $$("[data-t]").forEach(el => { el.textContent = u(el.dataset.t); });
    $$(".lang button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    const tog = $(".menu-toggle span");
    if (tog) tog.textContent = $(".site-nav").classList.contains("is-open") ? u("close") : u("menu");
    $$(".js-year").forEach(el => { el.textContent = new Date().getFullYear(); });
  }

  function buildMenus(galleries) {
    const fill = (cat, allKey) => {
      const ul = $(`[data-sub="${cat}"]`);
      if (!ul) return;
      const items = galleries.filter(g => g.category === cat);
      ul.innerHTML = `<li class="sub__all"><a href="gallerie.html?cat=${cat}">${esc(u(allKey))}</a></li>` +
        items.map(g => `<li><a href="galleria.html?g=${encodeURIComponent(g.id)}" data-g="${esc(g.id)}">${esc(tr(g, "title"))}</a></li>`).join("");
    };
    fill("serie", "allSerie");
    fill("impressioni", "allImp");
    markCurrent(galleries);
  }

  function markCurrent(galleries) {
    let nav = document.body.dataset.nav;
    if (PAGE === "galleries") nav = params.get("cat") || "";
    if (PAGE === "gallery" && galleries) {
      const g = galleries.find(x => x.id === params.get("g"));
      nav = g ? g.category : "";
      $$(`.sub a[data-g]`).forEach(a => a.classList.toggle("is-current", g && a.dataset.g === g.id));
    }
    $$(".nav > li > a").forEach(a => a.classList.toggle("is-current", !!nav && a.dataset.nav === nav));
    const file = location.pathname.split("/").pop() || "index.html";
    $$(".sub a:not([data-g])").forEach(a => a.classList.toggle("is-current", a.getAttribute("href") === file));
  }

  const navEl = $(".site-nav");
  const toggle = $(".menu-toggle");
  function setMenu(open) {
    navEl.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("no-scroll", open);
    $("span", toggle).textContent = open ? u("close") : u("menu");
  }
  toggle.addEventListener("click", () => setMenu(!navEl.classList.contains("is-open")));
  $$(".sub-toggle").forEach(b => b.addEventListener("click", () => {
    const li = b.closest(".has-sub");
    const open = !li.classList.contains("is-open");
    li.classList.toggle("is-open", open);
    b.setAttribute("aria-expanded", String(open));
  }));
  window.matchMedia("(min-width: 1081px)").addEventListener("change", e => { if (e.matches) setMenu(false); });

  $$(".lang button").forEach(b => b.addEventListener("click", () => {
    if (b.dataset.lang === lang) return;
    lang = b.dataset.lang;
    try { localStorage.setItem("sa-lang", lang); } catch (e) { /* ignore */ }
    applyUI();
    load("galleries").then(buildMenus).catch(() => {});
    render();
  }));

  async function footer() {
    const ul = $("[data-social]");
    if (!ul) return;
    try {
      const s = await load("site");
      const links = [["Instagram", s.instagram], ["Facebook", s.facebook], ["LinkedIn", s.linkedin], ["Behance", s.behance]].filter(x => x[1]);
      ul.innerHTML = links.map(([n, h]) => `<li><a href="${esc(h)}" target="_blank" rel="noopener">${n}</a></li>`).join("");
    } catch (e) { /* footer stays without links */ }
  }

  /* ==========================================================================
     Pages
     ========================================================================== */
  let stopSlideshow = null;

  const PAGES = {
    /* ---------- Home: simple loop of selected photos ---------- */
    async home() {
      const h = await load("home");
      const slides = (h.slides || []).filter(s => s.src);
      if (!slides.length) { app.innerHTML = ""; return; }
      app.innerHTML = `
        <section class="home" aria-label="Sara Aliscioni">
          <div class="slides">
            ${slides.map((s, i) => `<a class="slide${i === 0 ? " is-active" : ""}" href="${s.gallery ? `galleria.html?g=${encodeURIComponent(s.gallery)}` : "gallerie.html"}" tabindex="${i === 0 ? 0 : -1}">
              <img ${i < 2 ? `src="${esc(s.src)}"` : `data-src="${esc(s.src)}"`} alt="${esc(tr(s, "caption"))}" ${i === 0 ? 'fetchpriority="high"' : ""} decoding="async">
            </a>`).join("")}
          </div>
          <div class="home-bar">
            <a class="home-bar__cap" href="#"></a>
            <div class="home-bar__ctrl">
              <button type="button" data-step="-1" aria-label="${esc(u("prev"))}">‹</button>
              <span class="home-bar__n"></span>
              <button type="button" data-step="1" aria-label="${esc(u("next"))}">›</button>
            </div>
          </div>
        </section>`;
      const els = $$(".slide", app);
      const cap = $(".home-bar__cap", app);
      const num = $(".home-bar__n", app);
      let i = 0, timer = null;
      const ms = Math.max(3, +h.interval_seconds || 5) * 1000;
      const ready = k => { const img = $("img", els[k]); if (img && img.dataset.src) { img.src = img.dataset.src; img.removeAttribute("data-src"); } };
      const show = k => {
        els[i].classList.remove("is-active"); els[i].tabIndex = -1;
        i = (k + els.length) % els.length;
        ready(i); ready((i + 1) % els.length);
        els[i].classList.add("is-active"); els[i].tabIndex = 0;
        cap.textContent = tr(slides[i], "caption");
        cap.href = els[i].getAttribute("href");
        num.textContent = `${pad(i + 1)} / ${pad(els.length)}`;
      };
      const start = () => { clearInterval(timer); timer = setInterval(() => { if (!document.hidden) show(i + 1); }, ms); };
      $$("[data-step]", app).forEach(b => b.addEventListener("click", () => { show(i + +b.dataset.step); start(); }));
      show(0); start();
      stopSlideshow = () => clearInterval(timer);
    },

    /* ---------- Galleries index (?cat=serie|impressioni) ---------- */
    async galleries() {
      const all = await load("galleries");
      const cat = ["serie", "impressioni"].includes(params.get("cat")) ? params.get("cat") : "all";
      const list = cat === "all" ? all : all.filter(g => g.category === cat);
      const title = cat === "all" ? u("galleries") : u(`cat.${cat}`);
      document.title = `${title} — Sara Aliscioni`;
      app.innerHTML = `
        <div class="page">
          <header class="page-head"><h1>${esc(title)}</h1></header>
          <p class="cat-intro">${esc(u(`intro.${cat}`))}</p>
          <nav class="cat-switch" aria-label="${esc(u("galleries"))}">
            <a href="gallerie.html?cat=serie"${cat === "serie" ? ' class="is-current"' : ""}>${esc(u("cat.serie"))}</a>
            <a href="gallerie.html?cat=impressioni"${cat === "impressioni" ? ' class="is-current"' : ""}>${esc(u("cat.impressioni"))}</a>
            <a href="gallerie.html"${cat === "all" ? ' class="is-current"' : ""}>${esc(u("all"))}</a>
          </nav>
          <div class="cards">
            ${list.map(g => `
              <a class="card" href="galleria.html?g=${encodeURIComponent(g.id)}">
                <div class="card__img"><img ${imgAttrs(g.cover || (g.images[0] || {}).src, "(max-width: 700px) 46vw, (max-width: 1100px) 31vw, 23vw")} alt="${esc(tr(g, "title"))}" loading="lazy" decoding="async"></div>
                <h2 class="card__title">${esc(tr(g, "title"))}</h2>
                <p class="card__meta label">${esc([g.year, u("photos")((g.images || []).length)].filter(Boolean).join(" · "))}</p>
              </a>`).join("")}
          </div>
        </div>`;
    },

    /* ---------- Single gallery (?g=id) ---------- */
    async gallery() {
      const all = await load("galleries");
      const idx = all.findIndex(x => x.id === params.get("g"));
      if (idx < 0) { app.innerHTML = `<div class="page"><p class="empty">${esc(u("galleryMissing"))} <a class="more-link" href="gallerie.html">${esc(u("galleries"))}</a></p></div>`; return; }
      const g = all[idx];
      const same = all.filter(x => x.category === g.category);
      const k = same.indexOf(g);
      const prev = same[(k - 1 + same.length) % same.length];
      const next = same[(k + 1) % same.length];
      const imgs = g.images || [];
      document.title = `${tr(g, "title")} — Sara Aliscioni`;
      app.innerHTML = `
        <div class="page">
          <p class="crumbs label"><a href="gallerie.html?cat=${esc(g.category)}">${esc(u(`cat.${g.category}`))}</a></p>
          <div class="gallery-intro">
            <header class="page-head">
              <h1>${esc(tr(g, "title"))}</h1>
              <p class="meta label">${esc([tr(g, "place"), g.year, u("photos")(imgs.length)].filter(Boolean).join(" · "))}</p>
            </header>
            <div class="prose">${paras(tr(g, "text"))}</div>
          </div>
          <div class="masonry">
            ${imgs.map((im, i) => `
              <figure>
                <button type="button" data-i="${i}" aria-label="${esc(tr(im, "caption") || tr(g, "title"))}">
                  <img ${imgAttrs(im.src, "(max-width: 400px) 92vw, (max-width: 700px) 46vw, 31vw")} ${im.w ? `width="${im.w}" height="${im.h}"` : ""} alt="${esc(tr(im, "caption") || tr(g, "title"))}" loading="lazy" decoding="async">
                </button>
                ${tr(im, "caption") ? `<figcaption>${esc(tr(im, "caption"))}</figcaption>` : ""}
              </figure>`).join("")}
          </div>
          ${same.length > 1 ? `<nav class="pager">
            <a class="prev" href="galleria.html?g=${encodeURIComponent(prev.id)}"><span class="label">← ${esc(u("prev"))}</span><b>${esc(tr(prev, "title"))}</b></a>
            <a class="next" href="galleria.html?g=${encodeURIComponent(next.id)}"><span class="label">${esc(u("next"))} →</span><b>${esc(tr(next, "title"))}</b></a>
          </nav>` : ""}
        </div>`;
      $$(".masonry button", app).forEach(b => b.addEventListener("click", () => lightbox.open(imgs.map(im => ({ src: im.src, cap: tr(im, "caption") || tr(g, "title") })), +b.dataset.i)));
      markCurrent(all);
    },

    /* ---------- Bio ---------- */
    async bio() {
      const b = await load("bio");
      document.title = `${u("biography")} — Sara Aliscioni`;
      app.innerHTML = `
        <div class="page two-col">
          <figure class="two-col__media">
            ${b.portrait ? `<img src="${esc(b.portrait)}" alt="Sara Aliscioni" decoding="async">` : ""}
            <figcaption class="label">Sara Aliscioni</figcaption>
          </figure>
          <div>
            <header class="page-head"><h1>${esc(u("biography"))}</h1></header>
            ${tr(b, "lead") ? `<p class="lead">${esc(tr(b, "lead"))}</p>` : ""}
            <div class="prose">${paras(tr(b, "text"))}</div>
            ${(b.facts || []).length ? `<dl class="facts">${b.facts.map(f => `<div><dt class="label">${esc(tr(f, "label"))}</dt><dd>${esc(tr(f, "value"))}</dd></div>`).join("")}</dl>` : ""}
            ${(b.education || []).length ? `<h2 class="section-title">${esc(u("education"))}</h2>
              <ul class="rows">${b.education.map(e => `<li><span class="y">${esc(e.year)}</span><div><p class="t">${esc(tr(e, "text"))}</p></div></li>`).join("")}</ul>` : ""}
            ${tr(b, "languages") ? `<h2 class="section-title">${esc(u("languages"))}</h2><p>${esc(tr(b, "languages"))}</p>` : ""}
          </div>
        </div>`;
    },

    /* ---------- Exhibitions & awards ---------- */
    async exhibitions() {
      const cv = await load("cv");
      document.title = `${u("exhibitions")} — Sara Aliscioni`;
      app.innerHTML = `
        <div class="page">
          <header class="page-head"><h1>${esc(u("exhibitions"))}</h1></header>
          <div class="cv-grid">
            <div>${rows(u("solo"), cv.solo)}</div>
            <div>${rows(u("group"), cv.group)}</div>
            <div>${rows(u("awards"), cv.awards)}</div>
          </div>
        </div>`;
    },

    /* ---------- Publications ---------- */
    async publications() {
      const cv = await load("cv");
      document.title = `${u("publications")} — Sara Aliscioni`;
      app.innerHTML = `
        <div class="page">
          <header class="page-head"><h1>${esc(u("publications"))}</h1></header>
          <div class="cv-grid">
            <div>${rows(u("publications"), cv.publications)}</div>
            <div>${rows(u("work"), cv.work)}</div>
          </div>
        </div>`;
    },

    /* ---------- News ---------- */
    async news() {
      const items = [...await load("news")].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
      document.title = `${u("news")} — Sara Aliscioni`;
      app.innerHTML = `
        <div class="page">
          <header class="page-head"><h1>${esc(u("news"))}</h1></header>
          ${items.length ? `<ul class="news-list">${items.map(n => `
            <li>
              <p class="label">${esc(tr(n, "when") || n.date || "")}</p>
              <div>
                <h2>${esc(tr(n, "title"))}</h2>
                ${tr(n, "place") ? `<p class="place label">${esc(tr(n, "place"))}</p>` : ""}
                <div class="prose">${paras(tr(n, "text"))}</div>
                ${n.link ? `<a class="more-link" href="${esc(n.link)}" target="_blank" rel="noopener">${esc(u("link"))} ↗</a>` : ""}
              </div>
              ${n.image ? `<div class="img"><img ${imgAttrs(n.image, "260px")} alt="${esc(tr(n, "title"))}" loading="lazy" decoding="async"></div>` : "<div></div>"}
            </li>`).join("")}</ul>` : `<p class="empty">${esc(u("newsEmpty"))}</p>`}
        </div>`;
    },

    /* ---------- Blog ---------- */
    async blog() {
      const posts = [...await load("blog")].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
      document.title = `${u("blog")} — Sara Aliscioni`;
      app.innerHTML = `
        <div class="page">
          <header class="page-head"><h1>${esc(u("blog"))}</h1></header>
          ${posts.length ? `<div class="post-list">${posts.map(p => `
            <article>
              ${p.cover ? `<a class="img" href="articolo.html?p=${encodeURIComponent(p.id)}"><img ${imgAttrs(p.cover, "(max-width: 700px) 92vw, 33vw")} alt="" loading="lazy" decoding="async"></a>` : ""}
              <span class="label">${esc(fmtDate(p.date))}</span>
              <h2><a href="articolo.html?p=${encodeURIComponent(p.id)}">${esc(tr(p, "title"))}</a></h2>
              <div class="prose">${paras(tr(p, "excerpt"))}</div>
              <a class="more-link" href="articolo.html?p=${encodeURIComponent(p.id)}">${esc(u("readMore"))} →</a>
            </article>`).join("")}</div>` : `<p class="empty">${esc(u("blogEmpty"))}</p>`}
        </div>`;
    },

    async post() {
      const posts = await load("blog");
      const p = posts.find(x => x.id === params.get("p"));
      if (!p) { app.innerHTML = `<div class="page"><p class="empty">${esc(u("notFound"))}. <a class="more-link" href="blog.html">${esc(u("backBlog"))}</a></p></div>`; return; }
      document.title = `${tr(p, "title")} — Sara Aliscioni`;
      app.innerHTML = `
        <article class="page">
          <p class="crumbs label"><a href="blog.html">${esc(u("backBlog"))}</a></p>
          <header class="page-head"><h1>${esc(tr(p, "title"))}</h1><p class="meta label">${esc(fmtDate(p.date))}</p></header>
          ${p.cover ? `<img class="post-cover" src="${esc(p.cover)}" alt="" decoding="async">` : ""}
          <div class="prose">${paras(tr(p, "body"))}</div>
        </article>`;
    },

    /* ---------- Contact ---------- */
    async contact() {
      const s = await load("site");
      document.title = `${u("contact")} — Sara Aliscioni`;
      const handle = url => { try { const p = new URL(url).pathname.replace(/\/+$/, "").split("/").pop(); return p || url; } catch (e) { return url; } };
      const links = [
        s.email && ["Email", `mailto:${s.email}`, s.email],
        s.phone && [u("phone"), `tel:${s.phone.replace(/\s+/g, "")}`, s.phone],
        s.instagram && ["Instagram", s.instagram, "@" + handle(s.instagram)],
        s.facebook && ["Facebook", s.facebook, handle(s.facebook)],
        s.linkedin && ["LinkedIn", s.linkedin, "Sara Aliscioni"],
        s.behance && ["Behance", s.behance, handle(s.behance)],
        s.x && ["X / Twitter", s.x, "@" + handle(s.x)]
      ].filter(Boolean);
      app.innerHTML = `
        <div class="page two-col">
          <figure class="two-col__media">${s.contact_photo ? `<img src="${esc(s.contact_photo)}" alt="Sara Aliscioni" decoding="async">` : ""}</figure>
          <div>
            <header class="page-head"><h1>${esc(u("contact"))}</h1></header>
            <div class="prose">${paras(tr(s, "contact_text"))}</div>
            <div class="contact-links">
              ${links.map(([n, h, label]) => `<a href="${esc(h)}"${h.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}><b>${esc(n)}</b><span>${esc(label)}</span><i aria-hidden="true">↗</i></a>`).join("")}
            </div>
          </div>
        </div>`;
    },

    async notfound() {
      app.innerHTML = `
        <div class="page">
          <header class="page-head"><h1>${esc(u("notFound"))}</h1></header>
          <p class="prose">${esc(u("notFoundText"))}</p>
          <a class="more-link" href="index.html">${esc(u("home"))} →</a>
        </div>`;
    }
  };

  function rows(title, list) {
    if (!list || !list.length) return "";
    return `<h2 class="section-title">${esc(title)}</h2>
      <ul class="rows">${list.map(r => `<li><span class="y">${esc(r.year)}</span><div><p class="t">${esc(tr(r, "title"))}</p>${tr(r, "place") ? `<p class="p">${esc(tr(r, "place"))}</p>` : ""}</div></li>`).join("")}</ul>`;
  }

  function fmtDate(d) {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString(lang === "it" ? "it-IT" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  function render() {
    if (stopSlideshow) { stopSlideshow(); stopSlideshow = null; }
    const fn = PAGES[PAGE] || PAGES.notfound;
    fn().catch(() => { app.innerHTML = `<div class="page"><p class="empty">${esc(u("loadError"))}</p></div>`; });
  }

  /* ==========================================================================
     Lightbox
     ========================================================================== */
  const lightbox = (() => {
    const box = $(".lightbox");
    const img = $("img", box);
    const cap = $("figcaption", box);
    let list = [], i = 0;
    const show = () => {
      const it = list[i];
      img.src = it.src; img.alt = it.cap || "";
      cap.textContent = `${pad(i + 1)} / ${pad(list.length)}${it.cap ? " — " + it.cap : ""}`;
      const nx = list[(i + 1) % list.length]; if (nx) { const pre = new Image(); pre.src = nx.src; }
    };
    const open = (l, k) => { list = l; i = k; box.hidden = false; document.body.classList.add("no-scroll"); show(); $(".lightbox__close", box).focus({ preventScroll: true }); };
    const close = () => { box.hidden = true; document.body.classList.remove("no-scroll"); img.removeAttribute("src"); };
    const go = d => { i = (i + d + list.length) % list.length; show(); };
    $(".lightbox__close", box).addEventListener("click", close);
    $(".lightbox__prev", box).addEventListener("click", () => go(-1));
    $(".lightbox__next", box).addEventListener("click", () => go(1));
    box.addEventListener("click", e => { if (e.target === box || e.target.classList.contains("lightbox__fig")) close(); });
    document.addEventListener("keydown", e => {
      if (box.hidden) { if (e.key === "Escape" && navEl.classList.contains("is-open")) setMenu(false); return; }
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    });
    let sx = 0;
    box.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); });
    return { open };
  })();

  /* ---------- boot ---------- */
  applyUI();
  load("galleries").then(buildMenus).catch(() => markCurrent(null));
  footer();
  render();
})();
