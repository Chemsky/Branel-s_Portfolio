#!/usr/bin/env python3
"""Recompute the Content-Security-Policy hashes in vercel.json.

The site's CSP only allows the exact inline <script> and <style> blocks in
index.html. Run this after editing either block, then commit both files:

    python3 scripts/update_csp.py
"""
import base64, hashlib, json, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text(encoding="utf-8")

def hashes(tag):
    blocks = re.findall(rf"<{tag}>(.*?)</{tag}>", html, flags=re.S)
    if not blocks:
        raise SystemExit(f"No inline <{tag}> block found in index.html")
    return " ".join(
        "'sha256-" + base64.b64encode(hashlib.sha256(b.encode("utf-8")).digest()).decode() + "'"
        for b in blocks
    )

csp = "; ".join([
    "default-src 'none'",
    f"script-src {hashes('script')}",
    f"style-src {hashes('style')} https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
])

cfg_path = root / "vercel.json"
cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
for rule in cfg["headers"]:
    for h in rule["headers"]:
        if h["key"] == "Content-Security-Policy":
            h["value"] = csp
cfg_path.write_text(json.dumps(cfg, indent=2) + "\n", encoding="utf-8")
print("Updated CSP:\n" + csp)
