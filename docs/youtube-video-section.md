# Building the YouTube Video Section + Custom Popup Player

A complete guide to rebuilding the "Selected Works" video grid and the custom
modal player from this portfolio in another project.

Written so you can follow it top to bottom in a fresh repo, or hand it to a
coding agent as a spec. Every file is given in full.

---

## 1. What you're actually building

Two things that work together:

**A filterable grid of video cards.** Each card shows a YouTube thumbnail, a
category pill, title, client, and description. Clicking a card doesn't navigate
anywhere — it opens a modal.

**A custom popup player.** A portal-rendered modal with a 16:9 YouTube iframe,
project metadata underneath, an optional thumbnail strip when a project has
multiple videos, plus scroll lock, focus trap, Esc-to-close, and a hard iframe
teardown so audio never keeps playing after close.

### The one design decision that matters

**No YouTube iframe exists on the page until the user asks for it.**

A YouTube embed pulls ~1.5MB of JS and sets cookies on load. Eight of them on a
portfolio page is a dead Lighthouse score. So instead:

- The grid renders plain `<img>` thumbnails (~15KB each, straight from
  `img.youtube.com`).
- The iframe is created only when the modal opens, and destroyed when it closes.

This is the "lite embed" / facade pattern. Everything below follows from it.

### Data flow

```
lib/projects.ts  (your data)
        |
        v
SelectedWorks.tsx  ── filter state (All / Events / Gaming / ...)
        |
        v
ProjectCard.tsx  ── renders thumbnail, onClick -> openModal(project, cardRef)
        |
        v
stores/videoModal.ts  (zustand global store)
        |
        v
VideoModal.tsx  ── portal into <body>, builds iframe src, plays
```

The store is the reason the modal isn't nested inside the card. `VideoModal` is
mounted **once** at the root of the page; any card anywhere can open it by
writing to the store. No prop drilling, no eight modals in the DOM.

---

## 2. Dependencies

```bash
npm install zustand framer-motion
```

That's it. Everything else is React + your CSS framework. This project uses
Next.js 16 + React 19 + Tailwind, but see §11 for adapting to plain React/Vite.

### Next.js only: allow YouTube's image host

If you use `next/image` for thumbnails, this is **mandatory** or you get a
runtime error on every card:

```js
// next.config.mjs
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com", pathname: "/vi/**" },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
```

---

## 3. Layer 1 — the data model

`types/project.ts`

```ts
export type VideoCategory =
  | "Events"
  | "Podcasts"
  | "Gaming"
  | "Vlogs"
  | "Product Explainer";

export type VideoRole = "Editor" | "Motion" | "Sound" | "Full Stack";

export interface VideoEntry {
  youtubeId: string;
  label?: string;    // shown on the multi-video strip, e.g. "Director's cut"
  startAt?: number;  // seconds; deep-link into the video
}

export interface Project {
  id: string;
  title: string;
  client: string;
  category: VideoCategory;
  role: VideoRole;
  description: string;
  year: number;
  featured: boolean;
  videos: VideoEntry[];       // array, not a single id — see below
  thumbnailOverride?: string; // local image path, for when YT's thumb is bad
}

export type ThumbnailQuality =
  | "maxresdefault"
  | "hqdefault"
  | "mqdefault"
  | "default";
```

Two choices worth copying:

**`videos` is an array even when there's one video.** A single project often has
a teaser, a full cut, and a vertical version. Modeling it as an array from day
one means the multi-video strip in the modal is free later. Projects with one
entry just don't render the strip.

**`thumbnailOverride`.** YouTube auto-picks the thumbnail frame and sometimes
picks badly. This escape hatch lets you drop a hand-picked JPG in `/public` and
point at it without special-casing anything.

### Data source

`lib/projects.ts` — a plain typed array. No CMS, no fetch, no database.

```ts
import type { Project } from "@/types/project";

export const projects: Project[] = [
  {
    id: "uxindia-2025-promo",
    title: "UXINDIA 2025 Promo",
    client: "UXINDIA",
    category: "Events",
    role: "Motion",
    description:
      "Promotional event video highlighting UXINDIA 2025 and its design-focused experience.",
    year: 2025,
    featured: true,
    videos: [{ youtubeId: "xCtRBWz_VAE" }],
  },
  // ...more
];

export function getProjects(): Project[] {
  return projects;
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}
```

