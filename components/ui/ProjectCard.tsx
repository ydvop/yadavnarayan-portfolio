"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import type { Project } from "@/types/project";
import { getThumbnailURL } from "@/lib/youtube";
import { trackEvent } from "@/lib/analytics";
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

  const handleClick = () => {
    trackEvent("video_play_intent", {
      project_id: project.id,
      project_title: project.title,
      client: project.client,
      category: project.category,
      role: project.role,
      video_index: 0,
    });
    openModal(project, cardRef);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      role="article"
      className="group cursor-pointer overflow-hidden rounded-2xl bg-[hsl(var(--bg-secondary))] shadow-lg transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:scale-[1.02]"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      tabIndex={0}
      aria-label={`${project.title} by ${project.client} — click to watch`}
    >
      {/* Thumbnail */}
      <div className="overflow-hidden rounded-t-2xl">
        <LiteYouTube
          videoId={project.videos[0].youtubeId}
          thumbnailURL={thumbnailURL}
          title={project.title}
          priority={index < 2}
          className="transition-transform duration-400 group-hover:scale-[1.03]"
        />
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-2 p-5">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[hsl(var(--accent-orange))] px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--text-primary))]">
            {project.category}
          </span>
          <span className="text-xs text-[hsl(var(--text-muted))]">
            {project.year}
          </span>
        </div>
        <h3 className="text-lg font-bold text-[hsl(var(--text-primary))] text-pretty">
          {project.title}
        </h3>
        <p className="text-sm text-[hsl(var(--text-secondary))]">
          {project.client}
        </p>
        <p className="line-clamp-2 text-sm text-[hsl(var(--text-muted))]">
          {project.description}
        </p>
        <span className="mt-1 text-xs font-medium uppercase tracking-wider text-[hsl(var(--accent-orange))]">
          Role: {project.role}
        </span>
      </div>
    </motion.div>
  );
}
