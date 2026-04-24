"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ReelCategory = "Sketch" | "Storytelling" | "Informative";

interface ReelItem {
  id: string;
  url: string;
  client: string;
  category: ReelCategory;
  title: string;
  description: string;
}

const reels: ReelItem[] = [
  {
    id: "sab-kuch-milega-lekin",
    url: "https://www.instagram.com/reel/DHcq4BMo6gq/",
    client: "fitnesstalks_with_pranit",
    category: "Sketch",
    title: "Sab kuch milega lekin.....",
    description: "A high-energy fitness humor reel built for social engagement.",
  },
  {
    id: "show-this-to-your-mom",
    url: "https://www.instagram.com/reel/DFCYrx2Ideg/",
    client: "fitnesstalks_with_pranit",
    category: "Sketch",
    title: "Show this to your mom",
    description: "A punchy collaboration reel designed for quick-scrolling audiences.",
  },
  {
    id: "chalo-karan-ahooja-chale",
    url: "https://www.instagram.com/reel/DD3n1dkos1Q/",
    client: "fitnesstalks_with_pranit",
    category: "Sketch",
    title: "Chalo karan ahooja chale",
    description: "A bold fitness anthem reel cut to feel energetic and shareable.",
  },
  {
    id: "love-is-overhyped",
    url: "https://www.instagram.com/p/DPT14pVlfMW/",
    client: "iknowanam",
    category: "Storytelling",
    title: "Love is overhyped.",
    description: "A reflective storytelling post about love, patience, companionship, and peace.",
  },
  {
    id: "aaj-admin-poetic-mood-mein-hai",
    url: "https://www.instagram.com/p/DQo0ZDklOph/",
    client: "iknowanam",
    category: "Storytelling",
    title: "Aaj admin poetic mood mein hai!",
    description: "A poetic storytelling post centered on life, motivation, and reflection.",
  },
  {
    id: "brain-on-empty",
    url: "https://www.instagram.com/reel/DJmDdJxTRCo/",
    client: "novoscan.me",
    category: "Informative",
    title: "Brain on Empty",
    description: "An informative reel breaking down focus fatigue, ATP, dopamine, and quick brain support fixes.",
  },
  {
    id: "feel-like-crap-syndrome",
    url: "https://www.instagram.com/reel/DJWVuewzUpp/",
    client: "novoscan.me",
    category: "Informative",
    title: "Feel Like Crap Syndrome",
    description: "An informative reel explaining hidden inflammation, detox load, and why normal labs can still miss the issue.",
  },
  {
    id: "thyroid-overmedication",
    url: "https://www.instagram.com/reel/DJ_zmMhT-WW/",
    client: "novoscan.me",
    category: "Informative",
    title: "Thyroid Overmedication",
    description: "An informative reel about thyroid dosage, anxiety, palpitations, and what standard labs may overlook.",
  },
];

declare global {
  interface Window {
    instgrm?: {
      Embeds?: {
        process: () => void;
      };
    };
  }
}

function loadInstagramEmbeds() {
  return new Promise<void>((resolve) => {
    const existing = document.getElementById("instagram-embed-script");
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = "instagram-embed-script";
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
}

export function ShortFormContent() {
  const [activeFilter, setActiveFilter] = useState<"All" | ReelCategory>("All");
  const filterBarRef = useRef<HTMLDivElement>(null);
  const reelsRowRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(
    () => ["All", ...new Set(reels.map((reel) => reel.category))] as Array<"All" | ReelCategory>,
    []
  );

  const filteredReels =
    activeFilter === "All"
      ? reels
      : reels.filter((reel) => reel.category === activeFilter);

  const scrollFilters = (direction: "left" | "right") => {
    const container = filterBarRef.current;
    if (!container) return;

    const distance = Math.round(container.clientWidth * 0.7);
    container.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  const scrollReels = (direction: "left" | "right") => {
    const container = reelsRowRef.current;
    if (!container) return;

    const distance = Math.round(container.clientWidth * 0.82);
    container.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | undefined;

    loadInstagramEmbeds().then(() => {
      if (cancelled) return;

      window.instgrm?.Embeds?.process?.();

      timeoutId = window.setTimeout(() => {
        window.instgrm?.Embeds?.process?.();
        window.requestAnimationFrame(() => {
          window.instgrm?.Embeds?.process?.();
        });
      }, 400);
    });

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [activeFilter]);

  return (
    <section
      id="short-form-content"
      className="relative bg-[hsl(var(--bg-primary))] px-6 py-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-3">
          <span className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--accent-orange))]">
            Short Form Content
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white lg:text-5xl text-balance font-sans">
            Reel stories built for fast attention
          </h2>
          <p className="max-w-2xl text-base text-[hsl(var(--text-muted))]">
            Storytelling that pulls viewers in, keeps the emotion moving, and
            turns every frame into something worth remembering. Each reel sits
            inside a clean portfolio frame that keeps the narrative front and
            center.
          </p>
        </div>

        <div className="mb-10 flex items-center gap-3" aria-label="Filter reels by category">
          <div
            ref={filterBarRef}
            className="flex flex-1 gap-2 overflow-x-auto scroll-smooth whitespace-nowrap pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Filter reels by category"
          >
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveFilter(category)}
                aria-pressed={activeFilter === category}
                className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                  activeFilter === category
                    ? "bg-[hsl(var(--accent-orange))] text-[hsl(var(--text-primary))]"
                    : "bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-warm))]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-[hsl(var(--text-muted))]">
            Swipe or use the arrows to view more reels.
          </p>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => scrollReels("left")}
              aria-label="Scroll reels left"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-secondary))] transition-colors hover:bg-[hsl(var(--bg-warm))]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollReels("right")}
              aria-label="Scroll reels right"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-secondary))] transition-colors hover:bg-[hsl(var(--bg-warm))]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            ref={reelsRowRef}
            className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filteredReels.map((reel, index) => (
              <motion.article
                key={reel.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="min-w-[260px] max-w-[340px] flex-[0_0_78%] overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-1 sm:flex-[0_0_42%] lg:flex-[0_0_28%]"
              >
                <div className="relative bg-[#faf8f3] p-2 pb-0">
                  <div className="reel-embed-wrapper overflow-hidden rounded-2xl bg-[#f5f5f5] [max-height:390px]">
                    <blockquote
                      className="instagram-media"
                      data-instgrm-permalink={reel.url}
                      data-instgrm-version="14"
                      style={{
                        minWidth: "280px",
                        maxWidth: "100%",
                        width: "100%",
                        margin: 0,
                      }}
                    />
                  </div>
                </div>

                <div className="relative z-10 -mt-8 flex flex-col gap-2 rounded-t-[28px] bg-[hsl(var(--bg-secondary))] px-4 pb-4 pt-5 shadow-[0_-10px_24px_rgba(0,0,0,0.06)]">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-[hsl(var(--accent-orange))] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--text-primary))]">
                      {reel.category}
                    </span>
                    <span className="text-[11px] text-[hsl(var(--text-muted))]">
                      Instagram Reel
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[hsl(var(--text-primary))] text-pretty">
                    {reel.title}
                  </h3>

                  <p className="text-xs font-medium text-[hsl(var(--text-secondary))]">
                    {reel.client}
                  </p>

                  <p className="text-xs text-[hsl(var(--text-muted))]">
                    {reel.description}
                  </p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}