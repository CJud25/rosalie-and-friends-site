# Rosalie & Friends Live Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved static mock as the live rosalieandfriends.org, with real dogs, the real mascot, zero placeholders, on Vercel free tier.

**Architecture:** Plain static HTML/CSS/JS at repo root, served by Vercel with cleanUrls. Content harvested from facebook.com/rosalieandfriends (Petfinder fallback), optimized locally, committed to the repo. No build step, no dependencies.

**Tech Stack:** HTML/CSS/JS · Python (`py`) + Pillow for image work · `npx serve` for local preview (emulates cleanUrls) · Playwright chromium for screenshots/Lighthouse · gh CLI → GitHub → Vercel · Porkbun DNS.

## Global Constraints

- **Truth rule:** dog cards state ONLY facts present in a recorded source (Facebook post / Petfinder listing). Unknown = written as unknown. Every dog maps to a source URL in `docs/content-sources.md`.
- **Zero placeholders at ship:** `grep -ri placedog` → 0 hits; no generic venmo.com/paypal.com links except the agreed PayPal-homepage placeholder button; no fictional dogs.
- **Static only:** no frameworks, no package.json dependencies committed, no server code.
- **Preserve the approved design system:** palette/fonts/components in `css/styles.css` evolve (Task 6) but are not replaced.
- **Internal links become extensionless** (`href="/dogs"` not `dogs.html`) to match Vercel cleanUrls; local preview MUST use `npx serve` (not `file://`, not python http.server).
- **Windows box:** use `py` (never `python`), Bash tool for shell, Playwright bundled chromium for anything needing a browser binary.
- **Each task ends with its verification commands run and passing, then a commit.** Adversarial gates (Workflow multi-agent) sit between phases; a phase does not start until the previous gate's findings are fixed or refuted.

---

### Task 1: Content harvest (INLINE — needs user's Chrome session)

**Files:**
- Create: `docs/content-sources.md`, `images/mascot.jpg`, `images/dogs/<name>.jpg` (one per real dog), `tools/optimize_images.py`
- Scratch: raw downloads in scratchpad before optimization

**Interfaces:**
- Produces: `docs/content-sources.md` with one section per dog: `## <Name>` + `source:` URL + `seen:` date + `photo:` filename + `facts:` bullet list of ONLY sourced facts (age/breed/sex/temperament/fospice-status as stated). Plus `## Mascot` and `## Org details` (donate links found, confirm PO Box + EIN vs mock) sections. Task 3 builds cards exclusively from this file.

- [ ] **Step 1:** Load claude-in-chrome tools (one ToolSearch batch), get tab context, open `https://www.facebook.com/rosalieandfriends/` in a NEW tab.
- [ ] **Step 2:** Mascot: open the profile photo at full size, capture its CDN URL, download to scratchpad via `curl -L -o mascot_raw.jpg "<url>"`. Verify it's a real image: `py -c "from PIL import Image; im=Image.open('mascot_raw.jpg'); print(im.size, im.format)"` (install first if needed: `py -m pip install Pillow`).
- [ ] **Step 3:** Roster: scroll the page's recent posts + photos. Identify dogs currently presented as adoptable or fospice. For each: name, photo CDN URL, the post's exact claims, post date, post permalink. Record verbatim-supported facts only.
- [ ] **Step 4:** Fallback/cross-check: search petfinder.com for the rescue (Pensacola FL). If listed, capture each dog's listing URL + facts; prefer Petfinder for structured facts, Facebook for freshness. If Facebook blocks scraping entirely, Petfinder becomes primary.
- [ ] **Step 5:** Also from Facebook About: any donate links (PayPal.me etc.), confirm PO Box/EIN/motto against the mock's footer. Record in `## Org details`.
- [ ] **Step 6:** Download all dog photos to scratchpad (`curl -L`), verify each with Pillow as in Step 2.
- [ ] **Step 7:** Write `tools/optimize_images.py`:

