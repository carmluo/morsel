"use client";

import { useRef, useCallback } from "react";

interface UsePhotoOverlayReturn {
  photoUrl: string | null;
  photoCanvas: HTMLCanvasElement | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearPhoto: () => void;
}

export function usePhotoOverlay(
  canvasRef: React.RefObject<HTMLCanvasElement | null>
): UsePhotoOverlayReturn {
  const photoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const photoUrlRef = useRef<string | null>(null);
  const settersRef = useRef<{
    setPhotoUrl: ((url: string | null) => void) | null;
    setPhotoCanvas: ((c: HTMLCanvasElement | null) => void) | null;
  }>({ setPhotoUrl: null, setPhotoCanvas: null });

  // This hook is used alongside useState in the parent
  return {
    photoUrl: photoUrlRef.current,
    photoCanvas: photoCanvasRef.current,
    handleFileChange: () => {},
    clearPhoto: () => {},
  };
}

// Simpler: just a file input component that calls back with url + canvas
interface PhotoInputProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onLoad: (url: string, photoCanvas: HTMLCanvasElement) => void;
}

export default function PhotoInput({ canvasRef, onLoad }: PhotoInputProps) {
  const photoCanvasRef = useRef<HTMLCanvasElement | null>(null);

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
      // Reset so same file can be re-selected
      e.target.value = "";
    },
    [canvasRef, onLoad]
  );

  return (
    <label className="inline-flex items-center gap-2 cursor-pointer bg-surface border border-border text-text text-sm font-medium px-4 py-2 rounded-xl hover:border-muted transition-colors min-h-[40px]">
      <span>Upload photo</span>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleFileChange}
      />
    </label>
  );
}
