"use client";

import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface DrawingCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  photoUrl?: string | null;
  photoOpacity?: number;
  className?: string;
  overlayControls?: React.ReactNode;
  isEyedropping?: boolean;
  onEyedropSample?: (canvasX: number, canvasY: number) => void;
}

const CANVAS_SIZE = 800;

export default function DrawingCanvas({
  canvasRef,
  photoUrl,
  photoOpacity = 0.3,
  className,
  overlayControls,
  isEyedropping,
  onEyedropSample,
}: DrawingCanvasProps) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
  }, [canvasRef]);

  const handleEyedropPointer = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!onEyedropSample) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;
      onEyedropSample(Math.round(relX * CANVAS_SIZE), Math.round(relY * CANVAS_SIZE));
    },
    [onEyedropSample]
  );

  return (
    <div
      className={cn(
        "relative w-full aspect-square overflow-hidden rounded-2xl bg-white shadow-card",
        className
      )}
    >
      {/* Photo guide layer */}
      {photoUrl && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: photoOpacity }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt=""
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>
      )}

      {/* Drawing canvas */}
      <canvas
        ref={canvasRef}
        className="drawing-canvas absolute inset-0 w-full h-full cursor-crosshair"
        style={{ touchAction: "none" }}
      />

      {/* Eyedropper overlay — captures taps when in eyedrop mode */}
      {isEyedropping && (
        <div
          className="absolute inset-0 cursor-crosshair z-10"
          style={{ touchAction: "none" }}
          onPointerDown={handleEyedropPointer}
        />
      )}

      {overlayControls}
    </div>
  );
}
