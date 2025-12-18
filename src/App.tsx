import { useState, useEffect } from "react";
import "./App.css";

// Wasmのエクスポート関数の型定義
interface WasmExports {
  fibonacci: (n: number) => number;
  add: (a: number, b: number) => number;
  memory: WebAssembly.Memory;
}

function App() {
  const [wasmModule, setWasmModule] = useState<WasmExports | null>(null);
  const [input, setInput] = useState("10");
  const [result, setResult] = useState<number | null>(null);
  const [jsResult, setJsResult] = useState<number | null>(null);

  // Wasmを読み込む
  useEffect(() => {
    const loadWasm = async () => {
      try {
        console.log("Loading Wasm...");
        const response = await fetch("/build/release.wasm");
        const buffer = await response.arrayBuffer();
        const module = await WebAssembly.instantiate(buffer);
        setWasmModule(module.instance.exports as unknown as WasmExports);
        console.log("Wasm loaded!");
      } catch (error) {
        console.error("Failed to load wasm:", error);
      }
    };

    loadWasm();
  }, []);

  const jsFibonacci = (num: number): number => {
    if (num <= 1) return num;
    let a: number = 0;
    let b: number = 1;

    for (let i: number = 2; i <= num; i++) {
      const temp: number = a + b;
      a = b;
      b = temp;
    }

    return b;
  };

  const calculate = () => {
    if (wasmModule && wasmModule.fibonacci) {
      const n = parseInt(input);
      const fibResult = wasmModule.fibonacci(n);
      setResult(fibResult);
    }
  };

  const jsCalculate = () => {
    const n = parseInt(input);
    const fibResult = jsFibonacci(n);
    setJsResult(fibResult);
  };

  if (!wasmModule) {
    return <p>Loading Wasm...</p>;
  }

  return (
    <div className="App">
      <h1>React × WebAssembly Demo</h1>

      <div>
        <p style={{ color: "green" }}>✓ Wasm loaded successfully!</p>

        <div style={{ margin: "20px 0" }}>
          <h3>Test: 1 + 2 = {wasmModule.add(1, 2)}</h3>
        </div>

        <div>
          <h3>Fibonacci Calculator</h3>
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ padding: "8px", fontSize: "16px" }}
          />
          <button
            onClick={() => {
              calculate();
              jsCalculate();
            }}
            style={{
              marginLeft: "10px",
              padding: "8px 16px",
              fontSize: "16px",
            }}
          >
            Calculate
          </button>

          {result !== null && (
            <p style={{ fontSize: "20px", marginTop: "20px" }}>
              wasm fibonacci({input}) = <strong>{result}</strong>
            </p>
          )}

          {jsResult !== null && (
            <p style={{ fontSize: "20px", marginTop: "20px" }}>
              js fibonacci({input}) = <strong>{jsResult}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
