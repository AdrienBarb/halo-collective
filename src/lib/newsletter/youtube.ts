// Detect a YouTube video id from common URL shapes:
//   https://www.youtube.com/watch?v=<id>
//   https://youtu.be/<id>
//   https://www.youtube.com/embed/<id>
//   https://www.youtube.com/shorts/<id>
// Returns the 11-character video id, or null when the URL is missing or
// not a recognisable YouTube link. Renderer code uses this to pick
// between an embed-aware label/style and a plain external link.

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function parseYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!YOUTUBE_HOSTS.has(parsed.hostname)) return null;

  if (parsed.hostname === "youtu.be" || parsed.hostname === "www.youtu.be") {
    const id = parsed.pathname.replace(/^\/+/, "").split("/")[0] ?? "";
    return VIDEO_ID_PATTERN.test(id) ? id : null;
  }

  const v = parsed.searchParams.get("v");
  if (v && VIDEO_ID_PATTERN.test(v)) return v;

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments[0] === "embed" || segments[0] === "shorts" || segments[0] === "v") {
    const id = segments[1] ?? "";
    return VIDEO_ID_PATTERN.test(id) ? id : null;
  }

  return null;
}

export function isYouTubeUrl(url: string | null | undefined): boolean {
  return parseYouTubeId(url) !== null;
}
