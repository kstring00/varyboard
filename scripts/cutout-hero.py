"""
Hero product cutout from the sharpest real board photo (public/images/originals/board-closeup.webp).
The board's outer rail edges are straight verticals in this photo, so a tight rectangular crop keeps
the whole board (teal platform + grey rails) without background removal artefacts. A soft alpha fade
is applied at the top and bottom, where the photo frame cuts the board, and 3 px at the sides.
  python3 scripts/cutout-hero.py
"""
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
src = ROOT / "public/images/originals/board-closeup.webp"
out = ROOT / "public/images/cutouts/board-hero.png"
LEFT, RIGHT = 172, 846  # measured column-brightness edges of the rails

im = Image.open(src).convert("RGBA").crop((LEFT, 0, RIGHT, Image.open(src).height))
w, h = im.size
fade = Image.new("L", (w, h), 255)
px = fade.load()
edge = int(h * 0.07)
for y in range(edge):
    v = int(255 * (y / edge) ** 1.5)
    for x in range(w):
        px[x, y] = min(px[x, y], v)
        px[x, h - 1 - y] = min(px[x, h - 1 - y], v)
for x in range(3):
    v = int(255 * (x + 1) / 4)
    for y in range(h):
        px[x, y] = min(px[x, y], v)
        px[w - 1 - x, y] = min(px[w - 1 - x, y], v)
im.putalpha(ImageChops.multiply(im.getchannel("A"), fade))
im.save(out, optimize=True)
print("wrote", out.name, im.size)
