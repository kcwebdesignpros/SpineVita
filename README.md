# SpineVita Chiropractic

Marketing website for **SpineVita Chiropractic** — a root-cause chiropractic clinic in Kansas City, MO.

Built as an Express + EJS server-rendered app, then **prerendered to fully static HTML** and deployed to **Cloudflare Pages** for edge delivery. The only dynamic endpoint (the contact form) is handled by a Cloudflare Pages Function.

---

## Tech stack

| Layer | Choice |
|---|---|
| Templating | EJS + `express-ejs-layouts` |
| Server (dev/build) | Express 4 |
| Styling | Hand-written CSS with custom properties |
| Icons | Inline SVG set in `views/data/icons.js` |
| Hosting | Cloudflare Pages (static assets + Functions) |
| Build | `build.js` — prerenders every route to `dist/` |

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000 (auto-restarts on change)
```

Other scripts:

```bash
npm start          # run the Express server without watch mode
npm run build      # prerender the whole site into dist/
npm run preview    # build + serve dist/ through the Cloudflare Pages emulator
npm run deploy     # build + deploy dist/ to Cloudflare Pages
```

---

## How the Cloudflare deployment works

```
build.js  ──boots Express──▶  GET each route  ──▶  dist/**/index.html
                                                  dist/css, /js, /images
                                                  dist/_headers, /_redirects
functions/contact.js  ──▶  Cloudflare Pages Function (POST /contact)
```

* **Everything is static.** Pages, service details, blog posts, `robots.txt`,
  `sitemap.xml` and `404.html` are all written to `dist/` at build time, so they
  are served straight from Cloudflare's edge with no cold starts.
* **Output is directory-style** (`/about` → `dist/about/index.html`) so both
  `/about` and `/about/` resolve cleanly.
* **`public/` is copied verbatim**, which is how `_headers` and `_redirects`
  reach the deployment root.

### Contact form

The contact form is the one dynamic piece:

1. `POST /contact` hits `functions/contact.js`.
2. The function validates the payload and, if a `CONTACT_WEBHOOK` environment
   variable is configured, forwards the submission there as JSON.
3. It then `303`-redirects to `/contact?submitted=1`, and `main.js` swaps the
   form for the thank-you state (or `/contact?error=1` for the error state).

Without `CONTACT_WEBHOOK`, submissions are written to the Pages deployment log,
visible with:

```bash
npx wrangler pages deployment tail --project-name spinevita
```

To actually receive emails, point `CONTACT_WEBHOOK` at a form/automation
endpoint (Zapier, Make, n8n, a Worker, …) in the Pages project settings:

> Cloudflare dashboard → Workers & Pages → spinevita → Settings → Environment variables

---

## Deploying

### Option A — CLI (already wired up)

```bash
npx wrangler login                 # once
npm run cf:create                  # create the Pages project (once)
npm run deploy                     # build + deploy
```

### Option B — Git integration (auto-deploy on push)

In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**,
pick this repository, then use:

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | from `.nvmrc` (20) |

---

## Project structure

```
├── build.js                 # prerender script -> dist/
├── server.js                # Express app (routes + business data)
├── wrangler.toml            # Cloudflare Pages config
├── functions/
│   └── contact.js           # POST /contact handler
├── public/
│   ├── css/style.css
│   ├── js/main.js
│   ├── images/              # WebP assets (logo, favicon, photos)
│   ├── _headers
│   └── _redirects
└── views/
    ├── layouts/main.ejs
    ├── partials/            # header, footer, seo
    ├── pages/               # one file per page
    └── data/
        ├── services.js      # 6 services (drives pages + sitemap)
        ├── blog.js          # 4 blog posts
        └── icons.js         # inline SVG icon set
```

## Editing content

* **Business details** (phone, address, hours, socials) live in the
  `businessInfo` object at the top of `server.js`.
* **Services** and **blog posts** are data-driven from `views/data/`. Adding an
  entry automatically creates its page, its sitemap entry and its nav links.
* Run `npm run build` after content changes so `dist/` reflects them.

---

© SpineVita Chiropractic. All rights reserved.
