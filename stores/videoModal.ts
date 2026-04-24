import { create } from "zustand";
import type { Project } from "@/types/project";
import type { RefObject } from "react";

interface VideoModalState {
  isOpen: boolean;
  activeProject: Project | null;
  activeVideoIndex: number;
  triggerCardRef: RefObject<HTMLElement | null> | null;
  openModal: (
    project: Project,
    ref: RefObject<HTMLElement | null>
  ) => void;
  closeModal: () => void;
  setVideoIndex: (index: number) => void;
}

export const useVideoModal = create<VideoModalState>((set) => ({
  isOpen: false,
  activeProject: null,
  activeVideoIndex: 0,
  triggerCardRef: null,
  openModal: (project, ref) =>
    set({
      isOpen: true,
      activeProject: project,
      activeVideoIndex: 0,
      triggerCardRef: ref,
    }),
  closeModal: () =>
    set({
      isOpen: false,
      activeProject: null,
      activeVideoIndex: 0,
      triggerCardRef: null,
    }),
  setVideoIndex: (index) => set({ activeVideoIndex: index }),
}));
