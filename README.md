# Branel Ong – Portfolio

A single-page portfolio site: plain HTML, CSS and a small inline script. No build step and no dependencies.

## Hosting

Deployed on **Vercel**. Every push to the production branch redeploys automatically.
`vercel.json` adds security headers to every response:

| Header | Purpose |
|---|---|
| `Content-Security-Policy` | Only the page's own inline script/style (by hash) and Google Fonts may load; no forms, no outside connections, no embedding |
| `X-Frame-Options: DENY` | Stops other sites from framing the page (clickjacking) |
| `X-Content-Type-Options: nosniff` | Stops browsers guessing file types |
| `Referrer-Policy` | Shares only the site's origin with links you follow |
| `Permissions-Policy` | Turns off camera, microphone, location and similar features |
| `Strict-Transport-Security` | Forces HTTPS |
| `Cross-Origin-Opener-Policy` | Isolates the page from windows it opens |

## Editing the site

The CSP allows the inline `<script>` and `<style>` blocks only by their exact hash.
**After changing either block in `index.html`, run:**

```bash
python3 scripts/update_csp.py
```

Then commit both `index.html` and `vercel.json`. If you skip this, the browser blocks the changed script or styles on the live site.
