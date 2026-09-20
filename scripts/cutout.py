"""
Background-removed PNG cutouts of the board for parallax layers.

Usage:  python3 scripts/cutout.py            (needs: pip install "rembg[cpu]" pillow)

Reads the source photos listed in SOURCES, removes the background with rembg (u2net),
optionally crops to a region, trims transparent edges and writes PNGs to
public/images/cutouts/. Re-run whenever a better source photo is added.
"""
from pathlib import Path
from PIL import Image
from rembg import remove, new_session

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/images/originals"
OUT = ROOT / "public/images/cutouts"
OUT.mkdir(parents=True, exist_ok=True)

# (source file, output name, crop box (l, t, r, b) or None)
SOURCES = [
    # Board with a red band clipped into the top anchor, three-quarter view, clean wall.
    # Primary parallax layer. Two sections visible; the seam is ~54% down.
    ("mantoleft.webp", "board-with-band.png", (380, 0, 560, 654)),
]

# Derived crops of the cutouts above (no background removal needed).
# (source cutout, output name, crop box as fractions of the source size)
DERIVED = [
    # Clean single section (the lower one, no band) reused 3x for the 1-2-3 stacking scene.
    ("board-with-band.png", "board-section.png", (0.0, 0.545, 1.0, 1.0)),
]

# Straight rectangular crops of front-on boards in renders/photos with flat walls.
RECT_CROPS = [
    # Front-on board, gym scene, right-hand board (top of board is outside the frame).
    ("VarySystems_gym_r1.webp", "board-front.png", (536, 0, 581, 384)),
]

session = new_session("u2net")
for src, name, box in SOURCES:
    im = Image.open(SRC / src).convert("RGBA")
    if box:
        im = im.crop(box)
    cut = remove(im, session=session, alpha_matting=True,
                 alpha_matting_foreground_threshold=240,
                 alpha_matting_background_threshold=10)
    bbox = cut.getbbox()
    if bbox:
        cut = cut.crop(bbox)
    cut.save(OUT / name, optimize=True)
    print("wrote", name, cut.size)

for src, name, (l, t, r, b) in DERIVED:
    im = Image.open(OUT / src)
    w, h = im.size
    crop = im.crop((int(l * w), int(t * h), int(r * w), int(b * h)))
    bbox = crop.getbbox()
    if bbox:
        crop = crop.crop(bbox)
    crop.save(OUT / name, optimize=True)
    print("wrote", name, crop.size)

for src, name, box in RECT_CROPS:
    im = Image.open(SRC / src).convert("RGBA").crop(box)
    im.save(OUT / name, optimize=True)
    print("wrote", name, im.size)
