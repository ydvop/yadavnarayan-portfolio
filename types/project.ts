export type VideoCategory =
  | "Events"
  | "Podcasts"
  | "Gaming"
  | "Vlogs";

export type VideoRole = "Editor" | "Motion" | "Sound" | "Full Stack";

export interface VideoEntry {
  youtubeId: string;
  label?: string;
  startAt?: number;
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
  videos: VideoEntry[];
  thumbnailOverride?: string;
}

export type ThumbnailQuality =
  | "maxresdefault"
  | "hqdefault"
  | "mqdefault"
  | "default";
