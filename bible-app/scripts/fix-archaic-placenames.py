#!/usr/bin/env python3
"""Replace several more archaic 1919 Union Version proper-noun
transliterations with the modern standard spelling, same category as the
Lebanon fix in scripts/fix-lebanon-spelling.py (CUV content on this app
skewed to the ORIGINAL 1919 CUV's proper-noun spellings; mainstream modern
reprints -- 新标点和合本, 和合本修订版 -- and the AI-generated commentary
tracks on this app both already use the modern spelling):

  士班雅 -> 西班牙   (Spain, Romans 15:24)
  大马色 -> 大马士革  (Damascus)
  革哩底 -> 克里特   (Crete)
  居比路 -> 塞浦路斯  (Cyprus)
  该撒  -> 凯撒     (Caesar, as a title) -- this one substitution also
                       correctly turns 该撒利亚 (Caesarea) into 凯撒利亚,
                       since the latter is literally 该撒/凯撒 + 利亚.

NOT included: 推罗/推羅 (Tyre). It looks like the same pattern at first
(a 1919 spelling vs. a newer one, 泰尔/泰爾), but it isn't settled the way
the others are: the 1988 新标点和合本 changed it to 泰爾, a 1989 PRC
simplified reprint kept 推羅, and 和合本修订版 (2010, the current
authoritative revision) reverted back to 推羅. 推罗/推羅 is in fact what
this app already uses almost everywhere (51 of 52 files) -- the 1-2 stray
files using 泰尔/泰爾 are the actual inconsistency here, fixed by
scripts/fix-tyre-stragglers.py instead, in the OPPOSITE direction from
every other fix in this file.

Unlike Lebanon, these were already a *mix* of old/new spelling across the
app before this ran: the scripture text (public/bible) was 100% archaic
with zero modern instances, but the AI-generated insights/explain/
characters/bookintro commentary was mostly-but-not-entirely modern already
(e.g. some character bios used 大马色, others 大马士革, for the same city).
This normalizes everything to the modern spelling everywhere, which both
modernizes the scripture text and removes the internal inconsistency in
the commentary tracks.

Each substitution is a straight substring swap (no length change), every
hit was spot-checked by hand to be in proper-noun context before this
script was written, and every file is round-tripped through json.loads
before and after to catch any corruption.

Usage: python3 scripts/fix-archaic-placenames.py <glob> [<glob> ...]
  e.g. python3 scripts/fix-archaic-placenames.py "public/bible/zh-hant/*.json" "public/bible/zh-hans/*.json" "public/insights/zh-hant/*.json" "public/insights/zh-hans/*.json" "public/explain/zh-hant/*.json" "public/explain/zh-hans/*.json" "public/characters/zh-hant/*.json" "public/characters/zh-hans/*.json" "public/bookintro/zh-hant.json" "public/bookintro/zh-hans.json"

After running, regenerate the search index (it's built from the scripture
files, so it would otherwise still carry the old spelling):
  node scripts/build-search-index.mjs
"""
import glob
import json
import sys

PAIRS = [
    ("士班雅", "西班牙"),
    ("大马色", "大马士革"),
    ("革哩底", "克里特"),
    ("居比路", "塞浦路斯"),
    ("该撒", "凯撒"),
    ("該撒", "凱撒"),
]


def main():
    patterns = sys.argv[1:]
    if not patterns:
        print(__doc__)
        sys.exit(1)

    files = []
    for pattern in patterns:
        files.extend(glob.glob(pattern))

    totals = {old: 0 for old, _ in PAIRS}
    for path in sorted(set(files)):
        with open(path, "r", encoding="utf-8") as f:
            raw = f.read()
        new_raw = raw
        per_file = []
        for old, new in PAIRS:
            count = new_raw.count(old)
            if count:
                new_raw = new_raw.replace(old, new)
                totals[old] += count
                per_file.append(f"{old}->{new}:{count}")
        if new_raw == raw:
            continue
        json.loads(raw)
        json.loads(new_raw)
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_raw)
        print(f"{path}: {', '.join(per_file)}")

    print()
    for old, new in PAIRS:
        print(f"{old} -> {new}: {totals[old]} replaced")


if __name__ == "__main__":
    main()
