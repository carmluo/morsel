"use client";

import { useRef, useCallback } from "react";
import { Camera, ImageIcon } from "lucide-react";

interface PhotoInputProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onLoad: (url: string, photoCanvas: HTMLCanvasElement) => void;
}

export default function PhotoInput({ canvasRef, onLoad }: PhotoInputProps) {
  const photoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const mainCanvas = canvasRef.current;
          if (!mainCanvas) return;

          if (!photoCanvasRef.current) {
            photoCanvasRef.current = document.createElement("canvas");
          }
          const photoCanvas = photoCanvasRef.current;
          photoCanvas.width = mainCanvas.width;
          photoCanvas.height = mainCanvas.height;
          const ctx = photoCanvas.getContext("2d")!;
          const scale = Math.max(
            photoCanvas.width / img.width,
            photoCanvas.height / img.height
          );
          const w = img.width * scale;
          const h = img.height * scale;
          ctx.drawImage(img, (photoCanvas.width - w) / 2, (photoCanvas.height - h) / 2, w, h);
          onLoad(url, photoCanvas);
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [canvasRef, onLoad]
  );

  return (
    <div className="flex gap-2">
      {/* Take photo — opens camera directly */}
      <button
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        className="inline-flex items-center gap-2 bg-surface border border-border text-text text-sm font-medium px-4 py-2 rounded-xl hover:border-muted transition-colors min-h-[40px]"
      >
        <Camera size={16} />
        <span>Camera</span>
      </button>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleFileChange}
      />

      {/* Upload from library */}
      <button
        type="button"
        onClick={() => libraryInputRef.current?.click()}
        className="inline-flex items-center gap-2 bg-surface border border-border text-text text-sm font-medium px-4 py-2 rounded-xl hover:border-muted transition-colors min-h-[40px]"
      >
        <ImageIcon size={16} />
        <span>Upload</span>
      </button>
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  );
}
