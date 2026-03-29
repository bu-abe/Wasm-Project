import initWasm from "../build/release.wasm?init";

// AssemblyScript の文字列はポインタ経由なので変換ヘルパーが必要
function liftString(memory: WebAssembly.Memory, pointer: number): string {
  if (!pointer) return "";
  const end =
    (pointer + new Uint32Array(memory.buffer)[(pointer - 4) >>> 2]) >>> 1;
  const memoryU16 = new Uint16Array(memory.buffer);
  let start = pointer >>> 1;
  let str = "";
  while (end - start > 1024)
    str += String.fromCharCode(...memoryU16.subarray(start, (start += 1024)));
  return str + String.fromCharCode(...memoryU16.subarray(start, end));
}

function lowerString(
  exports: WebAssembly.Exports,
  memory: WebAssembly.Memory,
  value: string,
): number {
  const __new = exports.__new as (size: number, id: number) => number;
  const pointer = __new(value.length << 1, 2) >>> 0;
  const memoryU16 = new Uint16Array(memory.buffer);
  for (let i = 0; i < value.length; ++i)
    memoryU16[(pointer >>> 1) + i] = value.charCodeAt(i);
  return pointer;
}

const instance = await initWasm({
  env: {
    abort() {
      throw new Error("WASM abort");
    },
  },
});

const memory = instance.exports.memory as WebAssembly.Memory;
const rawDiff = instance.exports.diff as (a: number, b: number) => number;
const __pin = instance.exports.__pin as (ptr: number) => number;
const __unpin = instance.exports.__unpin as (ptr: number) => void;

export interface WasmTiming {
  lowerMs: number;
  execMs: number;
  liftMs: number;
  totalMs: number;
}

export function diff(oldText: string, newText: string): string {
  const oldPtr = __pin(lowerString(instance.exports, memory, oldText));
  const newPtr = lowerString(instance.exports, memory, newText);
  try {
    return liftString(memory, rawDiff(oldPtr, newPtr) >>> 0);
  } finally {
    __unpin(oldPtr);
  }
}

export function diffWithTiming(
  oldText: string,
  newText: string,
): { result: string; timing: WasmTiming } {
  const t0 = performance.now();
  const oldPtr = __pin(lowerString(instance.exports, memory, oldText));
  const newPtr = lowerString(instance.exports, memory, newText);
  const t1 = performance.now();

  const resultPtr = rawDiff(oldPtr, newPtr) >>> 0;
  const t2 = performance.now();

  const result = liftString(memory, resultPtr);
  const t3 = performance.now();

  __unpin(oldPtr);

  return {
    result,
    timing: {
      lowerMs: t1 - t0,
      execMs: t2 - t1,
      liftMs: t3 - t2,
      totalMs: t3 - t0,
    },
  };
}
