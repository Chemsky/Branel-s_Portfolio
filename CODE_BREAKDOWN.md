# Code Breakdown

This file explains what each file in the portfolio does, section by section.

> Line numbers below are approximate. They drift as the files are edited, so search for the named class or function instead.

The site is a single static page with no build step, framework or dependencies. It has four files that matter:

| File | Lines | Role |
|---|---|---|
| `index.html` | ~225 | Page structure and all text: home screen plus four pop-up dialogs |
| `styles.css` | ~210 | All visual styling, light/dark theming, slider and timeline layout |
| `script.js` | ~130 | All behaviour: theme toggle, pop-ups, sliders, email buttons |
| `vercel.json` | 38 | Hosting config: clean URLs and security headers |
| `README.md` | 33 | Short project notes for editors |

---

## How the pieces fit together

```
Browser loads index.html
 ├─ <link> styles.css       → colours, layout, dark mode, slider visuals
 ├─ <link> Google Fonts     → Inter (body) and JetBrains Mono (labels/dates)
 └─ <script> script.js      → wires up every button once the page has loaded

Vercel serves every response with the headers in vercel.json
 └─ the Content-Security-Policy only allows these files plus Google Fonts
```

The home screen shows a name, a location, three links and a "Work with me" button. Each one opens a native `<dialog>` pop-up. The About and Skills pop-ups each hold a carousel of slides. The Experience pop-up shows a vertical timeline. The Contact pop-up holds the email options.

---

## 1. `index.html`: structure and content

### `<head>` (lines 3–12)

| Line(s) | What it does |
|---|---|
| 4 | `charset="utf-8"` so symbols like `◐`, `›` and `’` render correctly |
| 5 | Responsive viewport. `viewport-fit=cover` lets the page use the full screen on notched phones; the CSS then pads with `env(safe-area-inset-*)` |
| 6–7 | Page title and the search-engine description |
| 8–9 | `preconnect` hints that open connections to Google Fonts early, so the fonts load faster |
| 10 | Loads the **Inter** (400–700) and **JetBrains Mono** (500) fonts. `display=swap` shows fallback text while the fonts download |
| 11 | Loads `styles.css` |

### Theme button and background (lines 14–22)

- **`#themeBtn`** (line 14) is a fixed button in the top-right corner that toggles dark mode. Its `aria-label` names it for screen readers because `◐` alone means nothing to them.
- **`.bg`** (lines 16–22) is five empty `<span class="ring">` elements. CSS turns them into stacked concentric circles behind the content. `aria-hidden="true"` hides them from screen readers because they are decoration.

### Home screen (lines 24–37)

```html
<main class="home"> → <div class="wrap full"> → <div class="hero">
```

- `<h1>`: the name.
- `.lead`: location ("Singapore").
- `.links`: three buttons (About, Skills, Experience).
- `.btn.primary`: "Work with me".

Every button carries a **`data-open="<dialog id>"`** attribute. `script.js` reads it to know which pop-up to open. Nothing in the HTML itself runs code. That is deliberate: the security policy forbids inline `onclick` handlers.

### Carousel dialogs: About and Skills

Both share the same template:

```html
<dialog id="about" aria-labelledby="aboutTitle">
  <div class="dlg-head">                ← sticky header
    <h3 id="aboutTitle">…</h3>          ← title (also the dialog's accessible name)
    <div class="dlg-tools">
      <span class="dates count">1 / 4</span>   ← slide counter, updated by JS
      <button class="close" data-close>×</button>
    </div>
  </div>
  <div class="carousel" aria-roledescription="carousel">
    <div class="viewport">              ← visible window, clips the other slides
      <div class="track">               ← row of slides, slid sideways by JS
        <div class="slide" role="group" aria-roledescription="slide" aria-label="1 of 4">…</div>
        …
      </div>
    </div>
    <div class="controls">
      <div class="dots"></div>          ← empty; JS adds one dot per slide
      <div class="arrows"> ‹ prev  › next </div>
    </div>
  </div>
</dialog>
```

The `aria-roledescription` and `aria-label` attributes follow the WAI-ARIA carousel pattern, so screen readers announce "slide 2 of 4".