For a portfolio this is correct — the data changes when you ship, so it should
live in git and be statically rendered. Don't reach for a CMS until someone
non-technical needs to edit it.

The `getProjects()` indirection looks pointless now, but it's the seam where a
CMS fetch goes later without touching a single component.

---

## 4. Layer 2 — YouTube helpers

`lib/youtube.ts` — the only file that knows YouTube URL shapes exist.

```ts
import type { ThumbnailQuality } from "@/types/project";

const YT_ID_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/|youtube\.com\/.*[?&]v=)([a-zA-Z0-9_-]{11})/;

/** Accepts a bare 11-char ID or any YouTube URL shape; returns the ID. */
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

export function buildEmbedURL(videoId: string, opts: EmbedOptions = {}): string {
  const { autoplay = true, muted = true, startAt, loop = false } = opts;

  const params = new URLSearchParams({
    autoplay: String(+autoplay),
    mute: String(+muted),
    rel: "0",              // don't show unrelated channels' videos at the end
    modestbranding: "1",   // minimal YouTube logo
    iv_load_policy: "3",   // no annotation overlays
    playsinline: "1",      // iOS: play inline, don't hijack fullscreen
    enablejsapi: "0",      // we don't use the JS API, so don't load it
    disablekb: "0",        // keep keyboard controls (accessibility)
    cc_load_policy: "0",
    fs: "1",               // allow fullscreen button
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
```

Notes on the params, because these are the ones that bite:

- **`youtube-nocookie.com`** — YouTube's privacy-enhanced domain. No tracking
  cookies until the user actually plays. Same embed API, different host. Use it
  by default; it makes the cookie-banner conversation much shorter.
- **`playsinline: 1`** — without it, iOS Safari yanks the video into the native
  fullscreen player and your modal design is irrelevant.
- **`rel: 0`** — no longer fully removes related videos (YouTube changed this in
  2018), but it now limits them to the same channel. Still worth setting.
- **`autoplay` + `muted`** — browsers block unmuted autoplay. It works in the
  modal anyway (`muted: false`) because the modal is opened by a user click,
  which counts as a user gesture. Autoplaying **unmuted on page load** would be
  blocked; autoplaying from a click is fine.

---

## 5. Layer 3 — the lite embed component

`components/ui/LiteYouTube.tsx`

This is the facade: a thumbnail with a play button that swaps itself for a real
iframe on click. The grid uses it for thumbnails; it also works standalone for
an inline player.

