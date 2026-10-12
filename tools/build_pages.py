"""Genera le pagine HTML del sito con header e footer condivisi.

Uso:  python3 tools/build_pages.py
I contenuti NON stanno qui: vengono letti a runtime dai file in /content (modificabili dal CMS).
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PAGES = [
    # file, data-page, nav attivo, titolo, descrizione
    ("index.html", "home", "home", "Sara Aliscioni — Fotografa",
     "Sara Aliscioni, fotografa di Roma. Reportage e street photography in bianco e nero."),
    ("gallerie.html", "galleries", "", "Gallerie — Sara Aliscioni",
     "Le gallerie fotografiche di Sara Aliscioni: serie e impressioni di viaggio."),
    ("galleria.html", "gallery", "", "Galleria — Sara Aliscioni",
     "Galleria fotografica di Sara Aliscioni."),
    ("bio.html", "bio", "bio", "Biografia — Sara Aliscioni",
     "Biografia di Sara Aliscioni, fotografa di reportage e street photography."),
    ("mostre.html", "exhibitions", "bio", "Mostre e premi — Sara Aliscioni",
     "Mostre personali e collettive, premi e riconoscimenti di Sara Aliscioni."),
    ("pubblicazioni.html", "publications", "bio", "Pubblicazioni — Sara Aliscioni",
     "Pubblicazioni, backstage e collaborazioni di Sara Aliscioni."),
    ("news.html", "news", "news", "News — Sara Aliscioni",
     "Mostre in corso e attività di Sara Aliscioni."),
    ("blog.html", "blog", "blog", "Blog — Sara Aliscioni",
     "Il blog di Sara Aliscioni."),
    ("articolo.html", "post", "blog", "Blog — Sara Aliscioni",
     "Un articolo dal blog di Sara Aliscioni."),
    ("contatti.html", "contact", "contact", "Contatti — Sara Aliscioni",
     "Contatti di Sara Aliscioni, fotografa."),
    ("404.html", "notfound", "", "Pagina non trovata — Sara Aliscioni",
     "Pagina non trovata."),
]

HEADER = """  <header class="site-header">
    <a class="brand" href="index.html">
      <span class="brand__name">Sara Aliscioni</span>
      <span class="brand__role" data-t="role">Fotografa</span>
    </a>
    <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="site-nav"><span data-t="menu">Menu</span><i aria-hidden="true"></i></button>
    <nav class="site-nav" id="site-nav" aria-label="Menu principale">
      <ul class="nav">
        <li><a href="index.html" data-nav="home" data-t="nav.home">Home</a></li>
        <li class="has-sub">
          <a href="gallerie.html?cat=serie" data-nav="serie" data-t="nav.serie">Serie</a>
          <button type="button" class="sub-toggle" aria-expanded="false" aria-label="Sottomenu"></button>
          <ul class="sub" data-sub="serie"></ul>
        </li>
        <li class="has-sub">
          <a href="gallerie.html?cat=impressioni" data-nav="impressioni" data-t="nav.impressioni">Impressioni di viaggio</a>
          <button type="button" class="sub-toggle" aria-expanded="false" aria-label="Sottomenu"></button>
          <ul class="sub sub--cols" data-sub="impressioni"></ul>
        </li>
        <li class="has-sub">
          <a href="bio.html" data-nav="bio" data-t="nav.bio">Bio</a>
          <button type="button" class="sub-toggle" aria-expanded="false" aria-label="Sottomenu"></button>
          <ul class="sub">
            <li><a href="bio.html" data-t="nav.biography">Biografia</a></li>
            <li><a href="mostre.html" data-t="nav.exhibitions">Mostre e premi</a></li>
            <li><a href="pubblicazioni.html" data-t="nav.publications">Pubblicazioni</a></li>
          </ul>
        </li>
        <li><a href="news.html" data-nav="news" data-t="nav.news">News</a></li>
        <li><a href="blog.html" data-nav="blog" data-t="nav.blog">Blog</a></li>
        <li><a href="contatti.html" data-nav="contact" data-t="nav.contact">Contatti</a></li>
      </ul>
      <div class="lang" role="group" aria-label="Lingua / Language">
        <button type="button" data-lang="it" aria-pressed="true">IT</button><span aria-hidden="true">/</span><button type="button" data-lang="en" aria-pressed="false">EN</button>
      </div>
    </nav>
  </header>
"""

FOOTER = """  <footer class="site-footer">
    <p>© <span class="js-year">2026</span> Sara Aliscioni — <span data-t="rights">Tutte le fotografie sono protette da diritto d'autore.</span></p>
    <ul class="social" data-social></ul>
  </footer>
"""

TEMPLATE = """<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta name="theme-color" content="#000000">
  <!-- Anteprima: togliere questa riga quando il sito è approvato per l'indicizzazione -->
  <meta name="robots" content="noindex, nofollow">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:image" content="https://tommyzaffa.github.io/sara-aliscioni/images/og.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <!-- Sofia Pro è un font a licenza (Adobe Fonts): se Sara attiva un kit, incollare qui il <link> di Adobe Fonts. Fino ad allora si usa Mulish. -->
  <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Mulish:wght@300;400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body data-page="{page}" data-nav="{nav}">
{header}
  <main class="site-main" id="app">
    <noscript><p class="page">Per vedere il sito è necessario attivare JavaScript.</p></noscript>
  </main>
{footer}
  <div class="lightbox" hidden>
    <button type="button" class="lightbox__close" aria-label="Chiudi">✕</button>
    <button type="button" class="lightbox__nav lightbox__prev" aria-label="Precedente">‹</button>
    <figure class="lightbox__fig"><img alt=""><figcaption></figcaption></figure>
    <button type="button" class="lightbox__nav lightbox__next" aria-label="Successiva">›</button>
  </div>
  <script src="js/app.js"></script>
</body>
</html>
"""

for file, page, nav, title, desc in PAGES:
    footer = "" if page == "home" else FOOTER
    html = TEMPLATE.format(title=title, desc=desc, page=page, nav=nav, header=HEADER, footer=footer)
    (ROOT / file).write_text(html, encoding="utf-8")
    print("wrote", file)
