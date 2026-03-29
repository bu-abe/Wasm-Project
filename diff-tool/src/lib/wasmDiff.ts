import { instantiate } from "@wasm-project/diff";
import wasmUrl from "@wasm-project/diff/build/release.wasm?url";

const module = await WebAssembly.compileStreaming(fetch(wasmUrl));
const wasm = await instantiate(module, {
  env: {
    abort() {
      throw new Error("WASM abort");
    },
  },
});

export interface WasmTiming {
  execMs: number;
  totalMs: number;
}

export function diff(oldText: string, newText: string): string {
  return wasm.diff(oldText, newText);
}

export function diffWithTiming(
  oldText: string,
  newText: string,
): { result: string; timing: WasmTiming } {
  const t0 = performance.now();
  const result = wasm.diff(oldText, newText);
  const t1 = performance.now();

  return {
    result,
    timing: {
      execMs: t1 - t0,
      totalMs: t1 - t0,
    },
  };
}
