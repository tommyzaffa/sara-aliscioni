# Sara Aliscioni — sito

Sito statico a sezioni, in inglese, in bianco e nero. Nessun build, nessuna libreria esterna. Struttura e contenuti seguono le linee guida di Sara (novembre 2026).

- **Menu:** Home · Bio · Projects · Observations Photography · Publications · News · Contact
- **Pagine:** `index.html` (12 foto a rotazione), `bio.html` (biography, statement, education, activities, exhibitions & awards), `projects.html` (elenco) e `projects.html?p=<id>`, `observations.html`, `publications.html` e `publications.html?p=<id>`, `news.html` e `news.html?n=<id>`, `contact.html` (modulo + contatti)
- **Contenuti:** tutti in `content/*.json` (home, bio, projects, observations, publications, news, site). Le pagine li leggono all'apertura.
- **Codice:** `css/style.css`, `js/app.js`. Header e footer sono generati da `tools/build_pages.py` (`python3 tools/build_pages.py` dopo aver cambiato il template).
- **Immagini:** `images/<sezione>/<progetto>/NNN.webp` (lato lungo 1600 px, max ~330 KB) + `NNN-t.webp` (miniatura quadrata 300 px); home in due versioni (1920 px e `-m` 1080 px per telefono); `images/uploads` per le foto caricate dal CMS. Video in `media/`.
- **Testi:** riga vuota = nuovo paragrafo · `### Titolo` = sottotitolo · `*testo*` = corsivo · `[testo](https://…)` = link.
- **Modulo contatti:** apre l'app di posta di chi scrive con il messaggio pronto (nessun servizio terzo). L'indirizzo è il campo `email` di `content/site.json`; `form_endpoint` serve solo se in futuro si usa un servizio di invio con accordo GDPR.
- **Pagine legali:** `privacy.html`, `cookies.html`, `terms.html` (testi in `tools/legal/`). Il sito non usa cookie né servizi esterni: font in `fonts/`, immagini e video sul sito.
- **Font:** titoli Archivo Black, testi Sofia Pro. Sofia Pro è a licenza (Adobe Fonts): finché non c'è un kit si usa Mulish, molto simile.

## Gestione dei contenuti (senza toccare il codice)

Il sito è predisposto per [Pages CMS](https://app.pagescms.org), gratuito: un pannello con moduli per modificare home, bio, progetti, observations, pubblicazioni, news e contatti, e caricare foto. La configurazione è in `.pages.yml`.

1. Sara crea un account GitHub gratuito.
2. Il proprietario del repository la aggiunge come collaboratrice (Settings → Collaborators), oppure le trasferisce il repository.
3. Su app.pagescms.org si entra con GitHub, si installa l'app Pages CMS su questo repository e lo si apre.
4. Ogni salvataggio aggiorna il sito in circa un minuto.

Consiglio per le foto caricate: JPG o WebP, lato lungo massimo 2000 px.

## Dominio (es. saraaliscioni.com)

1. Acquistare il dominio da un registrar (Cloudflare, Namecheap, OVH, Aruba…).
2. Nel DNS del dominio:
   - record `A` per `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - record `CNAME` per `www` → `tommyzaffa.github.io`
3. Su GitHub: Settings → Pages → Custom domain → `www.saraaliscioni.com`, poi spuntare "Enforce HTTPS".
4. Quando il sito è approvato: togliere `<meta name="robots" content="noindex, nofollow">` dal template in `tools/build_pages.py`, aggiornare l'URL di `og:image` e rigenerare le pagine.

Anteprima locale: `python3 -m http.server` nella cartella, poi http://localhost:8000

Tutte le fotografie © Sara Aliscioni.
