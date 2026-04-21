import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export async function compressImage(blob: Blob, maxKB = 500): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      const maxDim = 1200;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      let quality = 0.9;
      const tryCompress = () => {
        canvas.toBlob(
          (result) => {
            if (!result) return resolve(blob);
            if (result.size <= maxKB * 1024 || quality < 0.5) {
              resolve(result);
            } else {
              quality -= 0.1;
              tryCompress();
            }
          },
          "image/webp",
          quality
        );
      };
      tryCompress();
    };
    img.src = url;
  });
}

export function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export const REACTION_EMOJIS = ["🤤", "😭", "🔥", "💅", "🫠"];

export const PALETTE_COLORS = [
  "#1a1208", "#423630", "#7c4a3a", "#c4622d",
  "#e8956d", "#f5c6a0", "#fff3e0", "#ffffff",
  "#ff8fa3", "#e91e8c", "#9c27b0", "#3f51b5",
  "#a8d8ea", "#4caf50", "#8bc34a", "#cddc39",
  "#ffeb3b", "#ff9800", "#795548", "#9e9e9e",
];
