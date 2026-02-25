import { create } from "zustand";

export interface FilterSettings {
  brightness: number; // -100〜100
  contrast: number; // -100〜100
  saturation: number; // -100〜100
  blur: number; // 0〜20
  sharpness: number; // 0〜100
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
}

const DEFAULT_FILTERS: FilterSettings = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  sharpness: 0,
  grayscale: false,
  sepia: false,
  invert: false,
};

export type RenderMode = "wasm" | "js";

interface EditorState {
  // 画像データ
  originalImageData: ImageData | null;
  imageWidth: number;
  imageHeight: number;

  // フィルター設定
  filters: FilterSettings;

  // レンダリングモード
  renderMode: RenderMode;

  // Undo/Redo
  history: FilterSettings[];
  historyIndex: number;

  // アクション
  setOriginalImageData: (data: ImageData) => void;
  updateFilter: <K extends keyof FilterSettings>(
    key: K,
    value: FilterSettings[K]
  ) => void;
  resetFilters: () => void;
  setRenderMode: (mode: RenderMode) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  originalImageData: null,
  imageWidth: 0,
  imageHeight: 0,

  filters: { ...DEFAULT_FILTERS },

  renderMode: "wasm",

  history: [{ ...DEFAULT_FILTERS }],
  historyIndex: 0,

  setOriginalImageData: (data: ImageData) =>
    set({
      originalImageData: data,
      imageWidth: data.width,
      imageHeight: data.height,
      filters: { ...DEFAULT_FILTERS },
      history: [{ ...DEFAULT_FILTERS }],
      historyIndex: 0,
    }),

  updateFilter: (key, value) => {
    const { filters, history, historyIndex } = get();
    const newFilters = { ...filters, [key]: value };
    // 現在位置以降の履歴を切り捨てて新しい状態を追加
    const newHistory = [...history.slice(0, historyIndex + 1), newFilters];
    set({
      filters: newFilters,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  resetFilters: () => {
    const { history, historyIndex } = get();
    const newHistory = [
      ...history.slice(0, historyIndex + 1),
      { ...DEFAULT_FILTERS },
    ];
    set({
      filters: { ...DEFAULT_FILTERS },
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        filters: { ...history[newIndex] },
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        filters: { ...history[newIndex] },
        historyIndex: newIndex,
      });
    }
  },

  setRenderMode: (mode) => set({ renderMode: mode }),

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
}));
