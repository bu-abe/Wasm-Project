import * as wasmModule from "./wasm-pkg/video_filter.js"; // @ts-ignore - wasm-pack ビルド後に生成されるファイル
import { VideoEditorLayout } from "./components/VideoEditorLayout";

export function App() {
  return <VideoEditorLayout wasmModule={wasmModule} />;
}
