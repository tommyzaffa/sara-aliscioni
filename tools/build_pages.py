"""Generate the site HTML pages with a shared header and footer.

Uso:  python3 tools/build_pages.py
I contenuti NON stanno qui: vengono letti a runtime dai file in /content (modificabili dal CMS).
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE_URL = "https://www.saraaliscioni.com/"

PAGES = [
    # file, data-page, nav attivo, titolo, descrizione
    ("index.html", "home", "home", "Sara Aliscioni — Photographer",
     "Sara Aliscioni, photographer based in Rome. Reportage and street photography in a strict black-and-white language."),
    ("bio.html", "bio", "bio", "Bio — Sara Aliscioni",
     "Biography, artist statement, education, exhibitions and awards of Sara Aliscioni."),
    ("projects.html", "projects", "projects", "Projects — Sara Aliscioni",
     "Photographic projects by Sara Aliscioni."),
    ("observations.html", "observations", "observations", "Observations Photography — Sara Aliscioni",
     "Observations Photography, an open-ended body of work by Sara Aliscioni."),
    ("publications.html", "publications", "publications", "Publications — Sara Aliscioni",
     "Books, magazines and publications featuring the work of Sara Aliscioni."),
    ("news.html", "news", "news", "News — Sara Aliscioni",
     "Exhibitions, screenings, presentations and news about Sara Aliscioni."),
    ("contact.html", "contact", "contact", "Contact — Sara Aliscioni",
     "Contact Sara Aliscioni."),
    ("privacy.html", "legal", "", "Privacy Policy — Sara Aliscioni", "Privacy Policy of the Sara Aliscioni website."),
    ("cookies.html", "legal", "", "Cookie Policy — Sara Aliscioni", "Cookie Policy of the Sara Aliscioni website."),
    ("terms.html", "legal", "", "Terms of Use — Sara Aliscioni", "Terms of use and copyright of the Sara Aliscioni website."),
    ("404.html", "notfound", "", "Page not found — Sara Aliscioni",
     "Page not found."),
]

HEADER = """  <header class="site-header">
    <a class="brand" href="index.html">
      <span class="brand__name">Sara Aliscioni</span>
      <span class="brand__role">Photographer</span>
    </a>
    <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="site-nav"><span>Menu</span><i aria-hidden="true"></i></button>
    <nav class="site-nav" id="site-nav" aria-label="Main menu">
      <ul class="nav">
        <li><a href="index.html" data-nav="home">Home</a></li>
        <li><a href="bio.html" data-nav="bio">Bio</a></li>
        <li class="has-sub">
          <a href="projects.html" data-nav="projects">Projects</a>
          <button type="button" class="sub-toggle" aria-expanded="false" aria-label="Open submenu"></button>
          <ul class="sub" data-sub="projects"></ul>
        </li>
        <li><a href="observations.html" data-nav="observations">Observations Photography</a></li>
        <li class="has-sub">
          <a href="publications.html" data-nav="publications">Publications</a>
          <button type="button" class="sub-toggle" aria-expanded="false" aria-label="Open submenu"></button>
          <ul class="sub" data-sub="publications"></ul>
        </li>
        <li><a href="news.html" data-nav="news">News</a></li>
        <li><a href="contact.html" data-nav="contact">Contact</a></li>
      </ul>
    </nav>
  </header>
"""

FOOTER = """  <footer class="site-footer">
    <p>© <span class="js-year">2026</span> Sara Aliscioni<span class="js-vat"></span> — All photographs are protected by copyright.</p>
    <p class="legal-links"><a href="privacy.html">Privacy Policy</a> · <a href="cookies.html">Cookie Policy</a> · <a href="terms.html">Terms of Use</a></p>
    <ul class="social" data-social></ul>
  </footer>
"""

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta name="theme-color" content="#000000">
  <link rel="canonical" href="{canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="https://www.saraaliscioni.com/images/og.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <!-- Fonts are self-hosted (no requests to Google). Sofia Pro is licensed (Adobe Fonts): until a kit is added, Mulish is used. -->
  <link rel="preload" href="fonts/mulish.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="fonts/archivo-black.woff2" as="font" type="font/woff2" crossorigin>{extra_head}
  <link rel="stylesheet" href="css/style.css">
</head>
<body data-page="{page}" data-nav="{nav}">
{header}
  <main class="site-main" id="app">
{main}
  </main>
{footer}
  <div class="lightbox" hidden>
    <button type="button" class="lightbox__close" aria-label="Close">✕</button>
    <button type="button" class="lightbox__nav lightbox__prev" aria-label="Previous">‹</button>
    <figure class="lightbox__fig"><img alt=""><figcaption></figcaption></figure>
    <button type="button" class="lightbox__nav lightbox__next" aria-label="Next">›</button>
  </div>
  <script src="js/app.js"></script>
</body>
</html>
"""

for file, page, nav, title, desc in PAGES:
    footer = "" if page == "home" else FOOTER
    main = '    <noscript><p class="page">Please enable JavaScript to view this site.</p></noscript>'
    if page == "legal":
        main = (ROOT / "tools/legal" / file).read_text(encoding="utf-8")
    extra = '\n  <link rel="preload" href="content/home.json" as="fetch" crossorigin>' if page == "home" else ""
    canonical = SITE_URL + ("" if file == "index.html" else file)
    html = TEMPLATE.format(title=title, desc=desc, page=page, nav=nav, header=HEADER, footer=footer, main=main, extra_head=extra, canonical=canonical)
    (ROOT / file).write_text(html, encoding="utf-8")
    print("wrote", file)

# ---- sitemap.xml and robots.txt (detail pages are read from the content files)
urls = [SITE_URL + ("" if f == "index.html" else f) for f, page, *_ in PAGES if page not in ("notfound",)]
for name, prefix, key in [("projects", "projects.html?p=", "id"), ("publications", "publications.html?p=", "id"), ("news", "news.html?n=", "id")]:
    for item in json.loads((ROOT / "content" / f"{name}.json").read_text(encoding="utf-8")):
        urls.append(SITE_URL + prefix + item[key])
xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
xml += [f"  <url><loc>{u.replace('&', '&amp;')}</loc></url>" for u in urls]
xml += ["</urlset>", ""]
(ROOT / "sitemap.xml").write_text("\n".join(xml), encoding="utf-8")
(ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}sitemap.xml\n", encoding="utf-8")
print("wrote sitemap.xml with", len(urls), "urls, robots.txt")
