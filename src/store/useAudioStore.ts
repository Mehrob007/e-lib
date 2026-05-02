import { create } from "zustand";

interface AudioData {
  id: string;
  src: string;
  title: string;
  author: string;
  image: string;
}

interface AudioStore {
  currentAudio: AudioData | null;
  isPlaying: boolean;
  setAudio: (audio: AudioData) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
}

export const useAudioStore = create<AudioStore>((set) => ({
  currentAudio: null,
  isPlaying: false,
  setAudio: (audio) => set({ currentAudio: audio, isPlaying: true }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  stop: () => set({ currentAudio: null, isPlaying: false }),
}));