**Slide content:**

| Dialog | Slides | Content types used |
|---|---|---|
| `#about` | 4 | Summary paragraph · two `.stat` tiles (3+ years, 3 industries) · `.list` of competencies · `.edu-row` (Diploma in IT, Republic Polytechnic, 2016–2019) |
| `#skills` | 4 | Each slide is a `.chips` tag list: Support & remote access · Systems & data · Data quality management · Productivity |

### Experience dialog: timeline

`#experience` has no carousel. Inside `.tl-body` is an ordered list, `<ol class="timeline">`, with one `<li class="tl-item">` per job, newest first: Epoint System (2024–2026), Dao By Dorsett (2023–2024), Absolute Kinetic Consultancy (2021–2023). Each item has a date (`.tl-date`), job title (`.tl-title`), `.company`, and a `.list` of duties shown without bullet markers.

The vertical line is `.timeline::before`; each job's circle is `.tl-item::before`, filled in for the newest job. Every pop-up scrolls back to the top when it opens.

### Contact dialog (lines 208–231)

This dialog has no carousel. It contains:

1. **"Email me" button** (`#emailMeBtn`). `aria-expanded` and `aria-controls="mailChoice"` tell assistive tech that the button shows and hides a panel.
2. **`#mailChoice`**, hidden at first, with two links:
   - **Use my Gmail**: a Gmail web compose URL with the recipient and subject filled in.
   - **Use my Outlook**: an Outlook.com compose deep link with the same fields.
   - Both use `target="_blank" rel="noopener noreferrer"` so the new tab cannot reach back into this page.
   - `data-app="gmail"` / `data-app="outlook"` let `script.js` swap in the mobile app link on phones.
3. **Email row**: the address as plain text (CSS makes one click select all of it) and a **"Copy email"** button (`#copyBtn`).

### Script tag (line 233)

`<script src="script.js">` sits at the end of `<body>`, so every element already exists when the script runs. No `DOMContentLoaded` wait is needed.

---

## 2. `script.js`: behaviour

The whole file is wrapped in an IIFE, `(function () { … })();`, so none of its variables leak into the global scope. It is written in ES5 (`var`, `function`, `Array.prototype.forEach.call`), so it runs in older browsers too.

### 2.1 Theme toggle (lines 4–12)

```js
try { var saved = localStorage.getItem('theme'); … root.setAttribute('data-theme', saved); } catch (e) {}
```

1. **On load:** if the visitor picked a theme earlier, read it from `localStorage` and set `data-theme="dark"` or `"light"` on `<html>`. The `try/catch` keeps the page working where storage is blocked (private mode, disabled cookies).
2. **On click:** work out the current theme. That is the `data-theme` attribute if set, otherwise the OS setting via `matchMedia('(prefers-color-scheme: dark)')`. Flip it, apply it, and save it.

The CSS reacts to the `data-theme` attribute (see §3.1), so the script never touches colours directly.

> The saved theme is applied when the script runs at the end of `<body>`. A visitor whose saved choice differs from their OS setting may see a brief flash of the wrong theme on load.

### 2.2 Copy email (lines 14–20)

- Uses the async Clipboard API (`navigator.clipboard.writeText`).
- On success, the button reads **"Copied"** for 1.6 seconds, then resets.
- If the API is missing (old browser, non-HTTPS) or the write fails, the button reads **"Select the email to copy"**. CSS `user-select: all` on the address makes that a single click.

### 2.3 Carousel engine: `makeCarousel(dlg)` (lines 22–63)

This runs once for every `<dialog>` that contains a `.carousel`.

