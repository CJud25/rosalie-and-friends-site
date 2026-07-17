"""Inject canonical + OG/Twitter meta and the favicon set into every page head.

Idempotent: skips a page if og:site_name is already present. Run from repo root.
"""
import pathlib, re

BASE = "https://rosalieandfriends.org"
PAGES = {
    "index.html": ("/", "Rosalie and Friends | Fospice & Fixer Upper Dog Rescue, Pensacola FL"),
    "dogs.html": ("/dogs", "Meet the Dogs | Rosalie and Friends"),
    "fospice.html": ("/fospice", "Fospice Program | Rosalie and Friends"),
    "foster.html": ("/foster", "Foster | Rosalie and Friends"),
    "ways-to-help.html": ("/ways-to-help", "Ways to Help | Rosalie and Friends"),
    "about.html": ("/about", "About Us | Rosalie and Friends"),
    "contact.html": ("/contact", "Contact | Rosalie and Friends"),
    "404.html": (None, None),  # no canonical/og for the error page, icons only
}

ICONS = """  <link rel="icon" href="/favicon.ico" sizes="48x48" />
  <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32.png" />
  <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />"""

def og_block(path: str, title: str, desc: str) -> str:
    url = BASE + ("" if path == "/" else path)
    return f"""  <link rel="canonical" href="{url}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Rosalie and Friends" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{desc}" />
  <meta property="og:url" content="{url}" />
  <meta property="og:image" content="{BASE}/images/og-image.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />"""

for fname, (path, title) in PAGES.items():
    f = pathlib.Path(fname)
    if not f.exists():
        print("skip (missing):", fname); continue
    t = f.read_text(encoding="utf-8")
    if 'og:site_name' in t or (path is None and 'favicon-32' in t):
        print("skip (done):", fname); continue
    m = re.search(r'<meta name="description" content="([^"]*)"', t)
    desc = m.group(1) if m else ""
    old_icon = re.search(r'\s*<link rel="icon" type="image/jpeg" href="/images/mascot\.jpg" />', t)
    block = "\n" + ICONS
    if path is not None:
        block += "\n" + og_block(path, title, desc)
    if old_icon:
        t = t.replace(old_icon.group(0), block)
    else:
        t = t.replace("</head>", block + "\n</head>")
    f.write_text(t, encoding="utf-8", newline="\n")
    print("injected:", fname)
print("done")
