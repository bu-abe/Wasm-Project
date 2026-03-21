import { useState, useEffect } from "react";
import * as Type from "../types";

export function useWasm(wasmPath: string = import.meta.env.BASE_URL + "build/release.wasm") {
  const [wasmModule, setWasmModule] = useState<Type.WasmExports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadWasm = async () => {
      try {
        console.log("Loading Wasm...");
        const response = await fetch(wasmPath);
        const buffer = await response.arrayBuffer();
        const module = await WebAssembly.instantiate(buffer);
        setWasmModule(module.instance.exports as unknown as Type.WasmExports);
        console.log("Wasm loaded!");
      } catch (err) {
        console.error("Failed to load wasm:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    loadWasm();
  }, [wasmPath]);

  return { wasmModule, loading, error };
}
