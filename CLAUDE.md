# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

JavaScript と WebAssembly の画像処理パフォーマンスを比較するアプリケーション。グレースケールフィルターを使って、計算負荷の高いピクセル操作における WASM の性能優位性を実証する。

**技術スタック:** React 19 + TypeScript + Vite + AssemblyScript (WebAssembly) + Tailwind CSS 4

## よく使うコマンド

すべてのコマンドは `image-filter/` ディレクトリで実行：

```bash
# 開発
npm run dev              # 開発サーバー起動 (ポート 3000)

# ビルド
npm run build            # TypeScript + Vite バンドル
npm run asbuild          # WebAssembly ビルド (debug + release)
npm run asbuild:release  # 最適化された WASM のみビルド

# 品質チェック
npm run lint             # ESLint 実行

# テスト
npm run test             # tests/ ディレクトリのテスト実行
```

**注意:** `assembly/index.ts` を変更したら `npm run asbuild` で WASM ファイルを再生成すること。

## アーキテクチャ

```text
image-filter/
├── assembly/           # AssemblyScript ソース → WASM にコンパイル
│   └── index.ts        # grayscaleFilter, fibonacci, add 関数
├── build/              # コンパイル済み WASM (debug.wasm, release.wasm)
├── src/
│   ├── hooks/useWasm.ts    # WASM モジュールローダーフック
│   ├── lib/index.ts        # 画像処理ユーティリティ (JS + WASM ラッパー)
│   ├── types/index.ts      # WasmExports インターフェース
│   └── App.tsx             # メイン UI (before/after キャンバス比較)
```

### データフロー

1. ユーザーが画像アップロード → `loadImageToCanvas()` でキャンバスに描画
2. `getImageDataFromCanvas()` でピクセルデータ抽出
3. 以下のいずれかで処理：
   - `grayscaleFilterJS()` - 純粋な JavaScript 実装
   - `grayscaleFilterWasm()` - 共有メモリ経由で WASM 呼び出し
4. `measurePerformance()` で処理時間を計測して結果表示

### WebAssembly 統合

- **useWasm フック**: 非同期で `.wasm` ファイルをロード、`{ wasmModule, loading, error }` を返す
- **メモリ共有**: WASM が `WebAssembly.Memory` をエクスポートしてピクセルバッファに直接アクセス
- **型安全性**: `WasmExports` インターフェースで全 WASM エクスポート関数を定義

## 設定

- **Volta**: Node 24.11.0, NPM 11.6.2
- **TypeScript**: ES2022 ターゲット、strict モード有効
- **AssemblyScript**: release ビルドで optimizeLevel 3
