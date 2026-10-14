# Personal academic website

Plain static site: HTML + CSS + a little JavaScript. No build step, no Node.

## Find and replace the placeholders
Everything to personalise is in `index.html`. Placeholders are mostly replaced; see the TODO comments (for example
`grep -n TODO index.html`). Also replace `username.github.io` (canonical / Open Graph URLs).
Optional files to add: `assets/photo.jpg` (profile photo), `assets/cv.pdf`, `assets/pubs/*.webp` (publication thumbnails, about 400x280, shown at 168x116; set via `thumb` in `publications.bib`).

- **News**: add an `<li>` at the top of the list in the News section.
- **Publications**: edit `publications.bib`, then run `python3 scripts/build_publications.py` (stdlib only). Custom fields `pdf`, `code`, `arxiv`, `project`, `video`, `thumb`, `selected`; set `MY_NAME` in the script to bold your name.
- **Colours / fonts**: CSS variables at the top of `css/style.css`.

## Run locally
```
cd personal-website && python3 -m http.server 8000
```
Open http://localhost:8000.

## Hero banner
`index.html` has a full-bleed banner: the golden sun picture (`assets/intro/web/hero.webp`) in the light theme and the throne
(`web/hero-throne.webp`, falling back to `web/throne-wide.webp`) in the dark "Tsukuyomi" theme; they crossfade when the theme
is toggled. The banner height and the name's position are identical in both themes (only the colours differ), so toggling never moves anything.
`data-pos-sun` / `data-pos-night` on `.hero-banner` set which part of each picture stays visible. An optional red
Sharingan glow over the sun picture's eyes is off by default: set `data-glow="on"` and the eye positions in `data-eye-left` /
`data-eye-right` (fractions of the image, `"x,y"`).

## The intro animation
Plays on a first visit only (remembered in `localStorage` as `genjutsu-seen`, set as soon as it starts); with
"reduce motion" enabled it never plays automatically (an explicit replay still does). Any click, key, or touch skips it (there is no visible skip button; a hidden one remains for keyboard and screen-reader users).
Story (about 6 s): Itachi points at you, his body dissolves into crows, the Mangekyo Sharingan card (black and white, then a glitchy jitter into colour) with "You are already under my genjutsu.", then the glass shatters and the homepage is revealed.

