import { useState, useEffect } from "react";
import { instantiate } from "@wasm-project/image-filter";
import wasmUrl from "@wasm-project/image-filter/build/release.wasm?url";
import type { WasmExports } from "../types";

export function useWasm() {
  const [wasmModule, setWasmModule] = useState<WasmExports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadWasm = async () => {
      try {
        console.log("Loading Wasm...");
        const module = await WebAssembly.compileStreaming(fetch(wasmUrl));
        const wasm = await instantiate(module, {});
        setWasmModule(wasm as unknown as WasmExports);
        console.log("Wasm loaded!");
      } catch (err) {
        console.error("Failed to load wasm:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    loadWasm();
  }, []);

  return { wasmModule, loading, error };
}
