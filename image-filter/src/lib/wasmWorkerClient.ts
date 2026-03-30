// Wasm + Web Worker クライアント
// Worker とのメッセージングをラップし、Promise ベースの API を提供

import type { FilterSettings } from "../store/editorStore";

let worker: Worker | null = null;
let messageId = 0;
const pendingCallbacks = new Map<
  number,
  { resolve: (value: unknown) => void; reject: (reason: unknown) => void }
>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(
      new URL("../workers/wasmWorker.ts", import.meta.url),
      { type: "module" }
    );
    worker.onmessage = (e: MessageEvent) => {
      const { id, error, ...rest } = e.data;
      const cb = pendingCallbacks.get(id);
      if (!cb) return;
      pendingCallbacks.delete(id);
      if (error) {
        cb.reject(new Error(error));
      } else {
        cb.resolve(rest);
      }
    };
  }
  return worker;
}

function postMessage(data: Record<string, unknown>, transfer?: Transferable[]): Promise<Record<string, unknown>> {
  const id = ++messageId;
  return new Promise((resolve, reject) => {
    pendingCallbacks.set(id, { resolve: resolve as (v: unknown) => void, reject });
    getWorker().postMessage({ ...data, id }, transfer ?? []);
  });
}

let initialized = false;

export async function initWorkerWasm(): Promise<void> {
  if (initialized) return;
  await postMessage({ type: "init" });
  initialized = true;
}

export async function applyFiltersWorker(
  originalData: ImageData,
  filters: FilterSettings
): Promise<ImageData> {
  await initWorkerWasm();

  const { width, height } = originalData;
  // ピクセルデータのコピーを作って transfer
  const pixelBuffer = originalData.data.buffer.slice(0);

  const response = await postMessage(
    {
      type: "applyFilters",
      pixelData: pixelBuffer,
      width,
      height,
      filters,
    },
    [pixelBuffer]
  ) as { result: ArrayBuffer };

  const result = new ImageData(width, height);
  result.data.set(new Uint8Array(response.result));
  return result;
}
