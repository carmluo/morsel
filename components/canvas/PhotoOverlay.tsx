"use client";

import { useRef, useCallback } from "react";
import { ImageIcon } from "lucide-react";

interface PhotoInputProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onLoad: (url: string, photoCanvas: HTMLCanvasElement) => void;
  hasPhoto?: boolean;
}

export default function PhotoInput({ canvasRef, onLoad, hasPhoto }: PhotoInputProps) {
  const photoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 bg-surface border border-border text-text text-sm font-medium px-4 py-2 rounded-xl hover:border-muted transition-colors min-h-[40px]"
      >
        <ImageIcon size={15} />
        {hasPhoto ? "Change photo" : "Add photo"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
      />
    </>
  );
}
