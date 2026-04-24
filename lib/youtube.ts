import type { ThumbnailQuality } from "@/types/project";

const YT_ID_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/|youtube\.com\/.*[?&]v=)([a-zA-Z0-9_-]{11})/;

export function extractYouTubeId(input: string): string | null {
  if (!input) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  const match = input.match(YT_ID_REGEX);
  return match ? match[1] : null;
}

export interface EmbedOptions {
  autoplay?: boolean;
  muted?: boolean;
  startAt?: number;
  loop?: boolean;
}

export function buildEmbedURL(
  videoId: string,
  opts: EmbedOptions = {}
): string {
  const { autoplay = true, muted = true, startAt, loop = false } = opts;

  const params = new URLSearchParams({
    autoplay: String(+autoplay),
    mute: String(+muted),
    rel: "0",
    modestbranding: "1",
    iv_load_policy: "3",
    playsinline: "1",
    enablejsapi: "0",
    disablekb: "0",
    cc_load_policy: "0",
    fs: "1",
  });

  if (startAt) params.set("start", String(startAt));
  if (loop) params.set("loop", "1");

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
}

export function getThumbnailURL(
  videoId: string,
  quality: ThumbnailQuality = "maxresdefault"
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}
