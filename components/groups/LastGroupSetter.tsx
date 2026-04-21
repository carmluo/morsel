"use client";

import { useEffect } from "react";
import { setLastGroup } from "@/components/nav/BottomNav";

export default function LastGroupSetter({ groupId }: { groupId: string }) {
  useEffect(() => {
    setLastGroup(groupId);
  }, [groupId]);
  return null;
}
