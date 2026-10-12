# Sara Aliscioni — sito

Sito statico a sezioni, bilingue (IT/EN), in bianco e nero. Nessun build, nessuna libreria esterna.

- **Pagine:** `index.html` (home con foto a rotazione), `gallerie.html?cat=serie|impressioni`, `galleria.html?g=<id>`, `bio.html`, `mostre.html`, `pubblicazioni.html`, `news.html`, `blog.html`, `articolo.html?p=<id>`, `contatti.html`
- **Contenuti:** tutti in `content/*.json` (home, gallerie, news, blog, bio, curriculum, contatti). Le pagine li leggono all'apertura.
- **Codice:** `css/style.css`, `js/app.js`. Header e footer sono generati da `tools/build_pages.py` (`python3 tools/build_pages.py` dopo aver cambiato il template).
- **Immagini:** `images/l` (1600 px), `images/s` (720 px), `images/hero` (home, 1920 px), `images/uploads` (caricate dal CMS).
- **Font:** titoli Archivo Black, testi Sofia Pro. Sofia Pro è a licenza (Adobe Fonts): finché non c'è un kit si usa Mulish, molto simile. Per attivarlo basta incollare il `<link>` del kit Adobe Fonts nel template di `tools/build_pages.py` e rigenerare le pagine.

## Gestione dei contenuti (senza toccare il codice)

Il sito è predisposto per [Pages CMS](https://app.pagescms.org), gratuito: un pannello con moduli per modificare gallerie, news, blog, bio, mostre e contatti, e caricare foto. La configurazione è in `.pages.yml`.

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
