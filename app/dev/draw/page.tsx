"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Undo2, Redo2 } from "lucide-react";
import { useCanvas } from "@/hooks/useCanvas";
import DrawingCanvas from "@/components/canvas/DrawingCanvas";
import PhotoInput from "@/components/canvas/PhotoOverlay";
import ToolBar from "@/components/canvas/ToolBar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function DevDrawPage() {
  const router = useRouter();
  const canvas = useCanvas();

  const [mealName, setMealName] = useState("");
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoCanvas, setPhotoCanvas] = useState<HTMLCanvasElement | null>(null);
  const [showPhoto, setShowPhoto] = useState(true);
  const [clearConfirm, setClearConfirm] = useState(false);

  const handlePhotoLoad = useCallback((url: string, pc: HTMLCanvasElement) => {
    setPhotoUrl(url);
    setPhotoCanvas(pc);
    setShowPhoto(true);
  }, []);

  const handleClear = useCallback(() => {
    if (clearConfirm) {
      canvas.clearCanvas();
      setClearConfirm(false);
    } else {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 3000);
    }
  }, [clearConfirm, canvas]);

  const handleSubmit = async () => {
    if (!mealName.trim()) return;
    setSubmitting(true);

    const blob = await canvas.exportPng();
    const reader = new FileReader();
    reader.onload = () => {
      const existing = JSON.parse(localStorage.getItem("dev_posts") ?? "[]");
      const newPost = {
        id: crypto.randomUUID(),
        drawing_url: reader.result as string,
        meal_name: mealName.trim(),
        caption: caption.trim() || null,
        created_at: new Date().toISOString(),
        profiles: { username: "you", avatar_color: "#FF8FA3" },
        reactions: [],
        comment_count: 0,
      };
      localStorage.setItem("dev_posts", JSON.stringify([newPost, ...existing]));
      router.push("/dev/feed");
    };
    reader.readAsDataURL(blob);
  };

  const undoRedoOverlay = (
    <div className="absolute top-3 right-3 flex gap-1.5 z-10">
      <button
        onClick={canvas.undo}
        disabled={!canvas.canUndo}
        className="w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-text disabled:opacity-30 hover:bg-white transition-colors"
      >
        <Undo2 size={16} />
      </button>
      <button
        onClick={canvas.redo}
        disabled={!canvas.canRedo}
        className="w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-text disabled:opacity-30 hover:bg-white transition-colors"
      >
        <Redo2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 bg-bg/90 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push("/dev")}
          className="text-muted hover:text-text transition-colors min-h-[44px] min-w-[44px] flex items-center"
        >
          ←
        </button>
        <h1 className="font-display text-xl text-text">Draw a meal</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4">
        <DrawingCanvas
          canvasRef={canvas.canvasRef}
          photoUrl={showPhoto ? photoUrl : null}
          photoOpacity={0.3}
          overlayControls={undoRedoOverlay}
        />

        <div className="flex items-center px-1">
          <PhotoInput canvasRef={canvas.canvasRef} onLoad={handlePhotoLoad} />
        </div>

        <ToolBar
          tool={canvas.tool}
          setTool={canvas.setTool}
          color={canvas.color}
          setColor={canvas.setColor}
          brushSize={canvas.brushSize}
          setBrushSize={canvas.setBrushSize}
          canUndo={canvas.canUndo}
          canRedo={canvas.canRedo}
          onUndo={canvas.undo}
          onRedo={canvas.redo}
          onClear={handleClear}
          hasPhoto={!!photoUrl}
        />

        {clearConfirm && (
          <p className="text-xs text-center text-red-500 -mt-2 animate-fade-in">
            Tap clear again to erase everything
          </p>
        )}

        <div className="bg-surface rounded-2xl shadow-card p-5 flex flex-col gap-4">
          <Input
            label="What did you eat?"
            placeholder="e.g. spicy miso ramen"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            maxLength={60}
          />
          <Input
            label="Caption (optional)"
            placeholder="desk lunch hits different"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={140}
          />
        </div>

        <Button size="lg" onClick={handleSubmit} loading={submitting} disabled={!mealName.trim()} className="w-full">
          Share with the group
        </Button>
      </div>
    </div>
  );
}
