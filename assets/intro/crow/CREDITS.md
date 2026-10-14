# Crow sprite credits

No suitable free flying-crow asset was found, so `crow-side.png` is original artwork
generated procedurally (Python/Pillow, articulated wing with 5 separated primary "fingers", proportions after Corvus corax photos on Wikimedia Commons,
supersampled 4x). No third-party material; no attribution required.

Candidates reviewed and rejected (too small/pixel-art or restrictive licence):
- Pixel Raven, tbbk, CC0 - https://opengameart.org/node/142590 (16px pixel art)
- Owl and Raven Sprites, Revangale, CC-BY-SA 3.0 - https://opengameart.org/content/owl-and-raven-sprites (64px pixel art)
- Free Dark Crow, Aske4 (itch.io) - 40x40, no redistribution

## crow-side.png
- Horizontal strip, 8 frames, each 256 x 380 px (strip 2048 x 380), bird faces RIGHT
- Anime cel style after Itachi's crow jutsu: body #2b2a30, shadow side/far wing #1c1b20, grey wing-top edge, outline #0c0b10, ragged feathered wings, open beak on frames 2, 3, 7, glowing red eye #e0202a; transparent background
- Suggested rate: 12 fps for one flap per ~0.67 s (use 10-14 fps; vary per bird)
- Frames share one registration (bird body does not jitter between frames)

CSS (use px/calc, not percentages, for background-position; --w is the on-screen frame width):
```css
.crow{--w:256px;width:var(--w);height:calc(var(--w)*380/256);
  background:url(crow-side.png) 0 0/calc(var(--w)*8) 100% no-repeat;
  animation:flap .667s steps(8) infinite}
@keyframes flap{to{background-position:calc(var(--w)*-8) 0}}
```
In GSAP: set backgroundPosition per frame (`-i*w px`) from a ticker, or use `steps(8)` as the ease.

## Extras
- `feather.png` 44 x 128, loose ragged feather
- `shard-1..6.png` 256/224/192/176/144/128 px square, torn feathered cloak fragments
All original, generated with `crow.py` / `extras.py` (Pillow).