```tsx
"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { buildEmbedURL, type EmbedOptions } from "@/lib/youtube";

interface LiteYouTubeProps {
  videoId: string;
  thumbnailURL: string;
  title: string;
  onPlayStart?: () => void;
  embedOptions?: EmbedOptions;
  className?: string;
  priority?: boolean;
}

interface LiteYouTubeState {
  phase: "idle" | "loading" | "ready" | "error";
  src: string | null;
}

export function LiteYouTube({
  videoId,
  thumbnailURL,
  title,
  onPlayStart,
  embedOptions = {},
  className = "",
  priority = false,
}: LiteYouTubeProps) {
  const [state, setState] = useState<LiteYouTubeState>({
    phase: "idle",
    src: null,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    if (state.phase !== "idle") return;
    setState({ phase: "loading", src: buildEmbedURL(videoId, embedOptions) });
    onPlayStart?.();
  }, [state.phase, videoId, embedOptions, onPlayStart]);

  const handleIframeLoad = useCallback(() => {
    setState((s) => ({ ...s, phase: "ready" }));
  }, []);

  const handleIframeError = useCallback(() => {
    setState({ phase: "error", src: null });
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-[inherit] bg-[#111] ${className}`}
      style={{ aspectRatio: "16/9" }}
      data-phase={state.phase}
    >
      {/* Thumbnail stays mounted until the iframe reports ready — prevents a
          black flash between "iframe inserted" and "iframe painted". */}
      {state.phase !== "ready" && (
        <button
          className="absolute inset-0 block cursor-pointer border-none bg-transparent p-0"
          onClick={handleClick}
          aria-label={`Play ${title}`}
          disabled={state.phase === "loading"}
        >
          <Image
            src={thumbnailURL}
            alt={`${title} thumbnail`}
            fill
            sizes="(max-width:768px) 100vw, 50vw"
            priority={priority}
            className="object-cover transition-transform duration-400"
            crossOrigin="anonymous"
            onError={(e) => {
              // maxresdefault doesn't exist for every video — walk down.
              const target = e.currentTarget as HTMLImageElement;
              if (target.src.includes("maxresdefault")) {
                target.src = target.src.replace("maxresdefault", "hqdefault");
              } else if (target.src.includes("hqdefault")) {
                target.src = target.src.replace("hqdefault", "mqdefault");
              } else if (target.src.includes("mqdefault")) {
                target.src = target.src.replace("mqdefault", "default");
              } else if (!target.src.includes("/images/video-placeholder")) {
                target.src = "/images/video-placeholder.jpg";
              }
            }}
          />

          {state.phase === "idle" && (
            <span className="absolute inset-0 grid place-items-center transition-opacity duration-200 hover:opacity-85">
              {/* YouTube-shaped play button, tinted to the brand accent */}
              <svg viewBox="0 0 68 48" width="68" height="48" aria-hidden="true">
                <path
                  d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-5.41 2.49-6.19 5.42C.13 12.21 0 24 0 24s.13 11.79 1.55 17.1c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 5.41-2.49 6.19-5.42C68.87 35.79 69 24 69 24S68.87 12.21 67.45 7.74z"
                  fill="#FF5A36"
                />
                <path d="M27 34l18-10-18-10v20z" fill="#fff" />
              </svg>
            </span>
          )}

          {state.phase === "loading" && (
            <span
              className="absolute inset-0 m-auto h-12 w-12 animate-spin rounded-full border-[3px] border-[rgba(255,255,255,0.2)] border-t-[#FF5A36]"
              aria-label="Loading video"
            />
          )}
        </button>
      )}

      {/* Iframe — only exists after a click */}
      {state.src && (
        <iframe
          src={state.src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-none"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        />
      )}

      {state.phase === "error" && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1a1a1a] text-white"
          aria-live="assertive"
        >
          <p className="text-sm">Video unavailable.</p>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#FF5A36] underline"
          >
            {"Watch on YouTube ->"}
          </a>
        </div>
      )}
    </div>
  );
}
```

### Why the four-phase state machine

`idle → loading → ready`, with `error` as an escape. It's more than a boolean
because each phase renders differently: idle shows a play button, loading shows
a spinner and disables the button (so a double-click can't fire two loads), and
`ready` is the only phase that unmounts the thumbnail. Collapsing this into
`hasClicked` gives you a black rectangle for the second or two before YouTube
paints.

### The thumbnail fallback chain

`maxresdefault.jpg` (1280×720) **does not exist for every video** — older or
low-res uploads never got one, and YouTube serves a 120×90 grey placeholder
instead of a 404. The `onError` chain walks maxres → hq → mq → default, then
falls back to a local placeholder.

Put a real `public/images/video-placeholder.jpg` in place. The last branch
assumes it exists, and without it a broken video gives you a broken image icon.

> **Caveat with `next/image`:** mutating `target.src` in `onError` overwrites the
> optimizer URL with a raw YouTube one, so the fallback image skips Next's image
> pipeline. It works and it's invisible to users, but it is a hack. In plain
> React with a normal `<img>` it's completely clean. If it bothers you, hold the
> quality in state instead and let React re-render the src.

### About `sandbox`

`allow-scripts allow-same-origin` normally cancels out the point of sandboxing —
but only for **same-origin** frames. This iframe is cross-origin
(`youtube-nocookie.com`), so "same origin" means YouTube's own origin, not
yours. The frame still can't touch your DOM or cookies. Keep the attribute.

---

## 6. Layer 4 — the modal store

`stores/videoModal.ts`

```ts
import { create } from "zustand";
import type { Project } from "@/types/project";
import type { RefObject } from "react";

interface VideoModalState {
  isOpen: boolean;
  activeProject: Project | null;
  activeVideoIndex: number;
  triggerCardRef: RefObject<HTMLElement | null> | null;
  openModal: (project: Project, ref: RefObject<HTMLElement | null>) => void;
  closeModal: () => void;
  setVideoIndex: (index: number) => void;
}

