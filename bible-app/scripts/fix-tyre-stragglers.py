#!/usr/bin/env python3
"""Fix the one or two AI-generated insights files that used 泰尔/泰爾 for
Tyre instead of 推罗/推羅, which is what the rest of this app (scripture
text, character bios, map labels) already and consistently uses.

This is NOT the same kind of "archaic -> modern" fix as
scripts/fix-archaic-placenames.py. Tyre's spelling is genuinely unsettled
across CUV editions: the 1988 新标点和合本 changed 推羅 to 泰爾, a 1989 PRC
simplified reprint kept 推羅, and 和合本修订版 (2010, the current
authoritative revision) reverted back to 推羅. Since 推罗/推羅 is what this
app overwhelmingly already uses (51+ of ~52 files touching Tyre), the
stray 泰尔/泰爾 files are the actual inconsistency, and this fixes them to
match the app's own established, still-current spelling -- not the other
way around.

Usage: python3 scripts/fix-tyre-stragglers.py <glob> [<glob> ...]
  e.g. python3 scripts/fix-tyre-stragglers.py "public/insights/zh-hant/*.json" "public/insights/zh-hans/*.json"
"""
import glob
import json
import sys

PAIRS = [
    ("泰尔", "推罗"),
    ("泰爾", "推羅"),
]


def main():
    patterns = sys.argv[1:]
    if not patterns:
        print(__doc__)
        sys.exit(1)

    files = []
    for pattern in patterns:
        files.extend(glob.glob(pattern))

    total = 0
    for path in sorted(set(files)):
        with open(path, "r", encoding="utf-8") as f:
            raw = f.read()
        new_raw = raw
        per_file = []
        for old, new in PAIRS:
            count = new_raw.count(old)
            if count:
                new_raw = new_raw.replace(old, new)
                per_file.append(f"{old}->{new}:{count}")
        if new_raw == raw:
            continue
        json.loads(raw)
        json.loads(new_raw)
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_raw)
        print(f"{path}: {', '.join(per_file)}")
        total += 1

    print(f"\n{total} file(s) fixed")


if __name__ == "__main__":
    main()
