import { useState, useEffect, useRef } from "react";
import "./App.css";
import * as Type from "./types";
import {
  loadImageToCanvas,
  getImageDataFromCanvas,
  drawImageDataToCanvas,
  grayscaleFilterJS,
  grayscaleFilterWasm,
  measurePerformance,
} from "./lib";

function App() {
  const [wasmModule, setWasmModule] = useState<Type.WasmExports | null>(null);
  const canvasBeforeRef = useRef<HTMLCanvasElement>(null);
  const canvasAfterRef = useRef<HTMLCanvasElement>(null);
  const [jsTime, setJsTime] = useState<number | null>(null);
  const [wasmTime, setWasmTime] = useState<number | null>(null);

  // Wasmを読み込む
  useEffect(() => {
    const loadWasm = async () => {
      try {
        console.log("Loading Wasm...");
        const response = await fetch("/build/release.wasm");
        const buffer = await response.arrayBuffer();
        const module = await WebAssembly.instantiate(buffer);
        setWasmModule(module.instance.exports as unknown as Type.WasmExports);
        console.log("Wasm loaded!");
      } catch (error) {
        console.error("Failed to load wasm:", error);
      }
    };

    loadWasm();
  }, []);

  // 画像アップロード時の処理
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvasBeforeRef.current) return;

    try {
      // 画像をCanvasに読み込む（Before用）
      await loadImageToCanvas(file, canvasBeforeRef.current);

      // canvasAfterにもコピー
      if (canvasAfterRef.current) {
        canvasAfterRef.current.width = canvasBeforeRef.current.width;
        canvasAfterRef.current.height = canvasBeforeRef.current.height;
        const ctx = canvasAfterRef.current.getContext("2d");
        if (ctx) {
          ctx.drawImage(canvasBeforeRef.current, 0, 0);
        }
      }

      // リセット
      setJsTime(null);
      setWasmTime(null);
    } catch (error) {
      console.error("Failed to load image:", error);
    }
  };

  // JS版グレースケール実行
  const handleJsGrayscale = async () => {
    if (!canvasAfterRef.current) return;

    const imageData = getImageDataFromCanvas(canvasAfterRef.current);
    if (!imageData) return;

    const pixelData = new Uint8Array(imageData.data);
    const time = await measurePerformance("JS Grayscale", () => {
      grayscaleFilterJS(pixelData);
    });
    setJsTime(time);

    // 結果をCanvasに描画
    imageData.data.set(pixelData);
    drawImageDataToCanvas(canvasAfterRef.current, imageData);
  };

  // Wasm版グレースケール実行
  const handleWasmGrayscale = async () => {
    if (!canvasAfterRef.current || !wasmModule) return;

    const imageData = getImageDataFromCanvas(canvasAfterRef.current);
    if (!imageData) return;

    const pixelData = new Uint8Array(imageData.data);
    const time = await measurePerformance("Wasm Grayscale", () => {
      grayscaleFilterWasm(pixelData, wasmModule);
    });
    setWasmTime(time);

    // 結果をCanvasに描画
    imageData.data.set(pixelData);
    drawImageDataToCanvas(canvasAfterRef.current, imageData);
  };

  if (!wasmModule) {
    return <p className="text-center p-4">Loading Wasm...</p>;
  }

  return (
    <div className="App min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-amber-300">
        グレースケール処理 - JS vs Wasm
      </h1>

      {/* 画像アップロード */}
      <div className="mb-8">
        <label className="block mb-2 font-semibold">画像をアップロード</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
      </div>

      {/* Canvas表示 */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Before</h3>
          <canvas
            ref={canvasBeforeRef}
            className="w-full border-2 border-gray-600 rounded"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">After</h3>
          <canvas
            ref={canvasAfterRef}
            className="w-full border-2 border-gray-600 rounded"
          />
        </div>
      </div>

      {/* 処理ボタン */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={handleJsGrayscale}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold transition"
        >
          JS版グレースケール
        </button>
        <button
          onClick={handleWasmGrayscale}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition"
        >
          Wasm版グレースケール
        </button>
      </div>

      {/* 結果表示 */}
      <div className="grid grid-cols-2 gap-4 bg-gray-800 p-6 rounded">
        {jsTime !== null && (
          <div>
            <p className="text-gray-400">JS処理時間</p>
            <p className="text-2xl font-bold text-green-400">
              {jsTime.toFixed(2)}ms
            </p>
          </div>
        )}
        {wasmTime !== null && (
          <div>
            <p className="text-gray-400">Wasm処理時間</p>
            <p className="text-2xl font-bold text-blue-400">
              {wasmTime.toFixed(2)}ms
            </p>
          </div>
        )}
        {jsTime !== null && wasmTime !== null && (
          <div className="col-span-2 border-t border-gray-600 pt-4 mt-4">
            <p className="text-gray-400">速度比</p>
            <p className="text-2xl font-bold text-yellow-400">
              {(jsTime / wasmTime).toFixed(2)}x 高速化
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