export const useVideoModal = create<VideoModalState>((set) => ({
  isOpen: false,
  activeProject: null,
  activeVideoIndex: 0,
  triggerCardRef: null,
  openModal: (project, ref) =>
    set({ isOpen: true, activeProject: project, activeVideoIndex: 0, triggerCardRef: ref }),
  closeModal: () =>
    set({ isOpen: false, activeProject: null, activeVideoIndex: 0, triggerCardRef: null }),
  setVideoIndex: (index) => set({ activeVideoIndex: index }),
}));
```

Small but load-bearing:

- **One modal instance for N cards.** The modal mounts once at page root.
- **`triggerCardRef` is the accessibility payload.** When the modal closes,
  focus must return to the card that opened it — otherwise a keyboard user gets
  dumped at the top of the document. Storing the ref is how the modal knows
  where "back" is.
- **`activeVideoIndex` resets to 0 on open and close.** Reopening a project
  always starts at its first video.

Zustand is ~1KB; Context + `useReducer` works identically if you'd rather not
add a dependency. Don't put this in URL state unless you want deep-linkable
videos (a legitimate upgrade — see §10).

---

## 7. Layer 5 — the popup player

`components/ui/VideoModal.tsx`

The big one. Read the numbered concerns after the code.

```tsx
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useVideoModal } from "@/stores/videoModal";
import { buildEmbedURL, getThumbnailURL } from "@/lib/youtube";

