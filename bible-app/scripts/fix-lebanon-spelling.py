#!/usr/bin/env python3
"""Replace the archaic 1919 Union Version transliteration 利巴嫩 with the
modern standard Chinese name for Lebanon, 黎巴嫩, across scripture text,
character bios, and anywhere else it was carried over.

利巴嫩 was how the original Chinese Union Version rendered "Lebanon." Every
mainstream modern reprint (新标点和合本, 和合本修订版) and every major Bible
app (YouVersion/Bible.com among them) has since switched to 黎巴嫩, which is
also the ordinary modern Chinese name for the country -- the one used in
maps, news, and dictionaries, not just a competing Bible translation's
choice. Flagged by comparing against another app's 新标点和合本 text, which
used 黎巴嫩 for the exact same verses.

A plain substring swap is safe here: both strings are 3 characters (no
length change), the term is an unambiguous proper noun with no other sense,
and every hit was verified by hand to be in Lebanon-referring context before
this script was written.

Usage: python3 scripts/fix-lebanon-spelling.py <glob> [<glob> ...]
  e.g. python3 scripts/fix-lebanon-spelling.py "public/bible/zh-hant/*.json" "public/bible/zh-hans/*.json" "public/characters/zh-hant/*.json" "public/characters/zh-hans/*.json"

After running, regenerate the search index (it's built from the scripture
files, so it would otherwise still carry the old spelling):
  node scripts/build-search-index.mjs
"""
import glob
import json
import sys

OLD = "利巴嫩"
NEW = "黎巴嫩"


def main():
    patterns = sys.argv[1:]
    if not patterns:
        print(__doc__)
        sys.exit(1)

    files = []
    for pattern in patterns:
        files.extend(glob.glob(pattern))

    total = 0
    for path in files:
        with open(path, "r", encoding="utf-8") as f:
            raw = f.read()
        count = raw.count(OLD)
        if count == 0:
            continue
        new_raw = raw.replace(OLD, NEW)
        # Round-trip through json.loads both before and after so a malformed
        # file (or a replacement that somehow broke JSON structure) fails
        # loudly here rather than shipping.
        json.loads(raw)
        json.loads(new_raw)
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_raw)
        print(f"{path}: {count} replaced")
        total += count

    print(f"\nTotal replacements: {total}")


if __name__ == "__main__":
    main()
