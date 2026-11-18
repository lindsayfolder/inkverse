#!/usr/bin/env python3
"""Regenerates src/data/jesusWords.ts from scripts/data/red_letter_verses.json.

The source file is the "Words of Jesus Christ (red letter edition)" verse
list from kjvstudy.org (https://github.com/kennethreitz/kjvstudy.org, ISC
License, Copyright (c) 2025 Kenneth Reitz) -- 2007 KJV verse references
across Matthew, Mark, Luke, John, Acts, and Revelation, fetched from
raw.githubusercontent.com/kennethreitz/kjvstudy.org/main/kjvstudy_org/data/
red_letter_verses.json. Only the verse *references* are used here (not the
quoted text), since this app marks whole verses rather than sub-verse spans
-- see the comment atop the generated file for why.
"""
import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_JSON = ROOT / "scripts" / "data" / "red_letter_verses.json"
OUT_TS = ROOT / "src" / "data" / "jesusWords.ts"

BOOK_ID = {
    "Matthew": "mat",
    "Mark": "mar",
    "Luke": "luk",
    "John": "joh",
    "Acts": "act",
    "Revelation": "rev",
}

REF_RE = re.compile(r"^(\d?\s?[A-Za-z]+)\s(\d+):(\d+)$")

HEADER = '''// Verse references where Jesus speaks (the traditional "red letter" set:
// whole verses in the Gospels, Acts, and Revelation that contain his spoken
// words, including verses where the words are only part of the verse -- this
// app marks those whole verses rather than sub-verse spans, since spans would
// only be accurate for the exact KJV wording and not for WEB or the Chinese
// translations, which this app treats as interchangeable by bookId/chapter/
// verse across every other feature (bookmarks, notes, search navigation).
//
// Source: the "Words of Jesus Christ (red letter edition)" verse list from
// kjvstudy.org (https://github.com/kennethreitz/kjvstudy.org, ISC License,
// Copyright (c) 2025 Kenneth Reitz), 2007 verses across Matthew, Mark, Luke,
// John, Acts, and Revelation. Regenerate with scripts/build-jesus-words.py.
'''


def main() -> None:
    src = json.loads(SRC_JSON.read_text())
    verses = src["verses"]

    by_book: dict[str, dict[int, list[int]]] = defaultdict(lambda: defaultdict(list))
    bad = []
    for ref in verses:
        m = REF_RE.match(ref)
        if not m:
            bad.append(ref)
            continue
        book, chap, verse = m.group(1), int(m.group(2)), int(m.group(3))
        bid = BOOK_ID.get(book)
        if not bid:
            bad.append(ref)
            continue
        by_book[bid][chap].append(verse)

    if bad:
        raise SystemExit(f"Unparsed/unknown-book references, fix BOOK_ID or REF_RE: {bad}")

    lines = [HEADER.rstrip("\n")]
    lines.append("const JESUS_WORDS_VERSES: Record<string, Record<number, number[]>> = {")
    for bid in sorted(by_book):
        lines.append(f"  {bid}: {{")
        for ch in sorted(by_book[bid]):
            vs = sorted(set(by_book[bid][ch]))
            lines.append(f"    {ch}: {json.dumps(vs, separators=(',', ''))},")
        lines.append("  },")
    lines.append("};")
    lines.append("")
    lines.append("export function isJesusWords(bookId: string, chapter: number, verse: number): boolean {")
    lines.append("  const verses = JESUS_WORDS_VERSES[bookId]?.[chapter];")
    lines.append("  return verses !== undefined && verses.includes(verse);")
    lines.append("}")
    lines.append("")

    OUT_TS.write_text("\n".join(lines))
    total = sum(len(vs) for chmap in by_book.values() for vs in chmap.values())
    print(f"Wrote {OUT_TS} -- {total} verse references across {len(by_book)} books.")


if __name__ == "__main__":
    main()
