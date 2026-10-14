#!/usr/bin/env python3
"""Make assets/og-image.jpg (1200x630), the picture shown in link previews (Slack, iMessage, Twitter, ...).

Usage (needs Pillow: pip install pillow):
    python3 scripts/make_og_image.py "Madhav Iyengar" "PhD Student · University of Tübingen"

Optional: --serif path/to/CormorantGaramond.ttf  --sans path/to/Inter.ttf
(download them from https://github.com/google/fonts/tree/main/ofl/cormorantgaramond and .../ofl/inter,
 or drop them in scripts/fonts/ as serif.ttf and sans.ttf). Without fonts a plain default font is used.
The background is the dark banner picture assets/intro/web/hero-throne.webp.
"""
import argparse, os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
W, H = 1200, 630

ap = argparse.ArgumentParser()
ap.add_argument('name', nargs='?', default='Madhav Iyengar')
ap.add_argument('subtitle', nargs='?', default='PhD Student · University of Tübingen')
ap.add_argument('--bg', default=os.path.join(ROOT, 'assets/intro/web/hero-throne.webp'))
ap.add_argument('--out', default=os.path.join(ROOT, 'assets/og-image.jpg'))
ap.add_argument('--serif', default=os.path.join(HERE, 'fonts/serif.ttf'))
ap.add_argument('--sans', default=os.path.join(HERE, 'fonts/sans.ttf'))
a = ap.parse_args()

def font(path, size, weight=None):
    try:
        f = ImageFont.truetype(path, size)
        if weight:
            try: f.set_variation_by_axes([weight] if 'Cormorant' in path or path.endswith('serif.ttf') else [14, weight])
            except Exception: pass
        return f
    except Exception:
        return ImageFont.load_default()

# background: cover-fit the banner picture, keep his face (about 49.5% across, 36% down) in the upper middle
img = Image.open(a.bg).convert('RGB')
s = max(W / img.width, H / img.height)
img = img.resize((int(img.width * s) + 1, int(img.height * s) + 1), Image.LANCZOS)
x0 = (img.width - W) // 2
y0 = max(0, min(img.height - H, int(img.height * 0.40 - H * 0.42)))
img = img.crop((x0, y0, x0 + W, y0 + H))

# darken the bottom third
g = Image.new('L', (1, H))
for y in range(H):
    t = max(0.0, (y - H * 0.42) / (H * 0.58))
    g.putpixel((0, y), int(235 * min(1, t ** 1.2)))
shade = Image.new('RGB', (W, H), (7, 4, 5)); img.paste(shade, (0, 0), g.resize((W, H)))

d = ImageDraw.Draw(img)
big, small = font(a.serif, 92, 600), font(a.sans, 22, 500)
tw = d.textlength(a.name, font=big)
d.text(((W - tw) / 2, 410), a.name, font=big, fill=(245, 238, 226))
# subtitle in tracked caps
sub = a.subtitle.upper(); track = 5
widths = [d.textlength(ch, font=small) + track for ch in sub]
x = (W - sum(widths) + track) / 2
for ch, w in zip(sub, widths):
    d.text((x, 535), ch, font=small, fill=(214, 200, 176)); x += w
# thin crimson rule between them
d.rectangle([W / 2 - 24, 520, W / 2 + 24, 521], fill=(179, 18, 42))
img.save(a.out, quality=88, optimize=True)
print('wrote', a.out)
