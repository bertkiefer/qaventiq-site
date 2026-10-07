# qaventiq.com

The website of **QAVENTIQ LLC** (Laredo, Texas), the company behind PIQSYNC, FLOW and QUEUE. Plain static pages in
English: home, a page for each product (`piqsync`, `queue`, `flow`), `services`, `about`, `contact`, `privacy` and
`terms`. No forms, cookies, tracking, analytics, outside fonts or scripts.

- **Words:** all in `build.mjs`. **Look:** the colors are tokens at the top of `site.css` (a dark theme with a light
  one that follows the visitor's device). **Logos:** `assets/` (logos and icons only, never photos).
- **Settings:** `site.json`: `company`, `contact_email`, `city`, `host` (named on the privacy page), `updated` (the date
  on privacy and terms).
- **Build for GitHub Pages:** `node build.mjs --portable --out docs` (every link relative, so the pages work at
  `bertkiefer.github.io/qaventiq-site/` and at `qaventiq.com`). GitHub Pages publishes the `docs/` folder of `main`.
  Each page carries its own Content-Security-Policy (GitHub Pages can't send custom headers).
- **Custom domain:** a `docs/CNAME` file containing `qaventiq.com`, plus the domain's DNS pointing at GitHub Pages.
  Email for qaventiq.com is separate (Microsoft 365): its MX and TXT records never change.
- Needs Node 20 or newer; no packages to install.
