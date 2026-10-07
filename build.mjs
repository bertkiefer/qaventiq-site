#!/usr/bin/env node
// qaventiq.com: the company site of QAVENTIQ LLC, the company behind PIQSYNC, QUEUE and FLOW. Static pages, hosted on
// GitHub Pages: home, a page for each product, services, about, contact, and privacy + terms for this website itself
// (each product has its own). English. Plain words, nothing we
// can't back, no client photos, no outside requests (no fonts, scripts, trackers or forms), so the privacy page can say so.
// One tagline only: "Building smarter ways to work." The look comes from the brand board: near-black with a
// warm copper glow, copper + brushed silver, thin wide capitals; a light mode from its white tile.
//   node build.mjs              → dist/ (refuses until site.json has the company's legal name and an @qaventiq.com email)
//   node build.mjs --preview    → dist/ with a PREVIEW bar (not published yet)
//   node build.mjs --portable   → relative links + .html, for a private preview opened from a folder
// Published from github.com/bertkiefer/qaventiq-site: the portable build in docs/ (README.md).
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const TAGLINE = 'Building smarter ways to work.';
export const ORIGIN = 'https://qaventiq.com';

export function config(raw, { preview = false } = {}) {
  const c = { company: '', contact_email: '', city: '', updated: '', host: 'GitHub Pages', ...raw };
  const missing = [];
  if (!String(c.company).trim()) missing.push('company (the legal name)');
  if (!/^[^\s@<>]+@qaventiq\.com$/i.test(String(c.contact_email).trim())) missing.push('contact_email (an @qaventiq.com mailbox someone reads)');
  if (missing.length) throw new Error(`site.json is missing: ${missing.join('; ')}.`);
  return { company: String(c.company).trim(), email: String(c.contact_email).trim(), city: String(c.city).trim(),
    updated: String(c.updated).trim() || new Date().toISOString().slice(0, 10), host: String(c.host || 'GitHub Pages').trim(), preview: !!preview };
}

