"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface Group { id: string; name: string }

interface GroupPickerSheetProps {
  open: boolean;
  onClose: () => void;
  destination: "draw";
}

export default function GroupPickerSheet({ open, onClose, destination }: GroupPickerSheetProps) {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase
      .from("group_members")
      .select("groups(id, name)")
      .then(({ data }) => {
        setGroups(
          (data ?? []).map((m) => m.groups as unknown as Group)
        );
      });
  }, [open]);

  const go = (groupId: string) => {
    onClose();
    router.push(`/groups/${groupId}/${destination}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            key="sheet"
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-3xl shadow-2xl pb-safe"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-4" />
            <div className="px-5 pb-2">
              <p className="text-xs text-muted font-medium uppercase tracking-widest mb-3">
                Draw for which group?
              </p>
              <div className="flex flex-col gap-2 pb-8">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => go(g.id)}
                    className="flex items-center gap-3 px-4 py-4 rounded-2xl hover:bg-bg active:scale-[0.98] transition-all text-left min-h-[56px]"
                  >
                    <span className="font-medium text-text flex-1">{g.name}</span>
                    <span className="text-muted text-lg">→</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
