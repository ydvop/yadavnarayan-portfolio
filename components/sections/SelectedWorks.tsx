"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { VideoCategory } from "@/types/project";
import { getProjects } from "@/lib/projects";
import { trackEvent } from "@/lib/analytics";
import { ProjectCard } from "@/components/ui/ProjectCard";

const categories: Array<VideoCategory | "All"> = [
  "All",
  "Events",
  "Podcasts",
  "Gaming",
  "Vlogs",
];

export function SelectedWorks() {
  const [activeFilter, setActiveFilter] = useState<VideoCategory | "All">(
    "All"
  );
  const projects = getProjects();

  const filtered =
    activeFilter === "All"
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  const handleFilter = (cat: VideoCategory | "All") => {
    const prevFilter = activeFilter;
    setActiveFilter(cat);
    trackEvent("category_filter", {
      filter_value: cat,
      result_count: cat === "All" ? projects.length : projects.filter((p) => p.category === cat).length,
      previous_filter: prevFilter,
    });
  };

  return (
    <section
      id="work"
      className="relative bg-[hsl(var(--bg-warm))] px-6 py-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 flex flex-col gap-3">
          <span className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--accent-orange))]">
            Selected Works
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-[#1a1a1a] lg:text-5xl text-balance font-sans">
            Projects that speak for themselves
          </h2>
          <p className="max-w-2xl text-base text-[hsl(var(--text-muted))]">
            Each project reflects a sharp eye for detail, strong narrative structure, and purposeful editing. From high-energy promos to podcasts and branded content, every video is crafted to engage audiences and elevate the brand's message with clarity and impact.
          </p>
        </div>

        {/* Filter Bar */}
        <div
          className="mb-10 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter projects by category"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilter(cat)}
              aria-pressed={activeFilter === cat}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                activeFilter === cat
                  ? "bg-[hsl(var(--accent-orange))] text-[hsl(var(--text-primary))]"
                  : "bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-secondary))]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Project Grid */}
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
            <p className="text-lg text-[hsl(var(--text-muted))]">
              No projects in this category yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