// ---- the products (facts from the PIQSYNC repo: docs/ingest-bridge.md, the crew help, piqsync.com) ----------------------
const PRODUCTS = {
  piqsync: {
    name: 'PIQSYNC', icon: 'piqsync-icon-tile.png', lockup: 'piqsync-lockup.png', lockupSize: [585, 175], lockupAlt: 'PIQSYNC, Picture Intelligence. Quality. Synchronized.', where: 'In the cloud', plate: 'plate--piqsync',
    line: 'The platform for school photography studios: galleries, orders, messages and schools.',
    eyebrow: 'PIQSYNC · Picture Intelligence. Quality. Synchronized.',
    h1: 'Everything after the shutter clicks.',
    lead: 'PIQSYNC runs a school photography studio’s work from picture day through delivery: the photos from the camera to the cloud, the family galleries, the orders and the lab, the messages and the schools.',
    what: [
      'Studios photograph schools: underclass, seniors, sports and events. PIQSYNC is the platform behind it. Families see their studio’s name and logo first; PIQSYNC signs quietly at the foot of the page (“Powered by PIQSYNC”).',
      'Each photo is matched to the right student, gets a labeled proof made in the cloud, and lands in that family’s gallery. Families order prints and downloads; the studio sends the orders to its lab and sees each one’s progress until it’s delivered to the school or to home.',
    ],
    features: [
      ['Family galleries', 'Each family sees only their own child’s photos, under the studio’s name, in English or Spanish, on any phone.'],
      ['Orders and the lab', 'Prints, packages and downloads; orders grouped for the lab and delivered to the school or to home.'],
      ['Messages', 'Emails and texts from the studio. Texts go only to families who agreed to get them, and every message has a way to stop.'],
      ['Schools', 'A page where the school sends its roster, gets its flyer for families, and sees its reports.'],
      ['Studio first', 'The studio’s logo, colors and words lead on every family page, email and the app.'],
      ['Made for picture day', 'QUEUE at the school and FLOW at the studio feed it the day’s photos, already tied to the right students.'],
    ],
  },
  queue: {
    name: 'QUEUE', icon: 'queue-icon.png', lockup: 'queue-lockup.jpg', lockupSize: [700, 200], where: 'At the school', plate: 'plate--queue',
    line: 'The picture-day app: scan the card, take the photo, never mix up a student.',
    eyebrow: 'QUEUE · powered by PIQSYNC',
    h1: 'Picture day, one card at a time.',
    lead: 'QUEUE is the app the photo crew uses at the school. Each student’s card is scanned before the photo, so every picture is tied to the right child, even in a gym with no internet.',
    what: [
      'The crew scans the student’s card with a Bluetooth card scanner. QUEUE answers on the scanner itself with a short pattern of beeps and a light, so the person scanning hears from across the room whether the student is ready to photograph, already photographed, or not on this job.',
      'The day’s names list lives on the tablet. At most schools the tablets have no internet, and QUEUE keeps working: each station counts its own students and the stations merge their totals later, or share them live over a phone hotspot. Only small check-in notes go over it; photos never do.',
    ],
    features: [
      ['Card scanning', 'An Opticon card scanner connects over Bluetooth, straight to QUEUE: no keyboard pop-ups, no typing.'],
      ['Sounds you can hear', 'Found, already photographed, or not found: three distinct beep-and-light patterns the studio can tune.'],
      ['Works without internet', 'Everything needed for the day is on the tablet; it syncs when it’s back online.'],
      ['Tablet ready check', 'Ten quick checks before the first student, ending in one big green READY.'],
      ['Practice mode', 'Twelve made-up students and printable practice cards. Nothing counts and nothing uploads.'],
      ['English or Spanish', 'Each tablet can run in either language.'],
    ],
  },
  flow: {
    name: 'FLOW', icon: 'flow-icon.png', lockup: 'flow-lockup.jpg', lockupSize: [800, 239], where: 'At the studio', plate: 'plate--flow',
    line: 'The studio’s overnight uploader: every photo to the cloud, checked, by morning.',
    eyebrow: 'FLOW · powered by PIQSYNC',
    h1: 'Thousands of photos, uploaded while you sleep.',
    lead: 'FLOW is a small app on the studio’s office Mac or Windows computer. It notices each new camera photo, sends it to PIQSYNC, and checks that every file arrived, unattended, overnight.',
    what: [
      'Photographers copy their memory cards to the studio’s storage the way they always have. FLOW watches for each new camera photo, waits until it has finished copying, and sends it once. A file that is copied again, renamed or moved is recognised and skipped.',
      'The studio’s storage stays the master copy: FLOW only reads it, and never moves, renames or deletes anything there. It only makes outgoing secure connections, so nothing at the studio is opened to the internet.',
    ],
    features: [
      ['Overnight, unattended', 'Keeps the computer awake by itself while it works, so a night’s upload finishes on its own.'],
      ['Picks up where it stopped', 'If the internet drops, FLOW resumes where it left off instead of starting over.'],
      ['Checks every file', 'Each photo is verified on arrival, and the studio gets a report of the night in the morning.'],
      ['Each photo once', 'Files are recognised by their content, so copies and renamed files aren’t sent twice.'],
      ['Read-only', 'The studio’s own storage stays untouched: FLOW never moves, renames or deletes.'],
      ['Proofs made in the cloud', 'PIQSYNC makes the labeled proofs; nothing heavy runs at the studio.'],
    ],
  },
};
const ORDER = ['queue', 'flow', 'piqsync'];   // the way a picture day moves: school → studio → cloud

export const PAGES = ['index', 'piqsync', 'queue', 'flow', 'services', 'about', 'contact', 'privacy', 'terms', '404'];
const NAV = [['piqsync', 'PIQSYNC'], ['queue', 'QUEUE'], ['flow', 'FLOW'], ['services', 'Services'], ['about', 'About'], ['contact', 'Contact']];

let PORTABLE = false;   // --portable: relative paths + .html (a private preview); the real site uses clean root paths
const href = (page) => (PORTABLE ? `${page}.html` : page === 'index' ? '/' : `/${page}`);
const root = (f) => `${PORTABLE ? '' : '/'}${f}`;
const asset = (f) => root(`assets/${f}`);
const mail = (c) => `<a class="mail" href="mailto:${esc(c.email)}">${esc(c.email)}</a>`;

