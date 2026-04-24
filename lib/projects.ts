import type { Project } from "@/types/project";

export const projects: Project[] = [
  {
    id: "uxindia-2025-promo",
    title: "UXINDIA 2025 Promo",
    client: "UXINDIA",
    category: "Events",
    role: "Motion Designer",
    description:
      "Promotional event video highlighting UXINDIA 2025 and its design-focused experience.",
    year: 2025,
    featured: true,
    videos: [{ youtubeId: "xCtRBWz_VAE" }],
  },
  {
    id: "yacht-party-dubai",
    title: "Partying on Private Yacht In Dubai",
    client: "Fitnesstalks",
    category: "Vlogs",
    role: "Video Editor",
    description:
      "Travel vlog capturing a luxury private yacht party experience in Dubai.",
    year: 2025,
    featured: true,
    videos: [{ youtubeId: "cWLQMc9GJEc" }],
  },
  {
    id: "bb-ki-vines-transformation",
    title: "BB Ki Vines Transformation",
    client: "Fitnesstalks",
    category: "Vlogs",
    role: "Video Editor",
    description: "Vlog showcasing the transformation journey of BB Ki Vines.",
    year: 2025,
    featured: true,
    videos: [{ youtubeId: "KWmNP7-r1RU" }],
  },
  {
    id: "building-solana-podcast",
    title: "Building Solana, Podcast",
    client: "Solfate",
    category: "Podcasts",
    role: "Video Editor",
    description: "Podcast episode focused on building with Solana blockchain.",
    year: 2024,
    featured: true,
    videos: [{ youtubeId: "QTw9RT_PGRU" }],
  },
  {
    id: "design-power-india-talk",
    title: "What Does It Really Mean for India to Become a Design Power?",
    client: "UXINDIA",
    category: "Podcasts",
    role: "Video Editor",
    description:
      "Thought-provoking talk unpacking India's potential as a global design leader.",
    year: 2025,
    featured: true,
    videos: [{ youtubeId: "j72veh8D0Rw" }],
  },
  {
    id: "m56-scorpion-gaming",
    title: "M56 Scorpion History Compared",
    client: "High Ping Hero",
    category: "Gaming",
    role: "Video Editor",
    description:
      "Gaming review video exploring the history and comparison of the M56 Scorpion.",
    year: 2024,
    featured: true,
    videos: [{ youtubeId: "Ifs6JYY6g70" }],
  },
  {
    id: "dicker-max-gaming",
    title: "Dicker Max — Skewed Tank Destroyer",
    client: "High Ping Hero",
    category: "Gaming",
    role: "Video Editor",
    description:
      "Gaming review video diving into the unique traits of the Dicker Max.",
    year: 2024,
    featured: true,
    videos: [{ youtubeId: "Qq-qvJm8fRc" }],
  },
];

export function getProjects(): Project[] {
  return projects;
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}
