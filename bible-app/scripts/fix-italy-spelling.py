#!/usr/bin/env python3
"""Fix "Italy" in the Chinese content: zh-hans had 义大利, a naive
character-by-character simplification of Taiwan's Traditional spelling
義大利 (義 -> 义). That's not an old-vs-new wording issue like the archaic
place names fixed in scripts/fix-archaic-placenames.py -- it's simply the
wrong word. Mainland China's actual standard term for Italy is 意大利,
built from an entirely different first character (意, not a simplified
form of 義 at all). 义大利 isn't used anywhere in practice.

Likely origin: this app's zh-hans text was produced by converting
Traditional Chinese content with a Traditional->Simplified character
mapper (see scripts/*-convert.py), which handles 義->义 correctly as a
GLYPH simplification without knowing that 義大利 the PLACE NAME has its
own, unrelated standard Simplified spelling, 意大利. Worth remembering for
any other modern country name that might turn up the same way (most
biblical place names don't have this risk, since they're ancient names
with no competing modern official spelling -- Italy is naturally the
odd one out, being both a real present-day country AND a place Acts
26-28 name-checks repeatedly).

Separately, public/characters/zh-hant/julius.json had the opposite
inconsistency: it used 意大利 (fine in isolation -- that spelling is also
common in Hong Kong/Macau Traditional usage -- but every other zh-hant
file in this app, and the Acts map, already use 義大利 consistently, so
this one bio was the odd one out). Normalized to match.

Usage: python3 scripts/fix-italy-spelling.py
  (file list is fixed below rather than glob-based, since this bug is
  narrowly scoped to the handful of files that actually mention Italy)
"""
import json

SIMPLIFIED_FIX = [
    "public/bible/zh-hans/heb.json",
    "public/bible/zh-hans/act-1.json",
    "public/bible/zh-hans/act-2.json",
]

TRADITIONAL_CONSISTENCY_FIX = [
    "public/characters/zh-hant/julius.json",
]


def swap(path, old, new):
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()
    count = raw.count(old)
    if count == 0:
        print(f"SKIP (no match): {path}")
        return
    new_raw = raw.replace(old, new)
    json.loads(raw)
    json.loads(new_raw)
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_raw)
    print(f"{path}: {count} replaced ({old} -> {new})")


def main():
    for path in SIMPLIFIED_FIX:
        swap(path, "义大利", "意大利")
    for path in TRADITIONAL_CONSISTENCY_FIX:
        swap(path, "意大利", "義大利")

    # The map's simplified-language tspan line is plain SVG text, not JSON --
    # fixed by hand in public/maps/act-zh.svg, not by this script.
    print(
        "\nDon't forget public/maps/act-zh.svg's simplified tspan line "
        "(fixed by hand, not covered by this script) and "
        "node scripts/build-search-index.mjs afterward."
    )


if __name__ == "__main__":
    main()