// the lockup: the clean SVG, light or dark with the visitor's theme
const lockup = (cls, w, h, alt = 'QAVENTIQ') => `<picture class="${cls}"><source srcset="${asset('qaventiq-lockup-light.svg')}" media="(prefers-color-scheme: light)"><img src="${asset('qaventiq-lockup-dark.svg')}" alt="${esc(alt)}" width="${w}" height="${h}"></picture>`;
// "PIQSYNC by QAVENTIQ": the PIQSYNC logo followed by "by QAVENTIQ" in text
const piqBy = () => `<span class="piqby"><picture><source srcset="${asset('piqsync-logo-on-light.png')}" media="(prefers-color-scheme: light)"><img src="${asset('piqsync-logo-on-dark.png')}" alt="PIQSYNC" width="175" height="28"></picture><span>by QAVENTIQ</span></span>`;
// a product's icon tile at `size` wide; a tile that isn't square (PIQSYNC's Q, 188×175) keeps its own shape, never squashed
const icon = (key, size = 64) => { const [w, h] = PRODUCTS[key].iconSize || [1, 1]; return `<img class="picon" src="${asset(PRODUCTS[key].icon)}" alt="${esc(PRODUCTS[key].name)} icon" width="${size}" height="${Math.round((size * h) / w)}">`; };

