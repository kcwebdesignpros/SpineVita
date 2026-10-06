'use strict';

/**
 * Static prerender for Cloudflare Pages.
 *
 * Boots the Express app on an ephemeral port, requests every route and writes
 * the rendered HTML into dist/ using flat .html files (e.g. /about ->
 * dist/about.html) so Cloudflare Pages serves "/about" with a direct 200,
 * matching the canonical URLs and sitemap. Trailing-slash variants are
 * redirected to the canonical form automatically by Pages.
 *
 * public/ is copied verbatim, which also carries _headers and _redirects into
 * the deployment root.
 */

const fs = require('fs');
const path = require('path');
const app = require('./server');
const services = require('./views/data/services');
const blogPosts = require('./views/data/blog');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'dist');
const PUBLIC_DIR = path.join(ROOT, 'public');

/** Route list: source URL -> file path relative to dist/ */
const routes = [
  { url: '/', file: 'index.html' },
  { url: '/about', file: 'about.html' },
  { url: '/services', file: 'services.html' },
  { url: '/how-it-works', file: 'how-it-works.html' },
  { url: '/blog', file: 'blog.html' },
  { url: '/contact', file: 'contact.html' },
  { url: '/privacy-policy', file: 'privacy-policy.html' },
  { url: '/terms-of-service', file: 'terms-of-service.html' },
  { url: '/robots.txt', file: 'robots.txt' },
  { url: '/sitemap.xml', file: 'sitemap.xml' },
  ...services.map((s) => ({ url: `/services/${s.id}`, file: `services/${s.id}.html` })),
  ...blogPosts.map((p) => ({ url: `/blog/${p.id}`, file: `blog/${p.id}.html` }))
];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function write(relPath, contents) {
  const dest = path.join(OUT, relPath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, contents);
}

function countFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).reduce(
    (n, e) => n + (e.isDirectory() ? countFiles(path.join(dir, e.name)) : 1),
    0
  );
}

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  let failures = 0;
  try {
    for (const route of routes) {
      const res = await fetch(base + route.url);
      const body = await res.text();
      if (!res.ok) {
        failures++;
        console.error(`  FAIL ${res.status}  ${route.url}`);
      }
      write(route.file, body);
      console.log(`  ${String(res.status).padEnd(4)} ${route.url}  ->  dist/${route.file}`);
    }

    // Cloudflare Pages serves 404.html automatically for unmatched routes
    const notFound = await fetch(`${base}/__prerender_not_found__`);
    write('404.html', await notFound.text());
    console.log('  404  (not-found page)  ->  dist/404.html');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  // Copy static assets (also carries _headers and _redirects into dist/)
  copyDir(PUBLIC_DIR, OUT);

  console.log(
    `\nPrerendered ${routes.length + 1} routes. dist/ now contains ${countFiles(OUT)} files.`
  );

  if (failures) {
    console.error(`\n${failures} route(s) failed to prerender.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
