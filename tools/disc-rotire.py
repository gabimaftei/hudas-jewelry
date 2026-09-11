"""Generează discul de rotire, de printat pe A4.

Ține locul platformei rotative: pui piesa pe un capac care stă pe disc,
rotești capacul din reper în reper și fotografiezi. 36 de repere = 10
grade pas, adică exact ce-i trebuie vizualizatorului de pe site.
"""
from PIL import Image, ImageDraw, ImageFont
import math, sys

DPI = 300
A4 = (int(8.27 * DPI), int(11.69 * DPI))      # 2481 x 3507
STEPS = 36
R_OUT = int(8.6 / 2.54 * DPI)                  # cerc de ~8.6 cm rază (17.2 cm diametru)

im = Image.new("RGB", A4, "white")
d = ImageDraw.Draw(im)
cx, cy = A4[0] // 2, A4[1] // 2

def font(size):
    for p in ("/System/Library/Fonts/Supplemental/Arial.ttf",
              "/System/Library/Fonts/Helvetica.ttc"):
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    return ImageFont.load_default()

f_num = font(58)
f_small = font(40)
f_title = font(64)

# cercul exterior
d.ellipse([cx - R_OUT, cy - R_OUT, cx + R_OUT, cy + R_OUT], outline=(20, 20, 20), width=5)

for i in range(STEPS):
    ang = math.radians(i * (360 / STEPS) - 90)     # reperul 1 în sus
    major = (i % 9 == 0)                            # la fiecare 90°
    inner = R_OUT - (150 if major else 90)
    x1, y1 = cx + inner * math.cos(ang), cy + inner * math.sin(ang)
    x2, y2 = cx + R_OUT * math.cos(ang), cy + R_OUT * math.sin(ang)
    d.line([x1, y1, x2, y2], fill=(20, 20, 20), width=9 if major else 4)

    # numărul, în afara cercului
    rt = R_OUT + 78
    tx, ty = cx + rt * math.cos(ang), cy + rt * math.sin(ang)
    label = str(i + 1)
    fnt = f_num if major else f_small
    bb = d.textbbox((0, 0), label, font=fnt)
    d.text((tx - (bb[2] - bb[0]) / 2, ty - (bb[3] - bb[1]) / 2), label,
           fill=(20, 20, 20) if major else (110, 110, 110), font=fnt)

# centrul: cruce + cerc mic, ca să poți centra capacul
d.line([cx - 60, cy, cx + 60, cy], fill=(200, 60, 60), width=4)
d.line([cx, cy - 60, cx, cy + 60], fill=(200, 60, 60), width=4)
d.ellipse([cx - 14, cy - 14, cx + 14, cy + 14], outline=(200, 60, 60), width=4)

d.text((cx - 520, 190), "DISC DE ROTIRE — 36 de pași", fill=(20, 20, 20), font=f_title)
d.text((cx - 520, 280),
       "Printează la 100% (fără „fit to page”). Pune piesa pe un capac plat,",
       fill=(90, 90, 90), font=f_small)
d.text((cx - 520, 340),
       "centrat pe cruce. Rotește capacul din reper în reper, câte o poză la fiecare.",
       fill=(90, 90, 90), font=f_small)
d.text((cx - 520, A4[1] - 300),
       "Crucea roșie trebuie să rămână acoperită de capac — nu trebuie să se vadă în cadru.",
       fill=(90, 90, 90), font=f_small)

out = sys.argv[1] if len(sys.argv) > 1 else "disc-rotire.png"
im.save(out, dpi=(DPI, DPI))
print("scris:", out, im.size, f"({STEPS} repere)")