function shell(page, c, { title, description, bodyClass = '' }, inner) {
  const nav = NAV.map(([p, label]) => `<a href="${href(p)}"${p === page ? ' aria-current="page"' : ''}>${esc(label)}</a>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#0A0908" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#F7F4F0" media="(prefers-color-scheme: light)">
<meta property="og:type" content="website">
<meta property="og:site_name" content="QAVENTIQ">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${ORIGIN}/assets/qaventiq-share.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${asset('qaventiq-mark.svg')}" type="image/svg+xml">
<link rel="icon" href="${asset('qaventiq-icon-32.png')}" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${asset('qaventiq-icon-180.png')}">
<link rel="stylesheet" href="${root('site.css')}">
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
${c.preview ? '<div class="preview">PREVIEW · not published yet</div>\n' : ''}<a class="skip" href="#main">Skip to content</a>
<header class="top"><div class="wrap top-in"><a class="brand" href="${href('index')}" aria-label="QAVENTIQ home">${lockup('brand-logo', 168, 29)}</a>
<nav class="topnav" aria-label="Main">${nav}</nav></div></header>
${inner}
<footer class="foot"><div class="wrap">
<div class="foot-brand">${lockup('foot-logo', 196, 34)}<p class="tag">${esc(TAGLINE)}</p></div>
<nav class="foot-cols" aria-label="Footer">
<div><h2>Products</h2><a href="${href('piqsync')}">PIQSYNC</a><a href="${href('queue')}">QUEUE</a><a href="${href('flow')}">FLOW</a></div>
<div><h2>Company</h2><a href="${href('services')}">Services</a><a href="${href('about')}">About</a><a href="${href('contact')}">Contact</a></div>
<div><h2>Legal</h2><a href="${href('privacy')}">Privacy</a><a href="${href('terms')}">Terms</a></div>
</nav>
<p class="legal">© ${new Date().getFullYear()} ${esc(c.company)} · ${esc(c.city)} · ${mail(c)}</p>
</div></footer>
</body>
</html>
`;
}

// QUEUE → FLOW → PIQSYNC: how a picture day moves (the product pages mark their own step)
function chain(here = '') {
  const said = { queue: 'Each student’s card is scanned before the photo, so every picture belongs to the right child.',
    flow: 'That night the studio’s computer sends the day’s photos to the cloud and checks each one arrived.',
    piqsync: 'Photos are matched to students, proofed and put in each family’s gallery; families order and the studio’s lab prints.' };
  return `<ol class="chain">${ORDER.map((k, i) => `<li class="chain-step${k === here ? ' is-here' : ''}"${k === here ? ' aria-current="step"' : ''}>
<div class="chain-head">${icon(k, 44)}<div><span class="chain-n">${String(i + 1).padStart(2, '0')} · ${esc(PRODUCTS[k].where)}</span><a href="${href(k)}">${esc(PRODUCTS[k].name)}</a></div></div>
<p>${esc(said[k])}</p>${k === here ? '<span class="chain-tag">This page</span>' : ''}</li>`).join('')}</ol>`;
}

const STATUS = 'PIQSYNC, QUEUE and FLOW are in their first season, working with one studio. We aren’t taking new studios yet; write to us if you’d like to hear when we do.';
const FAMILY = 'Looking for your child’s photos? Use the link or card your studio gave you, or contact your studio. QAVENTIQ can’t see or change a studio’s orders.';

function home(c) {
  const build = [
    ['Websites', 'Company sites and landing pages that load fast on any phone, in English, Spanish or both. Like this one: no trackers, no cookies.'],
    ['SaaS', 'Web software your customers or staff sign in to: accounts and roles, payments, emails and texts, reports.'],
    ['Apps', 'Phone and tablet apps, and small desktop helpers for Mac and Windows, including apps that keep working without internet.'],
  ];
  const how = [
    ['Start with the real day', 'Before we design a screen we learn how the work is really done, where, and what goes wrong. QUEUE works offline because most school gyms have no internet for tablets.'],
    ['Plain words', 'Screens and messages say what will happen, in plain words. PIQSYNC’s family pages work in English and Spanish.'],
    ['Keep working', 'Software that picks up where it stopped and checks its own work: QUEUE without internet, FLOW overnight.'],
    ['Private by default', 'Collect what the job needs and no more. This website has no cookies, analytics or trackers.'],
    ['Tested before it ships', 'Every change runs through automated tests before it reaches anyone.'],
    ['Stay after launch', 'We keep fixing and improving what’s live, alongside the people who use it every day.'],
  ];
  return shell('index', c, { title: 'QAVENTIQ · Building smarter ways to work.', description: `QAVENTIQ builds websites, SaaS and apps, and makes PIQSYNC, QUEUE and FLOW for school photography studios.`, bodyClass: 'is-home' }, `<section class="hero"><div class="wrap hero-in">
<h1 class="hero-logo">${lockup('hero-lockup', 1124, 196)}</h1>
<div class="beam" aria-hidden="true"></div>
<p class="tagline">${esc(TAGLINE)}</p>
<p class="hero-lead">${esc(c.company)} builds websites, SaaS and apps. Our own products, PIQSYNC, QUEUE and FLOW, run a school photography studio from picture day to delivery.</p>
<p class="actions"><a class="btn" href="#products">See our products</a><a class="btn btn--ghost" href="${href('contact')}">Talk to us</a></p>
</div></section>
<main id="main">
<section class="band"><div class="wrap"><p class="eyebrow">What we build</p><h2>Websites, SaaS and apps</h2>
<div class="grid grid--3">${build.map(([h, p]) => `<div class="card"><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}</div>
<p class="more"><a href="${href('services')}">Our services</a></p></div></section>
<section class="band band--alt" id="products"><div class="wrap"><p class="eyebrow">Our products</p><h2>Picture day, start to finish</h2>
<p class="intro">Three products that work as one for school photography studios: QUEUE at the school, FLOW at the studio, PIQSYNC in the cloud.</p>
<div class="grid grid--3">${ORDER.map((k) => `<a class="prod" href="${href(k)}">${icon(k, 72)}<span class="prod-where">${esc(PRODUCTS[k].where)}</span><span class="prod-name">${esc(PRODUCTS[k].name)}</span><span class="prod-line">${esc(PRODUCTS[k].line)}</span><span class="prod-go">Learn more</span></a>`).join('')}</div>
<h3 class="sub">How they work together</h3>${chain()}
<p class="note">${esc(STATUS)}</p></div></section>
<section class="band"><div class="wrap"><p class="eyebrow">How we work</p><h2>The way we build</h2>
<ol class="steps">${how.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}</ol></div></section>
<section class="band band--cta"><div class="wrap"><p class="eyebrow">Contact</p><h2>Tell us what you’re working on</h2>
<p>Write to ${mail(c)}. We read every email.</p><p class="note note--quiet">${esc(FAMILY)}</p></div></section>
</main>`);
}

function product(key, c) {
  const p = PRODUCTS[key];
  // every product's header: its own lockup on the same plate (PIQSYNC's with its glow and slogan, like FLOW's and QUEUE's)
  const logo = `<div class="plate ${p.plate}"><img src="${asset(p.lockup)}" alt="${esc(p.lockupAlt || `${p.name}, powered by PIQSYNC`)}" width="${p.lockupSize[0]}" height="${p.lockupSize[1]}"></div>`;
  const others = ORDER.filter((k) => k !== key).map((k) => PRODUCTS[k].name).join(' and ');
  return shell(key, c, { title: `${p.name} · QAVENTIQ`, description: p.lead, bodyClass: `is-product is-${key}` }, `<section class="phero"><div class="wrap phero-in">
<p class="crumb"><a href="${href('index')}#products">Products</a> <span aria-hidden="true">/</span> ${esc(p.name)}</p>
${logo}
<p class="eyebrow">${esc(p.eyebrow)}</p>
<h1>${esc(p.h1)}</h1>
<p class="lead">${esc(p.lead)}</p>
${piqBy()}
</div></section>
<main id="main">
<section class="band"><div class="wrap narrow"><h2>What it does</h2>${p.what.map((t) => `<p>${esc(t)}</p>`).join('')}</div></section>
<section class="band band--alt"><div class="wrap"><h2>Key features</h2>
<div class="grid grid--3">${p.features.map(([h, t]) => `<div class="card"><h3>${esc(h)}</h3><p>${esc(t)}</p></div>`).join('')}</div></div></section>
<section class="band"><div class="wrap"><h2>How it works with ${esc(others)}</h2>${chain(key)}</div></section>
<section class="band band--cta"><div class="wrap narrow"><p class="note">${esc(STATUS)}</p><p>Questions about ${esc(p.name)}? Write to ${mail(c)}.</p><p class="note note--quiet">${esc(FAMILY)}</p></div></section>
</main>`);
}

function services(c) {
  const offer = [
    ['Websites', 'Company sites and landing pages that load fast on any phone and read well in English, Spanish or both. Static and simple to host, with nothing loaded from other companies unless you need it.'],
    ['SaaS', 'Web software your customers or staff sign in to: accounts and roles, payments through Stripe, emails and texts, reports and exports. Designed so one customer can become many.'],
    ['Apps', 'iPhone and Android apps, and small desktop helpers for Mac and Windows: including apps that keep working without internet and catch up when they’re back online.'],
    ['Connecting your tools', 'Card scanners over Bluetooth, cameras, payment providers, email and text services: the hardware and services you already use, working together.'],
  ];
  const steps = [
    ['A conversation', 'Tell us by email what you need. We’ll ask questions and tell you honestly whether we’re a good fit.'],
    ['A short written plan', 'What we’ll build first, what it will cost and when you’ll see it, in plain words.'],
    ['Small steps you can try', 'You use real pieces early, and what you learn shapes the next step.'],
    ['Launch, then look after it', 'We put it live with you, and keep it working and improving after launch.'],
  ];
  return shell('services', c, { title: 'Services · QAVENTIQ', description: 'Custom websites, SaaS and apps for businesses, from the company that makes PIQSYNC, QUEUE and FLOW.' }, `<section class="phero phero--plain"><div class="wrap phero-in">
<p class="eyebrow">Services</p><h1>Custom websites, SaaS and apps for businesses.</h1>
<p class="lead">The same care that goes into PIQSYNC, QUEUE and FLOW, for your business: software for the way your work is really done.</p></div></section>
<main id="main">
<section class="band"><div class="wrap"><h2>What we build</h2>
<div class="grid grid--2">${offer.map(([h, t]) => `<div class="card"><h3>${esc(h)}</h3><p>${esc(t)}</p></div>`).join('')}</div></div></section>
<section class="band band--alt"><div class="wrap"><h2>How a project goes</h2>
<ol class="steps steps--4">${steps.map(([h, t]) => `<li><h3>${esc(h)}</h3><p>${esc(t)}</p></li>`).join('')}</ol></div></section>
<section class="band band--cta"><div class="wrap narrow"><h2>Start with an email</h2><p>Write to ${mail(c)} with a few lines about your business and what you need.</p></div></section>
</main>`);
}

function about(c) {
  return shell('about', c, { title: 'About · QAVENTIQ', description: `${c.company} builds websites, SaaS and apps, and makes PIQSYNC, FLOW and QUEUE.` }, `<main id="main" class="doc-main"><div class="wrap narrow">
<h1>About QAVENTIQ</h1>
<p class="lead">${esc(c.company)} builds websites, SaaS and apps. The company is based in ${esc(c.city)}.</p>
<h2>Our products</h2>
<p>We make <a href="${href('piqsync')}">PIQSYNC</a>, <a href="${href('flow')}">FLOW</a> and <a href="${href('queue')}">QUEUE</a>, software for school photography studios.</p>
<h2>Contact</h2>
<p>${mail(c)}</p>
<p class="meta">${esc(c.company)} · ${esc(c.city)}</p>
</div></main>`);
}

function contact(c) {
  return shell('contact', c, { title: 'Contact · QAVENTIQ', description: `Write to ${c.company} at ${c.email}.` }, `<main id="main" class="doc-main"><div class="wrap narrow">
<h1>Contact</h1>
<p class="lead">Email us at ${mail(c)}. We read every email.</p>
<p class="mail-big">${esc(c.email)}</p>
<div class="grid grid--3 contact-grid">
<div class="card"><h2>Businesses</h2><p>Tell us about your business and what you need built: a website, web software or an app.</p></div>
<div class="card"><h2>Photography studios</h2><p>${esc(STATUS)}</p></div>
<div class="card"><h2>Families</h2><p>${esc(FAMILY)}</p></div>
</div>
<p class="meta">${esc(c.company)} · ${esc(c.city)}</p>
</div></main>`);
}

// Privacy + Terms: the exact texts in privacy.md and terms.md (Bert's words; edit those files, not this code). The
// renderer knows only what they use: "# Title", the "Last updated:" line, "## N. Heading" sections and plain paragraphs;
// every text is escaped, and the contact address becomes a mailto link.
function legal(page, c) {
  const lines = readFileSync(join(HERE, `${page}.md`), 'utf8').split(/\r?\n/);
  let title = page === 'privacy' ? 'Privacy Policy' : 'Terms of Use', body = '';
  const text = (t) => esc(t).replaceAll(esc(c.email), mail(c));
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) continue;
    if (l.startsWith('# ')) title = l.slice(2).trim();
    else if (l.startsWith('## ')) body += `<h2>${esc(l.slice(3).trim())}</h2>\n`;
    else if (/^Last updated:/i.test(l)) body += `<p class="meta">${esc(l)}</p>\n`;
    else body += `<p>${text(l)}</p>\n`;
  }
  return shell(page, c, { title: `${title} · QAVENTIQ`, description: `${title} for qaventiq.com.` }, `<main id="main" class="doc-main"><div class="wrap narrow">
<h1>${esc(title)}</h1>
${body}</div></main>`);
}

function notFound(c) {
  return shell('404', c, { title: 'Page not found · QAVENTIQ', description: 'That page isn’t here.' }, `<main id="main" class="doc-main"><div class="wrap narrow">
<p class="eyebrow">404</p><h1>That page isn’t here.</h1>
<p class="lead">It may have moved. Try the <a href="${href('index')}">home page</a>, or write to ${mail(c)}.</p></div></main>`);
}

export function render(page, c) {
  if (page === 'index') return home(c);
  if (PRODUCTS[page]) return product(page, c);
  if (page === 'services') return services(c);
  if (page === 'about') return about(c);
  if (page === 'contact') return contact(c);
  if (page === 'privacy' || page === 'terms') return legal(page, c);
  if (page === '404') return notFound(c);
  throw new Error(`no such page: ${page}`);
}

// Cloudflare Pages: security headers (_headers is Pages' own file format)
const HEADERS = `/*
  Content-Security-Policy: default-src 'none'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  Cross-Origin-Opener-Policy: same-origin
/assets/*
  Cache-Control: public, max-age=604800
`;

export function build({ out = join(HERE, 'dist'), preview = false, portable = false, site = null } = {}) {
  PORTABLE = !!portable;
  try {
    const c = config(site ?? JSON.parse(readFileSync(join(HERE, 'site.json'), 'utf8')), { preview });
    rmSync(out, { recursive: true, force: true }); mkdirSync(join(out, 'assets'), { recursive: true });
    const files = [];
    for (const page of PAGES) { const f = join(out, `${page}.html`); writeFileSync(f, render(page, c)); files.push(f); }
    copyFileSync(join(HERE, 'site.css'), join(out, 'site.css'));
    if (!PORTABLE) writeFileSync(join(out, '_headers'), HEADERS);
    for (const a of readdirSync(join(HERE, 'assets'))) if (/\.(png|jpg|svg)$/.test(a)) copyFileSync(join(HERE, 'assets', a), join(out, 'assets', a));
    return { out, files, preview: c.preview };
  } finally { PORTABLE = false; }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const i = process.argv.indexOf('--out'), out = i > 0 ? process.argv[i + 1] : undefined;
  try { const r = build({ preview: process.argv.includes('--preview'), portable: process.argv.includes('--portable'), ...(out ? { out } : {}) }); console.log(`built ${r.files.length} pages into ${r.out}${r.preview ? ' (PREVIEW bar shown)' : ''}`); }
  catch (e) { console.error(e.message); process.exit(1); }
}
