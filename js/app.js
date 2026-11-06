/* ==========================================================================
   Sara Aliscioni — static site in sections.
   Content lives in /content/*.json (editable from the CMS); this script
   reads it and builds each page. No animations except the home dissolve.
   ========================================================================== */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $("#app");
  const PAGE = document.body.dataset.page;
  const params = new URLSearchParams(location.search);

  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = n => String(n).padStart(2, "0");
  const thumb = im => (im && (im.thumb || im.src)) || "";
  const dims = im => (im && im.w ? `width="${im.w}" height="${im.h}"` : "");

  /* Tiny markdown: "### heading", *italic*, [label](url), blank line = new paragraph, single newline = line break */
  function inline(s) {
    return esc(s)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
        const ext = /^https?:/.test(url);
        return `<a href="${url}"${ext ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`;
      })
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  }
  function md(text) {
    return String(text || "").split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => {
      if (p.startsWith("### ")) return `<h3>${esc(p.slice(4))}</h3>`;
      return `<p>${inline(p)}</p>`;
    }).join("");
  }
  const excerpt = (text, n = 220) => {
    const first = String(text || "").split(/\n\s*\n/).find(p => p.trim() && !p.startsWith("###")) || "";
    const plain = first.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*/g, "").replace(/\n/g, " ");
    return plain.length > n ? plain.slice(0, n).replace(/\s+\S*$/, "") + "…" : plain;
  };

  /* ---------- data ---------- */
  const cache = {};
  const load = name => cache[name] || (cache[name] = fetch(`content/${name}.json`).then(r => {
    if (!r.ok) throw new Error(name);
    return r.json();
  }));

  /* ==========================================================================
     Header: submenus, current page, mobile menu, footer
     ========================================================================== */
  async function buildMenus() {
    const fill = (key, list, href, allLabel, allHref) => {
      const ul = $(`[data-sub="${key}"]`);
      if (!ul) return;
      ul.innerHTML = `<li class="sub__all"><a href="${allHref}">${esc(allLabel)}</a></li>` +
        list.map(x => `<li><a href="${href(x)}" data-id="${esc(x.id)}">${esc(x.title)}</a></li>`).join("");
    };
    try {
      const [projects, pubs] = await Promise.all([load("projects"), load("publications")]);
      fill("projects", projects, p => `projects.html?p=${encodeURIComponent(p.id)}`, "All projects", "projects.html");
      fill("publications", pubs, p => `publications.html?p=${encodeURIComponent(p.id)}`, "All publications", "publications.html");
    } catch (e) { /* menus stay without submenus */ }
    markCurrent();
  }

  function markCurrent() {
    const nav = document.body.dataset.nav;
    $$(".nav > li > a").forEach(a => a.classList.toggle("is-current", !!nav && a.dataset.nav === nav));
    const id = params.get("p");
    $$(`[data-sub="${PAGE}"] a[data-id]`).forEach(a => a.classList.toggle("is-current", !!id && a.dataset.id === id));
  }

  const navEl = $(".site-nav");
  const toggle = $(".menu-toggle");
  function setMenu(open) {
    navEl.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("no-scroll", open);
    $("span", toggle).textContent = open ? "Close" : "Menu";
  }
  toggle.addEventListener("click", () => setMenu(!navEl.classList.contains("is-open")));
  $$(".sub-toggle").forEach(b => b.addEventListener("click", () => {
    const li = b.closest(".has-sub");
    const open = !li.classList.contains("is-open");
    li.classList.toggle("is-open", open);
    b.setAttribute("aria-expanded", String(open));
  }));
  window.matchMedia("(min-width: 1081px)").addEventListener("change", e => { if (e.matches) setMenu(false); });

  const SOCIAL = [["Facebook", "facebook"], ["Instagram", "instagram"], ["LinkedIn", "linkedin"], ["X", "x"], ["Behance", "behance"]];
  async function footer() {
    $$(".js-year").forEach(el => { el.textContent = new Date().getFullYear(); });
    const ul = $("[data-social]");
    if (!ul) return;
    try {
      const s = await load("site");
      ul.innerHTML = SOCIAL.filter(([, k]) => s[k]).map(([n, k]) => `<li><a href="${esc(s[k])}" target="_blank" rel="noopener">${n}</a></li>`).join("");
      if (s.vat) $$(".js-vat").forEach(el => { el.textContent = ` · VAT ${s.vat}`; });
    } catch (e) { /* no links */ }
  }

  /* ==========================================================================
     Shared blocks
     ========================================================================== */
  // square thumbnails that open the lightbox
  const thumbs = (images, group) => !images || !images.length ? "" : `
    <div class="thumbs" data-group="${group}">
      ${images.map((im, i) => `<button type="button" data-i="${i}" aria-label="${esc(im.caption || `Photograph ${i + 1}`)}"><img src="${esc(thumb(im))}" alt="${esc(im.caption || "")}" loading="lazy" decoding="async"></button>`).join("")}
    </div>`;
  const groups = {};
  function bindThumbs(root = app) {
    $$(".thumbs", root).forEach(t => {
      const list = groups[t.dataset.group] || [];
      $$("button", t).forEach(b => b.addEventListener("click", () => lightbox.open(list, +b.dataset.i)));
    });
    $$("[data-zoom]", root).forEach(el => el.addEventListener("click", () => {
      lightbox.open([{ src: el.dataset.zoom, caption: el.dataset.caption || "" }], 0);
    }));
  }
  const register = (group, images) => { groups[group] = images || []; return group; };

  const endorsement = o => o && o.endorsement ? `
    <blockquote class="endorsement">
      ${md(o.endorsement)}
      ${o.endorsement_author ? `<footer>— ${esc(o.endorsement_author)}</footer>` : ""}
    </blockquote>` : "";

  const pager = (list, i, href, label) => {
    if (!list || list.length < 2) return "";
    const prev = list[(i - 1 + list.length) % list.length];
    const next = list[(i + 1) % list.length];
    return `<nav class="pager" aria-label="${esc(label)}">
      <a class="prev" href="${href(prev)}"><span class="label">← Previous</span><b>${esc(prev.title)}</b></a>
      <a class="next" href="${href(next)}"><span class="label">Next →</span><b>${esc(next.title)}</b></a>
    </nav>`;
  };

  const photoCount = n => `${n} ${n === 1 ? "photograph" : "photographs"}`;

  // a project-like page: title, date, endorsement, text (+ side photo), thumbnails
  function projectPage(p, opts = {}) {
    const g = register("main", p.images);
    const n = (p.images || []).length;
    return `
      <div class="page">
        ${opts.crumbs ? `<p class="crumbs label">${opts.crumbs}</p>` : ""}
        <header class="page-head">
          <h1>${esc(p.title)}</h1>
          <p class="meta label">${esc(p.date || "")}${n ? ` · ${photoCount(n)} · <a href="#photographs">View photographs ↓</a>` : ""}</p>
        </header>
        ${endorsement(p)}
        <div class="project-text${p.side_image ? " has-side" : ""}">
          <div class="prose">${md(p.text)}</div>
          ${p.side_image ? `<figure class="side-image"><img src="${esc(p.side_image.src)}" ${dims(p.side_image)} alt="Sara Aliscioni" loading="lazy" decoding="async"></figure>` : ""}
        </div>
        ${n ? `<h2 class="section-title" id="photographs">Photographs</h2>${thumbs(p.images, g)}` : ""}
        ${opts.pager || ""}
      </div>`;
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
            ${slides.map((s, i) => `<div class="slide${i === 0 ? " is-active" : ""}">
              <img ${i < 2 ? `src="${esc(s.src)}"` : `data-src="${esc(s.src)}"`} ${s.mobile ? `${i < 2 ? "srcset" : "data-srcset"}="${esc(s.mobile)} 1080w, ${esc(s.src)} 1920w" sizes="100vw"` : ""} alt="" ${i === 0 ? 'fetchpriority="high"' : ""} decoding="async">
            </div>`).join("")}
          </div>
          <div class="home-bar">
            <span class="home-bar__cap">Sara Aliscioni — Photographer <span class="home-bar__legal"><a href="privacy.html">Privacy</a> · <a href="cookies.html">Cookies</a> · <a href="terms.html">Terms</a></span></span>
            <div class="home-bar__ctrl">
              <button type="button" data-step="-1" aria-label="Previous photograph">‹</button>
              <span class="home-bar__n"></span>
              <button type="button" data-step="1" aria-label="Next photograph">›</button>
            </div>
          </div>
        </section>`;
      const els = $$(".slide", app);
      const num = $(".home-bar__n", app);
      let i = 0, timer = null;
      const ms = Math.max(3, +h.interval_seconds || 5) * 1000;
      const ready = k => {
        const img = $("img", els[k]);
        if (!img || !img.dataset.src) return;
        if (img.dataset.srcset) { img.srcset = img.dataset.srcset; img.removeAttribute("data-srcset"); }
        img.src = img.dataset.src; img.removeAttribute("data-src");
      };
      const show = k => {
        els[i].classList.remove("is-active");
        i = (k + els.length) % els.length;
        ready(i); ready((i + 1) % els.length);
        els[i].classList.add("is-active");
        num.textContent = `${pad(i + 1)} / ${pad(els.length)}`;
      };
      const start = () => { clearInterval(timer); timer = setInterval(() => { if (!document.hidden) show(i + 1); }, ms); };
      $$("[data-step]", app).forEach(b => b.addEventListener("click", () => { show(i + +b.dataset.step); start(); }));
      show(0); start();
      stopSlideshow = () => clearInterval(timer);
    },

    /* ---------- Bio ---------- */
    async bio() {
      const b = await load("bio");
      const rows = (list, withPlace = true) => `<ul class="rows">${(list || []).map(r => `
        <li><span class="y">${esc(r.year)}</span><div><p class="t">${esc(r.title || r.text)}</p>${withPlace && r.place ? `<p class="p">${esc(r.place)}</p>` : ""}</div></li>`).join("")}</ul>`;
      app.innerHTML = `
        <div class="page">
          <nav class="subnav label" aria-label="Bio sections">
            <a href="#biography">Biography</a><a href="#statement">Artist statement</a><a href="#education">Education & activities</a><a href="#exhibitions">Exhibitions & awards</a>
          </nav>
          <div class="two-col">
            <figure class="two-col__media">
              ${b.portrait ? `<img src="${esc(b.portrait.src || b.portrait)}" ${dims(b.portrait)} alt="Sara Aliscioni" decoding="async">` : ""}
            </figure>
            <div>
              <header class="page-head" id="biography"><h1>Biography</h1></header>
              <div class="prose">${md(b.biography)}</div>
              <h2 class="section-title" id="statement">Artist statement</h2>
              <div class="prose statement">${md(b.statement)}</div>
              ${(b.facts || []).length ? `<dl class="facts">${b.facts.map(f => `<div><dt class="label">${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join("")}</dl>` : ""}
              <h2 class="section-title" id="education">Education</h2>
              ${rows(b.education, false)}
              ${(b.activities || []).length ? `<h2 class="section-title">Activities</h2>${rows(b.activities, false)}` : ""}
              ${(b.collaborations || []).length ? `<h2 class="section-title">Backstage & collaborations</h2>${rows(b.collaborations)}` : ""}
              ${b.languages ? `<h2 class="section-title">Languages</h2><p>${esc(b.languages)}</p>` : ""}
            </div>
          </div>
          <h2 class="page-title" id="exhibitions">Exhibitions & awards</h2>
          <div class="cv-grid">
            <div><h3 class="section-title">Solo exhibitions</h3>${rows(b.solo)}</div>
            <div><h3 class="section-title">Group exhibitions</h3>${rows(b.group)}</div>
            <div><h3 class="section-title">Awards & recognitions</h3>${rows(b.awards)}</div>
          </div>
        </div>`;
    },

    /* ---------- Projects (list, or ?p=id) ---------- */
    async projects() {
      const list = await load("projects");
      const id = params.get("p");
      if (id) {
        const i = list.findIndex(x => x.id === id);
        if (i < 0) return notFound("This project doesn't exist.", "projects.html", "All projects");
        const p = list[i];
        document.title = `${p.title} — Sara Aliscioni`;
        app.innerHTML = projectPage(p, {
          crumbs: `<a href="projects.html">Projects</a>`,
          pager: pager(list, i, x => `projects.html?p=${encodeURIComponent(x.id)}`, "Projects")
        });
        bindThumbs();
        return;
      }
      app.innerHTML = `
        <div class="page">
          <header class="page-head"><h1>Projects</h1></header>
          <div class="cards">
            ${list.map(p => `
              <a class="card" href="projects.html?p=${encodeURIComponent(p.id)}">
                <div class="card__img"><img src="${esc(thumb(p.cover) || thumb((p.images || [])[0]))}" alt="${esc(p.title)}" loading="lazy" decoding="async"></div>
                <h2 class="card__title">${esc(p.title)}</h2>
                <p class="card__meta label">${esc(p.date || "")}</p>
              </a>`).join("")}
          </div>
        </div>`;
    },

    /* ---------- Observations Photography ---------- */
    async observations() {
      const o = await load("observations");
      app.innerHTML = projectPage(o);
      bindThumbs();
    },

    /* ---------- Publications (list, or ?p=id) ---------- */
    async publications() {
      const list = await load("publications");
      const id = params.get("p");
      if (id) {
        const i = list.findIndex(x => x.id === id);
        if (i < 0) return notFound("This publication doesn't exist.", "publications.html", "All publications");
        const p = list[i];
        document.title = `${p.title} — Sara Aliscioni`;
        const imgs = p.images || [];
        app.innerHTML = `
          <div class="page">
            <p class="crumbs label"><a href="publications.html">Publications</a></p>
            <div class="pub-intro">
              ${p.cover ? `<figure class="pub-cover"><img src="${esc(p.cover.src)}" ${dims(p.cover)} alt="${esc(p.title)}" decoding="async"></figure>` : ""}
              <div>
                <header class="page-head">
                  <p class="label">${esc(p.year)}</p>
                  <h1>${esc(p.title)}</h1>
                  ${p.subtitle ? `<p class="subtitle">${esc(p.subtitle)}</p>` : ""}
                </header>
                ${endorsement(p)}
                <div class="prose">${md(p.text)}</div>
              </div>
            </div>
            ${imgs.length ? (p.layout === "scroll"
              ? `<div class="scroll-images">${imgs.map(im => `<img src="${esc(im.src)}" ${dims(im)} alt="${esc(im.caption || p.title)}" loading="lazy" decoding="async">`).join("")}</div>`
              : `<div class="pub-images">${imgs.map(im => `<img src="${esc(im.src)}" ${dims(im)} alt="${esc(im.caption || p.title)}" loading="lazy" decoding="async">`).join("")}</div>`) : ""}
            ${pager(list, i, x => `publications.html?p=${encodeURIComponent(x.id)}`, "Publications")}
          </div>`;
        bindThumbs();
        return;
      }
      app.innerHTML = `
        <div class="page">
          <header class="page-head"><h1>Publications</h1></header>
          <ul class="entry-list">
            ${list.map(p => `
              <li>
                <a href="publications.html?p=${encodeURIComponent(p.id)}">
                  <span class="entry-list__img">${p.cover ? `<img src="${esc(thumb(p.cover))}" alt="" loading="lazy" decoding="async">` : ""}</span>
                  <span class="entry-list__body">
                    <span class="label">${esc(p.year)}</span>
                    <b>${esc(p.title)}</b>
                    ${p.subtitle ? `<span class="entry-list__sub">${esc(p.subtitle)}</span>` : ""}
                    <span class="entry-list__text">${esc(excerpt(p.text, 180))}</span>
                  </span>
                </a>
              </li>`).join("")}
          </ul>
        </div>`;
    },

    /* ---------- News (list, or ?n=id) ---------- */
    async news() {
      const list = await load("news");
      const id = params.get("n");
      if (id) {
        const i = list.findIndex(x => x.id === id);
        if (i < 0) return notFound("This news item doesn't exist.", "news.html", "All news");
        const n = list[i];
        document.title = `${n.title} — Sara Aliscioni`;
        const hl = n.highlight;
        const secs = n.sections || [];
        if (hl) register("hl", hl.images);
        secs.forEach((s, k) => register("s" + k, s.images));
        app.innerHTML = `
          <article class="page">
            <p class="crumbs label"><a href="news.html">News</a></p>
            <div class="pub-intro">
              ${n.icon ? `<figure class="pub-cover"><button type="button" data-zoom="${esc(n.icon.src)}" data-caption="${esc(n.title)}" aria-label="Enlarge image"><img src="${esc(n.icon.src)}" ${dims(n.icon)} alt="${esc(n.title)}" decoding="async"></button></figure>` : ""}
              <div>
                <header class="page-head">
                  <p class="label">${esc(n.when || "")}</p>
                  <h1>${esc(n.title)}</h1>
                  ${n.details ? `<p class="subtitle">${esc(n.details)}</p>` : ""}
                </header>
                <div class="prose">${md(n.text)}</div>
              </div>
            </div>
            ${hl ? `<section class="highlight">
              <h2 class="section-title">${esc(hl.title || "Highlight")}</h2>
              ${hl.quote ? `<blockquote class="endorsement">${md(hl.quote)}${hl.author ? `<footer>— ${esc(hl.author)}</footer>` : ""}</blockquote>` : ""}
              ${(hl.images || []).length ? `<div class="highlight__images">${hl.images.map((im, k) => `<button type="button" data-hl="${k}"><img src="${esc(im.src)}" ${dims(im)} alt="${esc(im.caption || "")}" loading="lazy" decoding="async"></button>`).join("")}</div>` : ""}
            </section>` : ""}
            ${n.video && n.video.src ? `<section><h2 class="section-title">${esc(n.video.title || "Video")}</h2>
              <video class="video" src="${esc(n.video.src)}" ${n.video.poster ? `poster="${esc(n.video.poster)}"` : ""} controls preload="metadata" playsinline></video></section>` : ""}
            ${secs.map((s, k) => `<section class="news-section">
              <h2 class="section-title">${esc(s.title)}</h2>
              ${s.text || s.poster ? `<div class="news-section__intro${s.poster ? " has-poster" : ""}">
                ${s.poster ? `<button type="button" class="news-section__poster" data-zoom="${esc(s.poster.src)}" data-caption="${esc(s.title)}" aria-label="Enlarge poster"><img src="${esc(thumb(s.poster))}" alt="Poster — ${esc(s.title)}" loading="lazy" decoding="async"></button>` : ""}
                ${s.text ? `<div class="prose">${md(s.text)}</div>` : ""}
              </div>` : ""}
              ${thumbs(s.images, "s" + k)}
              ${(s.links || []).length ? `<ul class="links">${s.links.map(l => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a></li>`).join("")}</ul>` : ""}
            </section>`).join("")}
            ${(n.links || []).length ? `<section><h2 class="section-title">Press & links</h2><ul class="links">${n.links.map(l => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a></li>`).join("")}</ul></section>` : ""}
            ${pager(list, i, x => `news.html?n=${encodeURIComponent(x.id)}`, "News")}
          </article>`;
        bindThumbs();
        $$("[data-hl]", app).forEach(b => b.addEventListener("click", () => lightbox.open(hl.images, +b.dataset.hl)));
        return;
      }
      app.innerHTML = `
        <div class="page">
          <header class="page-head"><h1>News</h1></header>
          <ul class="entry-list entry-list--news">
            ${list.map(n => `
              <li>
                <a href="news.html?n=${encodeURIComponent(n.id)}">
                  <span class="entry-list__img">${n.icon ? `<img src="${esc(thumb(n.icon))}" alt="" loading="lazy" decoding="async">` : ""}</span>
                  <span class="entry-list__body">
                    <span class="label">${esc(n.when || "")}</span>
                    <b>${esc(n.title)}</b>
                    ${n.details ? `<span class="entry-list__sub">${esc(n.details)}</span>` : ""}
                    <span class="entry-list__text">${esc(excerpt(n.text))}</span>
                    <span class="more-link">Read more →</span>
                  </span>
                </a>
              </li>`).join("")}
          </ul>
        </div>`;
    },

    /* ---------- Contact ---------- */
    async contact() {
      const s = await load("site");
      // Default: the form opens the visitor's own email app with the message ready (no data passes through third parties).
      // form_endpoint can point to a form service with a GDPR data-processing agreement, if one is set up in the future.
      const endpoint = s.form_endpoint || "";
      const canSend = !!(endpoint || s.email);
      app.innerHTML = `
        <div class="page">
          <div class="two-col">
            <figure class="two-col__media">${s.contact_photo ? `<img src="${esc(s.contact_photo.src || s.contact_photo)}" ${dims(s.contact_photo)} alt="Sara Aliscioni" decoding="async">` : ""}</figure>
            <div>
              <header class="page-head"><h1>Contact</h1></header>
              ${s.contact_text ? `<div class="prose">${md(s.contact_text)}</div>` : ""}
              <form class="form" novalidate>
                <fieldset>
                  <legend class="form__legend">Name</legend>
                  <div class="form__row">
                    <label><span>First name <small>(required)</small></span><input name="first_name" autocomplete="given-name" required></label>
                    <label><span>Last name <small>(required)</small></span><input name="last_name" autocomplete="family-name" required></label>
                  </div>
                </fieldset>
                <label><span>Email <small>(required)</small></span><input type="email" name="email" autocomplete="email" required></label>
                <label><span>Subject <small>(required)</small></span><input name="subject" required></label>
                <label><span>Message <small>(required)</small></span><textarea name="message" rows="6" required></textarea></label>
                <input type="text" name="_honey" class="form__hp" tabindex="-1" autocomplete="off" aria-hidden="true">
                <label class="form__check"><input type="checkbox" name="privacy" required> <span>I have read the <a href="privacy.html" target="_blank">Privacy Policy</a> <small>(required)</small></span></label>
                <p class="form__note">${endpoint ? "Your message is sent to Sara and used only to reply to you." : "Pressing “Send” opens your email app with the message ready: nothing is sent until you send it yourself."}</p>
                <button type="submit" class="form__send"${canSend ? "" : " disabled"}>Send</button>
                <p class="form__status" role="status">${canSend ? "" : "The contact form will be active shortly. In the meantime you can reach Sara on the social networks below."}</p>
              </form>
            </div>
          </div>
          <h2 class="section-title">Contacts</h2>
          <div class="contact-links">
            ${s.email && s.show_email ? `<a href="mailto:${esc(s.email)}"><b>Email</b><span>${esc(s.email)}</span><i aria-hidden="true">↗</i></a>` : ""}
            ${SOCIAL.filter(([, k]) => s[k]).map(([name, k]) => `<a href="${esc(s[k])}" target="_blank" rel="noopener"><b>${name}</b><span>${esc(handle(k, s[k]))}</span><i aria-hidden="true">↗</i></a>`).join("")}
          </div>
        </div>`;
      const form = $(".form", app);
      const status = $(".form__status", app);
      form.addEventListener("submit", async e => {
        e.preventDefault();
        if (!canSend) return;
        if (!form.reportValidity()) return;
        const data = Object.fromEntries(new FormData(form));
        if (data._honey) return;
        if (!endpoint) {
          const name = `${data.first_name} ${data.last_name}`.trim();
          const body = `${data.message}\n\n—\n${name}\n${data.email}`;
          location.href = `mailto:${s.email}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;
          status.innerHTML = `Your email app should now open with the message ready to send. If nothing happens, write to <a href="mailto:${esc(s.email)}">${esc(s.email)}</a>.`;
          return;
        }
        const btn = $(".form__send", form);
        btn.disabled = true; status.textContent = "Sending…";
        try {
          const r = await fetch(endpoint, {
            method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              name: `${data.first_name} ${data.last_name}`.trim(), email: data.email, subject: data.subject, message: data.message,
              _subject: `Website — ${data.subject}`, _replyto: data.email
            })
          });
          const res = await r.json().catch(() => ({}));
          if (!r.ok || String(res.success) === "false") throw new Error(res.message || r.status);
          form.reset(); status.textContent = "Thank you — your message has been sent.";
        } catch (err) {
          status.textContent = /activat/i.test(String(err && err.message))
            ? "The contact form is being activated: please try again in a little while, or write on Instagram."
            : "Sorry, the message could not be sent. Please try again later or write on Instagram.";
        } finally { btn.disabled = false; }
      });
    },

    async legal() { /* static content */ },

    async notfound() { notFound("The page you are looking for doesn't exist or has moved.", "index.html", "Back to home"); }
  };

  function handle(k, url) {
    if (k === "linkedin") return "Sara Aliscioni";
    try {
      const p = new URL(url).pathname.replace(/\/+$/, "").split("/").pop();
      return (k === "instagram" || k === "x") ? "@" + p : p;
    } catch (e) { return url; }
  }

  function notFound(msg, href, label) {
    app.innerHTML = `<div class="page"><header class="page-head"><h1>Not found</h1></header><p class="empty">${esc(msg)}</p><a class="more-link" href="${href}">${esc(label)} →</a></div>`;
  }

  function render() {
    if (stopSlideshow) { stopSlideshow(); stopSlideshow = null; }
    const fn = PAGES[PAGE] || PAGES.notfound;
    fn().then(() => {
      if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
    }).catch(() => { app.innerHTML = `<div class="page"><p class="empty">Couldn't load the content. Please try again shortly.</p></div>`; });
  }

  /* ==========================================================================
     Lightbox
     ========================================================================== */
  const lightbox = (() => {
    const box = $(".lightbox");
    const img = $("img", box);
    const cap = $("figcaption", box);
    const prevB = $(".lightbox__prev", box), nextB = $(".lightbox__next", box);
    let list = [], i = 0;
    const show = () => {
      const it = list[i];
      img.src = it.src; img.alt = it.caption || "";
      cap.textContent = list.length > 1 ? `${pad(i + 1)} / ${pad(list.length)}${it.caption ? " — " + it.caption : ""}` : (it.caption || "");
      const nx = list[(i + 1) % list.length]; if (nx && list.length > 1) { const pre = new Image(); pre.src = nx.src; }
    };
    const open = (l, k) => {
      list = l; i = k; box.hidden = false; document.body.classList.add("no-scroll");
      prevB.hidden = nextB.hidden = list.length < 2;
      show(); $(".lightbox__close", box).focus({ preventScroll: true });
    };
    const close = () => { box.hidden = true; document.body.classList.remove("no-scroll"); img.removeAttribute("src"); };
    const go = d => { if (list.length < 2) return; i = (i + d + list.length) % list.length; show(); };
    $(".lightbox__close", box).addEventListener("click", close);
    prevB.addEventListener("click", () => go(-1));
    nextB.addEventListener("click", () => go(1));
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

  /* detail pages (?p= / ?n=) get their own canonical URL */
  (() => {
    const key = params.get("p") ? "p" : params.get("n") ? "n" : null;
    if (!key) return;
    $$('link[rel="canonical"], meta[property="og:url"]').forEach(el => {
      const attr = el.tagName === "LINK" ? "href" : "content";
      const u = new URL(el.getAttribute(attr));
      u.search = `?${key}=${encodeURIComponent(params.get(key))}`;
      el.setAttribute(attr, u.href);
    });
  })();

  /* ---------- boot ---------- */
  buildMenus();
  footer();
  render();
})();
