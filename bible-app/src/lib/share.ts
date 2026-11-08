// Sharing one or more verses, kept deliberately defensive: iOS Safari's
// navigator.share() only honors the "this call came from a real tap"
// check for a short window after the gesture, rejects (rather than
// resolves) when the user dismisses the share sheet, and has no timeout
// of its own — so a share mechanism that's careless about any of that
// can read to the user as the whole app freezing. The guards below each
// correspond to one of those failure modes:
//   - a module-level busy flag stops a double-tap from firing a second
//     share() while the first is still open (some browsers throw
//     InvalidStateError on overlapping calls; at best it's confusing)
//   - AbortError from a user-dismissed share sheet is treated as a normal
//     "cancelled" outcome, never surfaced as a failure
//   - image generation is wrapped in its own short timeout and never
//     allowed to hold up the actual share() call past ~800ms, since that
//     delay is what risks the gesture-expiry rejection above — holds
//     regardless of how many verses are selected, since card generation
//     is still just text layout (fast) even for a few dozen verses
//   - clipboard writeText is the final fallback for browsers with no
//     Web Share API at all (desktop Chrome/Firefox)
//   - nothing here retains a reference to the canvas, blob, or File past
//     the call: once shareVerses() resolves there's nothing left to grow
//     across repeated shares — each call starts from nothing and leaves
//     nothing behind for the next one to build on
export type ShareOutcome = "shared" | "copied" | "cancelled" | "unavailable" | "failed";

export interface ShareVersesInput {
  reference: string;
  verses: { n: number; text: string }[];
  appName: string;
}

let sharing = false;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

function buildShareText(input: ShareVersesInput): string {
  if (input.verses.length === 1) {
    return `"${input.verses[0].text}"\n— ${input.reference}`;
  }
  return `${input.verses.map((v) => `${v.n} ${v.text}`).join("\n\n")}\n— ${input.reference}`;
}

export async function shareVerses(input: ShareVersesInput): Promise<ShareOutcome> {
  if (sharing) return "failed";
  sharing = true;
  try {
    const shareText = buildShareText(input);
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
      canShare?: (data: ShareData) => boolean;
    };

    if (nav.share) {
      // Image sharing is a nice-to-have, never a blocker: generation gets
      // a tight timeout, and any failure there (including the timeout
      // itself) just falls through to the plain text share below instead
      // of surfacing an error.
      try {
        const file = await withTimeout(renderVerseCard(input), 800);
        if (file && nav.canShare?.({ files: [file] })) {
          await nav.share({ files: [file], text: shareText, title: input.reference });
          return "shared";
        }
      } catch (err) {
        if (isAbort(err)) return "cancelled";
      }

      try {
        await nav.share({ text: shareText, title: input.reference });
        return "shared";
      } catch (err) {
        if (isAbort(err)) return "cancelled";
        // Not a cancel — fall through to clipboard rather than reporting
        // failure outright, since most share() rejections here are a
        // platform declining the specific payload, not a real error.
      }
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareText);
      return "copied";
    }
    return "unavailable";
  } catch {
    return "failed";
  } finally {
    sharing = false;
  }
}

// Kept as a thin single-verse convenience wrapper — same call shape every
// existing call site already uses, unchanged output for the one-verse
// case (buildShareText and renderVerseCard both special-case length 1).
export function shareVerse(input: { reference: string; text: string; appName: string }): Promise<ShareOutcome> {
  return shareVerses({ reference: input.reference, appName: input.appName, verses: [{ n: 0, text: input.text }] });
}

// Collapses a reader's tapped-in-any-order verse selection into the
// compact range notation apps conventionally share with ("1-3, 5" rather
// than "1, 2, 3, 5") — sorted and de-duplicated first since selection
// order shouldn't matter and a verse number is set-like (either tapped or
// not), not a sequence.
export function formatVerseRange(verseNumbers: number[]): string {
  const sorted = [...new Set(verseNumbers)].sort((a, b) => a - b);
  const parts: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i <= sorted.length; i++) {
    const n = sorted[i];
    if (n === prev + 1) {
      prev = n;
      continue;
    }
    parts.push(start === prev ? `${start}` : `${start}-${prev}`);
    if (n !== undefined) {
      start = n;
      prev = n;
    }
  }
  return parts.join(", ");
}

