"use client";

import { useState } from "react";
import Image from "next/image";

interface Tool {
  name: string;
  abbr?: string;
  bg: string;
  fg: string;
  category: string;
  icon?: string;
}

const tools: Tool[] = [
  { name: "Premiere Pro", abbr: "Pr", bg: "#00005b", fg: "#9999ff", category: "Editing" },
  { name: "After Effects", abbr: "Ae", bg: "#00005b", fg: "#d291ff", category: "Motion" },
  { name: "DaVinci Resolve", bg: "#1a1a2e", fg: "#e94560", category: "Editing", icon: "davinci-resolve.png" },
  { name: "Photoshop", abbr: "Ps", bg: "#001e36", fg: "#31a8ff", category: "Design" },
  { name: "Lightroom", abbr: "Lr", bg: "#001e36", fg: "#31a8ff", category: "Design" },
  { name: "Figma", bg: "#1e1e1e", fg: "#a259ff", category: "Design", icon: "figma.svg" },
];

export function Tools() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section
      id="tools"
      className="relative overflow-hidden py-24 lg:py-32"
      style={{ backgroundColor: "#f0ece6" }}
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center gap-3 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(var(--accent-orange))]">
            MY TOOLKIT
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-[#1a1a1a] lg:text-5xl text-balance font-sans">
            Tools I use to create magic
          </h2>
          <p className="mt-2 max-w-md text-base text-[#666]">
            From editing suites to design tools, these are the instruments
            behind every project.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6">
          {tools.map((tool, i) => {
            const isHovered = hoveredIndex === i;

            return (
              <div
                key={tool.name}
                className="group relative flex flex-col items-center gap-3 rounded-2xl border border-transparent bg-white px-4 py-6 transition-all duration-300 ease-out"
                style={{
                  boxShadow: isHovered
                    ? "0 8px 30px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)"
                    : "0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)",
                  transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Icon Circle */}
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 ease-out"
                  style={{
                    backgroundColor: tool.bg,
                    transform: isHovered ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {tool.icon ? (
                    <Image
                      src={`/icons/${tool.icon}`}
                      alt={tool.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 object-contain"
                    />
                  ) : (
                    <span
                      className="text-lg font-bold"
                      style={{ color: tool.fg }}
                    >
                      {tool.abbr}
                    </span>
                  )}
                </div>

                {/* Name */}
                <span className="text-center text-xs font-semibold text-[#333] transition-colors duration-200">
                  {tool.name}
                </span>

                {/* Category tag */}
                <span
                  className="absolute -top-0 right-3 rounded-b-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-opacity duration-300"
                  style={{
                    backgroundColor: tool.bg,
                    color: tool.fg,
                    opacity: isHovered ? 1 : 0,
                  }}
                >
                  {tool.category}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
