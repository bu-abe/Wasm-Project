declare namespace __AdaptedExports {
  /** Exported memory */
  export const memory: WebAssembly.Memory;
  /**
   * assembly/index/fibonacci
   * @param n `i32`
   * @returns `i32`
   */
  export function fibonacci(n: number): number;
  /**
   * assembly/index/add
   * @param a `i32`
   * @param b `i32`
   * @returns `i32`
   */
  export function add(a: number, b: number): number;
  /**
   * assembly/index/grayscaleFilter
   * @param offset `u32`
   * @param length `u32`
   */
  export function grayscaleFilter(offset: number, length: number): void;
  /**
   * assembly/index/brightnessFilter
   * @param offset `u32`
   * @param length `u32`
   * @param value `i32`
   */
  export function brightnessFilter(offset: number, length: number, value: number): void;
  /**
   * assembly/index/contrastFilter
   * @param offset `u32`
   * @param length `u32`
   * @param value `i32`
   */
  export function contrastFilter(offset: number, length: number, value: number): void;
  /**
   * assembly/index/saturationFilter
   * @param offset `u32`
   * @param length `u32`
   * @param value `i32`
   */
  export function saturationFilter(offset: number, length: number, value: number): void;
  /**
   * assembly/index/sepiaFilter
   * @param offset `u32`
   * @param length `u32`
   */
  export function sepiaFilter(offset: number, length: number): void;
  /**
   * assembly/index/invertFilter
   * @param offset `u32`
   * @param length `u32`
   */
  export function invertFilter(offset: number, length: number): void;
  /**
   * assembly/index/boxBlurFilter
   * @param src `u32`
   * @param dst `u32`
   * @param width `u32`
   * @param height `u32`
   * @param radius `u32`
   */
  export function boxBlurFilter(src: number, dst: number, width: number, height: number, radius: number): void;
  /**
   * assembly/index/sharpenFilter
   * @param src `u32`
   * @param dst `u32`
   * @param width `u32`
   * @param height `u32`
   * @param amount `i32`
   */
  export function sharpenFilter(src: number, dst: number, width: number, height: number, amount: number): void;
}
/** Instantiates the compiled WebAssembly module with the given imports. */
export declare function instantiate(module: WebAssembly.Module, imports: {
}): Promise<typeof __AdaptedExports>;