const CARD_WIDTH = 1080;
const MIN_CARD_HEIGHT = 1080;

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Deliberately uses generic system font stacks, not the app's custom
// webfonts — waiting on document.fonts.ready here would add an
// unbounded delay right before the share() call, which is exactly the
// kind of pre-share stall the gesture-expiry guard above exists to avoid.
async function renderVerseCard(input: ShareVersesInput): Promise<File | null> {
  const scratch = document.createElement("canvas").getContext("2d");
  if (!scratch) return null;

  const paper = getComputedStyle(document.documentElement).getPropertyValue("--paper-panel").trim() || "#f2e7d3";
  const ink = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#1c1a17";
  const gold = getComputedStyle(document.documentElement).getPropertyValue("--gold").trim() || "#c97a12";
  const margin = 96;
  const maxWidth = CARD_WIDTH - margin * 2;

  const single = input.verses.length === 1;

  if (single) {
    let fontSize = 58;
    let lines: string[] = [];
    do {
      scratch.font = `italic 600 ${fontSize}px Georgia, "Times New Roman", serif`;
      lines = wrapLines(scratch, input.verses[0].text, maxWidth);
      if (lines.length * (fontSize * 1.5) < MIN_CARD_HEIGHT - 320) break;
      fontSize -= 4;
    } while (fontSize > 28);

    const canvas = document.createElement("canvas");
    canvas.width = CARD_WIDTH;
    canvas.height = MIN_CARD_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    paintBackground(ctx, CARD_WIDTH, MIN_CARD_HEIGHT, paper, gold);

    const lineHeight = fontSize * 1.5;
    const totalHeight = lines.length * lineHeight;
    let y = (MIN_CARD_HEIGHT - totalHeight) / 2 - 40;
    ctx.fillStyle = ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = `italic 600 ${fontSize}px Georgia, "Times New Roman", serif`;
    lines.forEach((line, i) => {
      y += lineHeight;
      const decorated = lines.length === 1 ? `“${line}”` : i === 0 ? `“${line}` : i === lines.length - 1 ? `${line}”` : line;
      ctx.fillText(decorated, CARD_WIDTH / 2, y);
    });

    ctx.fillStyle = gold;
    ctx.font = `700 40px Georgia, "Times New Roman", serif`;
    ctx.fillText(input.reference, CARD_WIDTH / 2, y + lineHeight + 20);

    ctx.fillStyle = ink;
    ctx.globalAlpha = 0.55;
    ctx.font = `600 28px "Segoe UI", Helvetica, Arial, sans-serif`;
    ctx.fillText(input.appName, CARD_WIDTH / 2, MIN_CARD_HEIGHT - margin / 2);
    ctx.globalAlpha = 1;

    return toFile(canvas);
  }

  // Multiple verses: a left-aligned numbered list instead of a centered
  // quote, with the card's height growing to fit however many were
  // selected — capped at a sane font floor rather than an unbounded
  // shrink loop, so a very large selection still renders promptly instead
  // of the auto-shrink loop spinning toward an unreadably tiny size.
  let fontSize = 40;
  let blocks: { num: string; lines: string[] }[] = [];
  let lineHeight = fontSize * 1.45;
  for (; fontSize >= 26; fontSize -= 2) {
    scratch.font = `600 ${fontSize}px Georgia, "Times New Roman", serif`;
    const numWidth = scratch.measureText("000").width + 18;
    blocks = input.verses.map((v) => ({ num: String(v.n), lines: wrapLines(scratch, v.text, maxWidth - numWidth) }));
    lineHeight = fontSize * 1.45;
    const totalLines = blocks.reduce((sum, b) => sum + b.lines.length, 0);
    const contentHeight = totalLines * lineHeight + (blocks.length - 1) * (lineHeight * 0.4);
    if (contentHeight < 2400 || fontSize <= 26) break;
  }

  scratch.font = `600 ${fontSize}px Georgia, "Times New Roman", serif`;
  const numWidth = scratch.measureText("000").width + 18;
  const totalLines = blocks.reduce((sum, b) => sum + b.lines.length, 0);
  const contentHeight = totalLines * lineHeight + (blocks.length - 1) * (lineHeight * 0.4);
  const footerHeight = 220;
  const cardHeight = Math.max(MIN_CARD_HEIGHT, margin * 2 + contentHeight + footerHeight);

  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = cardHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  paintBackground(ctx, CARD_WIDTH, cardHeight, paper, gold);

  ctx.textBaseline = "alphabetic";
  ctx.font = `600 ${fontSize}px Georgia, "Times New Roman", serif`;
  let y = margin + fontSize;
  for (const block of blocks) {
    ctx.fillStyle = gold;
    ctx.textAlign = "right";
    ctx.fillText(block.num, margin + numWidth - 18, y);
    ctx.fillStyle = ink;
    ctx.textAlign = "left";
    for (const line of block.lines) {
      ctx.fillText(line, margin + numWidth, y);
      y += lineHeight;
    }
    y += lineHeight * 0.4;
  }

  ctx.fillStyle = gold;
  ctx.textAlign = "center";
  ctx.font = `700 40px Georgia, "Times New Roman", serif`;
  ctx.fillText(input.reference, CARD_WIDTH / 2, cardHeight - footerHeight / 2 - 20);

  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.55;
  ctx.font = `600 28px "Segoe UI", Helvetica, Arial, sans-serif`;
  ctx.fillText(input.appName, CARD_WIDTH / 2, cardHeight - margin / 2);
  ctx.globalAlpha = 1;

  return toFile(canvas);
}

function paintBackground(ctx: CanvasRenderingContext2D, w: number, h: number, paper: string, gold: string): void {
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = gold;
  ctx.fillRect(0, 0, w, 14);
}

async function toFile(canvas: HTMLCanvasElement): Promise<File | null> {
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return null;
  return new File([blob], "verses.png", { type: "image/png" });
}
