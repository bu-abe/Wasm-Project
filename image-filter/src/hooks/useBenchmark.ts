import { useState, useCallback } from "react";
import { useEditorStore } from "../store/editorStore";
import { useWasm } from "./useWasm";
import { applyFilters } from "../lib/wasmFilters";
import { applyFiltersJS } from "../lib/jsFilters";
import { applyFiltersWebGL } from "../lib/webglFilters";

export interface BenchmarkResult {
  jsTime: number;
  wasmTime: number;
  webglTime: number;
  speedupWasm: number;
  speedupWebGL: number;
  speedupWebGLvsWasm: number;
  pixelCount: number;
}

export function useBenchmark() {
  const { wasmModule } = useWasm();
  const { originalImageData, filters } = useEditorStore();
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runBenchmark = useCallback(async () => {
    if (!wasmModule || !originalImageData) return;

    setIsRunning(true);
    // UI を更新させてからベンチマーク開始
    await new Promise((r) => setTimeout(r, 30));

    const jsStart = performance.now();
    applyFiltersJS(originalImageData, filters);
    const jsTime = performance.now() - jsStart;

    const wasmStart = performance.now();
    applyFilters(wasmModule, originalImageData, filters);
    const wasmTime = performance.now() - wasmStart;

    const webglStart = performance.now();
    applyFiltersWebGL(originalImageData, filters);
    const webglTime = performance.now() - webglStart;

    setResult({
      jsTime,
      wasmTime,
      webglTime,
      speedupWasm: jsTime / wasmTime,
      speedupWebGL: jsTime / webglTime,
      speedupWebGLvsWasm: wasmTime / webglTime,
      pixelCount: originalImageData.width * originalImageData.height,
    });
    setIsRunning(false);
  }, [wasmModule, originalImageData, filters]);

  return { runBenchmark, result, isRunning };
}
