#!/usr/bin/env python3
"""Builds public/crossrefs/<book>.json from OpenBible.info's community
cross-reference dataset (CC BY 2016, https://www.openbible.info/labs/cross-references/).

Source file needed (not committed to this repo -- raw source data, not an
app asset): cross_references.txt, a TSV of `From Verse  To Verse  Votes`
rows e.g. "Gen.1.1  John.1.1  45". Get it from, e.g.,
https://github.com/neuu-org/bible-crossrefs-dataset
(data/00_raw/openbible/cross_references.txt in that repo -- NOT the
data/01_processed or data/02_unified paths, which are Git LFS pointers in
a shallow anonymous clone) and point SRC below at it, or pass its path as
the first argument.

Trims to votes >= 3 (~111k of the full ~344k rows, matching the ~120k
"trimmed, high-confidence" scope decided on) and caps at 8 refs per verse
(a handful of "hub" verses have 60+ raw matches, which would overwhelm the
UI). One dataset serves all 4 translations -- cross-references are verse
addresses, not translated prose, so there's no per-language variant.
"""
import json
import math
import re
import sys
from collections import defaultdict
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/tmp/xref-src/cross_references.txt")
BIBLE_DIR = REPO_ROOT / "public" / "bible" / "en"
OUT_DIR = REPO_ROOT / "public" / "crossrefs"
VOTE_THRESHOLD = 3
MAX_REFS_PER_VERSE = 8

BOOK_ORDER = [
    "gen","exo","lev","num","deu","jos","jdg","rut","1sa","2sa","1ki","2ki","1ch","2ch",
    "ezr","neh","est","job","psa","pro","ecc","sos","isa","jer","lam","eze","dan","hos",
    "joe","amo","oba","jon","mic","nah","hab","zep","hag","zec","mal",
    "mat","mar","luk","joh","act","rom","1co","2co","gal","eph","phi","col","1th","2th",
    "1ti","2ti","tit","phm","heb","jas","1pe","2pe","1jo","2jo","3jo","jud","rev",
]
CHAPTER_COUNTS = {
    "gen":50,"exo":40,"lev":27,"num":36,"deu":34,"jos":24,"jdg":21,"rut":4,"1sa":31,"2sa":24,
    "1ki":22,"2ki":25,"1ch":29,"2ch":36,"ezr":10,"neh":13,"est":10,"job":42,"psa":150,"pro":31,
    "ecc":12,"sos":8,"isa":66,"jer":52,"lam":5,"eze":48,"dan":12,"hos":14,"joe":3,"amo":9,
    "oba":1,"jon":4,"mic":7,"nah":3,"hab":3,"zep":3,"hag":2,"zec":14,"mal":4,
    "mat":28,"mar":16,"luk":24,"joh":21,"act":28,"rom":16,"1co":16,"2co":13,"gal":6,"eph":6,
    "phi":4,"col":4,"1th":5,"2th":3,"1ti":6,"2ti":4,"tit":3,"phm":1,"heb":13,"jas":5,
    "1pe":5,"2pe":3,"1jo":5,"2jo":1,"3jo":1,"jud":1,"rev":22,
}
# Must match src/lib/bookSplits.ts's SPLIT_BOOKS -- these books' KJV text
# ships as multiple part-files, not one <id>.json.
SPLIT_BOOKS = {
    "psa":3,"jer":3,"eze":3,"gen":3,"isa":3,
    "num":2,"exo":2,"deu":2,"luk":2,"2ch":2,"act":2,"mat":2,"lev":2,"1sa":2,"1ki":2,
}

# OpenBible.info's book abbreviations -> this app's book ids (src/data/books.ts).
OPENBIBLE_ABBR_TO_ID = {
    "1Chr":"1ch","1Cor":"1co","1John":"1jo","1Kgs":"1ki","1Pet":"1pe","1Sam":"1sa","1Thess":"1th","1Tim":"1ti",
    "2Chr":"2ch","2Cor":"2co","2John":"2jo","2Kgs":"2ki","2Pet":"2pe","2Sam":"2sa","2Thess":"2th","2Tim":"2ti","3John":"3jo",
    "Acts":"act","Amos":"amo","Col":"col","Dan":"dan","Deut":"deu","Eccl":"ecc","Eph":"eph","Esth":"est","Exod":"exo",
    "Ezek":"eze","Ezra":"ezr","Gal":"gal","Gen":"gen","Hab":"hab","Hag":"hag","Heb":"heb","Hos":"hos","Isa":"isa",
    "Jas":"jas","Jer":"jer","Job":"job","Joel":"joe","John":"joh","Jonah":"jon","Josh":"jos","Jude":"jud","Judg":"jdg",
    "Lam":"lam","Lev":"lev","Luke":"luk","Mal":"mal","Mark":"mar","Matt":"mat","Mic":"mic","Nah":"nah","Neh":"neh",
    "Num":"num","Obad":"oba","Phil":"phi","Phlm":"phm","Prov":"pro","Ps":"psa","Rev":"rev","Rom":"rom","Ruth":"rut",
    "Song":"sos","Titus":"tit","Zech":"zec","Zeph":"zep",
}

REF_RE = re.compile(r"^([1-3]?[A-Za-z]+)\.(\d+)\.(\d+)$")