export function VideoModal() {
  const {
    isOpen, activeProject, activeVideoIndex, triggerCardRef,
    closeModal, setVideoIndex,
  } = useVideoModal();

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // (1) Portals need a DOM. Skip the first render so SSR and hydration agree.
  useEffect(() => { setMounted(true); }, []);

  // (2) Lock background scroll while open.
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // (3) Build the embed URL when opened or when the active video changes.
  useEffect(() => {
    if (!isOpen || !activeProject) { setIframeSrc(null); return; }
    const video = activeProject.videos[activeVideoIndex];
    setIframeSrc(
      buildEmbedURL(video.youtubeId, {
        autoplay: true,
        muted: false,       // safe: opening the modal was a user gesture
        startAt: video.startAt,
      })
    );
  }, [isOpen, activeProject, activeVideoIndex]);

  // (4) Hard teardown — kills audio the instant the modal closes.
  useEffect(() => {
    if (!isOpen && iframeRef.current) {
      iframeRef.current.src = "about:blank";
    }
  }, [isOpen]);

  // (5) Focus in on open, focus back to the trigger card on close.
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else if (triggerCardRef?.current) {
      triggerCardRef.current.focus();
    }
  }, [isOpen, triggerCardRef]);

  const handleClose = useCallback(() => { closeModal(); }, [closeModal]);

  // (6) Esc to close + Tab focus trap.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") { e.preventDefault(); handleClose(); return; }
      if (e.key !== "Tab") return;

      const focusable =
        modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], iframe, [tabindex]:not([tabindex="-1"])'
        ) ?? [];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    },
    [isOpen, handleClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // (7) Swapping videos: null the src first so React remounts the iframe.
  const handleVideoSwap = useCallback(
    (index: number) => {
      if (activeProject && index !== activeVideoIndex) {
        setIframeSrc(null);
        setTimeout(() => setVideoIndex(index), 50);
      }
    },
    [activeProject, activeVideoIndex, setVideoIndex]
  );

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && activeProject && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(0,0,0,0.85)] p-6 lg:p-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => {
            // (8) Backdrop click only — not clicks bubbling from the panel.
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${activeProject.title} – Video Player`}
            className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-[#141414]"
            style={{ maxHeight: "85vh" }}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              ref={closeButtonRef}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(0,0,0,0.6)] text-white/80 transition-colors hover:bg-[rgba(0,0,0,0.9)] hover:text-white"
              onClick={handleClose}
              aria-label="Close video"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {/* Player — reserve the 16:9 box before the iframe exists */}
            <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
              {iframeSrc ? (
                <iframe
                  ref={iframeRef}
                  src={iframeSrc}
                  title={activeProject.title}
                  allow="autoplay; fullscreen; encrypted-media"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-none"
                  referrerPolicy="strict-origin-when-cross-origin"
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
                  <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-[rgba(255,255,255,0.2)] border-t-[#FF5A36]" />
                </div>
              )}
            </div>

            {/* Multi-video strip — only when there's more than one */}
            {activeProject.videos.length > 1 && (
              <div
                className="flex gap-2 overflow-x-auto px-3 py-2 hide-scrollbar"
                role="tablist"
                aria-label="Video versions"
              >
                {activeProject.videos.map((v, i) => (
                  <button
                    key={v.youtubeId}
                    role="tab"
                    aria-selected={i === activeVideoIndex}
                    className={`relative flex-shrink-0 overflow-hidden rounded-md transition-all duration-200 ${
                      i === activeVideoIndex
                        ? "ring-2 ring-[#FF5A36] ring-offset-1 ring-offset-[#141414]"
                        : "opacity-50 hover:opacity-90"
                    }`}
                    onClick={() => handleVideoSwap(i)}
                    aria-label={v.label ?? `Video ${i + 1}`}
                  >
                    <img
                      src={getThumbnailURL(v.youtubeId, "hqdefault")}
                      alt={v.label ?? `Video ${i + 1}`}
                      loading="lazy"
                      className="h-12 w-20 object-cover lg:h-14 lg:w-24"
                    />
                    {v.label && (
                      <span className="absolute inset-x-0 bottom-0 bg-[rgba(0,0,0,0.7)] px-1.5 py-0.5 text-[9px] font-medium text-white">
                        {v.label}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-col gap-1.5 overflow-y-auto px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#FF5A36] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {activeProject.category}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#FF5A36]">
                  {activeProject.role}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">{activeProject.title}</h2>
              <p className="text-xs text-[#999]">
                {activeProject.client} &middot; {activeProject.description}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
```

### The eight things that make it feel right

**(1) `mounted` guard.** `createPortal` needs `document.body`, which doesn't
exist during SSR. Returning `null` until after mount keeps server and client
markup identical and avoids a hydration mismatch.

**(2) Scroll lock.** Setting `body.overflow = "hidden"` stops the page behind
the modal from scrolling. The cleanup function is not optional — without it, an
unmount while open leaves the whole site permanently unscrollable.

**(3) Building the src in an effect, not inline.** Because it lets you set it to
`null` deliberately, which is what powers (7).

**(4) Iframe teardown — the one everyone forgets.** Framer Motion's exit
animation keeps the modal in the DOM for ~300ms after close. That's 300ms of
audio playing over a page the user already dismissed. Forcing
`src = "about:blank"` kills the player instantly. **If you copy one line from
this document, copy this one.**

**(5) Focus management.** Focus moves to the close button on open (the 50ms
timeout waits for the portal to paint) and returns to the originating card on
close. This is the pair that makes the modal usable without a mouse.

**(6) Focus trap.** Tab from the last focusable element wraps to the first;
Shift+Tab from the first wraps to the last. Combined with `aria-modal="true"`
and `role="dialog"`, screen readers treat the rest of the page as inert.

**(7) The 50ms swap.** Changing an iframe's `src` in place doesn't reliably
reload YouTube's player — you can get a frozen frame or the old video's audio.
Setting src to `null`, letting React unmount the iframe, then setting the new
index on the next tick guarantees a fresh element. Crude, but it's one line and
it always works.

**(8) `e.target === e.currentTarget`.** Without this check, any click inside the
modal bubbles to the backdrop and closes it — including a click on the video.

---

## 8. Layer 6 — the card and the grid

`components/ui/ProjectCard.tsx`

```tsx
"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import type { Project } from "@/types/project";
import { getThumbnailURL } from "@/lib/youtube";
import { useVideoModal } from "@/stores/videoModal";
import { LiteYouTube } from "./LiteYouTube";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { openModal } = useVideoModal();

  const thumbnailURL =
    project.thumbnailOverride ??
    getThumbnailURL(project.videos[0].youtubeId, "maxresdefault");

  const handleClick = () => openModal(project, cardRef);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      role="article"
      className="group cursor-pointer overflow-hidden rounded-2xl bg-[#1a1a1a] shadow-lg transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:scale-[1.02]"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); }
      }}
      tabIndex={0}
      aria-label={`${project.title} by ${project.client} — click to watch`}
    >
      <div className="overflow-hidden rounded-t-2xl">
        <LiteYouTube
          videoId={project.videos[0].youtubeId}
          thumbnailURL={thumbnailURL}
          title={project.title}
          priority={index < 2}   // first two are likely above the fold
          className="transition-transform duration-400 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-col gap-2 p-5">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#FF5A36] px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
            {project.category}
          </span>
          <span className="text-xs text-[#808080]">{project.year}</span>
        </div>
        <h3 className="text-lg font-bold text-white">{project.title}</h3>
        <p className="text-sm text-[#b3b3b3]">{project.client}</p>
        <p className="line-clamp-2 text-sm text-[#808080]">{project.description}</p>
        <span className="mt-1 text-xs font-medium uppercase tracking-wider text-[#FF5A36]">
          Role: {project.role}
        </span>
      </div>
    </motion.div>
  );
}
```

Points worth carrying over:

- **`whileInView` + `viewport={{ once: true }}`** — cards fade up as you scroll,
  once. The `index * 0.1` delay staggers them. Keep the stagger under ~0.5s
  total or late cards feel broken.
- **`priority={index < 2}`** — the first two thumbnails preload; the rest lazy
  load. This is what keeps LCP fast.
- **Keyboard handler + `tabIndex={0}`.** The card is a clickable `div`, so it
  needs Enter/Space handling and a tab stop added manually. A `<button>` wrapper
  would give you this free, but then the nested play button becomes invalid
  HTML. This is the pragmatic trade — just don't skip the keyboard handler.

### The section with filters

`components/sections/SelectedWorks.tsx`

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { VideoCategory } from "@/types/project";
import { getProjects } from "@/lib/projects";
import { ProjectCard } from "@/components/ui/ProjectCard";

const categories: Array<VideoCategory | "All"> = [
  "All", "Events", "Podcasts", "Gaming", "Vlogs", "Product Explainer",
];

export function SelectedWorks() {
  const [activeFilter, setActiveFilter] = useState<VideoCategory | "All">("All");
  const projects = getProjects();

  const filtered =
    activeFilter === "All"
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  return (
    <section id="work" className="relative bg-[#efeae1] py-24">
      <div className="container-shell">
        <div className="mb-12 flex flex-col gap-3">
          <span className="text-sm font-semibold uppercase tracking-widest text-[#FF5A36]">
            Selected Works
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-[#1a1a1a] lg:text-5xl">
            Projects that speak for themselves
          </h2>
        </div>

        {/* Filter bar */}
        <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              aria-pressed={activeFilter === cat}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                activeFilter === cat
                  ? "bg-[#FF5A36] text-white"
                  : "bg-[#121212] text-[#b3b3b3] hover:bg-[#1a1a1a]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid — keyed on the filter so the whole set animates on change */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <p className="text-lg text-[#808080]">No projects in this category yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
```

**`key={activeFilter}` with `AnimatePresence mode="wait"`** is the whole filter
animation. Changing the key makes React treat it as a new element, so the old
grid runs its exit animation, then the new one enters. `mode="wait"` prevents
them overlapping. Without the key you'd get an unanimated instant swap.

**Always write the empty state.** Filters produce empty results the moment you
add a category with nothing in it yet.

### Mount the modal once

```tsx
// app/page.tsx
export default function Home() {
  return (
    <main>
      <SelectedWorks />
      {/* ...other sections... */}
      <VideoModal />   {/* once, at the root */}
    </main>
  );
}
```

---

## 9. The CSS you need

Only one custom utility is required — the rest is Tailwind:

```css
/* Hide the scrollbar on the multi-video strip */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
```

Plus, if you keep the design tokens, define your accent once:

```css
:root {
  --accent-orange: 13 100% 60%;   /* used as hsl(var(--accent-orange)) */
}
```

And respect reduced motion globally — with this in place you don't need to
handle it in each Framer component:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 10. Gotchas, in the order they'll bite you

1. **Audio after close.** Covered in §7(4). Set the iframe src to
   `about:blank`.
2. **`next/image` throws on YouTube URLs** until `remotePatterns` includes
   `img.youtube.com`. §2.
3. **`maxresdefault` 404s** on older videos and you get a grey box, not an
   error. You need the fallback chain and a real placeholder file. §5.
4. **iOS fullscreen hijack** without `playsinline=1`. §4.
5. **Body scroll never restored** if the scroll-lock effect has no cleanup. §7(2).
6. **Backdrop closes on inner clicks** without the `e.target === e.currentTarget`
   check. §7(8).
7. **Swapping `src` on a live iframe** is unreliable. Unmount and remount. §7(7).
8. **Keep your union types honest.** In this repo `VideoRole` is
   `"Editor" | "Motion" | ...` but the data uses `"Video Editor"` and
   `"Motion Designer"` — and `next.config` sets
   `typescript.ignoreBuildErrors: true`, so nothing complains. Either widen the
   type to `string` or fix the data. Don't ship with type checking disabled and
   then trust your types.
9. **Framer Motion v11 vs v12+.** The package was renamed to `motion` in v12
   (`import { motion } from "motion/react"`). The API here is unchanged; only
   the import path differs. Check which you installed.
10. **`useState` for filters loses the state on back-navigation.** Fine for a
    portfolio. If it matters, move the filter and the open video into search
    params (`?filter=Gaming&v=xCtRBWz_VAE`) — that also makes individual videos
    shareable, which the current implementation can't do.

---

## 11. Porting to plain React (Vite, CRA, Remix, anything)

Four changes, all mechanical:

1. **Drop `"use client"`.** Next-specific.
2. **`next/image` → `<img>`:**
   ```tsx
   <img
     src={thumbnailURL}
     alt={`${title} thumbnail`}
     loading={priority ? "eager" : "lazy"}
     className="absolute inset-0 h-full w-full object-cover"
     onError={/* same fallback chain, now completely clean */}
   />
   ```
   Delete the `remotePatterns` config — it's not needed.
3. **`mounted` guard is optional** without SSR, but harmless. Keep it if you
   might add SSR later.
4. **Path aliases.** `@/lib/youtube` needs a `vite.config` alias or a
   `tsconfig` `paths` entry; otherwise use relative imports.

Everything else — the store, the state machine, the portal, focus trap, iframe
teardown — is framework-agnostic React.

### Swapping YouTube for Vimeo

Only `lib/youtube.ts` changes. Vimeo's embed is
`https://player.vimeo.com/video/{id}?autoplay=1&muted=0`, and thumbnails need an
API call (`https://vimeo.com/api/v2/video/{id}.json`) rather than a predictable
URL — so you'd either fetch at build time or lean on `thumbnailOverride`. Every
other layer is untouched. That's the payoff of keeping URL construction in one
file.

---

## 12. Build order

Bottom-up. Each step is verifiable before the next one exists.

- [ ] `types/project.ts` — the data model
- [ ] `lib/projects.ts` — 2-3 real projects, not lorem ipsum
- [ ] `lib/youtube.ts` — paste an ID into `buildEmbedURL`, open the URL, confirm it plays
- [ ] `next.config` image `remotePatterns` (Next only)
- [ ] `public/images/video-placeholder.jpg` — a real file
- [ ] `LiteYouTube.tsx` — render one standalone; test click → play, and a bad ID → error state
- [ ] `ProjectCard.tsx` — render one; check the thumbnail and hover
- [ ] `stores/videoModal.ts`
- [ ] `VideoModal.tsx` — mount at root; wire the card's onClick
- [ ] Test: Esc, backdrop click, close button, Tab trap, focus return
- [ ] Test: close mid-playback → **audio must stop immediately**
- [ ] `SelectedWorks.tsx` — grid + filter bar + empty state
- [ ] Add a project with 2+ videos to exercise the strip
- [ ] Mobile pass: iOS Safari inline playback, no horizontal overflow

---

## 13. Accessibility checklist

Everything the implementation above already handles — verify each after porting:

- [ ] `role="dialog"` + `aria-modal="true"` on the modal panel
- [ ] `aria-label` on the dialog naming the video
- [ ] Focus moves into the modal on open
- [ ] Focus returns to the triggering card on close
- [ ] Tab is trapped inside while open
- [ ] Esc closes
- [ ] Cards are reachable by Tab and activate on Enter/Space
- [ ] Play button has an `aria-label` naming the video ("Play {title}")
- [ ] Filter buttons use `aria-pressed`
- [ ] Video strip uses `role="tablist"` / `role="tab"` / `aria-selected`
- [ ] Error state is `aria-live="assertive"`
- [ ] `disablekb: 0` keeps YouTube's own keyboard controls working
- [ ] Reduced motion respected globally

---

## Appendix — file map

```
types/project.ts                     data model
lib/youtube.ts                       URL construction (the only YT-aware file)
lib/projects.ts                      the content
stores/videoModal.ts                 modal open/close state
components/ui/LiteYouTube.tsx        thumbnail → iframe facade
components/ui/ProjectCard.tsx        one card in the grid
components/ui/VideoModal.tsx         the popup player
components/sections/SelectedWorks.tsx  the section: header, filters, grid
app/page.tsx                         mounts <VideoModal /> once
```

Roughly 600 lines total, no video library, no CMS.
