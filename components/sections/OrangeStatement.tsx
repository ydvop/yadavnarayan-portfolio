"use client";

import { useRef, useEffect, useState } from "react";

const STATEMENT_WORDS = [
  "I", "craft", "stories", "that", "move", "people", "—",
  "through", "every", "frame,", "cut,", "and", "transition.",
  "Every", "edit", "is", "a", "choice.", "Every", "choice",
  "shapes", "the", "rhythm.",
];

export function OrangeStatement() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setProgress(1);
      return;
    }

    let rafId: number | null = null;

    function updateFill() {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;

      // The section is tall (300vh). The sticky container stays fixed for 200vh of scroll.
      // Progress goes from 0 to 1 as the user scrolls through the extra height.
      // rect.top starts at ~0 when section enters, goes to -(300vh - 100vh) = -200vh
      const scrollableDistance = section.offsetHeight - vh;
      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / scrollableDistance));
      setProgress(p);
    }

    function onScroll() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateFill);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    updateFill();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Calculate which word index should be fully filled
  const totalWords = STATEMENT_WORDS.length;
  const filledUpTo = Math.max(0, progress * totalWords) || 0;

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative bg-[hsl(var(--accent-orange))] video-editing-doodles"
      style={{ height: "300vh" }}
    >
      {/* Sticky container that stays in view while the tall section scrolls */}
      <div
        ref={stickyRef}
        className="sticky top-0 flex h-screen items-center justify-center px-6 lg:px-8"
      >
        <div className="mx-auto max-w-5xl">
          <p className="flex flex-wrap justify-center gap-x-[0.35em] gap-y-[0.15em] text-center text-[7vw] font-black leading-[1.15] tracking-tight sm:text-[5vw] lg:text-[3.5vw]">
            {STATEMENT_WORDS.map((word, i) => {
              // Each word transitions from muted to fully visible
              const wordProgress = Math.max(0, Math.min(1, filledUpTo - i));
              const opacity = Math.max(0.2, Math.min(1, 0.2 + wordProgress * 0.8));

              return (
                <span
                  key={`${word}-${i}`}
                  className="inline-block transition-opacity duration-150 ease-out"
                  style={{
                    opacity: isNaN(opacity) ? 0.2 : opacity,
                    color: "white",
                  }}
                >
                  {word}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
