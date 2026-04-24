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
    setState({
      phase: "loading",
      src: buildEmbedURL(videoId, embedOptions),
    });
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
      {/* Thumbnail — always in DOM until iframe ready */}
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
            style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
            crossOrigin="anonymous"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              // Try fallback resolutions in order
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

      {/* Iframe — injected only after click */}
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

      {/* Error State */}
      {state.phase === "error" && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1a1a1a] text-[hsl(var(--text-primary))]"
          aria-live="assertive"
        >
          <p className="text-sm">Video unavailable.</p>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[hsl(var(--accent-orange))] underline"
          >
            {"Watch on YouTube ->"}
          </a>
        </div>
      )}
    </div>
  );
}
