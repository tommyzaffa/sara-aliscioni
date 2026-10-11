# Sara Aliscioni — portfolio

Sito vetrina bilingue (IT/EN) per la fotografa romana Sara Aliscioni: reportage e street photography in bianco e nero.

Statico, nessun build: HTML + CSS + JS. Librerie da CDN: GSAP 3.12.5 (+ ScrollTrigger) e Lenis 1.1.13.

## Struttura

- `index.html` — pagina unica (hero, dichiarazione, lavori scelti, fotogrammi, archivio, news, bio, curriculum, contatti)
- `css/style.css` — stile
- `js/content.js` — testi IT/EN, curriculum, selezioni (hero, fotogrammi)
- `js/projects.js` — 40 progetti con foto e didascalie (generato dal portfolio Behance)
- `js/main.js` — animazioni, visualizzatore progetti (`#/p/<progetto>`), lightbox, cambio lingua
- `images/s` (720px), `images/l` (1600px), `images/hero` (1920px) — WebP

## Modifiche frequenti

- **Testi / traduzioni:** `js/content.js` → `i18n.it` e `i18n.en`
- **Lavori in evidenza:** campo `featured` in `js/projects.js`
- **Indicizzazione:** togliere `<meta name="robots" content="noindex, nofollow">` da `index.html` quando il sito è approvato

Anteprima locale: `python3 -m http.server` nella cartella, poi http://localhost:8000

Tutte le fotografie © Sara Aliscioni.
