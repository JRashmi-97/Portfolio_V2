#!/usr/bin/env python3
"""
Builds small display copies for the certificate gallery.

The coverflow cards are at most ~340px tall, but the originals are 1100-2900px
(44.8 megapixels decoded across the 32 cards). Every time a card is rasterised
during a scroll or a 3D transform the browser re-samples the full-size JPEG,
which is what the page feels like it "stutters" on. This script writes a
thumb/ copy of each image at a size the cards actually need.

    python tools/make_thumbs.py            # build every thumb
    python tools/make_thumbs.py --force    # rebuild even if the thumb exists
    python tools/make_thumbs.py --html     # point the gallery <img> tags at thumb/

The full-resolution files are never touched: the click-to-open modal still
reads data-file="certificates/<name>" and shows the original.

Re-run this after adding a certificate, then bump the ?v= version in index.html.
"""

import os
import re
import sys
import urllib.parse

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required:  pip install pillow")

SRC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "certificates")
OUT_DIR = os.path.join(SRC_DIR, "thumb")
LONG_EDGE = 760          # cards render at <= 379px; 760 covers a 2x display
QUALITY = 72
EXTS = (".jpg", ".jpeg", ".png")


def target_name(fn):
    # every thumb is a JPEG: the cards are photographs of certificates, and a
    # PNG copy of one costs ten times more for no visible gain
    return os.path.splitext(fn)[0] + ".jpg"


def build(force=False):
    os.makedirs(OUT_DIR, exist_ok=True)
    rows, skipped = [], 0
    for fn in sorted(os.listdir(SRC_DIR)):
        path = os.path.join(SRC_DIR, fn)
        if not os.path.isfile(path) or os.path.splitext(fn)[1].lower() not in EXTS:
            continue
        out = os.path.join(OUT_DIR, target_name(fn))
        if os.path.exists(out) and not force:
            skipped += 1
            continue
        with Image.open(path) as im:
            im.thumbnail((LONG_EDGE, LONG_EDGE), Image.LANCZOS)
            if im.mode not in ("RGB", "L"):
                flat = Image.new("RGB", im.size, (255, 255, 255))
                flat.paste(im.convert("RGBA"), (0, 0), im.convert("RGBA"))
                im = flat
            im.save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        before, after = os.path.getsize(path), os.path.getsize(out)
        rows.append((fn, before, after, im.size))

    if rows:
        print(f"{'file':38s} {'orig':>9s} {'thumb':>9s}  thumb size")
        for fn, before, after, size in rows:
            print(f"{fn[:38]:38s} {before/1024:8.0f}K {after/1024:8.0f}K  {size[0]}x{size[1]}")
        tb = sum(r[1] for r in rows) / 1024 / 1024
        ta = sum(r[2] for r in rows) / 1024 / 1024
        print(f"\n{len(rows)} built ({skipped} already present) — {tb:.1f} MB -> {ta:.1f} MB")
    else:
        print(f"nothing to do — {skipped} thumbs already in {OUT_DIR}")


def point_html_at_thumbs():
    """Rewrite the coverflow <img src> tags to thumb/; data-file keeps the
    original, so the click-to-open modal still shows the full-resolution scan."""
    html_path = os.path.join(os.path.dirname(SRC_DIR), "index.html")
    with open(html_path, encoding="utf-8") as fh:
        html = fh.read()
    changed = [0]

    def swap(m):
        url = m.group(1)
        name = urllib.parse.unquote(url.split("/")[-1])
        thumb = os.path.join(OUT_DIR, target_name(name))
        if not os.path.exists(thumb):
            return m.group(0)
        changed[0] += 1
        quoted = urllib.parse.quote(os.path.basename(thumb))
        return 'src="certificates/thumb/%s"' % quoted

    html = re.sub(r'src="(certificates/[^"?]+)"', swap, html)
    with open(html_path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(html)
    print(f"{changed[0]} <img> tags now load from certificates/thumb/")


if __name__ == "__main__":
    if "--html" in sys.argv:
        point_html_at_thumbs()
    else:
        build(force="--force" in sys.argv)
