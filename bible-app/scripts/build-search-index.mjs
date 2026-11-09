#!/usr/bin/env node
// Builds one compact full-text search index per Bible version from the
// existing per-book scripture files (public/bible/<lang>/<id>.json), so the
// app can do real whole-Bible verse search instead of scanning per-book
// files one at a time. Output: public/search-index/<lang>.json.
//
// Format intentionally mirrors the source files' own shape — chapters as an
// array of verse arrays — just with the verse objects flattened to plain
// strings (dropping the redundant "n" key, since verse number is just the
// array index + 1) and merged across all 66 books into a single
// { [bookId]: string[][] } file per language. That keeps the format
// trivial to scan client-side while cutting both the per-verse JSON
// overhead and the 66-separate-HTTP-requests cost of loading books
// one at a time.
//
// Usage: node scripts/build-search-index.mjs

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_ROOT = join(ROOT, "public", "bible");
const DST_ROOT = join(ROOT, "public", "search-index");

const LANGS = ["en", "web", "zh-hant", "zh-hans"];

mkdirSync(DST_ROOT, { recursive: true });

// The ~15 largest books are split into 2-3 part files each (see
// src/lib/bookSplits.ts) so the app doesn't download a whole 200KB+ book
// just to open one chapter — e.g. gen-1.json/gen-2.json/gen-3.json instead
// of one gen.json. Detected here purely from the filename pattern
// (<bookId>-<partNumber>.json), not by importing bookSplits.ts itself —
// this is a plain Node script, not run through the app's TS/bundler
// toolchain, and book ids never contain a hyphen themselves, so the
// pattern is unambiguous. Parts are concatenated back into one combined
// entry per book, in part order, so the index's shape is unaffected by
// how the source happens to be chunked on disk.
const PART_FILE = /^(.+)-(\d+)$/;

for (const lang of LANGS) {
  const dir = join(SRC_ROOT, lang);
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  const index = {};
  const parts = new Map(); // bookId -> Map(partNumber -> chapters[][])
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(dir, file), "utf-8"));
    const stem = file.slice(0, -".json".length);
    const match = stem.match(PART_FILE);
    if (match) {
      const [, bookId, partNumber] = match;
      if (!parts.has(bookId)) parts.set(bookId, new Map());
      parts.get(bookId).set(Number(partNumber), data.chapters.map((chapter) => chapter.map((v) => v.t)));
    } else {
      index[data.id] = data.chapters.map((chapter) => chapter.map((v) => v.t));
    }
  }
  for (const [bookId, partChapters] of parts) {
    index[bookId] = [...partChapters.keys()].sort((a, b) => a - b).flatMap((n) => partChapters.get(n));
  }
  const dst = join(DST_ROOT, `${lang}.json`);
  const json = JSON.stringify(index);
  writeFileSync(dst, json);
  const books = Object.keys(index).length;
  const verses = Object.values(index).reduce(
    (sum, chapters) => sum + chapters.reduce((s, ch) => s + ch.length, 0),
    0
  );
  console.log(`${lang}.json — ${books} books, ${verses} verses, ${(json.length / 1024 / 1024).toFixed(2)} MB`);
}
