// Erzeugt aus content/*.json die fertige statische Seite im Ordner dist/.
// Keine Abhängigkeiten. Cloudflare Pages: Build command "node build.mjs", Output "dist".
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'node:fs';

const read = (n) => JSON.parse(readFileSync(`content/${n}.json`, 'utf8'));
const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lines = (s = '') => esc(s).split('\n').join('<br>');

const site = read('site');
const home = read('home');
const kontakt = read('kontakt');
const impressum = read('impressum');
const datenschutz = read('datenschutz');

const ORIGIN = 'https://fraukaschmir.com';

function layout({ path, title, description, active, body, robots }) {
  const nav = (href, label, key) =>
    `<a href="${href}"${active === key ? ' class="active" aria-current="page"' : ''}>${label}</a>`;
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
${description ? `<meta name="description" content="${esc(description)}">` : ''}
${robots ? `<meta name="robots" content="${robots}">` : ''}
<link rel="canonical" href="${ORIGIN}${path}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
${description ? `<meta property="og:description" content="${esc(description)}">` : ''}
<meta property="og:url" content="${ORIGIN}${path}">
<meta property="og:image" content="${ORIGIN}/assets/img/og.jpg">
<meta name="theme-color" content="#f8f7f4">
<link rel="icon" href="/assets/img/favicon.png" type="image/png">
<link rel="preload" href="/assets/fonts/poppins-300.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/style.css">
</head>
<body>
<header class="top">
  <a class="logo" href="/"><img src="/assets/img/logo.png" width="296" height="172" alt="${esc(site.tagline_logo_alt)}"></a>
  <nav aria-label="Hauptmenü">
    ${nav('/', 'Home', 'home')}
    ${nav('/kontakt/', 'Kontakt', 'kontakt')}
  </nav>
</header>
<main>
${body}
</main>
<footer class="foot">
  <div class="foot-grid">
    <a class="foot-logo" href="/"><img src="/assets/img/logo.png" width="296" height="172" alt="${esc(site.tagline_logo_alt)}" loading="lazy"></a>
    <div>
      <h2>${esc(site.footer_follow_title)}</h2>
      <ul>
        <li><a href="${esc(site.instagram)}" rel="noopener" target="_blank">Instagram</a></li>
        <li><a href="${esc(site.facebook)}" rel="noopener" target="_blank">Facebook</a></li>
      </ul>
    </div>
    <div>
      <h2>${esc(site.footer_nav_title)}</h2>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/kontakt/">Kontakt</a></li>
      </ul>
    </div>
    <div>
      <h2>${esc(site.footer_legal_title)}</h2>
      <ul class="plain">
        <li><a href="/impressum/">Impressum</a></li>
        <li><a href="/datenschutz/">Datenschutzerklärung</a></li>
      </ul>
    </div>
  </div>
  <p class="copy">${esc(site.copyright)}</p>
</footer>
</body>
</html>
`;
}

function homePage() {
  const body = `
<section class="hero-title">
  <h1>${esc(home.headline)}</h1>
</section>
<section class="band band-hero">
  <img src="${esc(home.hero_image)}" alt="${esc(home.hero_image_alt)}" width="2200" height="1466" fetchpriority="high">
  <div class="box box-right">
    <h2 class="box-title big">${esc(home.hero_box_title)}</h2>
    <p>${esc(home.hero_box_text)}</p>
    <a class="btn" href="${esc(home.hero_button_link)}" rel="noopener" target="_blank">${esc(home.hero_button_text)}</a>
  </div>
</section>
<section class="kids">
  <p class="kids-text">${lines(home.kids_text)}</p>
  <img src="${esc(home.kids_image)}" alt="${esc(home.kids_image_alt)}" width="933" height="1400" loading="lazy">
</section>
<section class="band band-service">
  <img src="${esc(home.service_image)}" alt="${esc(home.service_image_alt)}" width="2200" height="1466" loading="lazy">
  <div class="box box-left">
    <h2 class="box-title">${esc(home.service_title)}</h2>
    <p>${esc(home.service_text)}</p>
    <a class="btn" href="tel:${esc(site.phone_link)}">${esc(home.service_button_text)}</a>
  </div>
</section>`;
  return layout({ path: '/', title: home.meta_title, description: home.meta_description, active: 'home', body });
}

function kontaktPage() {
  const body = `
<section class="contact">
  <div class="contact-text">
    <h1>${esc(kontakt.title)}</h1>
    <h2>${esc(kontakt.mail_title)}</h2>
    <p><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>
    <h2>${esc(kontakt.phone_title)}</h2>
    <p><a href="tel:${esc(site.phone_link)}">${esc(site.phone_display)}</a></p>
    <h2>${esc(kontakt.visit_title)}</h2>
    <p>${esc(kontakt.address_1)}</p>
    <p>${esc(kontakt.address_2)}</p>
  </div>
  <img class="contact-img" src="${esc(kontakt.image)}" alt="${esc(kontakt.image_alt)}" width="1400" height="907">
</section>`;
  return layout({ path: '/kontakt/', title: kontakt.meta_title, description: kontakt.meta_description, active: 'kontakt', body });
}

// "## Überschrift" und Absätze (Leerzeile), einfache Zeilenumbrüche bleiben erhalten.
function legalPage(path, data) {
  const html = data.body
    .split(/\n{2,}/)
    .map((block) =>
      block.startsWith('## ') ? `<h2>${esc(block.slice(3))}</h2>` : `<p>${lines(block)}</p>`
    )
    .join('\n');
  const body = `<section class="legal"><h1>${esc(data.title)}</h1>\n${html}\n</section>`;
  return layout({ path, title: data.meta_title, description: '', active: '', body, robots: 'noindex' });
}

function write(path, html) {
  const dir = path === '/' ? 'dist' : `dist${path}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/index.html`, html);
}

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
cpSync('assets', 'dist/assets', { recursive: true });

write('/', homePage());
write('/kontakt/', kontaktPage());
write('/impressum/', legalPage('/impressum/', impressum));
write('/datenschutz/', legalPage('/datenschutz/', datenschutz));

writeFileSync(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${ORIGIN}/</loc></url>\n  <url><loc>${ORIGIN}/kontakt/</loc></url>\n</urlset>\n`
);
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`);
if (existsSync('_headers')) cpSync('_headers', 'dist/_headers');
console.log('Build fertig: dist/');