| Part | Lines | What it does |
|---|---|---|
| Setup | 24–29 | Finds the viewport, track, slides, dots container and counter. `index` holds the current slide |
| Dot creation | 30–36 | Builds one `<button class="dot">` per slide, labelled "Go to slide N", which calls `go(n)` |
| `fit()` | 37 | Sets the viewport height to the current slide's height, so short slides don't leave empty space. CSS animates the change |
| `go(n)` | 38–45 | The core function: |
| | 39 | Wraps the index around with `(n + length) % length`, so "next" on the last slide returns to the first |
| | 40 | Moves the track with `translateX(-100% × index)` |
| | 41 | Marks the active dot with `aria-current="true"` (CSS stretches it into a pill) |
| | 42 | Sets `aria-hidden` on the off-screen slides so screen readers skip them |
| | 43 | Updates the "2 / 4" counter |
| | 44 | Calls `fit()` |
| Arrow buttons | 46–47 | Previous/next |
| Keyboard | 48–51 | ← / → keys anywhere inside the open dialog change the slide |
| Swipe | 52–58 | Records `clientX` on `pointerdown`. On `pointerup`, a horizontal move of more than 40 px goes to the next or previous slide. Works for touch, mouse and pen. CSS `touch-action: pan-y` keeps vertical scrolling native |
| Scroll guard | 59 | Resets `scrollLeft` to 0. When keyboard focus lands on a link inside a hidden slide, the browser would otherwise scroll the viewport sideways and break the layout |
| Resize | 60 | Re-fits the height on window resize while the dialog is open (text rewraps, so the height changes) |
| `dlg.reset` | 61 | Attaches a function to the dialog element so that opening a dialog always starts on slide 1 |

Line 63 runs `makeCarousel` on every dialog that has a `.carousel`, which skips `#contact`.

> Setting `element.style.height` and `.transform` from JavaScript is allowed under the site's CSP. The policy only blocks inline `style="…"` attributes written in the HTML.

### 2.4 "Email me" toggle (lines 65–71)

Clicking the button shows or hides `#mailChoice` by flipping its `hidden` attribute, and keeps `aria-expanded` in sync.

### 2.5 Mobile mail-app deep links (lines 73–104)

The goal: on a phone, tapping "Use my Gmail" opens the **Gmail app** rather than a cramped web page. If the app isn't installed, the web version opens instead.

