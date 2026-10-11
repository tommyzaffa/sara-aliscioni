/* ==========================================================================
   Sara Aliscioni — portfolio
   ========================================================================== */
(() => {
  "use strict";

  const PROJECTS = window.SA_PROJECTS || [];
  const C = window.SA_CONTENT;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const hasGSAP = typeof window.gsap !== "undefined";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const mqMobile = window.matchMedia("(max-width: 860px)");

  /* ---------- state ---------- */
  const byKey = Object.fromEntries(PROJECTS.map(p => [p.key, p]));
  const IMG = {};
  PROJECTS.forEach(p => p.images.forEach(([id, w, h]) => { if (!IMG[id]) IMG[id] = [w, h]; }));
  IMG["kill-the-covid"] = [1300, 1232];

  const urlLang = new URLSearchParams(location.search).get("lang");
  let stored = null;
  try { stored = localStorage.getItem("sa-lang"); } catch (e) { /* storage blocked */ }
  let lang = (urlLang === "it" || urlLang === "en") ? urlLang
    : (stored === "it" || stored === "en") ? stored
    : ((navigator.language || "it").toLowerCase().startsWith("it") ? "it" : "en");

  let lenis = null;
  const t = key => (C.i18n[lang] && C.i18n[lang][key]) || C.i18n.it[key] || "";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  /* bilingual inline text: <span data-it data-en>current</span> */
  const bi = (o, tag = "span", cls = "") => `<${tag}${cls ? ` class="${cls}"` : ""} data-it="${esc(o.it)}" data-en="${esc(o.en)}">${esc(o[lang])}</${tag}>`;
  const pad = n => String(n).padStart(2, "0");

  const src = (id, size = "l") => `images/${size}/${id}.webp`;
  const srcset = id => `images/s/${id}.webp 720w, images/l/${id}.webp ${Math.max(...(IMG[id] || [1600]))}w`;
  const imgTag = (id, alt, sizes, extra = "") => {
    const [w, h] = IMG[id] || [1600, 1200];
    return `<img src="${src(id, "s")}" srcset="${srcset(id)}" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}" loading="lazy" decoding="async" ${extra}>`;
  };

  /* ==========================================================================
     Static renders
     ========================================================================== */
  function renderHero() {
    const wrap = $(".hero__slides");
    wrap.innerHTML = C.hero.map((s, i) => {
      const [w, h] = IMG[s.id] || [1920, 1280];
      return `<figure class="hero__slide${i === 0 ? " is-active" : ""}" data-key="${s.key}">
        <img src="images/hero/${s.id}.webp" srcset="images/l/${s.id}.webp 1600w, images/hero/${s.id}.webp ${w}w" sizes="100vw"
             width="${w}" height="${h}" alt="${esc(s.cap[lang])}" ${i === 0 ? 'fetchpriority="high"' : 'loading="eager"'} decoding="async">
      </figure>`;
    }).join("");
    setHeroCaption(0, false);
  }

  function setHeroCaption(i, animate = true) {
    const s = C.hero[i];
    const cap = $(".hero__captext");
    const idx = $(".hero__index");
    const link = $("[data-hero-link]");
    link.setAttribute("href", `#/p/${s.key}`);
    const apply = () => { cap.textContent = s.cap[lang]; idx.textContent = `${pad(i + 1)} / ${pad(C.hero.length)}`; };
    if (animate && hasGSAP && !reduce) {
      gsap.to([cap, idx], { y: -8, opacity: 0, duration: .35, ease: "power2.in", onComplete: () => {
        apply(); gsap.fromTo([cap, idx], { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: "power3.out" });
      } });
    } else apply();
  }

  function renderMarquee() {
    const track = $(".marquee__track");
    const item = `<span class="marquee__item"><span class="mono"><i class="dot"></i>${esc(t("now.label"))}</span><span>${esc(t("now.text"))}</span><span class="sep">✦</span></span>`;
    track.innerHTML = `<span class="marquee__group">${item}${item}</span><span class="marquee__group" aria-hidden="true">${item}${item}</span>`;
  }

  function renderStatement() {
    const el = $(".statement__main");
    const words = t("statement.main").split(" ");
    el.innerHTML = words.map(w => `<span class="w">${esc(w)} </span>`).join("");
    el.setAttribute("aria-label", t("statement.main"));
  }

  const shortTitle = p => ({
    it: p.title.it.replace(/^Impressioni (dalla |dalle |dall'|dal |dai |da )/i, ""),
    en: p.title.en.replace(/^Impressions from (the )?/i, "")
  });

  function renderWorks() {
    const list = $(".works__list");
    const feat = PROJECTS.filter(p => p.featured);
    list.innerHTML = feat.map((p, i) => `
      <li class="work">
        <a class="work__link" href="#/p/${p.key}" data-project="${p.key}" data-cursor="open">
          <span class="work__num mono">${pad(i + 1)}</span>
          <span class="work__title">${bi(shortTitle(p))}</span>
          <span class="work__place mono">${bi({ it: t2("it", "cat." + p.cat), en: t2("en", "cat." + p.cat) }, "span", "work__cat")}${bi(p.place)}</span>
          <span class="work__year mono">${esc(p.year)}</span>
          <span class="work__arrow" aria-hidden="true">→</span>
          <span class="work__thumb">${imgTag(p.cover, p.title[lang], "(max-width: 860px) 92vw, 1px")}</span>
        </a>
      </li>`).join("");
  }

  function renderFrames() {
    const track = $(".frames__track");
    track.innerHTML = C.frames.map(([id, key], i) => {
      const p = byKey[key];
      const im = p.images.find(x => x[0] === id);
      const cap = (im && im[3]) || { it: p.title.it, en: p.title.en };
      const [w, h] = IMG[id] || [1600, 1200];
      return `<a class="frame" href="#/p/${key}" data-cursor="view">
        <div class="frame__media" style="aspect-ratio:${w}/${h}">${imgTag(id, cap[lang], `${Math.round((w / h) * 58)}vh`, 'style="width:100%;height:100%"')}</div>
        <p class="frame__cap mono"><b>Fr. ${pad(i + 1)}</b>${bi(cap)}</p>
      </a>`;
    }).join("");
  }

  function renderArchive() {
    const grid = $(".archive__grid");
    const list = [...PROJECTS].sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    grid.innerHTML = list.map(p => `
      <a class="card" href="#/p/${p.key}" data-cat="${p.cat}" data-cursor="open">
        <div class="card__media">
          ${imgTag(p.cover, p.title[lang], "(max-width: 620px) 92vw, (max-width: 1100px) 45vw, 24vw")}
          <span class="card__count mono">${p.images.length} ${bi({ it: "foto", en: p.images.length === 1 ? "photo" : "photos" })}</span>
        </div>
        <div class="card__body">
          <h3 class="card__title">${bi(p.title)}</h3>
          <span class="card__year mono">${esc(p.year)}</span>
          <span class="card__meta mono">${bi({ it: t2("it", "cat." + p.cat), en: t2("en", "cat." + p.cat) })}</span>
        </div>
      </a>`).join("");
    const counts = { all: PROJECTS.length, serie: PROJECTS.filter(p => p.cat === "serie").length, impressioni: PROJECTS.filter(p => p.cat === "impressioni").length };
    $$(".filters button").forEach(b => { $("sup", b).textContent = counts[b.dataset.filter]; });
  }
  function t2(l, key) { return C.i18n[l][key] || ""; }

  function renderBio() {
    const img = $(".bio__img");
    const id = C.about.id;
    const [w, h] = IMG[id] || [C.about.w, C.about.h];
    img.src = src(id, "s");
    img.srcset = srcset(id);
    img.sizes = "(max-width: 860px) 92vw, 40vw";
    img.width = w; img.height = h;
    $(".edu__list").innerHTML = C.education.map(e => `<li><span>${esc(e.y)}</span>${bi(e)}</li>`).join("");
  }

  function renderCV() {
    const groups = [["solo", "cv.solo"], ["group", "cv.group"], ["awards", "cv.awards"], ["pubs", "cv.pubs"], ["work", "cv.work", true]];
    $(".cv__groups").innerHTML = groups.map(([k, label, wide]) => `
      <div class="cv__group${wide ? " cv__group--wide" : ""}">
        <h3>${bi({ it: t2("it", label), en: t2("en", label) }, "b")}<span class="mono">${pad(C.cv[k].length)}</span></h3>
        <ul class="cv__list">
          ${C.cv[k].map(r => `<li class="cv__row"><span class="cv__y">${esc(r.y)}</span><div><p class="cv__t">${bi(r.t)}</p>${r.p.it ? `<p class="cv__p">${bi(r.p)}</p>` : ""}</div></li>`).join("")}
        </ul>
      </div>`).join("");
  }

  function renderContactTitle() {
    const el = $(".contact__title");
    el.innerHTML = t("contact.title").split("<br>").map(l => `<span class="line"><span>${l}</span></span>`).join("");
  }

  /* ---------- language ---------- */
  function applyLang(first = false) {
    document.documentElement.lang = lang;
    document.title = t("meta.title");
    $$("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$("[data-it]").forEach(el => { el.textContent = el.dataset[lang]; });
    $$(".lang button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    const burgerLabel = $(".nav__burger span");
    if (burgerLabel) burgerLabel.textContent = document.body.classList.contains("menu-open") ? t("nav.close") : t("nav.menu");
    if (!first) {
      renderMarquee(); marquee.measure();
      renderStatement(); statementFx();
      renderContactTitle();
      setHeroCaption(hero.index, false);
      if (viewer.current) viewer.render(viewer.current, true);
      if (hasGSAP) ScrollTrigger.refresh();
    }
  }

  $$(".lang button").forEach(b => b.addEventListener("click", () => {
    if (b.dataset.lang === lang) return;
    lang = b.dataset.lang;
    try { localStorage.setItem("sa-lang", lang); } catch (e) { /* ignore */ }
    applyLang();
  }));

  /* ==========================================================================
     Boot
     ========================================================================== */
  renderHero();
  renderMarquee();
  renderStatement();
  renderWorks();
  renderFrames();
  renderArchive();
  renderBio();
  renderCV();
  applyLang(true);
  renderContactTitle();
  $(".year").textContent = new Date().getFullYear();

  if (!hasGSAP) {
    // Libraries failed to load: show everything statically.
    document.body.classList.remove("is-loading");
    $(".loader").remove();
    $$(".statement__main .w").forEach(w => (w.style.opacity = 1));
    $$('a[href^="#/p/"]').forEach(a => {
      const p = byKey[a.getAttribute("href").slice(4)];
      if (p) { a.href = p.behance; a.target = "_blank"; a.rel = "noopener"; }
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });

  /* ---------- Lenis smooth scroll ---------- */
  if (!reduce && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const scrollTo = (target, opts = {}) => {
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: x => 1 - Math.pow(1 - x, 4), ...opts });
    else {
      const el = typeof target === "string" ? $(target) : target;
      if (el && el.scrollIntoView) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    }
  };
  $$("[data-scroll]").forEach(a => a.addEventListener("click", e => {
    const href = a.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    e.preventDefault();
    if (document.body.classList.contains("menu-open")) toggleMenu(false);
    scrollTo(href === "#top" ? 0 : href);
  }));

  /* ==========================================================================
     Loader + intro
     ========================================================================== */
  const loader = $(".loader");
  const loaderNum = $(".loader__num");
  const loaderBar = $(".loader__bar span");
  const prog = { v: 0 };
  let loaded = 0;
  const toLoad = $$(".hero__slide img").slice(0, 2);
  const total = toLoad.length + 1;
  const bump = () => { loaded++; gsap.to(prog, { v: loaded / total * 100, duration: .8, ease: "power2.out", onUpdate: drawProg }); };
  function drawProg() { loaderNum.textContent = pad(Math.round(prog.v)); loaderBar.style.transform = `scaleX(${prog.v / 100})`; }
  toLoad.forEach(img => {
    if (img.complete && img.naturalWidth) bump();
    else { img.addEventListener("load", bump, { once: true }); img.addEventListener("error", bump, { once: true }); }
  });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(bump);

  gsap.from(".loader__name span, .loader__name em", { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: .08, delay: .1 });
  gsap.from(".loader__sub", { opacity: 0, y: 10, duration: 1, delay: .5 });

  let introStarted = false;
  const startAt = performance.now();
  const waitDone = setInterval(() => {
    const elapsed = performance.now() - startAt;
    if ((loaded >= total && prog.v >= 99.5 && elapsed > 1500) || elapsed > 6000) { clearInterval(waitDone); intro(); }
  }, 60);

  function intro() {
    if (introStarted) return;
    introStarted = true;
    prog.v = 100; drawProg();
    const tl = gsap.timeline({ defaults: { ease: "expo.inOut" } });
    tl.to(".loader__center, .loader__count, .loader__bar", { opacity: 0, y: -20, duration: .6, ease: "power2.in" })
      .to(loader, { clipPath: "inset(0 0 100% 0)", duration: 1.2 }, "-=.1")
      .add(() => { document.body.classList.remove("is-loading"); hero.start(); }, "-=.9")
      .from(".hero__slide.is-active img", { scale: 1.35, duration: 2.2, ease: "expo.out" }, "-=1")
      .from(".hero__title .word", { yPercent: 110, duration: 1.4, stagger: .12, ease: "expo.out" }, "-=1.9")
      .from(".hero__top > *, .hero__bottom > *", { opacity: 0, y: 14, duration: 1, stagger: .06, ease: "power3.out" }, "-=1.1")
      .from(".nav", { opacity: 0, duration: 1.2, ease: "power2.out" }, "-=1.1")
      .add(() => {
        loader.remove();
        if (lenis) lenis.start();
        ScrollTrigger.refresh();
        handleRoute(true);
      });
  }

  /* ==========================================================================
     Hero slideshow — slow dissolves, long takes
     ========================================================================== */
  const hero = {
    index: 0, timer: null, DUR: 7,
    slides: $$(".hero__slide"),
    start() {
      if (reduce) return;
      this.kenBurns(this.slides[0]);
      this.progress();
      this.timer = gsap.delayedCall(this.DUR, () => this.next());
    },
    kenBurns(slide) {
      const img = $("img", slide);
      const dir = Math.random() > .5 ? 1 : -1;
      gsap.fromTo(img, { scale: 1.14, xPercent: 1.5 * dir }, { scale: 1.0, xPercent: 0, duration: this.DUR + 2, ease: "none" });
    },
    progress() { gsap.fromTo(".hero__progress span", { scaleX: 0 }, { scaleX: 1, duration: this.DUR, ease: "none" }); },
    go(i) {
      const prev = this.slides[this.index];
      const next = this.slides[i];
      this.index = i;
      gsap.set(next, { zIndex: 2, opacity: 0 });
      next.classList.add("is-active");
      this.kenBurns(next);
      gsap.to(next, { opacity: 1, duration: 2.2, ease: "power2.inOut", onComplete: () => {
        prev.classList.remove("is-active"); gsap.set(prev, { opacity: 0, zIndex: "" }); gsap.set(next, { zIndex: 1 });
      } });
      setHeroCaption(i);
      this.progress();
    },
    next() {
      this.go((this.index + 1) % this.slides.length);
      this.timer = gsap.delayedCall(this.DUR, () => this.next());
    }
  };

  // parallax on the hero while leaving
  if (!reduce) {
    gsap.to(".hero__slides", { yPercent: 22, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero__title", { yPercent: -28, opacity: .2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  }

  /* ==========================================================================
     Marquee — speed follows the scroll
     ========================================================================== */
  const marquee = {
    x: 0, w: 0, speed: 0.6, boost: 1,
    track: $(".marquee__track"),
    measure() { const g = $(".marquee__group", this.track); this.w = g ? g.offsetWidth : 0; },
    tick() {
      if (!this.w) return;
      const base = this.boost >= 0 ? 1 : -1;
      this.boost += (base - this.boost) * 0.05;
      this.x -= this.speed * this.boost;
      if (this.x <= -this.w) this.x += this.w;
      if (this.x > 0) this.x -= this.w;
      this.track.style.transform = `translate3d(${this.x}px,0,0)`;
    }
  };
  marquee.measure();
  window.addEventListener("resize", () => marquee.measure());
  if (!reduce) {
    gsap.ticker.add(() => marquee.tick());
    ScrollTrigger.create({ onUpdate(self) {
      const v = self.getVelocity();
      marquee.boost = self.direction * (1 + Math.min(Math.abs(v) / 220, 8));
    } });
  }

  /* ==========================================================================
     Statement — words light up while scrolling
     ========================================================================== */
  let stTween = null;
  function statementFx() {
    if (stTween) { stTween.scrollTrigger && stTween.scrollTrigger.kill(); stTween.kill(); }
    const words = $$(".statement__main .w");
    if (reduce) { gsap.set(words, { opacity: 1 }); return; }
    stTween = gsap.to(words, {
      opacity: 1, stagger: .08, ease: "none",
      scrollTrigger: { trigger: ".statement__main", start: "top 82%", end: "bottom 42%", scrub: .6 }
    });
  }
  statementFx();

  /* ==========================================================================
     Generic reveals
     ========================================================================== */
  if (!reduce) {
    gsap.utils.toArray(".reveal").forEach(el => {
      gsap.from(el, { y: 44, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
    gsap.utils.toArray(".label").forEach(el => {
      gsap.from(el, { opacity: 0, x: -14, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%", once: true } });
    });

    // works rows
    gsap.from(".work", { y: 50, opacity: 0, duration: 1.2, ease: "expo.out", stagger: .07, scrollTrigger: { trigger: ".works__list", start: "top 85%", once: true } });

    // image curtain reveals
    const curtain = (els) => els.forEach(el => {
      const img = $("img", el);
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 90%", once: true } });
      tl.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" });
      if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: "expo.out", clearProps: "transform" }, 0.1);
    });
    curtain($$(".news__img, .bio__figure"));
    ScrollTrigger.batch(".card", {
      start: "top 92%", once: true,
      onEnter: batch => {
        gsap.fromTo(batch.map(c => $(".card__media", c)), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut", stagger: .1 });
        gsap.fromTo(batch.map(c => $(".card__body", c)), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: .1, delay: .35 });
      }
    });
    gsap.set(".card__media", { clipPath: "inset(100% 0% 0% 0%)" });

    // bio image slow drift
    gsap.fromTo(".bio__img", { yPercent: -4 }, { yPercent: 4, ease: "none", scrollTrigger: { trigger: ".bio", start: "top bottom", end: "bottom top", scrub: true } });

    // cv rows
    gsap.utils.toArray(".cv__group").forEach(g => {
      gsap.from($$(".cv__row, h3", g), { y: 24, opacity: 0, duration: 1, ease: "expo.out", stagger: .04, scrollTrigger: { trigger: g, start: "top 85%", once: true } });
    });

    // contact
    ScrollTrigger.create({ trigger: ".contact__title", start: "top 85%", once: true, onEnter: () => {
      gsap.from(".contact__title .line > span", { yPercent: 110, duration: 1.4, ease: "expo.out", stagger: .12 });
    } });
    gsap.from(".contact__links li", { y: 30, opacity: 0, duration: 1.1, ease: "expo.out", stagger: .08, scrollTrigger: { trigger: ".contact__links", start: "top 88%", once: true } });

    // footer name slides in
    gsap.fromTo(".footer__big", { xPercent: -8 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: true } });
  }

  /* ==========================================================================
     Frames — horizontal strip pinned on desktop
     ========================================================================== */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 861px) and (prefers-reduced-motion: no-preference)", () => {
    const track = $(".frames__track");
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const scrollTween = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        trigger: ".frames", start: "top top", end: () => "+=" + dist(), pin: true, scrub: .9, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: self => gsap.set(".frames__bar span", { scaleX: self.progress })
      }
    });
    $$(".frame").forEach(f => {
      const img = $("img", f);
      gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: "none", scrollTrigger: { trigger: f, containerAnimation: scrollTween, start: "left right", end: "right left", scrub: true } });
    });
    gsap.from(".frames__head .section__title, .frames__hint", { y: 30, opacity: 0, duration: 1.2, ease: "expo.out", stagger: .08, scrollTrigger: { trigger: ".frames", start: "top 75%", once: true } });
  });

  /* ==========================================================================
     Nav: hide on scroll down, current section
     ========================================================================== */
  const nav = $(".nav");
  let lastY = 0;
  const onScrollNav = y => {
    if (document.body.classList.contains("menu-open")) return;
    const down = y > lastY;
    nav.classList.toggle("is-hidden", down && y > window.innerHeight * .9);
    lastY = y;
  };
  if (lenis) lenis.on("scroll", e => onScrollNav(e.scroll));
  else window.addEventListener("scroll", () => onScrollNav(window.scrollY), { passive: true });

  ["lavori", "archivio", "bio", "mostre", "contatti"].forEach(id => {
    const link = $(`.nav__links a[href="#${id}"]`);
    ScrollTrigger.create({ trigger: "#" + id, start: "top 50%", end: "bottom 50%", onToggle: self => link && link.classList.toggle("is-current", self.isActive) });
  });

  /* ---------- Mobile menu ---------- */
  const burger = $(".nav__burger");
  const menu = $(".menu");
  function toggleMenu(open) {
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    $("span", burger).textContent = open ? t("nav.close") : t("nav.menu");
    if (open) {
      nav.classList.remove("is-hidden");
      lenis && lenis.stop();
      gsap.set(menu, { visibility: "visible" });
      gsap.to(menu, { clipPath: "inset(0 0 0% 0)", duration: .9, ease: "expo.inOut" });
      gsap.fromTo(".menu__links a", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: .06, delay: .35 });
    } else {
      gsap.to(menu, { clipPath: "inset(0 0 100% 0)", duration: .8, ease: "expo.inOut", onComplete: () => gsap.set(menu, { visibility: "hidden" }) });
      lenis && lenis.start();
    }
  }
  burger.addEventListener("click", () => toggleMenu(!document.body.classList.contains("menu-open")));

  /* ==========================================================================
     Cursor + floating preview
     ========================================================================== */
  const cursor = $(".cursor");
  const cursorLabel = $(".cursor__label");
  const preview = $(".preview");
  const previewInner = $(".preview__inner");
  if (finePointer && !reduce) {
    document.body.classList.add("has-cursor");
    const cx = gsap.quickTo(cursor, "x", { duration: .25, ease: "power3" });
    const cy = gsap.quickTo(cursor, "y", { duration: .25, ease: "power3" });
    const px = gsap.quickTo(preview, "x", { duration: .7, ease: "power3" });
    const py = gsap.quickTo(preview, "y", { duration: .7, ease: "power3" });
    let lastX = 0;
    window.addEventListener("pointermove", e => {
      cx(e.clientX); cy(e.clientY);
      cursor.classList.add("is-visible");
      const pw = preview.offsetWidth, ph = preview.offsetHeight;
      px(Math.min(e.clientX + 32, window.innerWidth - pw - 16));
      py(Math.min(Math.max(e.clientY - ph / 2, 16), window.innerHeight - ph - 16));
      const vx = e.clientX - lastX; lastX = e.clientX;
      gsap.to(previewInner, { rotate: gsap.utils.clamp(-8, 8, vx * .4), duration: .6, ease: "power3" });
    }, { passive: true });
    document.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));

    const labelFor = el => {
      const c = el.closest("[data-cursor]");
      return c ? t("cursor." + c.dataset.cursor) : "";
    };
    document.addEventListener("pointerover", e => {
      const l = labelFor(e.target);
      cursor.classList.toggle("is-active", !!l);
      cursorLabel.textContent = l;
    });

    // works list hover preview
    const list = $(".works__list");
    let cycle = null;
    const showPreview = key => {
      const p = byKey[key];
      if (!p) return;
      const ids = [p.cover, ...p.images.map(i => i[0]).filter(id => id !== p.cover)].slice(0, 5);
      let k = 0;
      const put = id => {
        const img = new Image();
        img.src = src(id, "s"); img.alt = "";
        previewInner.appendChild(img);
        gsap.fromTo(img, { clipPath: "inset(100% 0 0 0)", scale: 1.15 }, { clipPath: "inset(0% 0 0 0)", scale: 1, duration: .8, ease: "expo.out", onComplete: () => {
          while (previewInner.children.length > 1) previewInner.firstChild.remove();
        } });
      };
      put(ids[0]);
      clearInterval(cycle);
      cycle = setInterval(() => { k = (k + 1) % ids.length; put(ids[k]); }, 900);
    };
    list.addEventListener("pointerenter", () => {
      list.classList.add("is-hovering");
      gsap.to(preview, { autoAlpha: 1, duration: .4 });
      gsap.fromTo(previewInner, { scale: .85 }, { scale: 1, duration: .6, ease: "expo.out" });
    });
    list.addEventListener("pointerleave", () => {
      list.classList.remove("is-hovering");
      clearInterval(cycle);
      gsap.to(preview, { autoAlpha: 0, duration: .35 });
    });
    $$(".work__link", list).forEach(a => a.addEventListener("pointerenter", () => showPreview(a.dataset.project)));
  }

  /* ==========================================================================
     Archive filters
     ========================================================================== */
  $$(".filters button").forEach(btn => btn.addEventListener("click", () => {
    $$(".filters button").forEach(b => b.classList.toggle("is-active", b === btn));
    const f = btn.dataset.filter;
    const cards = $$(".card");
    gsap.to(cards, { opacity: 0, y: 16, duration: .3, ease: "power2.in", stagger: .01, onComplete: () => {
      cards.forEach(c => c.classList.toggle("is-hidden", f !== "all" && c.dataset.cat !== f));
      const vis = cards.filter(c => !c.classList.contains("is-hidden"));
      gsap.set(vis.map(c => $(".card__media", c)), { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.fromTo(vis, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .8, ease: "expo.out", stagger: .03 });
      ScrollTrigger.refresh();
    } });
  }));

  /* ==========================================================================
     Project viewer
     ========================================================================== */
  const viewer = initViewerBasics();

  function initViewerBasics() {
    const el = $("#viewer");
    const scroller = $(".viewer__scroller", el);
    const track = $(".viewer__track", el);
    const bar = $(".viewer__progress span", el);
    const cur = $(".viewer__cur", el);
    const tot = $(".viewer__tot", el);
    const crumb = $(".viewer__crumb", el);
    const G = hasGSAP ? gsap : null;
    const state = { current: null, target: 0, pos: 0, raf: 0, pushed: false, items: [] };
    const horizontal = () => !mqMobile.matches;

    function render(key, keepScroll = false) {
      const p = byKey[key];
      if (!p) return;
      state.current = key;
      const order = PROJECTS.filter(x => x.featured).concat(PROJECTS.filter(x => !x.featured));
      const nextP = order[(order.indexOf(p) + 1) % order.length];
      track.innerHTML = `
        <div class="v-intro">
          <p class="v-intro__cat mono"><span>${esc(t("cat." + p.cat))}</span><span>${esc(p.year)}</span></p>
          <h2 class="v-intro__title" id="viewer-title">${esc(p.title[lang])}</h2>
          <p class="v-intro__desc">${esc(p.desc[lang])}</p>
          <div class="v-intro__meta mono">
            ${p.place[lang] ? `<span>${esc(p.place[lang])}</span>` : ""}
            <span>${p.images.length} ${esc(t("viewer.photos"))}</span>
            <a href="${p.behance}" target="_blank" rel="noopener">${esc(t("viewer.behance"))} ↗</a>
          </div>
          <p class="v-intro__hint mono">${esc(t("viewer.drag"))} →</p>
        </div>
        ${p.images.map(([id, w, h, cap], i) => `
          <figure class="v-item" data-i="${i}">
            <div class="v-item__media" style="aspect-ratio:${w}/${h}" data-cursor="view">
              <img src="${src(id, "s")}" srcset="${srcset(id)}" sizes="(max-width: 860px) 92vw, calc(${(w / h).toFixed(3)} * (100vh - 260px))"
                   width="${w}" height="${h}" alt="${esc(cap ? cap[lang] : p.title[lang])}" ${i < 3 ? "" : 'loading="lazy"'} decoding="async" draggable="false">
            </div>
            <figcaption class="v-item__cap mono"><b>${pad(i + 1)}</b><span>${esc(cap ? cap[lang] : p.title[lang])}</span></figcaption>
          </figure>`).join("")}
        <a class="v-next" href="#/p/${nextP.key}" data-cursor="open">
          <span class="v-next__label mono">${esc(t("viewer.next"))} →</span>
          <span class="v-next__media"><img src="${src(nextP.cover, "s")}" alt="" loading="lazy"></span>
          <span class="v-next__title">${esc(nextP.title[lang])}</span>
        </a>`;
      crumb.textContent = p.title[lang];
      tot.textContent = pad(p.images.length);
      state.items = $$(".v-item", track);
      const nx = $(".v-next", track);
      nx.addEventListener("click", e => {
        e.preventDefault();
        if (state.dragMoved) return;
        history.replaceState(null, "", "#/p/" + nextP.key);
        open(nextP.key);
      });
      $$(".v-item__media", track).forEach(m => m.addEventListener("click", () => {
        if (state.dragMoved) return;
        lightbox.open(p, +m.parentElement.dataset.i);
      }));
      if (!keepScroll) { scroller.scrollLeft = 0; scroller.scrollTop = 0; state.target = state.pos = 0; }
      update();
    }

    function update() {
      const hz = horizontal();
      const max = hz ? scroller.scrollWidth - scroller.clientWidth : scroller.scrollHeight - scroller.clientHeight;
      const v = hz ? scroller.scrollLeft : scroller.scrollTop;
      bar.style.transform = `scaleX(${max > 0 ? v / max : 0})`;
      const mid = hz ? window.innerWidth / 2 : window.innerHeight / 2;
      let best = 0, bd = Infinity;
      state.items.forEach((it, i) => {
        const r = it.getBoundingClientRect();
        const c = hz ? r.left + r.width / 2 : r.top + r.height / 2;
        const d = Math.abs(c - mid);
        if (d < bd) { bd = d; best = i; }
      });
      cur.textContent = pad(best + 1);
    }
    scroller.addEventListener("scroll", update, { passive: true });

    // wheel → smooth horizontal
    function loop() {
      state.pos += (state.target - state.pos) * 0.12;
      if (Math.abs(state.target - state.pos) < 0.5) state.pos = state.target;
      scroller.scrollLeft = state.pos;
      if (state.pos !== state.target) state.raf = requestAnimationFrame(loop);
      else state.raf = 0;
    }
    const kick = () => { if (!state.raf) state.raf = requestAnimationFrame(loop); };
    const clampT = v => Math.max(0, Math.min(v, scroller.scrollWidth - scroller.clientWidth));
    scroller.addEventListener("wheel", e => {
      if (!horizontal()) return;
      e.preventDefault();
      if (!state.raf) state.pos = scroller.scrollLeft;
      const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      state.target = clampT((state.raf ? state.target : scroller.scrollLeft) + d * (e.deltaMode === 1 ? 32 : 1.1));
      kick();
    }, { passive: false });

    // drag to scroll (desktop)
    let dragX = 0, dragStart = 0, down = false;
    scroller.addEventListener("pointerdown", e => {
      if (!horizontal() || e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; state.dragMoved = false; dragX = e.clientX; dragStart = scroller.scrollLeft;
    });
    window.addEventListener("pointermove", e => {
      if (!down) return;
      const dx = e.clientX - dragX;
      if (Math.abs(dx) > 5) { state.dragMoved = true; scroller.classList.add("is-dragging"); }
      if (state.dragMoved) { state.target = clampT(dragStart - dx * 1.4); kick(); }
    });
    window.addEventListener("pointerup", () => {
      if (!down) return;
      down = false; scroller.classList.remove("is-dragging");
      setTimeout(() => { state.dragMoved = false; }, 30);
    });
    track.addEventListener("click", e => { if (state.dragMoved) { e.preventDefault(); e.stopPropagation(); } }, true);

    function step(dir) {
      const hz = horizontal();
      const items = state.items;
      const curI = parseInt(cur.textContent, 10) - 1;
      const n = Math.max(0, Math.min(items.length - 1, curI + dir));
      const it = items[n];
      if (!it) return;
      if (hz) { state.pos = scroller.scrollLeft; state.target = clampT(it.offsetLeft - (scroller.clientWidth - it.offsetWidth) / 2); kick(); }
      else it.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function open(key, fromClick) {
      const wasOpen = el.classList.contains("is-open");
      render(key);
      if (wasOpen) {
        if (G && !reduce) G.from(".v-intro > *, .v-item", { opacity: 0, x: 60, duration: 1, ease: "expo.out", stagger: .05 });
        return;
      }
      state.pushed = !!fromClick;
      el.classList.add("is-open");
      el.setAttribute("aria-hidden", "false");
      document.documentElement.style.overflow = "hidden";
      lenis && lenis.stop();
      if (G && !reduce) {
        G.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "expo.inOut" });
        G.from(".v-intro > *", { y: 40, opacity: 0, duration: 1.2, ease: "expo.out", stagger: .07, delay: .55 });
        G.from(".v-item", { x: horizontal() ? 120 : 0, y: horizontal() ? 0 : 40, opacity: 0, duration: 1.4, ease: "expo.out", stagger: .08, delay: .6 });
      } else el.style.clipPath = "inset(0)";
      setTimeout(() => $(".viewer__back", el).focus({ preventScroll: true }), 50);
    }

    function close() {
      if (!el.classList.contains("is-open")) return;
      const done = () => {
        el.classList.remove("is-open");
        el.setAttribute("aria-hidden", "true");
        track.innerHTML = "";
        state.current = null;
      };
      document.documentElement.style.overflow = "";
      lenis && lenis.start();
      if (G && !reduce) G.to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: .9, ease: "expo.inOut", onComplete: done });
      else done();
    }

    $(".viewer__back", el).addEventListener("click", () => {
      if (state.pushed && location.hash.startsWith("#/p/")) history.back();
      else { history.replaceState(null, "", location.pathname + location.search); close(); }
    });

    document.addEventListener("keydown", e => {
      if (!el.classList.contains("is-open") || $(".lightbox").classList.contains("is-open")) return;
      if (e.key === "Escape") $(".viewer__back", el).click();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); step(1); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); step(-1); }
    });
    window.addEventListener("resize", () => { if (state.current) update(); });

    return { open, close, render, get current() { return state.current; } };
  }

  /* ---------- routing ---------- */
  let navClick = false;
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#/p/"]');
    if (a) navClick = true;
  }, true);
  function handleRoute(initial) {
    const m = location.hash.match(/^#\/p\/([\w-]+)/);
    if (m && byKey[m[1]]) viewer.open(m[1], !initial && navClick);
    else viewer.close();
    navClick = false;
  }
  window.addEventListener("hashchange", () => { if (!introStarted) return; handleRoute(false); });

  /* ==========================================================================
     Lightbox
     ========================================================================== */
  const lightbox = (() => {
    const box = $(".lightbox");
    const img = $("img", box);
    const cap = $("figcaption", box);
    let proj = null, i = 0;
    function show() {
      const [id, , , c] = proj.images[i];
      img.src = src(id, "l");
      img.alt = c ? c[lang] : proj.title[lang];
      cap.textContent = `${pad(i + 1)} / ${pad(proj.images.length)} — ${c ? c[lang] : proj.title[lang]}`;
      gsap.fromTo(img, { opacity: 0, scale: .98 }, { opacity: 1, scale: 1, duration: .6, ease: "power3.out" });
    }
    function open(p, idx) { proj = p; i = idx; box.classList.add("is-open"); box.setAttribute("aria-hidden", "false"); show(); }
    function close() { box.classList.remove("is-open"); box.setAttribute("aria-hidden", "true"); }
    const go = d => { i = (i + d + proj.images.length) % proj.images.length; show(); };
    $(".lightbox__close", box).addEventListener("click", close);
    $(".lightbox__prev", box).addEventListener("click", () => go(-1));
    $(".lightbox__next", box).addEventListener("click", () => go(1));
    box.addEventListener("click", e => { if (e.target === box || e.target.classList.contains("lightbox__fig")) close(); });
    document.addEventListener("keydown", e => {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    });
    let sx = 0;
    box.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); });
    return { open, close };
  })();

  /* ==========================================================================
     Footer clock — Rome time
     ========================================================================== */
  const clock = $(".clock");
  const fmt = new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });
  const tickClock = () => { clock.textContent = fmt.format(new Date()); };
  tickClock(); setInterval(tickClock, 20000);

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
