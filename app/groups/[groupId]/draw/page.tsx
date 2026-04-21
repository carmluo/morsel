"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Undo2, Redo2, Eye, EyeOff, ChevronDown } from "lucide-react";
import { useCanvas } from "@/hooks/useCanvas";
import { compressImage } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import DrawingCanvas from "@/components/canvas/DrawingCanvas";
import PhotoInput from "@/components/canvas/PhotoOverlay";
import ToolBar from "@/components/canvas/ToolBar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createPostAction, uploadDrawingAction } from "./actions";

export default function DrawPage() {
  const router = useRouter();
  const { groupId } = useParams<{ groupId: string }>();
  const canvas = useCanvas();

  const [mealName, setMealName] = useState("");
  const [caption, setCaption] = useState("");
  const [mysteryMode, setMysteryMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoCanvas, setPhotoCanvas] = useState<HTMLCanvasElement | null>(null);
  const [showPhoto, setShowPhoto] = useState(true);
  const [photoOpacity, setPhotoOpacity] = useState(0.35);
  const [clearConfirm, setClearConfirm] = useState(false);

  // Group selector
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState(groupId);
  const [showGroupPicker, setShowGroupPicker] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("group_members")
      .select("groups(id, name)")
      .then(({ data }) => {
        const gs = (data ?? []).map((m) => m.groups as unknown as { id: string; name: string });
        setGroups(gs);
      });
  }, []);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  const handlePhotoLoad = useCallback(
    (url: string, pc: HTMLCanvasElement) => {
      setPhotoUrl(url);
      setPhotoCanvas(pc);
      setShowPhoto(true);
    },
    []
  );

  const handleClear = useCallback(() => {
    if (clearConfirm) {
      canvas.clearCanvas();
      setClearConfirm(false);
    } else {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 3000);
    }
  }, [clearConfirm, canvas]);

  const handleEyedropSample = useCallback(
    (canvasX: number, canvasY: number) => {
      if (!photoCanvas) return;
      const sampled = canvas.sampleColor(canvasX, canvasY, photoCanvas);
      canvas.setColor(sampled);
      canvas.setTool("brush");
    },
    [photoCanvas, canvas]
  );

  const handleSubmit = async () => {
    if (!mealName.trim()) {
      setError("What did you eat? Add a meal name.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const blob = await canvas.exportPng();
      const compressed = await compressImage(blob, 500);

      const formData = new FormData();
      formData.append("drawing", compressed, "drawing.webp");
      const uploadResult = await uploadDrawingAction(formData);
      if (uploadResult.error || !uploadResult.url) throw new Error(uploadResult.error ?? "Upload failed");

      const result = await createPostAction({
        groupId: selectedGroupId,
        drawingUrl: uploadResult.url,
        mealName: mealName.trim(),
        caption: caption.trim() || null,
        mysteryMode,
      });

      if (result.error) throw new Error(result.error);
      router.push(`/groups/${selectedGroupId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  };

  const undoRedoOverlay = (
    <div className="absolute top-3 right-3 flex gap-1.5 z-10">
      <button
        onClick={canvas.undo}
        disabled={!canvas.canUndo}
        className="w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-text disabled:opacity-30 hover:bg-white transition-colors"
        aria-label="Undo"
      >
        <Undo2 size={16} />
      </button>
      <button
        onClick={canvas.redo}
        disabled={!canvas.canRedo}
        className="w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-text disabled:opacity-30 hover:bg-white transition-colors"
        aria-label="Redo"
      >
        <Redo2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg pb-32">
      <header className="sticky top-0 z-10 bg-bg/90 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-muted hover:text-text transition-colors min-h-[44px] min-w-[44px] flex items-center"
        >
          ←
        </button>
        <h1 className="font-display text-xl text-text">New post</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Canvas */}
        <DrawingCanvas
          canvasRef={canvas.canvasRef}
          photoUrl={showPhoto ? photoUrl : null}
          photoOpacity={photoOpacity}
          overlayControls={undoRedoOverlay}
          isEyedropping={canvas.tool === "eyedropper"}
          onEyedropSample={handleEyedropSample}
        />

        {/* Photo controls row */}
        <div className="flex items-center gap-2 flex-wrap">
          <PhotoInput canvasRef={canvas.canvasRef} onLoad={handlePhotoLoad} hasPhoto={!!photoUrl} />
          {photoUrl && (
            <>
              <button
                onClick={() => setShowPhoto((s) => !s)}
                className="w-10 h-10 rounded-xl border border-border bg-surface flex items-center justify-center text-muted hover:text-text transition-colors"
                aria-label={showPhoto ? "Hide photo" : "Show photo"}
              >
                {showPhoto ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
              <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                <span className="text-xs text-muted shrink-0">Opacity</span>
                <input
                  type="range"
                  min={0.05}
                  max={0.9}
                  step={0.05}
                  value={photoOpacity}
                  onChange={(e) => setPhotoOpacity(Number(e.target.value))}
                  className="flex-1 accent-accent"
                  disabled={!showPhoto}
                />
              </div>
            </>
          )}
        </div>

        {/* Toolbar */}
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

        {canvas.tool === "eyedropper" && (
          <p className="text-xs text-center text-accent -mt-2">
            Tap anywhere on the drawing to sample a color from your photo
          </p>
        )}

        {clearConfirm && (
          <p className="text-xs text-center text-red-500 -mt-2">
            Tap clear again to erase everything
          </p>
        )}

        {/* Post details */}
        <div className="bg-surface rounded-2xl shadow-card p-5 flex flex-col gap-4">
          <Input
            label="What did you eat?"
            placeholder="e.g. spicy miso ramen"
            value={mealName}
            onChange={(e) => { setMealName(e.target.value); setError(""); }}
            maxLength={60}
            error={error}
          />
          <Input
            label="Caption (optional)"
            placeholder="desk lunch hits different when you drew it"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={140}
          />
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={mysteryMode}
              onChange={(e) => setMysteryMode(e.target.checked)}
              className="w-4 h-4 accent-accent"
            />
            <div>
              <span className="text-sm text-text">Mystery mode</span>
              <p className="text-xs text-muted">Friends guess the meal before you reveal</p>
            </div>
          </label>
        </div>

        {/* Group selector */}
        <div className="bg-surface rounded-2xl shadow-card p-4 flex flex-col gap-2">
          <p className="text-xs text-muted font-medium uppercase tracking-wide">Posting to</p>
          {groups.length > 1 ? (
            <div className="relative">
              <button
                onClick={() => setShowGroupPicker((s) => !s)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border hover:border-muted transition-colors text-left"
              >
                <span className="font-medium text-text text-sm">
                  {selectedGroup?.name ?? "Select group"}
                </span>
                <ChevronDown size={16} className="text-muted" />
              </button>
              {showGroupPicker && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-surface rounded-xl border border-border shadow-card z-20 overflow-hidden">
                  {groups.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => { setSelectedGroupId(g.id); setShowGroupPicker(false); }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-bg ${
                        g.id === selectedGroupId ? "text-accent font-medium" : "text-text"
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="font-medium text-text text-sm px-1">
              {selectedGroup?.name ?? "Loading…"}
            </p>
          )}
        </div>

        <Button
          size="lg"
          onClick={handleSubmit}
          loading={submitting}
          className="w-full"
        >
          Share with the group
        </Button>
      </div>
    </div>
  );
}
