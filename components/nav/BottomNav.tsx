"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Pencil, Users, User } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import GroupPickerSheet from "./GroupPickerSheet";
import { cn } from "@/lib/utils";

const LAST_GROUP_KEY = "morsel_last_group";

export function setLastGroup(groupId: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LAST_GROUP_KEY, groupId);
  }
}

function getLastGroup(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_GROUP_KEY);
}

const HIDDEN_PREFIXES = ["/auth", "/onboarding", "/dev"];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [groupCount, setGroupCount] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDest, setPickerDest] = useState<"draw">("draw");

  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  // Fetch group count once to know if we need a picker
  useEffect(() => {
    if (hidden) return;
    const supabase = createClient();
    supabase
      .from("group_members")
      .select("group_id", { count: "exact", head: true })
      .then(({ count }) => setGroupCount(count ?? 0));
  }, [hidden]);

  const handleFeed = useCallback(() => {
    const lastGroup = getLastGroup();
    router.push(lastGroup ? `/groups/${lastGroup}` : "/groups");
  }, [router]);

  const handleDraw = useCallback(() => {
    if (groupCount === 1) {
      const lastGroup = getLastGroup();
      if (lastGroup) { router.push(`/groups/${lastGroup}/draw`); return; }
    }
    if (groupCount && groupCount > 1) {
      setPickerDest("draw");
      setPickerOpen(true);
      return;
    }
    router.push("/groups");
  }, [groupCount, router]);


  if (hidden) return null;

  const isActive = (pattern: string) => pathname.includes(pattern);
  // Feed: on a specific group feed page (has groupId segment, not settings/draw/widget)
  const feedActive = /^\/groups\/[^/]+$/.test(pathname);
  const drawActive = isActive("/draw");
  const groupsActive = pathname === "/groups" || pathname === "/groups/new" || pathname === "/groups/join";
  const profileActive = pathname.startsWith("/profile");

  return (
    <>
      <GroupPickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        destination={pickerDest}
      />
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-md border-t border-border pb-safe">
        <div className="max-w-lg mx-auto px-2 flex items-center justify-around h-16">
          <NavTab
            icon={<Home size={22} />}
            label="Feed"
            active={feedActive}
            onClick={handleFeed}
          />
          <NavTab
            icon={<Pencil size={22} />}
            label="Draw"
            active={drawActive}
            onClick={handleDraw}
          />
          <NavTab
            icon={<Users size={22} />}
            label="Groups"
            active={groupsActive}
            onClick={() => router.push("/groups")}
          />
          <NavTab
            icon={<User size={22} />}
            label="Profile"
            active={profileActive}
            onClick={() => router.push("/profile")}
          />
        </div>
      </nav>
    </>
  );
}

function NavTab({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-0.5 px-5 py-2 rounded-2xl transition-all duration-150 min-h-[44px] min-w-[60px] relative",
        active ? "text-accent" : "text-muted hover:text-text"
      )}
    >
      {active && (
        <motion.div
          layoutId="nav-pill"
          className="absolute inset-0 bg-accent/8 rounded-2xl"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative">{icon}</span>
      <span className={cn("text-[10px] font-medium relative", active ? "text-accent" : "text-muted")}>
        {label}
      </span>
    </button>
  );
}
