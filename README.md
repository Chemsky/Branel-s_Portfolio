# Branel Ong – Portfolio

A single-page portfolio site: plain HTML, CSS and a small inline script. No build step and no dependencies.

## Hosting

Deployed on **Vercel**. Every push to the production branch redeploys automatically.
`vercel.json` adds security headers to every response:

| Header | Purpose |
|---|---|
| `Content-Security-Policy` | Only the site's own files and Google Fonts may load; no inline code, no forms, no outside connections, no embedding |
| `X-Frame-Options: DENY` | Stops other sites from framing the page (clickjacking) |
| `X-Content-Type-Options: nosniff` | Stops browsers guessing file types |
| `Referrer-Policy` | Shares only the site's origin with links you follow |
| `Permissions-Policy` | Turns off camera, microphone, location and similar features |
| `Strict-Transport-Security` | Forces HTTPS |
| `Cross-Origin-Opener-Policy` | Isolates the page from windows it opens |

## Files

| File | Contents |
|---|---|
| `index.html` | Page content and pop-ups |
| `styles.css` | All styling |
| `script.js` | Pop-ups, sliders, theme toggle, Email me and Copy email |
| `vercel.json` | Security headers |

## Editing the site

Edit any file and push. No extra steps are needed.

Keep all code in `styles.css` and `script.js`. The security policy blocks inline `<script>` blocks, `<style>` blocks, `style="…"` attributes and `onclick="…"`-type attributes in `index.html`. Add new outside resources (another font, an analytics script) to the `Content-Security-Policy` in `vercel.json`, or the browser will block them.
