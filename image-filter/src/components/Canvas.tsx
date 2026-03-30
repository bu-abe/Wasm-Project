import type { RefObject, ReactNode } from "react";

interface CanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  hasImage: boolean;
  overlay?: ReactNode;
}

export function Canvas({ canvasRef, hasImage, overlay }: CanvasProps) {
  return (
    <div className="relative flex-1 bg-gray-900 flex items-center justify-center overflow-auto p-4">
      {overlay}
      <canvas
        ref={canvasRef}
        className={hasImage ? "max-w-full max-h-full object-contain shadow-lg" : "hidden"}
      />
      {!hasImage && (
        <p className="text-gray-500 text-lg">画像をアップロードしてください</p>
      )}
    </div>
  );
}
