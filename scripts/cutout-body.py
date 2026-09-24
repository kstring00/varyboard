"""
Body-map cutout for the plan builder: removes the black studio background from the supplied
figure render and writes a transparent PNG.  python3 scripts/cutout-body.py
"""
from pathlib import Path
from PIL import Image
from rembg import remove, new_session

ROOT = Path(__file__).resolve().parents[1]
src = ROOT / "public/images/originals/body-map-source.webp"
out = ROOT / "public/images/body-map.png"
im = Image.open(src).convert("RGBA")
cut = remove(im, session=new_session("u2net"), alpha_matting=True, alpha_matting_foreground_threshold=235, alpha_matting_background_threshold=8)
bbox = cut.getbbox()
cut = cut.crop(bbox)
cut.thumbnail((640, 1400))
cut.save(out, optimize=True)
print("wrote", out.name, cut.size)
