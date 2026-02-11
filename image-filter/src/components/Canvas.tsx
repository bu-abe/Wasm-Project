import type { RefObject } from "react";

interface CanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  hasImage: boolean;
}

export function Canvas({ canvasRef, hasImage }: CanvasProps) {
  return (
    <div className="flex-1 bg-gray-900 flex items-center justify-center overflow-auto p-4">
      {!hasImage ? (
        <p className="text-gray-500 text-lg">画像をアップロードしてください</p>
      ) : (
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain shadow-lg"
        />
      )}
    </div>
  );
}
