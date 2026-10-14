# Intro image sources

All images are (c) Masashi Kishimoto / Shueisha / Studio Pierrot (Naruto Shippuden). Fan/wallpaper reproductions, local development use only.
Direct URLs are on wallpapercave.com (prefix https://wallpapercave.com).

## Installed
- fingers.jpg: Itachi's final forehead poke (rain, bloodied Sasuke left, Itachi right). Wallpaper-style art of the scene.
  - Source page: https://wallpapercave.com/itachi-x-sasuke-wallpapers
  - Direct: https://wallpapercave.com/wp/wp9061412.jpg
  - Original: 2880x1800 (installed resized to 2560 wide)
- throne.jpg: Itachi seated on the stone throne (anime screenshot, 1280x720, small logo bottom-right/top-right).
  - Source page: https://wallpapercave.com/itachi-on-throne-wallpapers
  - Direct: https://wallpapercave.com/wp/wp12352522.jpg
  - Original: 1280x720

## Alternates
- alternates/fingers-alt1.jpg: Itachi reaching two fingers toward viewer (dark illustration, tiny "dws4.me" watermark top-right)
  - Page: https://wallpapercave.com/itachi-sasuke-desktop-wallpapers
  - Direct: https://wallpapercave.com/wp/wp14193770.jpg ; 1920x1200
- alternates/fingers-alt2.jpg: anime screenshot, Itachi extending hand with two fingers (animeultima watermark bottom-right, low-res)
  - Page: https://wallpapercave.com/itachi-throne-wallpapers
  - Direct: https://wallpapercave.com/wp/wp9774477.jpg ; 1280x720
- alternates/throne-alt1.jpg: flat vector Itachi on throne, peach background
  - Page: https://wallpapercave.com/itachi-on-throne-wallpapers
  - Direct: https://wallpapercave.com/wp/wp9774449.jpg ; 4098x2304 (installed resized to 2560 wide)
- alternates/throne-alt2.jpg: lit photo-manip style Itachi on throne (square)
  - Page: https://wallpapercave.com/itachi-on-throne-wallpapers
  - Direct: https://wallpapercave.com/wp/wp9774457.jpg ; 1920x1920

## Update: re-made finals (upscaled)
- fingers.jpg: Itachi lying on his back, two fingers + Akatsuki Shu ring toward viewer (Shippuden ep ~138 frame). Made from alternates/fingers-alt2.jpg (1280x720, wallpapercave wp9774477). Cropped to x150..1130, y0..540 (removes TV Tokyo logo, animeultima watermark and Sasuke's bandaged arm), upscaled 4x with Real-ESRGAN (realesrgan-ncnn-vulkan 20220424, model realesr-animevideov3), resized to 2560x1410. No clean >=1080p version of this frame was found online.
- alternates/fingers-rain.jpg: the previous fingers.jpg (rain forehead-poke scene), kept for reference.
- throne.jpg: made from alternates/throne-uncropped.jpg (1280x720, wallpapercave wp12352522). Cropped to x0..1000, y0..562 (removes TV Tokyo and wallpaperswide logos), upscaled 4x with Real-ESRGAN realesr-animevideov3, resized to 2560x1440.

## Update 2: true high-res frames from the anime (supersede the above for fingers/throne)
Episode: Naruto Shippuden ep 138-ish fight (Itachi vs Sasuke, Uchiha hideout, "Fated Battle Between Brothers" arc, ep 134-138). Scene: Itachi lying wounded points two fingers, dissolves into crows, genjutsu reveals him on the throne. Exact episode number not confirmed from a primary source.
- Main source (pointing, dissolve, crows): https://www.youtube.com/watch?v=viZOXPFhUPU ("Sasuke vs Itachi 4k 60FPS"), 3840x2160 AV1, 60 fps, 48 s clip (fan upscale + frame interpolation of the 720p/1080p TV/BD source; no logos/subs). Downloaded with yt-dlp (android_vr client), frames via ffmpeg.
  - Frame numbers are 1-based at 60 fps. Rise (dark close-up, hand lifting) 1736-1784 (t=28.9-29.7 s of file; note: tile timeline by frame index). Point shot 1788-1913 every 5th frame. Dissolve 2414-2606. Crows flying across floor toward throne 2642-2858.
  - point/point-NN: crop 2880x1620 at x=450,y=0 of the 4K frame (removes Sasuke's bandaged arm), lanczos to 2560x1440. rise-NN: full frame, 2560x1440 (Sasuke's cloak at right). dissolve/reform: full frame resized to 2560x1440. No Real-ESRGAN used (source already >= 1440p).
  - fingers.jpg = point/point-05 (frame 1808).
- Throne: https://www.youtube.com/watch?v=AYV7vhAVb80 (Itachi twixtor 2560x1440, 60 fps). throne.jpg = frame 1540, native 2560x1440, no processing. alternates/throne-closeup-1440.jpg = frame 41 (Itachi seated, close-up, banner behind).
- Cross-check: https://www.youtube.com/watch?v=zTBb_Cv-FdI is the same scene at 1920x1080.
- Old files kept: alternates/fingers-upscaled-720.jpg, alternates/throne-upscaled-720.jpg.
- reform/ = crows scattering/flying from the dissolve site toward the throne (the clip ends before crows gather into Itachi on the throne; no true reform frames found).

## Update 3: throne (sharp), Mangekyo eye, hero background
Full-res originals (PNG) are kept outside this repository. Web copies: assets/intro/web (1920w; hero 2560w) and web-sm (960w; hero 1280w), WebP q86 (hero q84), made with Pillow (Lanczos).
- web/throne.webp, web-sm/throne.webp: frame 291 of https://www.youtube.com/watch?v=DsGRbkmdvDo ("INTRO + TWIXTOR - NARUTO SASUKE VS ITACHI | 4K | 30 FPS"), 3840x2160, 30 fps, native frame, no crop, no logos. Itachi seated at the throne (black tomoe ornament behind), head/shoulders, fills the frame. Candidates B (frame 405, eyes closed) and C (frame 151, wide throne shot cropped 2560x1440 at x640,y560; face is smeared/bloodied there) are in throne-candidates/.
- web/eye-01..20.webp (+web-sm): frames 552-571 (1-based, 60 fps) of https://www.youtube.com/watch?v=8s6BOf-Wyho ("THIS IS 4K ANIME (Itachi)"), 3840x2160 AV1. Three-tomoe Sharingan merges into the Mangekyo, then glows and slowly spins. Every frame is unique, no ghosting seen. Originals in source-frames/eye/.
- web/hero.webp (2560x1440), web-sm/hero.webp (1280x720): frame 330 of https://www.youtube.com/watch?v=tbDM6-So0S8 ("Itachi Vs Deidara | AMV (4K)"), 3840x2160, 23.976 fps. Itachi silhouetted in a blazing doorway with sun rays (Deidara recruitment flashback). The clip carries a "RUSTY" watermark bottom-centre; cropped away (crop 3272x1840 at x284,y0, then scaled to 2560x1440). Episode number not confirmed (probably the Akatsuki/Deidara arc near ep 457, unverified). Other candidates in hero-candidates/ (gate f292, f360; sun-flare f372, f400). 1080p alternative of the same scene: https://www.youtube.com/watch?v=ejNSP7P1yyo.
- Not usable: Bt0ihOac88A (Deidara vs Itachi 1080p60), v69_Ib_1C0I (4K full fight) returned HTTP 403 after the first chunk.

## Update 4: hero sun scene follow-up, wide throne banner
- Deidara recruitment flashback is in Naruto Shippuden ep 457 "Partner" (Aibo), Itachi Shinden arc "Light and Darkness" (aired JP 2016-04-21). Confirmed via ANN review + search summaries; Narutopedia returned HTTP 402 to the fetch tool, so the Itachi-vs-Deidara scene placement within the ep was not checked there.
- No native 1080p TV/BD clip of this scene was obtainable (the 1080p60 upload Bt0ihOac88A returns 403 on download; the other uploads of the scene are 720p max or hard-subbed). Best sources are the 4K AMV tbDM6-So0S8 (3840x2160, "RUSTY" watermark) and the 1080p AMV ejNSP7P1yyo ("Livayea" watermark).
- In the scene the wide doorway silhouette has NO drawn glowing Sharingan (only two tiny white eye slits). The glowing orange-red Sharingan appears only in a separate close-up of the golden silhouetted face (ejNSP f555) and in close-ups of the eyes (tbDM6 f222/f234/f510). Candidates (a wide frame with glowing eyes does not exist): source-frames/hero-candidates-2/. web/hero.webp unchanged; backups web/hero-doorway.webp and web-sm/hero-doorway.webp.
- Wide throne banner: web/hero-throne.webp (2560x1120, q84) + web-sm/hero-throne.webp (1280x560). Frame 151 of DsGRbkmdvDo (4K, 30 fps; static from frame ~51 to 188; 149-160 sharpest), cropped 3840x1680 at x0,y260 (16:7), scaled 2/3. Candidates and full 16:9 frame: source-frames/throne-wide-candidates/.

## Update 5: manga throne pair, sun hero grading
- Manga throne panel: Naruto manga, vol. 42, around chapter 384 (Itachi vs Sasuke at the Uchiha hideout; Sasuke enters and finds Itachi on the throne; bubbles "Omae wa doko made miete iru / Sono sharingan..."). Chapter number inferred from search results (arc ch. 384-); not verified against a chapter list.
  - B&W: official raw page image, 1583x1920 PNG, from naruto-official.com (cmsapi-frontend.naruto-official.com ... /news/2024/07/17/EoB9yZz8lciKGAuH/01 42 08874512_017.png), found via Yandex image search. Upscaled 2x (Real-ESRGAN realesr-animevideov3), cropped x400-1200,y30-1830 of the 1583x1920 page (removes the speech bubbles), resized to 889x2000 / 489x1100.
  - Color: painterly color version, 1242x2208 screenshot (black bars cropped, 1242x1535) from https://i.pinimg.com/originals/53/43/b8/5343b8bbc09d6ce14a0ea16fd8202a41.jpg (a fan/unknown-artist coloring, not an official edition; no watermark seen). Upscaled 2x with Real-ESRGAN, registered to the B&W page with SIFT+RANSAC homography then ECC refinement (checked with a 50% blend: lines overlap to the pixel), warped straight from the 2x color into the same crop/size as the B&W so the pair is pixel-aligned.
  - Files: web/throne-manga-bw.webp, web/throne-manga-color.webp (889x2000, q86), web-sm (489x1100); full-res 1600x3600 pair in source-frames/manga/throne-manga-{bw,color}-full.png.
  - web/hero-throne.webp (2560x1120) + web-sm (1280x560): 16:7 crop of the aligned color panel (x90-1583, y110-763 of the B&W page grid), rendered at 2x from the upscaled color. Previous anime banner backed up as hero-throne-anime.webp.
- Sun hero: web/hero.webp (+sm) is now the re-graded 4K doorway frame (S-curve, crushed blacks, amber/gold, vignette, tight bloom); the ungraded one is hero-doorway-ungraded.webp. web/hero-sun-eyes.webp (2560x1440, sm 1280x720) = ejNSP7P1yyo frame 555 (1080p AMV, "Livayea" watermark removed by inpainting, Real-ESRGAN 2x), graded dark with the Sharingan irises re-coloured red (geometry-based masks) and soft procedural rays on the bright background. Eye positions in the eyes frame: left iris 38.9% x / 23.1% y, right iris 62.2% x / 25.0% y.

## Update 6: anime throne restored, natural sun images
- Throne (anime, as requested instead of fan wallpapers/manga): web/throne.webp (2560x1440, q86) and web-sm/throne.webp (1280x720) = the full 16:9 4K frame f151 of https://www.youtube.com/watch?v=DsGRbkmdvDo (3840x2160, static camera f51-188, sharpest f149-160). Previous close-up kept as web/throne-closeup.webp.
- Dark banner: web/hero-throne.webp (2560x1120) + web-sm (1280x560) = the SAME frame, rows y0..y1 = 260..1940 of 2160 px (fractions 0.1204 .. 0.8981), full width, scaled 2/3. Manga banner backed up as hero-throne-manga.webp; the anime banner is also hero-throne-anime.webp (identical).
- DeviantArt EternalDriftArt "Uchiha itachi sitting on Throne Wallpaper 4k UHD": the page only serves a 1280x720 preview with a large watermark (token limits it to <=1280x720); it is stylised AI-looking crow art with a different composition, so not used.
- Sun images matching the user's reference (native anime frames, natural red eyes): see source-frames/sun-candidates/ (URLS.txt, contact-sheet.jpg). Installed web/hero-sun.webp (2560x1440, q84) + web-sm (1280x720) from candidate 01 (steamusercontent.com/ugc/277352215423134046/E7B9B1AC84136EB76A2324168AE5ACF6BABA2090/, 1920x1080, upscaled 2x with Real-ESRGAN realesr-animevideov3, no grading, no recolouring). web/hero-doorway-statues.webp (+sm) from candidate 02 (steamusercontent.com/ugc/531747978903956327/2A64FA9C5025DEB121EA98E99253236A5C1D9998/, 1600x1200, 2x upscaled, cropped to 16:9 rows 220..2020 of the 2x image).

## Update 7: clear-face throne banner, full-body sun hero
- Dark banner: web/hero-throne.webp (2560x1120) + sm = wide 4K f151 (DsGRbkmdvDo) with the smeared/bloodied face region replaced by the clean face from the 4K medium shot f372 of 8s6BOf-Wyho (donor face scaled to the head, colour-matched, headband dimmed, soft elliptical blend). Full-frame version: web/throne-cleanface.webp. Original banner backed up as hero-throne-f151.webp. Candidates + contact sheet: source-frames/throne-banner-candidates/ (C1-C3 true medium shots with clean faces, C4 original wide, C5 composite). Searched DsGRbkmdvDo f36-188 and AYV7vhAVb80 f1421-1540: every wide/medium-wide throne frame in these clips has the same smeared face; the only clean calm faces are the closer medium shots.
- Light hero: web/hero-sun.webp is now the graded 4K doorway full-body silhouette with small red eye glints added on the two eye slits (synthetic, 2 tiny ellipses + glow); the head close-up is backed up as hero-sun-head.webp. Native-eye alternatives: hero-sun-head, hero-doorway-statues, hero-doorway-ungraded.

## Update 8: Sharingan on the banner face
web/hero-throne.webp (+sm) = f151 wide + f372 face (as v1, backed up as hero-throne-composite-v1.webp) with painted Sharingan irises (#c4141c, dark ring, 3 tomoe, black pupil, soft glow) on the two eye slits at 4K: right (1942.5,887.6), left squinted (1903,888.6) of 3840x2160; source-frames/throne-banner-candidates/C6. f291 head angle not used (different pose/scale).

## Update 9: sharpened banner
hero-throne*.webp now from the f151 clean-face composite run through Real-ESRGAN realesr-animevideov3 x4 (4 overlapping tiles, Lanczos/area downscale to native 3840x2160, feathered blend; x4plus-anime was smoother/plastic, rejected), then crisp small Sharingan eyes repainted (#c8101e, thin dark ring, tiny pupil, ~1px glow). web/hero-throne-3840.webp (3840x1680), 2560 and 1280 versions; previous = hero-throne-composite-v2.webp. Sources C7 in throne-banner-candidates.

## Update 10: banner repair v4 + remaster search
Banner = wide f151 (sharpened) with the WHOLE head (hair, face, headband, scar lines) replaced by the f372 head of 8s6BOf-Wyho (uniform 0.14 scale, segmented hair silhouette mask, old head inpainted first, colour/plate/hair tone matched), so hair comes from one source. His left eye is closed (squint) natively in the anime drawing; only the open eye has a painted Sharingan (#c41e... ring+3 tomoe+pupil, hair strand kept over it). Prior version = hero-throne-composite-v3.webp (and hero-throne-3840-composite-v3.webp). Before/after: source-frames/throne-banner-candidates/before-after-face-2x.png. Fan remaster search: source-frames/throne-remaster-candidates/ (none anime-faithful wide >=2560, not installed).

## Update 11: sharpened intro sequences
All used point/dissolve/eye frames re-processed identically: raw 4K frame (point crop 2880x1620 at x450,y0; eye from source-frames/eye PNG) -> area-downscale to 1920w -> Real-ESRGAN realesr-animevideov3 x4 (tile 400) -> area-downscale to 2560w. Tiers: web-hd 2560w q84 (new), web 1920w q86, web-sm 960w q85 (same filenames). Old web/web-sm frames backed up in source-frames/web-backup-seq/.

## Update 12: red Sharingan irises in point frames
All 13 used point frames: irises segmented per frame (dark low-chroma blob inside fixed windows around (2052,577) and (2266,713) of the 2560 frame; detections in source-frames/point-iris-detect.json), recoloured to red (v'=clamp(1.8v+0.12), R=.92v',G=.07v',B=.10v', darkest core kept as pupil, faint 3.5px glow) and face exposure +12% (soft ellipse). Re-exported to web-hd/web/web-sm. Previous frames: source-frames/web-backup-seq-eyes/.

## Update 13: drawn round Sharingan on point frames
Replaced the recoloured blobs: per-eye constant centre/size (L (2051,572) 30x33px, R (2267,710) 28x33px at 2560, rotated), 4x-supersampled flat Sharingan (#d0141e->dark rim, ring at 0.6r, 3 tomoe, pupil, black outline), clipped to the eye opening, +12% face lift. Sheet: source-frames/web-backup-seq-eyes/contact-sheet-round-iris.jpg.

## Update 14: hero-sun = doorway silhouette + drawn Sharingan
Source: sun-candidates/02 (1600x1200 steam ws screenshot), 16:9 crop rows 110..1010, Real-ESRGAN animevideov3 x4, down to 3840x2160, graded bright/warm (S-curve gamma .68, gold tint). Two drawn Sharingan (r=19px, centres (1902,522),(1954,522), 3 tomoe, ring, pupil, outline, soft red halo). Prior hero-sun = hero-sun-head-v2.webp. Preview: sun-candidates/09-preview-1280.jpg.

## Update 15: hero-sun eyes redrawn as glowing almond slits (42x15px, slanted 10deg, partial red iris + pupil, soft red halo), head darkened with a soft brown multiply ellipse; eye centres (1904,562),(1952,562) of 3840x2160.

## Update 16: Nano Banana art (user-generated)
Banners: web/hero-throne(-3840) and web/hero-sun(-3840) now come from nb2/o83cjso83cjso83c.jpg (throne, 2752x1536 -> 16:9 centre crop 2731x1536, Real-ESRGAN animevideov3 x2, 3840x2160; iris pixels boosted) and nb2/36s1cp36s1cp36s1.jpg (doorway). Old: hero-throne-nbclose, hero-sun-painted-eyes. Alt: source-frames/throne-banner-candidates/nb-zoomout-dark-alt.jpg. Pointing redraw kept at source-frames/nb-pointing-redraw.jpg (not installed).
Cutouts: crow/nb-crow-1..7.png (+webp max 640) from c85a0wc85a0wc85a.jpg, crow/nb-feather-1..8.webp (max 256) from b9701hb9701hb970.jpg. Alpha from min-channel ramp + eroded solid core, colour un-premultiplied against white at edges. Contact sheets: source-frames/nb-contact-*.jpg.
