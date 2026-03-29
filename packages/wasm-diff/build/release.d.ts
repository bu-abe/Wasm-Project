declare namespace __AdaptedExports {
  /** Exported memory */
  export const memory: WebAssembly.Memory;
  /**
   * assembly/index/diff
   * @param oldText `~lib/string/String`
   * @param newText `~lib/string/String`
   * @returns `~lib/string/String`
   */
  export function diff(oldText: string, newText: string): string;
}
/** Instantiates the compiled WebAssembly module with the given imports. */
export declare function instantiate(module: WebAssembly.Module, imports: {
  env: unknown,
}): Promise<typeof __AdaptedExports>;
