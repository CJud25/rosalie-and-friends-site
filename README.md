# rosalieandfriends.org

The website of **Rosalie and Friends Inc.**, a 501(c)(3) dog rescue in Pensacola, FL, dedicated to *fospice and fixer uppers* — seniors, medical cases, and overlooked dogs.

Live site: https://rosalieandfriends.org · Facebook: https://www.facebook.com/rosalieandfriends

## What this is

A plain static site — no framework, no build step. HTML at the root, `css/`, `js/`, `images/`, self-hosted fonts in `fonts/`. Hosted on Vercel (free tier); `vercel.json` turns on clean URLs (`/dogs` serves `dogs.html`) and security headers.

## Preview locally

```bash
npx serve .
```

Then open http://localhost:3000. Use `npx serve` (not `file://` or a plain http server) — internal links are extensionless and `serve` resolves them the same way Vercel does.

## Updating the dog roster

Every dog on the site is real and every fact traces to a source — see `docs/content-sources.md` (the source-of-truth file) and `docs/harvest/rosalie-roster.json` (raw data from the rescue's Petfinder listing).

To add/remove a dog:
1. Add the dog's photo to `images/dogs/` (compress with `py tools/optimize_images.py <dir>` — max 900px wide).
2. Copy an existing `<article class="dog-card">` block in `dogs.html`, update the facts (only facts the rescue has published — no guessed ages/breeds/temperaments), give the article a unique `id`, and update `data-tags`/`data-name`/`data-age` for the filters.
3. Record the dog's source (Petfinder/Facebook URL + date) in `docs/content-sources.md`.
4. Run `py tools/check_links.py` — it must print `OK`.

House rules: unknown facts stay unknown ("ask us about ..."); safety restrictions (no cats, kids guidance, housing needs) are never dropped from a card; adopted dogs move to Happy Tails rather than being deleted.

## Tools

- `tools/check_links.py` — verifies every internal link/asset resolves; run before any commit.
- `tools/optimize_images.py` — resizes/compresses photos into the repo.
- `tools/make_icons.py` — regenerates favicons + the og-image from `images/mascot.jpg`.
- `tools/add_og.py` — (idempotent) injects canonical/OG/Twitter meta into page heads.

## Deploying

Pushes to `master` auto-deploy via Vercel's GitHub integration. DNS for rosalieandfriends.org points at Vercel from Porkbun (`A @ 76.76.21.21`, `CNAME www cname.vercel-dns.com`).

## Owner to-dos

- Swap the PayPal donate button on `ways-to-help.html` for the org's real donation link (marked `TODO(owner)`).
- Confirm the fospice medical-costs wording with the rescue (marked `TODO(owner)` in `fospice.html`).
- Verify the foster JotForm ID (`fb.jotform.com/223377576549168`) is current.
- When the rescue provides real impact numbers, restore the stats bar on `about.html` (see comment there).
