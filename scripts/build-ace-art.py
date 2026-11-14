"""Compress the text-free section art into shared/art/ (WebP, about 900 px wide).

  python3 scripts/build-ace-art.py SOURCE_DIR

Art is decoration only: no labels, no structures that carry meaning. Every title
is set in code. Plates that failed the structure check are not listed here:
  pat.png   the cube net has 5 squares, which cannot fold into a cube. The PAT
            card uses a code-drawn net instead (shared/art/pat.svg).
  home.png  cropped to x < 960 px to leave out a ball-and-stick model whose
            four bonds sit flat in one plane.
"""
import os, sys
from PIL import Image
SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'shared', 'art')
os.makedirs(OUT, exist_ok=True)
PLATES = {'home': (0, 0, 960, 752), 'bio': None, 'gchem': None, 'ochem': None, 'qr': None}
for name, crop in PLATES.items():
    im = Image.open(os.path.join(SRC, name + '.png')).convert('RGB')
    if crop: im = im.crop(crop)
    w = 900
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    dest = os.path.join(OUT, name + '.webp')
    im.save(dest, 'WEBP', quality=78, method=6)
    print(name, im.size, os.path.getsize(dest) // 1024, 'KB')
