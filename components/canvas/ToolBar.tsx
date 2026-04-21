"use client";

import { Pencil, Eraser, Pipette, Trash2, ChevronRight } from "lucide-react";
import { cn, PALETTE_COLORS } from "@/lib/utils";
import type { Tool } from "@/hooks/useCanvas";

interface ToolBarProps {
  tool: Tool;
  setTool: (t: Tool) => void;
  color: string;
  setColor: (c: string) => void;
  brushSize: number;
  setBrushSize: (s: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  hasPhoto: boolean;
}

const BRUSH_PRESETS = [4, 10, 20] as const;

const TOOLS = [
  { id: "brush" as Tool, Icon: Pencil, label: "Draw" },
  { id: "eraser" as Tool, Icon: Eraser, label: "Erase" },
];

export default function ToolBar({
  tool, setTool,
  color, setColor,
  brushSize, setBrushSize,
  onClear,
  hasPhoto,
}: ToolBarProps) {
  return (
    <div className="flex flex-col gap-4 bg-surface rounded-2xl shadow-card p-4">
      {/* Tool row */}
      <div className="flex items-center gap-2">
        {TOOLS.map(({ id, Icon, label }) => (
          <ToolChip
            key={id}
            active={tool === id}
            onClick={() => setTool(id)}
            label={label}
            Icon={Icon}
          />
        ))}

        {/* Eyedropper — only shown when photo is loaded */}
        {hasPhoto && (
          <ToolChip
            active={tool === "eyedropper"}
            onClick={() => setTool("eyedropper")}
            label="Sample"
            Icon={Pipette}
          />
        )}

        <div className="flex-1" />

        {/* Clear */}
        <button
          onClick={onClear}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:bg-red-50 hover:text-red-500 transition-all duration-150"
          title="Clear canvas"
          aria-label="Clear canvas"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Brush size */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted w-8">Size</span>
        {BRUSH_PRESETS.map((size) => (
          <button
            key={size}
            onClick={() => setBrushSize(size)}
            className={cn(
              "rounded-full flex items-center justify-center transition-all duration-100 border-2",
              brushSize === size ? "border-accent scale-110" : "border-transparent hover:border-border"
            )}
            style={{ width: `${size + 14}px`, height: `${size + 14}px`, minWidth: `${size + 14}px` }}
            aria-label={`Brush ${size}px`}
          >
            <span
              className="rounded-full bg-text block"
              style={{ width: `${size}px`, height: `${size}px` }}
            />
          </button>
        ))}
        <input
          type="range"
          min={2}
          max={40}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="flex-1 accent-accent"
        />
        <span className="text-xs text-muted w-5 text-right tabular-nums">{brushSize}</span>
      </div>

      {/* Color palette */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {PALETTE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                "w-7 h-7 rounded-full transition-transform hover:scale-110 border",
                c === "#ffffff" ? "border-border" : "border-transparent",
                color === c && "ring-2 ring-accent ring-offset-1"
              )}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
          {/* Custom color input */}
          <label className="w-7 h-7 rounded-full border-2 border-dashed border-muted flex items-center justify-center cursor-pointer hover:border-accent transition-colors overflow-hidden relative">
            <ChevronRight size={12} className="text-muted" />
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full border border-border shrink-0" style={{ backgroundColor: color }} />
          <span className="text-xs text-muted font-mono">{color}</span>
        </div>
      </div>
    </div>
  );
}

function ToolChip({
  active,
  onClick,
  label,
  Icon,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  Icon: React.ElementType;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-1.5 rounded-xl transition-all duration-150 min-h-[40px] border",
        "disabled:opacity-30 disabled:pointer-events-none",
        active
          ? "bg-accent/10 border-accent/40 text-accent px-3 py-2"
          : "bg-bg border-border text-muted hover:text-text hover:border-muted px-2.5 py-2"
      )}
    >
      <Icon size={18} strokeWidth={active ? 2.5 : 2} />
      {active && <span className="text-xs font-medium">{label}</span>}
    </button>
  );
}
