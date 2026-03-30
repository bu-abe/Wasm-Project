import { useState, useCallback } from "react";
import { useEditorStore } from "../store/editorStore";
import { useWasm } from "./useWasm";
import { applyFilters } from "../lib/wasmFilters";
import { applyFiltersJS } from "../lib/jsFilters";
import { applyFiltersWebGL } from "../lib/webglFilters";
import { applyFiltersWorker } from "../lib/wasmWorkerClient";

const ITERATIONS = 10;

export interface Stats {
  times: number[];
  avg: number;
  median: number;
  min: number;
  max: number;
}

export interface BenchmarkResult {
  js: Stats;
  wasm: Stats;
  webgl: Stats;
  wasmWorker: Stats;
  pixelCount: number;
}

function calcStats(times: number[]): Stats {
  const sorted = [...times].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  return {
    times: sorted,
    avg: times.reduce((a, b) => a + b, 0) / times.length,
    median,
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

export function useBenchmark() {
  const { wasmModule } = useWasm();
  const { originalImageData, filters } = useEditorStore();
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const runBenchmark = useCallback(async () => {
    if (!wasmModule || !originalImageData) return;

    setIsRunning(true);
    setProgress(0);
    await new Promise((r) => setTimeout(r, 30));

    const jsTimes: number[] = [];
    const wasmTimes: number[] = [];
    const webglTimes: number[] = [];
    const wasmWorkerTimes: number[] = [];

    for (let i = 0; i < ITERATIONS; i++) {
      // JS
      const jsStart = performance.now();
      applyFiltersJS(originalImageData, filters);
      jsTimes.push(performance.now() - jsStart);

      // WASM
      const wasmStart = performance.now();
      applyFilters(wasmModule, originalImageData, filters);
      wasmTimes.push(performance.now() - wasmStart);

      // WebGL
      const webglStart = performance.now();
      applyFiltersWebGL(originalImageData, filters);
      webglTimes.push(performance.now() - webglStart);

      // WASM + Worker
      const workerStart = performance.now();
      await applyFiltersWorker(originalImageData, filters);
      wasmWorkerTimes.push(performance.now() - workerStart);

      setProgress(i + 1);
      // UI 更新の隙間を与える
      await new Promise((r) => setTimeout(r, 10));
    }

    setResult({
      js: calcStats(jsTimes),
      wasm: calcStats(wasmTimes),
      webgl: calcStats(webglTimes),
      wasmWorker: calcStats(wasmWorkerTimes),
      pixelCount: originalImageData.width * originalImageData.height,
    });
    setIsRunning(false);
  }, [wasmModule, originalImageData, filters]);

  return { runBenchmark, result, isRunning, progress, iterations: ITERATIONS };
}