- **Replay**: add `?intro=1` to the URL (http://localhost:8000/?intro=1) or use the Sharingan button in the nav / "Replay intro" in the footer. The intro counts as seen only once it actually plays (or is skipped), so a visit where the frames load too slowly does not use it up.
- **Timings**: edit the `CONFIG` object at the top of `js/intro.js`. `totalDuration` (default 6.2 s) scales the whole
  thing (try `5.0`). The anime frames play at `fps: 12`; the other marks (`eyeHold`, `revealDur`, `exitDur`, ...)
  are in seconds of the natural timeline. Crow knobs: `crowDensity` (multiplies all crow counts), `flapSpeed`,
  `dissolveCrows` / `eyeCrows` / `reformCrows` / `exitCrows`, `redEyeShare`, `featherCount`, `featherLinger`.
  Other knobs: `returningVisitor` (`'none'` or `'flash'`), `loadMax` / `loadMaxForced`, `shardCols`/`shardRows`, the text.
- **Assets** (all under `assets/intro/`, about 1.3 MB in total):
  - `web/point-*.webp`, `web/dissolve-*.webp`: the anime frame sequences (1920x1080 WebP).
    The frame numbers in use are listed in `CONFIG.sequences`; ghosted (blended) source frames were left out.
  - `web/eye-*.webp`: real eye footage shown as a graded widescreen band on the title card (frames 1-5 activation, 6-20 ping-pong loop). Empty `CONFIG.eyeSeq.ids` = the drawn Mangekyo.
  - `web/hero-sun.webp` etc.: the homepage banner images (also `web-sm/` versions of everything, for phones).
  - `crow/crow-side.png`: the raven flap sprite (8 frames, original artwork, see `crow/CREDITS.md`).
  - The full-resolution source frames live **outside** the site in `../personal-website-source-frames/`
    so they are not published. To use other frames, convert them to 1920-wide WebP into `web/` and edit `CONFIG.sequences`.
- **Loading**: GSAP (self-hosted in `js/vendor/`, CDN copy as fallback) and all the images load in parallel from the
  moment `intro.js` starts, and the intro begins once both are ready. The time budget runs from that start: `loadMax`
  (9 s) for the automatic first-visit intro, `loadMaxForced` (20 s) for an explicit replay. If they are not ready in
  time, or any asset is missing, the intro is skipped and the site is shown at once (and not marked as seen). A tiny
  spinning tomoe appears if loading takes more than 0.4 s. The last-resort timeout in the `<head>` script of
  `index.html` (18 s, or 35 s for a replay) must stay above `loadMax`/`loadMaxForced` + `totalDuration` + `safetyExtra`, plus a little for the boot delay.
- **Framing on phones**: each sequence has `focus` (desktop) and `focusMobile` (portrait), CSS object-position style
  values like `'40% 40%'`, choosing which part of the 16:9 frame stays visible. Same for the throne image.
- **Preview a single frame**: `http://localhost:8000/?intro=1&at=2.5` builds the intro, jumps to 2.5 real seconds
  (after `totalDuration` scaling) and pauses there. In this mode all timers, skip handling, the `localStorage`
  write and URL cleanup are disabled. Use it to tune framing (`focus` / `focusMobile`) and take screenshots of each
  beat (try `at=0.9` pointing, `2.4` dissolve, `3.5` eye, `5.2` throne reveal).
  Normal `?intro=1` runs remove `intro` from the address bar after starting, so a reload does not replay.
- **Credits**: the intro artwork credit line lives in the footer of `index.html`.

## Deploy to GitHub Pages
1. Create a repo named exactly `username.github.io` (your GitHub username).
2. Push the contents of this folder to the `main` branch:
   ```
   git init && git add . && git commit -m "Initial site"
   git branch -M main
   git remote add origin git@github.com:username/username.github.io.git
   git push -u origin main
   ```
3. On GitHub: Settings, Pages, Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
4. The site appears at https://username.github.io within a minute or two.

## Custom domain
1. Create a file named `CNAME` in the site root containing only your domain, e.g. `www.example.com`.
2. At your registrar's DNS settings add four `A` records for the apex domain pointing to
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`,
   and a `CNAME` record for `www` pointing to `username.github.io`.
3. In Settings, Pages, enter the domain and tick "Enforce HTTPS" once the certificate is ready (can take up to an hour).

`404.html` is served automatically by GitHub Pages for missing URLs. It uses absolute paths (`/css/style.css`, `/assets/...`, `/`) because it is shown at any depth, so it assumes a user site at the domain root.

## Easter eggs (spoilers)
- **Konami code** (up up down down left right left right B A): replays the intro.
- **Type "sharingan"** anywhere (not in a form field, mouse devices only): the cursor becomes a spinning Mangekyo for 6 seconds.
- **Click the little crow** at the end of a section title: it flies off, drops a feather, and comes back after about 10 s.
- **Open the browser console**: there is a small message.
- Also: the mouse cursor is a feather on desktop (`assets/cursor-feather.png`, `@2x`), and feathers drift through the banner. All of it is off with "reduce motion".

## Link preview image, icons, print
- `assets/og-image.jpg` is the link-preview picture. Regenerate it with your real name: `python3 scripts/make_og_image.py "Madhav Iyengar" "PhD Student · University of Tübingen"` (needs Pillow). After deploying, make the `og:image` / `twitter:image` URLs in `index.html` absolute.
- Icons: `assets/favicon.svg`, `favicon-16/32.png`, `apple-touch-icon.png`, `icon-192/512.png`, `site.webmanifest`.
- Printing the page (or saving as PDF) gives a plain black-on-white version without the banner and nav.
- Opening a deep link such as `/#publications` skips the intro and does not mark it as seen.
