"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export type Tool = "brush" | "eraser" | "eyedropper";

const MAX_HISTORY = 20;

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const [tool, setTool] = useState<Tool>("brush");
  const [color, setColor] = useState("#423630");
  const [brushSize, setBrushSize] = useState(10);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext("2d") : null;
  }, []);

  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;

    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const idx = historyIndexRef.current;
    historyRef.current = historyRef.current.slice(0, idx + 1);
    historyRef.current.push(snapshot);

    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    } else {
      historyIndexRef.current += 1;
    }

    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, [getCtx]);

  const undo = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || historyIndexRef.current <= 0) return;

    historyIndexRef.current -= 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    ctx.putImageData(snapshot, 0, 0);
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(true);
  }, [getCtx]);

  const redo = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || historyIndexRef.current >= historyRef.current.length - 1) return;

    historyIndexRef.current += 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    ctx.putImageData(snapshot, 0, 0);
    setCanUndo(true);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, [getCtx]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveSnapshot();
  }, [getCtx, saveSnapshot]);

  const getCanvasPoint = useCallback(
    (e: PointerEvent): { x: number; y: number } => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const setupCtxStyle = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.lineWidth = tool === "eraser" ? brushSize * 2 : brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = tool === "eraser" ? "rgba(0,0,0,1)" : color;
      ctx.globalCompositeOperation =
        tool === "eraser" ? "destination-out" : "source-over";
    },
    [tool, color, brushSize]
  );

  const startStroke = useCallback(
    (e: PointerEvent) => {
      const canvas = canvasRef.current;
      const ctx = getCtx();
      if (!canvas || !ctx) return;
      if (tool === "eyedropper") return;

      canvas.setPointerCapture(e.pointerId);
      isDrawingRef.current = true;
      const pt = getCanvasPoint(e);
      lastPointRef.current = pt;

      setupCtxStyle(ctx);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, (ctx.lineWidth / 2) * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = tool === "eraser" ? "rgba(0,0,0,1)" : color;
      ctx.globalCompositeOperation =
        tool === "eraser" ? "destination-out" : "source-over";
      ctx.fill();
    },
    [getCtx, getCanvasPoint, setupCtxStyle, tool, color]
  );

  const continueStroke = useCallback(
    (e: PointerEvent) => {
      if (!isDrawingRef.current) return;
      const ctx = getCtx();
      if (!ctx) return;

      const pt = getCanvasPoint(e);
      const last = lastPointRef.current;
      if (!last) return;

      setupCtxStyle(ctx);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
      lastPointRef.current = pt;
    },
    [getCtx, getCanvasPoint, setupCtxStyle]
  );

  const endStroke = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    saveSnapshot();
  }, [saveSnapshot]);

  // Wire pointer events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onDown = (e: PointerEvent) => startStroke(e);
    const onMove = (e: PointerEvent) => continueStroke(e);
    const onUp = () => endStroke();

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [startStroke, continueStroke, endStroke]);

  // Save initial blank snapshot
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;

    const blank = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current = [blank];
    historyIndexRef.current = 0;
    setCanUndo(false);
  }, [getCtx]);

  const exportPng = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) return reject(new Error("No canvas"));
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))),
        "image/webp",
        0.9
      );
    });
  }, []);

  const sampleColor = useCallback(
    (x: number, y: number, photoCanvas: HTMLCanvasElement): string => {
      const ctx = photoCanvas.getContext("2d");
      if (!ctx) return color;
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const r = pixel[0].toString(16).padStart(2, "0");
      const g = pixel[1].toString(16).padStart(2, "0");
      const b = pixel[2].toString(16).padStart(2, "0");
      return `#${r}${g}${b}`;
    },
    [color]
  );

  return {
    canvasRef,
    tool, setTool,
    color, setColor,
    brushSize, setBrushSize,
    undo, redo, canUndo, canRedo,
    clearCanvas,
    exportPng,
    sampleColor,
  };
}