```python
"""Resize/compress harvested photos into the repo. Usage: py tools/optimize_images.py <src_dir>"""
import sys, pathlib
from PIL import Image, ImageOps

SRC = pathlib.Path(sys.argv[1])
DOGS_OUT = pathlib.Path("images/dogs"); DOGS_OUT.mkdir(parents=True, exist_ok=True)
MAX_W = 900

for p in sorted(SRC.glob("*.jpg")):
    im = ImageOps.exif_transpose(Image.open(p)).convert("RGB")
    if im.width > MAX_W:
        im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
    out = (pathlib.Path("images") if p.stem == "mascot" else DOGS_OUT) / p.name
    im.save(out, "JPEG", quality=82, optimize=True, progressive=True)
    print(out, im.size, f"{out.stat().st_size//1024}KB")
```

- [ ] **Step 8:** Run it: `py tools/optimize_images.py <scratch_dir>`. Expected: every photo ≤900px wide, mostly ≤150KB, mascot at `images/mascot.jpg`, dogs in `images/dogs/`.
- [ ] **Step 9:** Write `docs/content-sources.md` (format in Interfaces above).
- [ ] **Step 10:** Verify: `ls images/dogs | wc -l` matches dog count in content-sources.md; `grep -c "^## " docs/content-sources.md` = dogs + 2.
- [ ] **Step 11:** Commit: `git add -A && git commit -m "content: harvest mascot + real roster with per-dog sources"`

### Task 2: GATE 1 — source-verification panel (Workflow)

