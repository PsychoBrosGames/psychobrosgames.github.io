#!/usr/bin/env python3
"""
Derive web-sized imagery from the raw press art pulled by fetch-press-art.mjs.

Raw Steam screenshots are 1920x1080 and ~550 KB each; shipping 60 of them would
add ~26 MB to the site for no visual gain. This produces exactly the sizes the
layout actually renders, then deletes the raws.

Editorial rationale for using screenshots rather than the Steam capsule as the
primary card art: capsules carry baked-in game logos and store-style
compositions. Twenty of them tiled together read as a storefront and fight the
site's own typography. Screenshots stay photographic and let our headline
treatment sit on top. The official capsule is still kept, credited, as
`key-art.jpg` on each review page.

Outputs per game, into assets/press/<slug>/:
    cover.jpg     1200x514  (21:9)  lead card, grid cards, review hero
    thumb.jpg      480x270  (16:9)  rail items, rows, archive cards
    gallery-N.jpg  800x450  (16:9)  review page gallery
    key-art.jpg    460x215          official Steam capsule, untouched

    python scripts/optimize-press-art.py
"""

import json
import pathlib
import sys

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
PRESS = ROOT / "assets" / "press"
MANIFEST = ROOT / "data" / "press-art.json"

COVER = (1200, 675)   # 16:9, matches .card__art and .article__cover exactly.
                      # .lead__art is 21:9 and crops this vertically via
                      # object-fit, which the top-biased crop already suits.
THUMB = (480, 270)    # 16:9
GALLERY = (800, 450)  # 16:9


def crop_to_ratio(im, ratio, top_bias=0.3):
    """Crop to `ratio`, biased toward the top of the frame.

    Game HUDs are bottom-heavy (health bars, hotbars, turn counters). A straight
    centre crop trims top and bottom equally and leaves a half-cut strip of UI
    along the bottom edge, which looks like a mistake. Taking 30% of the loss
    off the top and 70% off the bottom removes the HUD cleanly and keeps the
    subject, which is usually nearer the horizon line."""
    w, h = im.size
    target_h = w / ratio
    if target_h <= h:
        top = int(round((h - target_h) * top_bias))
        return im.crop((0, top, w, int(round(top + target_h))))
    target_w = h * ratio
    left = int(round((w - target_w) / 2))
    return im.crop((left, 0, int(round(left + target_w)), h))


def emit(src, dest, size, quality):
    with Image.open(src) as im:
        im = im.convert("RGB")
        im = crop_to_ratio(im, size[0] / size[1])
        im = im.resize(size, Image.LANCZOS)
        im.save(dest, "JPEG", quality=quality, optimize=True, progressive=True)
    return dest.stat().st_size


def main():
    if not MANIFEST.exists():
        sys.exit("data/press-art.json missing - run scripts/fetch-press-art.mjs first")

    manifest = json.loads(MANIFEST.read_text(encoding="utf8"))
    before = sum(p.stat().st_size for p in PRESS.rglob("*.jpg"))
    after = 0
    problems = []

    for slug, record in manifest.items():
        d = PRESS / slug
        shots = sorted(d.glob("shot-*.jpg"))
        if not shots:
            problems.append(f"{slug}: no screenshots to derive from")
            record["cover"] = None
            record["thumb"] = None
            record["gallery"] = []
            continue

        primary = shots[0]
        after += emit(primary, d / "cover.jpg", COVER, 82)
        after += emit(primary, d / "thumb.jpg", THUMB, 80)
        record["cover"] = f"assets/press/{slug}/cover.jpg"
        record["thumb"] = f"assets/press/{slug}/thumb.jpg"

        gallery = []
        for i, shot in enumerate(shots[1:], start=1):
            name = f"gallery-{i}.jpg"
            after += emit(shot, d / name, GALLERY, 80)
            gallery.append(f"assets/press/{slug}/{name}")
        record["gallery"] = gallery

        # The official capsule keeps its own credited slot on the review page.
        header = d / "header.jpg"
        if header.exists():
            key_art = d / "key-art.jpg"
            header.replace(key_art)
            after += key_art.stat().st_size
            record["keyArt"] = f"assets/press/{slug}/key-art.jpg"
            if record.get("header"):
                record["keyArtOrigin"] = record["header"]["origin"]
            record.pop("header", None)
        else:
            record["keyArt"] = None

        # Raws are reproducible via fetch-press-art.mjs; do not ship them.
        for shot in shots:
            shot.unlink()
        record.pop("shots", None)

        print(f"ok  {slug:<28} cover+thumb+{len(gallery)} gallery")

    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf8")

    print("\n--- summary ---")
    print(f"raw downloaded : {before / 1024 / 1024:.2f} MB")
    print(f"shipped        : {after / 1024 / 1024:.2f} MB")
    print(f"saved          : {(before - after) / 1024 / 1024:.2f} MB")

    if problems:
        print(f"\n--- {len(problems)} problem(s) ---")
        for p in problems:
            print(f"  ! {p}")
    else:
        print("\nno problems.")


if __name__ == "__main__":
    main()
