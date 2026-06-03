// Minimal ID3v2 tag reader — extracts only the TIT2 (title) frame.
// Supports ID3v2.3 and v2.4 with UTF-8 / ISO-8859-1 / UTF-16 encodings.
// Returns null on any failure so callers can fall back to the filename.

const MAX_TAG_SCAN = 128 * 1024; // 128 KB — enough for any real-world ID3 block

export async function readID3Title(file: File): Promise<string | null> {
  try {
    const headerBuf = await file.slice(0, 10).arrayBuffer();
    const hdr = new Uint8Array(headerBuf);

    // Check "ID3" magic
    if (hdr[0] !== 0x49 || hdr[1] !== 0x44 || hdr[2] !== 0x33) return null;

    // Sync-safe integer tag size (4 bytes, 7 bits each)
    const tagSize =
      ((hdr[6] & 0x7f) << 21) |
      ((hdr[7] & 0x7f) << 14) |
      ((hdr[8] & 0x7f) << 7) |
      (hdr[9] & 0x7f);

    const readLen = Math.min(tagSize + 10, MAX_TAG_SCAN);
    const tagBuf = await file.slice(0, readLen).arrayBuffer();
    const tag = new Uint8Array(tagBuf);

    let i = 10;
    while (i + 10 <= tag.length) {
      const frameId =
        String.fromCharCode(tag[i], tag[i + 1], tag[i + 2], tag[i + 3]);

      // Detect 3-char ID3v2.2 frame IDs (no longer supported, stop scanning)
      if (frameId === "\0\0\0\0") break;

      const frameSize =
        (tag[i + 4] << 24) | (tag[i + 5] << 16) | (tag[i + 6] << 8) | tag[i + 7];

      if (frameSize <= 0 || frameSize > readLen) break;

      if (frameId === "TIT2" && frameSize > 1) {
        const encoding = tag[i + 10];
        const textBytes = tag.slice(i + 11, i + 10 + frameSize);

        let title = "";
        if (encoding === 0) {
          // ISO-8859-1
          title = new TextDecoder("iso-8859-1").decode(textBytes).replace(/\0+$/, "").trim();
        } else if (encoding === 1) {
          // UTF-16 with BOM (skip 2-byte BOM)
          title = new TextDecoder("utf-16le").decode(textBytes.slice(2)).replace(/\0+$/, "").trim();
        } else {
          // UTF-8 (encoding === 3) or unknown — try UTF-8
          title = new TextDecoder("utf-8").decode(textBytes).replace(/\0+$/, "").trim();
        }

        return title.length > 0 ? title : null;
      }

      i += 10 + frameSize;
    }
    return null;
  } catch {
    return null;
  }
}

// Load only the audio metadata headers to obtain track duration.
// Uses preload="metadata" to avoid downloading the entire file.
export function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = "metadata";

    const done = (d: number) => {
      audio.src = "";
      audio.removeAttribute("src");
      resolve(d);
    };

    audio.addEventListener(
      "loadedmetadata",
      () => done(isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0),
      { once: true }
    );
    audio.addEventListener("error", () => done(0), { once: true });

    audio.src = url;
  });
}
