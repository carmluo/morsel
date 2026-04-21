"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createGroupAction } from "./actions";
import { uploadGroupPhotoAction } from "../group-actions";
import { compressImage } from "@/lib/utils";

export default function NewGroupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    try {
      let photoUrl: string | null = null;

      if (photoFile) {
        const compressed = await compressImage(photoFile, 800);
        const formData = new FormData();
        formData.append("photo", compressed, "photo.webp");
        const upload = await uploadGroupPhotoAction(formData);
        if (upload.error || !upload.url) {
          setError(upload.error ?? "Photo upload failed.");
          return;
        }
        photoUrl = upload.url;
      }

      const result = await createGroupAction(name.trim(), photoUrl);
      if (result.error) {
        setError(result.error);
      } else {
        router.push(`/groups/${result.groupId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-text">Create a group</h1>
          <p className="text-muted text-sm mt-1">Give your lunch club a name.</p>
        </div>

        <form
          onSubmit={handleCreate}
          className="bg-surface rounded-2xl shadow-card p-8 flex flex-col gap-6"
        >
          {/* Photo picker */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Group photo"
                  className="w-24 h-24 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-border flex items-center justify-center">
                  <Users size={32} className="text-muted" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-text border border-border rounded-xl px-3 py-2 transition-colors"
            >
              <ImageIcon size={14} />
              {photoPreview ? "Change photo" : "Add photo"}
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" className="sr-only" onChange={handlePhotoSelect} />
          </div>

          <Input
            label="Group name"
            placeholder="e.g. Carmen's Lunch Club"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            error={error}
            autoFocus
          />

          <Button type="submit" size="lg" loading={loading} className="w-full">
            Create group
          </Button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-muted text-center hover:text-text transition-colors"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
