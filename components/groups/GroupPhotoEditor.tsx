"use client";

import { useState, useRef, useTransition } from "react";
import { ImageIcon, Users } from "lucide-react";
import { uploadGroupPhotoAction, updateGroupPhotoAction } from "@/app/groups/group-actions";
import { compressImage } from "@/lib/utils";

interface GroupPhotoEditorProps {
  groupId: string;
  currentPhotoUrl: string | null;
}

export default function GroupPhotoEditor({ groupId, currentPhotoUrl }: GroupPhotoEditorProps) {
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    startTransition(async () => {
      setError("");
      const compressed = await compressImage(file, 800);
      const formData = new FormData();
      formData.append("photo", compressed, "photo.webp");
      const upload = await uploadGroupPhotoAction(formData);
      if (upload.error || !upload.url) {
        setError(upload.error ?? "Upload failed.");
        return;
      }
      const update = await updateGroupPhotoAction(groupId, upload.url);
      if (update.error) {
        setError(update.error);
        return;
      }
      setPhotoUrl(upload.url);
    });
  };

  return (
    <div className="flex items-center gap-5">
      {/* Preview */}
      <div className="shrink-0">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Group photo"
            className="w-20 h-20 rounded-full object-cover ring-2 ring-border"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-border flex items-center justify-center">
            <Users size={28} className="text-muted" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-text">Group photo</p>
        <button
          type="button"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-text border border-border rounded-xl px-3 py-2 transition-colors disabled:opacity-50"
        >
          <ImageIcon size={13} />
          {photoUrl ? "Change photo" : "Add photo"}
        </button>
        {isPending && <p className="text-xs text-muted">Uploading…</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handlePhotoSelect} />
    </div>
  );
}
