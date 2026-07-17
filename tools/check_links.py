"""Verify every internal href/src in *.html resolves to a file.

Extensionless links map to <name>.html; "/" maps to index.html.
Run from the repo root: py tools/check_links.py
"""
import re, sys, pathlib

root = pathlib.Path(".")
errs = []
for page in root.glob("*.html"):
    html = page.read_text(encoding="utf-8")
    for attr, url in re.findall(r'(href|src)="([^"]+)"', html):
        u = url.split("#")[0].split("?")[0]
        if not u or u.startswith(("http://", "https://", "mailto:", "tel:", "data:")):
            continue
        p = u.lstrip("/")
        if p == "" or (root / p).exists() or (root / (p + ".html")).exists():
            continue
        errs.append(f"{page.name}: {url}")

print("\n".join(errs) or "OK: all internal links resolve")
sys.exit(1 if errs else 0)