| Part | What it does |
|---|---|
| `isIOS` | Matches iPhone/iPad/iPod in the user agent. It also catches **iPadOS 13+**, which reports itself as `MacIntel`, by checking `maxTouchPoints > 1` |
| `isAndroid` | Matches `Android` in the user agent |
| `APPS` | Per-app identifiers: iOS URL schemes (`googlegmail://`, `ms-outlook://`) and Android package names |
| `appUrl()` | **iOS:** builds a scheme URL such as `googlegmail://co?to=…&subject=…`. **Android:** builds an `intent:` URL that targets the app's package and includes `S.browser_fallback_url`, so Chrome opens the web link automatically if the app is missing |
| Click handler | On desktop it returns early and the normal link opens the web version in a new tab. On mobile it cancels the default action and navigates to the app URL |
| iOS fallback | iOS has no built-in fallback, so a 1.5-second timer starts. If the page is still visible when it fires (the app didn't open), it goes to the web URL. A `visibilitychange` listener cancels the timer as soon as the app takes over |

### 2.6 Pop-up open/close (lines 106–117)

- **`openDialog(id)`**: opens a dialog with the native `showModal()`, which provides the backdrop, focus trap and **Esc to close** for free. Then calls `reset()` to start on slide 1.
- Every `[data-open]` button opens its matching dialog.
- Every dialog closes when its `[data-close]` (×) button is clicked, or when the user **clicks the backdrop**. A click on the backdrop reports the `<dialog>` element itself as `e.target`; a click inside reports a child element.

### 2.7 Deep linking with a hash (lines 119–121)

If the URL ends in `#about`, `#skills`, `#experience` or `#contact`, that dialog opens on load. A whitelist check ensures only known IDs are accepted. This allows links such as `yoursite.com/#contact`.

---

## 3. `styles.css`: presentation

### 3.1 Design tokens and theming (lines 1–62)

All colours, the corner radius, shadows and fonts are **CSS custom properties** on `:root`. Components only ever use `var(--token)`.

| Token group | Purpose |
|---|---|
| `--bg`, `--surface`, `--text`, `--muted`, `--line` | Base palette for dialogs and cards |
| `--accent`, `--accent-soft`, `--on-accent` | Brand blue, its pale tint, and text drawn on top of it |
| `--page`, `--ring-*`, `--ring-shadow`, `--page-*` | Home-screen-only palette (background rings and hero text) |
| `--scrim` | Dialog backdrop dim |
| `--font-body`, `--font-mono` | Inter / JetBrains Mono, each with system fallbacks |

**Dark mode** is set in two places with identical values:

1. `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }` follows the OS setting unless the user chose light.
2. `:root[data-theme="dark"] { … }` applies when the user chose dark with the button.

Together these give three states: follow the OS, forced light, forced dark. `color-scheme: dark` also darkens native widgets such as scrollbars.

> The dark overrides do **not** redefine `--page`, `--ring-*` or `--page-*`. The home screen therefore stays light in dark mode; only the dialogs switch to dark. The `.theme-btn` rules use `!important` on the `--page-*` colours for the same reason. This appears to be a deliberate design choice.

### 3.2 Base and accessibility (lines 64–82)

- `box-sizing: border-box` on everything.
- `prefers-reduced-motion: reduce` turns off **all** transitions and animations (slides, dialog pop-in) for users who ask their OS for less motion.
- `:focus-visible` shows a 2 px blue outline for keyboard users only.
- `.wrap` is the centred content column (max 880 px) with safe-area padding for notched phones.

### 3.3 Home screen (lines 84–130)

| Selector | What it does |
|---|---|
| `.theme-btn` | Fixed top-right, offset by the safe-area inset |
| `main.home` | `min-height: 100dvh` plus flexbox centres the hero vertically. `dvh` accounts for mobile browser toolbars |
| `.bg` / `.ring` | Full-screen fixed layer. Each ring is absolutely centred with `translate(-50%,-50%)` and sized as a multiple of `--d = max(440px, 60vmin)` (×1.62, 1.46, 1.31, 1.15, 1). Each ring is a shade lighter towards the centre, and a soft shadow gives a layered "ripple" look. `pointer-events: none` keeps the rings from blocking clicks |
| `h1`, `.lead` | `clamp()` font sizes that scale smoothly with the viewport. `text-wrap: balance` evens out line lengths |
| `.links` / `.link` | Centred row of text buttons with an underline that turns blue on hover |
| `.btn`, `.btn.primary` | Button style; primary is filled blue |

### 3.4 Contact dialog (lines 131–160)

- Centres everything in a column.
- The × button is absolutely positioned so the title stays centred.
- `.mail-wrap[hidden] { display: none; }` is needed because `.mail-wrap { display: grid }` would otherwise override the `hidden` attribute.
- `.email` has `user-select: all` (one click selects the whole address) and `overflow-wrap: anywhere` (long addresses wrap on small screens).

### 3.5 Dialogs (lines 162–183)

| Selector | What it does |
|---|---|
| `dialog` | Width `min(680px, 100vw − 32px)`, max height `100dvh − 32px`, scrolls inside if taller, rounded with a large shadow |
| `dialog::backdrop` | Dim scrim plus a 2 px blur of the page behind |
| `dialog[open]` + `@keyframes pop` | 0.22 s fade-and-rise entrance |
| `.dlg-head` | **Sticky** header, so the title and × stay visible while scrolling long slides |
| `.dates`, `.slide-label` | Monospace with tabular numbers, so "1 / 4" doesn't shift width |
| `.company` | Blue, semi-bold employer name |

### 3.6 Carousel (lines 185–216)

| Selector | What it does |
|---|---|
| `.viewport` | `overflow: clip` hides the off-screen slides (`hidden` is listed first as a fallback). `transition: height .3s` animates the height `fit()` sets |
| `.track` | A flex row. `transition: transform .45s cubic-bezier(.2,.7,.2,1)` produces the eased slide. `align-items: flex-start` lets each slide keep its own height, which `fit()` relies on |
| `.slide` | `flex: 0 0 100%`: each slide is exactly one viewport wide |
| `.list`, `.chips`, `.stats`, `.edu-row` | The four slide content layouts (bullets, tags, two-column stat tiles, education row) |
| `.controls` | **Sticky** to the bottom of the dialog, so the arrows and dots stay reachable |
| `.dot[aria-current="true"]` | The active dot stretches from 9 px to a 24 px pill. Styling from the ARIA state keeps the visuals and accessibility in sync |

### 3.7 Mobile (lines 217–221)

Below 560 px, the stat tiles stack into one column and the padding tightens.

---

## 4. `vercel.json`: hosting and security

| Setting | Effect |
|---|---|
| `cleanUrls: true` | Serves `/page` instead of `/page.html` |
| `headers` → `source: "/(.*)"` | Applies the headers below to **every** response |

**Content-Security-Policy**, directive by directive:

| Directive | Meaning |
|---|---|
| `default-src 'none'` | Block everything not explicitly allowed below |
| `script-src 'self'` | Only `script.js` from this site; no inline scripts, no `eval` |
| `style-src 'self' https://fonts.googleapis.com` | Only `styles.css` and the Google Fonts stylesheet; no inline `<style>` or `style="…"` |
| `font-src https://fonts.gstatic.com` | Font files only from Google |
| `img-src 'self' data:` | Images only from this site or `data:` URIs |
| `connect-src 'none'` | No `fetch`/XHR/WebSocket at all. The site needs none |
| `base-uri 'none'` | Blocks `<base>` tag injection |
| `form-action 'none'` | No form may submit anywhere |
| `frame-ancestors 'none'` | No site may embed this page (modern form of `X-Frame-Options`) |
| `upgrade-insecure-requests` | Rewrites any `http://` request to `https://` |

**Other headers:**

| Header | Effect |
|---|---|
| `X-Content-Type-Options: nosniff` | Browser must trust the declared file type |
| `X-Frame-Options: DENY` | Clickjacking protection for older browsers |
| `Referrer-Policy: strict-origin-when-cross-origin` | Other sites see only the domain, not the full URL |
| `Permissions-Policy` | Disables camera, microphone, geolocation, payment, USB and FLoC tracking |
| `Strict-Transport-Security` | HTTPS only for 2 years, including subdomains, eligible for browser preload lists |
| `Cross-Origin-Opener-Policy: same-origin` | Isolates this window from cross-origin windows it opens |

This policy is why the README says to keep all code in `styles.css` and `script.js`: anything inline in `index.html` would be blocked.

---

## 5. Issues found during the review

Items 1–4 and 6–8 were fixed in a later clean-up. Nothing on screen changed: every view was compared pixel for pixel before and after.

| # | Issue | Status |
|---|---|---|
| 1 | Selector-less leftover block in `styles.css` that made the browser drop the next rule | **Fixed**: removed, along with the unused `.btn[disabled]` |
| 2 | `.btn`, `.btn.primary`, `.btn:hover` defined twice | **Fixed**: merged into one set (same values that were winning) |
| 3 | Outdated header comment in `styles.css` | **Fixed** |
| 4 | Unused `--ok`, `--err`, `--bg`, `--radius`, `--shadow` and `.highlight` | **Fixed**: removed. Duplicate `.theme-btn`, `main.home`, `.mail-choice` and `.contact` rules were also merged |
| 5 | Dao By Dorsett lists two pairs of similar duties (Level 1 support; Oracle accounts) | **Content choice**: left as written |
| 6 | A swipe released outside the slider could leave a stale start point | **Fixed**: cleared on `pointercancel` / `pointerleave` |
| 7 | One `resize` listener per carousel | **Fixed**: a single shared listener refits whichever pop-up is open |
| 8 | Email address repeated in `script.js` | **Fixed** in `script.js` (one `MAIL_TO` constant). It still appears in `index.html` (visible text and two links), which must be edited too if the address changes |

Also fixed in the same pass:

- **"Copy email" failure text stuck.** If copying failed, the button kept saying "Select the email to copy". It now reverts after 3 seconds.
- **Pop-ups reopened mid-scroll.** Closing Experience after scrolling and reopening it kept the old position. Every pop-up now opens at the top.
- **iPhone app fallback.** Tapping Use my Gmail/Outlook twice could queue two fallback redirects. Now only the latest one runs, and it's cancelled as soon as the app opens.
