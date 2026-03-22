import { create } from 'zustand'
import type { FilterSettings, PerformanceStats, RenderMode, SourceMode } from '../types'

interface VideoStore {
  // 動画状態
  videoFile: File | null;
  videoUrl: string | null;
  isPlaying: boolean;

  // ソースモード
  sourceMode: SourceMode;
  cameraStream: MediaStream | null;

  // フィルター設定
  filters: FilterSettings;

  // レンダリングモード
  renderMode: RenderMode;

  // パフォーマンス
  perf: PerformanceStats;

  // アクション
  setVideoFile: (file: File) => void;
  clearVideo: () => void;
  setIsPlaying: (playing: boolean) => void;
  setSourceMode: (mode: SourceMode) => void;
  setCameraStream: (stream: MediaStream | null) => void;
  stopCamera: () => void;
  setFilter: <K extends keyof FilterSettings>(key: K, value: FilterSettings[K]) => void;
  resetFilters: () => void;
  setRenderMode: (mode: RenderMode) => void;
  updatePerf: (stats: Partial<PerformanceStats>) => void;
}

const defaultFilters: FilterSettings = {
  grayscale: false,
  sepia: false,
  invert: false,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  backgroundBlur: false,
  backgroundBlurRadius: 15,
}

export const useVideoStore = create<VideoStore>((set, get) => ({
  videoFile: null,
  videoUrl: null,
  isPlaying: false,
  sourceMode: 'file',
  cameraStream: null,
  filters: { ...defaultFilters },
  renderMode: 'wasm',
  perf: { fps: 0, msPerFrame: 0, frameCount: 0 },

  setVideoFile: (file) => {
    const prev = get().videoUrl;
    if (prev) URL.revokeObjectURL(prev);
    const url = URL.createObjectURL(file);
    set({ videoFile: file, videoUrl: url, isPlaying: false });
  },

  clearVideo: () => {
    const prev = get().videoUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({ videoFile: null, videoUrl: null, isPlaying: false });
  },

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  setSourceMode: (mode) => set({ sourceMode: mode }),

  setCameraStream: (stream) => set({ cameraStream: stream }),

  stopCamera: () => {
    const stream = get().cameraStream;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    set({ cameraStream: null, sourceMode: 'file', isPlaying: false });
  },

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: { ...defaultFilters } }),

  setRenderMode: (mode) => set({ renderMode: mode }),

  updatePerf: (stats) =>
    set((state) => ({ perf: { ...state.perf, ...stats } })),
}))
