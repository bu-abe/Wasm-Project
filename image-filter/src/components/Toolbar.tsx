import { useRef } from "react";
import { useEditorStore } from "../store/editorStore";

interface ToolbarProps {
  onImageUpload: (file: File) => void;
  onDownload: (format: "png" | "jpeg") => void;
  hasImage: boolean;
}

export function Toolbar({ onImageUpload, onDownload, hasImage }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { undo, redo, canUndo, canRedo } = useEditorStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
      e.target.value = "";
    }
  };

  return (
    <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-2">
      <span className="text-sm font-bold text-blue-400 mr-4">
        Image Editor
      </span>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
      >
        アップロード
      </button>

      <div className="w-px h-6 bg-gray-600 mx-1" />

      <button
        onClick={undo}
        disabled={!canUndo()}
        className="px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
        title="元に戻す (Ctrl+Z)"
      >
        ↩ 元に戻す
      </button>
      <button
        onClick={redo}
        disabled={!canRedo()}
        className="px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
        title="やり直し (Ctrl+Shift+Z)"
      >
        ↪ やり直し
      </button>

      {hasImage && (
        <>
          <div className="w-px h-6 bg-gray-600 mx-1" />
          <button
            onClick={() => onDownload("png")}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition"
          >
            PNG 保存
          </button>
          <button
            onClick={() => onDownload("jpeg")}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition"
          >
            JPEG 保存
          </button>
        </>
      )}
    </div>
  );
}