def parse_ref(s):
    m = REF_RE.match(s)
    if not m:
        return None
    abbr, c, v = m.group(1), int(m.group(2)), int(m.group(3))
    bid = OPENBIBLE_ABBR_TO_ID.get(abbr)
    if not bid:
        return None
    return bid, c, v


def parse_side(side):
    """Returns (bookId, chapter, verseStart, verseEnd_or_None). Handles
    'Book.C.V' and 'Book.C.V1-Book.C.V2' (range always within one chapter
    in this dataset)."""
    if "-" in side:
        left, right = side.split("-", 1)
        a = parse_ref(left)
        if not a:
            return None
        b = parse_ref(right)
        end = b[2] if b and b[0] == a[0] and b[1] == a[1] else None
        return a[0], a[1], a[2], end
    a = parse_ref(side)
    if not a:
        return None
    return a[0], a[1], a[2], None


def load_verse_counts():
    """bookId -> {chapter: maxVerse}, reading the shipped KJV text (respecting split-book files)."""
    counts = {}
    for bid in BOOK_ORDER:
        total_chapters = CHAPTER_COUNTS[bid]
        parts = SPLIT_BOOKS.get(bid)
        chapters = []
        if parts:
            per_part = math.ceil(total_chapters / parts)
            for i in range(1, parts + 1):
                f = BIBLE_DIR / f"{bid}-{i}.json"
                data = json.loads(f.read_text())
                chapters.extend(data["chapters"])
        else:
            f = BIBLE_DIR / f"{bid}.json"
            data = json.loads(f.read_text())
            chapters = data["chapters"]
        counts[bid] = {str(ci + 1): len(verses) for ci, verses in enumerate(chapters)}
    return counts


def main():
    if not SRC.exists():
        print(f"Source file not found: {SRC}\nSee this script's module docstring for where to get it.")
        sys.exit(1)

    verse_counts = load_verse_counts()

    # from_key "bookId:chapter:verse" -> list of (votes, toBookId, toChapter, toVerse, toVerseEnd)
    by_from = defaultdict(list)
    total_rows = 0
    skipped_parse = 0
    skipped_range = 0
    with SRC.open() as f:
        next(f)
        for line in f:
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 3:
                continue
            frm_s, to_s, votes_s = parts[0], parts[1], parts[2]
            try:
                votes = int(votes_s)
            except ValueError:
                continue
            if votes < VOTE_THRESHOLD:
                continue
            frm = parse_side(frm_s)
            to = parse_side(to_s)
            if not frm or not to:
                skipped_parse += 1
                continue
            from_bid, from_c, from_v, from_ve = frm
            to_bid, to_c, to_v, to_ve = to
            if from_bid not in CHAPTER_COUNTS or to_bid not in CHAPTER_COUNTS:
                skipped_parse += 1
                continue
            # Drop refs pointing past the chapter/verse this translation
            # actually has (rare versification mismatches between the
            # source dataset and our shipped KJV text).
            fc_max = verse_counts[from_bid].get(str(from_c))
            tc_max = verse_counts[to_bid].get(str(to_c))
            if fc_max is None or from_v > fc_max or tc_max is None or to_v > tc_max:
                skipped_range += 1
                continue
            if to_ve is not None and to_ve > tc_max:
                to_ve = None
            key = f"{from_bid}:{from_c}:{from_v}"
            by_from[key].append((votes, to_bid, to_c, to_v, to_ve))
            total_rows += 1

    print(f"parsed rows kept: {total_rows}, parse-skipped: {skipped_parse}, range-skipped: {skipped_range}")
    print(f"unique from-verses: {len(by_from)}")

    # bookId -> { chapter(str) -> { verse(str) -> [ {b,c,v,e?} ] } }
    per_book = {bid: defaultdict(dict) for bid in BOOK_ORDER}
    total_refs_out = 0
    for key, refs in by_from.items():
        from_bid, from_c, from_v = key.split(":")
        refs.sort(key=lambda r: -r[0])
        trimmed = refs[:MAX_REFS_PER_VERSE]
        out_list = []
        for votes, to_bid, to_c, to_v, to_ve in trimmed:
            obj = {"b": to_bid, "c": to_c, "v": to_v}
            if to_ve is not None and to_ve != to_v:
                obj["e"] = to_ve
            out_list.append(obj)
        per_book[from_bid][from_c][from_v] = out_list
        total_refs_out += len(out_list)

    print(f"total ref objects written: {total_refs_out}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    total_bytes = 0
    files_written = 0
    for bid in BOOK_ORDER:
        chapters = per_book[bid]
        if not chapters:
            continue
        obj = {}
        for c in sorted(chapters.keys()):
            vmap = chapters[c]
            obj[str(c)] = {str(v): refs for v, refs in sorted(vmap.items())}
        out_path = OUT_DIR / f"{bid}.json"
        text = json.dumps(obj, separators=(",", ":"), ensure_ascii=False)
        out_path.write_text(text)
        total_bytes += len(text.encode("utf-8"))
        files_written += 1

    print(f"files written: {files_written}, total size: {total_bytes/1024/1024:.2f} MB")


if __name__ == "__main__":
    main()