- [ ] **Step 1:** Run a Workflow: one verifier agent per dog (reads `docs/content-sources.md` entry + the card-facts; adversarial prompt: *refute* any fact not literally supported by the recorded source; flag any dog whose source is older than ~60 days or that a newer post marks adopted/pending — check via WebFetch of the permalink where fetchable, else report UNVERIFIABLE-REMOTELY for inline browser re-check). Schema: `{dog, verdict: PASS|FAIL|RECHECK, problems[]}`.
- [ ] **Step 2:** Fix every FAIL (edit content-sources.md facts down to what's supported); re-check every RECHECK inline in Chrome. Re-run failed verifiers until all PASS.
- [ ] **Step 3:** Commit: `git commit -am "gate1: roster facts verified against sources"`

### Task 3: Real roster into the pages

**Files:**
- Modify: `dogs.html` (replace all fictional cards), `index.html` (3 featured cards + Willow spotlight band → real fospice dog or general band if none)

**Interfaces:**
- Consumes: `docs/content-sources.md` (Task 1), photos in `images/dogs/`
- Card template (exact structure already in the mock — reuse classes verbatim):

```html
<article class="dog-card">
  <img src="/images/dogs/NAME.jpg" alt="NAME, FACTUAL-DESCRIPTOR" class="dog-card__img" loading="lazy" />
  <div class="dog-card__body">
    <div class="dog-card__meta">
      <span class="dog-card__tag">AGE-IF-KNOWN</span>
      <span class="dog-card__tag">BREED-IF-KNOWN</span>
      <!-- add ONLY if sourced: <span class="dog-card__tag dog-card__tag--fospice">Fospice</span> -->
    </div>
    <h3 class="dog-card__name">NAME</h3>
    <p class="dog-card__desc">SOURCED-FACTS-ONLY. If sparse: "Ask us about NAME — message us on Facebook."</p>
    <a href="https://form.jotform.com/223268341300041" target="_blank" rel="noopener" class="dog-card__link">Apply to Adopt NAME &rarr;</a>
  </div>
</article>
```

- [ ] **Step 1:** Rebuild `dogs.html` roster from content-sources.md — one card per dog, omit unknown tags entirely (no guessed ages/breeds). Keep the page's section framing; adjust intro copy to actual counts.
- [ ] **Step 2:** `index.html`: pick 3 dogs (prefer 1 fospice) for featured; rewrite the spotlight band around a real fospice dog with sourced copy, or generalize the band to program-copy-only if no current fospice dog.
- [ ] **Step 3:** Verify: `grep -c placedog dogs.html index.html` → `0` in both; every `images/dogs/*.jpg` referenced exists (`py tools/check_links.py` arrives in Task 4 — here: manual spot check + open `npx serve` preview and eyeball every card).
- [ ] **Step 4:** Commit: `git commit -am "content: real roster on dogs + home"`

### Task 4: Placeholder fixes + link plumbing

**Files:**
- Modify: `ways-to-help.html` (Venmo/PayPal), `contact.html` (Messenger rework), all 7 `*.html` (extensionless internal links), `js/main.js` (active-link fix)
- Create: `tools/check_links.py`

**Interfaces:**
- Produces: `tools/check_links.py` — repo-wide internal link/asset checker used by every later gate. Exit 0 = clean.

- [ ] **Step 1:** `ways-to-help.html`: Venmo button `href="https://venmo.com/u/rosalieandfriends"`; PayPal button stays `https://www.paypal.com` with visible label unchanged and an HTML comment `<!-- TODO(owner): swap for real PayPal link -->`.
- [ ] **Step 2:** `contact.html`: delete the dead `<form>` block; replace with a Messenger panel reusing existing card classes:

```html
<div class="contact-card">
  <h3>Message Us</h3>
  <p>The fastest way to reach us — we run on Facebook.</p>
  <a href="https://m.me/rosalieandfriends" target="_blank" rel="noopener" class="btn btn-primary" style="width:100%;justify-content:center;">Message us on Facebook &rarr;</a>
</div>
```

Keep JotForm application buttons, PO Box, Facebook link. Fill the empty anchor text at contact.html:102 (foster JotForm) with "Foster Application".
- [ ] **Step 3:** All pages: convert internal hrefs to extensionless root-relative (`index.html`→`/`, `about.html`→`/about`, etc.) including navbar, overlay, footer, in-page CTAs. Asset paths → root-relative (`/css/styles.css`, `/js/main.js`, `/images/...`).
- [ ] **Step 4:** `js/main.js` active-link logic — replace the `.html`-based match:

```js
const path = window.location.pathname.replace(/\/$/, "") || "/";
document.querySelectorAll('.navbar__links a, .nav-overlay a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === path || (path === "/" && href === "/")) link.classList.add('active');
});
```

- [ ] **Step 5:** Write `tools/check_links.py`:

```python
"""Verify every internal href/src in *.html resolves to a file. Extensionless links map to <name>.html; '/' maps to index.html."""
import re, sys, pathlib
root = pathlib.Path(".")
errs = []
for page in root.glob("*.html"):
    for attr, url in re.findall(r'(href|src)="([^"]+)"', page.read_text(encoding="utf-8")):
        u = url.split("#")[0].split("?")[0]
        if not u or u.startswith(("http", "mailto:", "tel:", "data:")): continue
        p = u.lstrip("/")
        target = root / ("index.html" if p == "" else p)
        if not target.exists() and not (root / (p + ".html")).exists():
            errs.append(f"{page.name}: {url}")
print("\n".join(errs) or "OK: all internal links resolve")
sys.exit(1 if errs else 0)
```

- [ ] **Step 6:** Run `py tools/check_links.py` → `OK`. Preview with `npx serve .` and click through all 7 pages + hamburger nav.
- [ ] **Step 7:** Commit: `git commit -am "fix: real Venmo, Messenger contact, extensionless links + link checker"`

### Task 5: GATE 2 — content review panel (Workflow)

- [ ] **Step 1:** Workflow with 3 adversarial reviewers: (a) placeholder hunter (`grep -rin "placedog\|lorem\|TODO\|placeholder"` + fictional-dog-name sweep: Biscuit/Luna/Willow etc. absent unless real); (b) claims auditor (every visible dog/org claim on every page vs content-sources.md); (c) link auditor (runs check_links.py + verifies external URLs' shape: both JotForm IDs unchanged from mock, venmo /u/ path, m.me handle). Schema: findings list.
- [ ] **Step 2:** Verify each finding against the code (kill false positives), fix real ones, re-run finders that had findings. Commit: `git commit -am "gate2: content review fixes"`

### Task 6: Design polish (INLINE — invoke frontend-design skill first)

**Files:**
- Modify: `css/styles.css`, all `*.html` as needed, `images/` (any new brand assets)

- [ ] **Step 1:** Invoke `frontend-design:frontend-design`; set direction: warm, hand-crafted rescue feel anchored on the real mascot photo; "fospice and fixer uppers" leads; must not read as a generic template.
- [ ] **Step 2:** Apply polish: hero uses a real harvested photo (not placedog); mascot brand moments (navbar mark, section dividers or paw motif if tasteful); typography rhythm/scale pass; card hover restraint; focus-visible states; `prefers-reduced-motion` respected; mobile spacing pass at 360px/768px.
- [ ] **Step 3:** Screenshot loop: `npx serve . &` then Playwright chromium screenshots of all 7 pages at 1440px and 390px; iterate until composed.
- [ ] **Step 4:** `py tools/check_links.py` still OK. Commit: `git commit -am "design: polish pass (frontend-design)"`

### Task 7: GATE 3 — design review panel (Workflow)

- [ ] **Step 1:** Workflow: 4 critics on the screenshots + code — visual hierarchy, WCAG AA (contrast ratios computed from styles.css values, alt text, focus, reduced-motion), responsive (390px screenshots), cold-read first-time visitor ("what is fospice? where do I donate? can I find a dog in 10 seconds?"). Adversarial verify pass on findings, then fix.
- [ ] **Step 2:** Re-screenshot changed pages, confirm fixes. Commit: `git commit -am "gate3: design review fixes"`

### Task 8: Production hardening

**Files:**
- Create: `vercel.json`, `robots.txt`, `sitemap.xml`, `404.html`, `tools/make_icons.py`, `images/favicon-32.png`, `images/apple-touch-icon.png`, `images/og-image.jpg`, `favicon.ico`
- Modify: all `*.html` heads (favicon set, OG/Twitter tags), `index.html` (JSON-LD)

- [ ] **Step 1:** `tools/make_icons.py` (center-crop mascot square → 32px, 180px, ICO; og-image 1200×630: mascot on `#FAF6F0`-style brand cream, offset left, no text):

```python
from PIL import Image, ImageOps
m = ImageOps.exif_transpose(Image.open("images/mascot.jpg")).convert("RGB")
s = min(m.size); sq = m.crop(((m.width-s)//2, (m.height-s)//2, (m.width+s)//2, (m.height+s)//2))
sq.resize((32,32), Image.LANCZOS).save("images/favicon-32.png")
sq.resize((180,180), Image.LANCZOS).save("images/apple-touch-icon.png")
sq.resize((48,48), Image.LANCZOS).save("favicon.ico")
og = Image.new("RGB", (1200,630), "#FAF6F0")
d = sq.resize((470,470), Image.LANCZOS); og.paste(d, (80,80)); og.save("images/og-image.jpg", "JPEG", quality=88)
print("icons done")
```

(Adjust cream hex to the actual `--color-cream` in styles.css.)
- [ ] **Step 2:** Every page `<head>`: replace jpeg favicon line with icon set + canonical + OG/Twitter block (per-page title/description/canonical URL, shared og:image):

```html
<link rel="icon" href="/favicon.ico" sizes="48x48" />
<link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32.png" />
<link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
<link rel="canonical" href="https://rosalieandfriends.org/PAGE" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Rosalie and Friends" />
<meta property="og:title" content="PAGE-TITLE" />
<meta property="og:description" content="PAGE-DESC" />
<meta property="og:url" content="https://rosalieandfriends.org/PAGE" />
<meta property="og:image" content="https://rosalieandfriends.org/images/og-image.jpg" />
<meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
```

- [ ] **Step 3:** `index.html` JSON-LD before `</head>`:

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"NGO","name":"Rosalie and Friends Inc.",
"url":"https://rosalieandfriends.org","logo":"https://rosalieandfriends.org/images/apple-touch-icon.png",
"description":"Pensacola, FL 501(c)(3) dog rescue dedicated to fospice and fixer uppers.",
"address":{"@type":"PostalAddress","postOfficeBoxNumber":"11553","addressLocality":"Pensacola","addressRegion":"FL","postalCode":"32524","addressCountry":"US"},
"sameAs":["https://www.facebook.com/rosalieandfriends"],"taxID":"47-4412072","nonprofitStatus":"Nonprofit501c3"}
</script>
```

- [ ] **Step 4:** `vercel.json`:

```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [{
    "source": "/(.*)",
    "headers": [
      {"key": "X-Content-Type-Options", "value": "nosniff"},
      {"key": "X-Frame-Options", "value": "SAMEORIGIN"},
      {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"},
      {"key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()"}
    ]
  }]
}
```

- [ ] **Step 5:** `robots.txt` (`User-agent: *` / `Allow: /` / `Sitemap: https://rosalieandfriends.org/sitemap.xml`); `sitemap.xml` with the 7 canonical URLs; `404.html` on-brand ("This pup wandered off") linking home + dogs, reusing site nav/footer.
- [ ] **Step 6:** Lighthouse against `npx serve` using Playwright's chromium: `npx lighthouse http://localhost:3000 --chrome-flags="--headless" --output=json --output-path=lh.json` with `CHROME_PATH` pointed at Playwright chromium. Fix until ≥90 × 4 categories on home + dogs pages.
- [ ] **Step 7:** `py tools/check_links.py` → OK. Commit: `git commit -am "prod: icons, og cards, schema, sitemap, vercel config, 404"`

### Task 9: GATE 4 — repo-ship-gate (both gates)

- [ ] **Step 1:** Invoke `repo-ship-gate` skill. Gate 1: clone to a throwaway dir, `npx serve` from the clone, click through, run check_links.py, confirm README (write a short README.md in this step: what the site is, how to preview, how to update a dog card, deploy notes). Gate 2: full-tree + full-history secret/PII sweep (fosters/adopters/applicants must not appear; PO Box/EIN are public-record and stay; harvested photos are of dogs, fine).
- [ ] **Step 2:** Fix findings, commit: `git commit -am "gate4: ship-gate fixes + README"`

### Task 10: Deploy — GitHub → Vercel → DNS ([OWNER] steps marked)

- [ ] **Step 1:** `gh repo create CJud25/rosalie-and-friends-site --public --source . --push` (public: it's a public website; also a portfolio artifact).
- [ ] **Step 2 [OWNER]:** Vercel: user logs in at vercel.com with GitHub → Add New Project → import `rosalie-and-friends-site` → Framework Preset "Other", no build command, output dir default → Deploy. (Offer to drive via claude-in-chrome together.)
- [ ] **Step 3:** Verify the `*.vercel.app` preview URL: every page 200, images load, clean URLs work, 404 page works.
- [ ] **Step 4 [OWNER]:** Vercel → Project → Settings → Domains → add `rosalieandfriends.org` and `www.rosalieandfriends.org` (www redirects to apex). Vercel shows required records — use THOSE values; expected shape: `A @ 76.76.21.21`, `CNAME www cname.vercel-dns.com`.
- [ ] **Step 5 [OWNER]:** Porkbun → rosalieandfriends.org → DNS: delete conflicting default A/ALIAS/CNAME records, add the two records above. (Offer browser-drive.)
- [ ] **Step 6:** Wait for propagation (minutes–hours). Verify: `nslookup rosalieandfriends.org` → 76.76.21.21; https://rosalieandfriends.org loads with valid cert; www redirects.
- [ ] **Step 7:** GATE 5 — post-deploy Workflow/agent against the LIVE domain: all 7 pages + 404 status/content, og-card check via a share-debugger-style fetch of meta tags, external links resolve (JotForm ×2, Venmo, m.me, Facebook), sitemap/robots reachable.
- [ ] **Step 8:** Commit any final fixes; tag `v1.0.0`; hand the user the launch checklist (share on Facebook, update page's website field).

---

## Self-review notes

- Spec coverage: all 5 phases + gates mapped (T1/T2 = Phase1+Gate1, T3-T5 = Phase2+Gate2, T6/T7 = Phase3+Gate3, T8/T9 = Phase4+Gate4, T10 = Phase5+Gate5). Success criteria each land in a task (mascot T1/T8, sourced dogs T1-T3, zero placeholders T5, Lighthouse T8, og-card T8/T10, $0 T10).
- Types/interfaces: content-sources.md format defined once (T1) and consumed (T3, T5); check_links.py defined (T4) and reused (T6, T8, T9).
- Placeholder scan: none — every code step shows the code; gate workflow scripts are authored at run time by design (their contracts and schemas are specified in the gate tasks).
