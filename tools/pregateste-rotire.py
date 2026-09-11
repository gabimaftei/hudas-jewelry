#!/usr/bin/env python3
"""Pregăteşte cadrele de rotire pentru web.

    python3 tools/pregateste-rotire.py <folder-cu-poze> <id-piesa> [--cadre 36]

Ce face, şi de ce contează ordinea:

1. Caută marginea piesei pe fundalul alb, în FIECARE cadru.
2. Le **uneşte într-o singură încadrare**, folosită apoi identic peste tot.

Pasul 2 e tot secretul. Dacă fiecare cadru s-ar tăia pe marginea lui, piesa
ar sălta în cadru la rotire — pentru că silueta ei se schimbă cu unghiul, iar
o tăiere strânsă pe fiecare cadru ar reîncadra-o de 36 de ori. O singură
încadrare, calculată cât să încapă piesa în toate poziţiile, o ţine fixă.

3. Micşorează la 900px pe latura lungă şi comprimă.
4. Scrie în assets/spins/<id>/01.jpg …
"""
from PIL import Image
import os, re, sys, glob

MAX_SIDE = 900
QUALITY = 78
WHITE = 244          # peste atât, un pixel trece drept fundal
PAD = 0.06           # aer în jurul piesei
SCAN = 700           # rezoluţia la care se caută marginea

def natural_key(s):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r'(\d+)', s)]

def content_box(im):
    """Marginea a tot ce nu e fundal alb."""
    w0, h0 = im.size
    sc = min(1.0, SCAN / max(w0, h0))
    small = im.resize((max(1, int(w0*sc)), max(1, int(h0*sc))), Image.BILINEAR).convert("L")
    mask = small.point(lambda p: 255 if p < WHITE else 0)
    bb = mask.getbbox()
    if bb is None:
        return None
    return tuple(int(v / sc) for v in bb)

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) < 2:
        print(__doc__); sys.exit(1)
    src, pid = args[0], args[1]
    want = None
    if '--cadre' in sys.argv:
        want = int(sys.argv[sys.argv.index('--cadre') + 1])

    files = sorted(
        [f for f in glob.glob(os.path.join(src, '*'))
         if f.lower().endswith(('.jpg', '.jpeg', '.png', '.tif', '.tiff'))],
        key=natural_key)
    if not files:
        print("Niciun fişier de imagine în", src); sys.exit(1)

    if want and want != len(files):
        step = len(files) / want
        files = [files[min(len(files)-1, int(i*step))] for i in range(want)]
        print(f"Am ales {want} cadre din {len(files)} disponibile.")

    print(f"{len(files)} cadre. Caut încadrarea comună…")
    union = None
    for f in files:
        with Image.open(f) as im:
            bb = content_box(im.convert("RGB"))
        if bb is None:
            continue
        union = bb if union is None else (min(union[0], bb[0]), min(union[1], bb[1]),
                                          max(union[2], bb[2]), max(union[3], bb[3]))
    if union is None:
        print("N-am găsit piesa în niciun cadru. Fundalul e alb?"); sys.exit(1)

    with Image.open(files[0]) as im:
        W, H = im.size
    l, t, r, b = union
    pad = int(max(r-l, b-t) * PAD)
    # pătrat, ca să nu sară încadrarea între piese late şi înalte
    cx, cy = (l+r)//2, (t+b)//2
    half = max(r-l, b-t)//2 + pad
    box = (max(0, cx-half), max(0, cy-half), min(W, cx+half), min(H, cy+half))
    print(f"Încadrare comună: {box[2]-box[0]}x{box[3]-box[1]} px, aceeaşi la toate cadrele.")

    out = os.path.join('assets', 'spins', pid)
    os.makedirs(out, exist_ok=True)
    for old in glob.glob(os.path.join(out, '*.jpg')):
        os.remove(old)

    total = 0
    for i, f in enumerate(files, 1):
        with Image.open(f) as im:
            crop = im.convert("RGB").crop(box)
        if max(crop.size) > MAX_SIDE:
            sc = MAX_SIDE / max(crop.size)
            crop = crop.resize((round(crop.width*sc), round(crop.height*sc)), Image.LANCZOS)
        dest = os.path.join(out, f"{i:02d}.jpg")
        crop.save(dest, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        total += os.path.getsize(dest)

    print(f"\nScris {len(files)} cadre în {out}")
    print(f"Greutate totală: {total/1024/1024:.1f} MB ({total/len(files)/1024:.0f} KB pe cadru)")
    print(f"\nAcum pune în catalog, la piesa „{pid}”:  \"spin\": {len(files)}")
    print("Dacă se roteşte în sensul greşit, adaugă şi:  \"spinReverse\": true")

if __name__ == '__main__':
    main()
