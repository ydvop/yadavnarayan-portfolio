"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useVideoModal } from "@/stores/videoModal";
import { buildEmbedURL, getThumbnailURL } from "@/lib/youtube";
import { trackEvent } from "@/lib/analytics";

export function VideoModal() {
  const {
    isOpen,
    activeProject,
    activeVideoIndex,
    triggerCardRef,
    closeModal,
    setVideoIndex,
  } = useVideoModal();

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const openTimeRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      openTimeRef.current = Date.now();
      if (activeProject) {
        trackEvent("video_modal_open", {
          project_id: activeProject.id,
          project_title: activeProject.title,
          trigger: "card_click",
        });
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, activeProject]);

  // Set iframe src when open & index changes
  useEffect(() => {
    if (!isOpen || !activeProject) {
      setIframeSrc(null);
      return;
    }
    const video = activeProject.videos[activeVideoIndex];
    setIframeSrc(
      buildEmbedURL(video.youtubeId, {
        autoplay: true,
        muted: false,
        startAt: video.startAt,
      })
    );
  }, [isOpen, activeProject, activeVideoIndex]);

  // Tear down iframe on close
  useEffect(() => {
    if (!isOpen && iframeRef.current) {
      iframeRef.current.src = "about:blank";
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else if (triggerCardRef?.current) {
      triggerCardRef.current.focus();
    }
  }, [isOpen, triggerCardRef]);

  // Close handler with analytics
  const handleClose = useCallback(
    (trigger: "esc" | "backdrop" | "button") => {
      if (activeProject) {
        trackEvent("video_modal_close", {
          project_id: activeProject.id,
          close_trigger: trigger,
          session_duration_ms: Date.now() - openTimeRef.current,
        });
      }
      closeModal();
    },
    [activeProject, closeModal]
  );

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose("esc");
        return;
      }
      if (e.key !== "Tab") return;

      // Focus trap
      const focusable =
        modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], iframe, [tabindex]:not([tabindex="-1"])'
        ) ?? [];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [isOpen, handleClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleVideoSwap = useCallback(
    (index: number) => {
      if (activeProject && index !== activeVideoIndex) {
        trackEvent("video_swap", {
          project_id: activeProject.id,
          from_index: activeVideoIndex,
          to_index: index,
          video_label: activeProject.videos[index].label ?? `Video ${index + 1}`,
        });
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
            if (e.target === e.currentTarget) handleClose("backdrop");
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
            {/* Close Button */}
            <button
              ref={closeButtonRef}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(0,0,0,0.6)] text-white/80 transition-colors hover:bg-[rgba(0,0,0,0.9)] hover:text-white"
              onClick={() => handleClose("button")}
              aria-label="Close video"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Player */}
            <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
              {iframeSrc && (
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
              )}
              {!iframeSrc && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
                  <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-[rgba(255,255,255,0.2)] border-t-[#FF5A36]" />
                </div>
              )}
            </div>

            {/* Multi-video strip */}
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
                        ? "ring-2 ring-[hsl(var(--accent-orange))] ring-offset-1 ring-offset-[#141414]"
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
                <span className="rounded-full bg-[hsl(var(--accent-orange))] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {activeProject.category}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--accent-orange))]">
                  {activeProject.role}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">
                {activeProject.title}
              </h2>
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
