"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, ChevronDown, Users } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

interface GroupNavProps {
  group: { id: string; name: string; admin_id: string; photo_url?: string | null };
  groups: { id: string; name: string; photo_url?: string | null }[];
  members: { username: string; avatar_color: string }[];
  currentUserId: string;
  isAdmin: boolean;
}

export default function GroupNav({
  group,
  groups,
  members,
  currentUserId,
  isAdmin,
}: GroupNavProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 bg-bg/90 backdrop-blur-sm border-b border-border px-4 py-3">
      <div className="max-w-lg mx-auto flex items-center gap-3">
        {/* Group photo + name + optional dropdown */}
        <div className="relative flex-1 min-w-0">
          <button
            onClick={() => groups.length > 1 && setOpen((s) => !s)}
            className="flex items-center gap-2.5 min-h-[44px]"
          >
            {/* Group photo */}
            {group.photo_url ? (
              <img src={group.photo_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center shrink-0">
                <Users size={14} className="text-muted" />
              </div>
            )}
            <h1 className="font-display text-xl text-text truncate">{group.name}</h1>
            {groups.length > 1 && (
              <ChevronDown size={16} className="text-muted shrink-0 mt-0.5" />
            )}
          </button>

          {open && groups.length > 1 && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute top-full mt-1 left-0 bg-surface rounded-2xl border border-border shadow-card z-20 overflow-hidden min-w-[200px]">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => { setOpen(false); router.push(`/groups/${g.id}`); }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-bg flex items-center gap-3 ${
                      g.id === group.id ? "text-accent font-medium" : "text-text"
                    }`}
                  >
                    {g.photo_url ? (
                      <img src={g.photo_url} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center shrink-0">
                        <Users size={11} className="text-muted" />
                      </div>
                    )}
                    {g.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Member avatars */}
        <div className="flex -space-x-2 shrink-0">
          {members.slice(0, 5).map((m) => (
            <Avatar
              key={m.username}
              username={m.username}
              color={m.avatar_color}
              size="sm"
              className="ring-2 ring-bg"
            />
          ))}
          {members.length > 5 && (
            <span className="w-7 h-7 rounded-full bg-border flex items-center justify-center text-xs text-muted ring-2 ring-bg">
              +{members.length - 5}
            </span>
          )}
        </div>

        {isAdmin && (
          <button
            onClick={() => router.push(`/groups/${group.id}/settings`)}
            className="text-muted hover:text-text transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Group settings"
          >
            <Settings size={20} />
          </button>
        )}
      </div>
    </header>
  );
}
