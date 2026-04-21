"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WidgetCarousel from "@/components/widget/WidgetCarousel";

const MOCK_WIDGET_POSTS = [
  {
    id: "w1",
    drawing_url: "https://placehold.co/400x400/FFD6E0/FF8FA3?text=🍜",
    meal_name: "Spicy miso ramen",
    mystery_mode: false,
    profiles: { username: "yuki", avatar_color: "#A8D8EA" },
  },
  {
    id: "w2",
    drawing_url: "https://placehold.co/400x400/D6EEF8/A8D8EA?text=🥑",
    meal_name: "Avocado toast",
    mystery_mode: false,
    profiles: { username: "mira", avatar_color: "#FFD166" },
  },
  {
    id: "w3",
    drawing_url: "https://placehold.co/400x400/FFF3CD/FFD166?text=🕵️",
    meal_name: "Mystery meal",
    mystery_mode: true,
    profiles: { username: "sam", avatar_color: "#B7E4C7" },
  },
];

export default function DevWidgetPage() {
  const router = useRouter();
  const [posts, setPosts] = useState(MOCK_WIDGET_POSTS);

  useEffect(() => {
    const local = JSON.parse(localStorage.getItem("dev_posts") ?? "[]").map(
      (p: { id: string; drawing_url: string; meal_name: string }) => ({
        id: p.id,
        drawing_url: p.drawing_url,
        meal_name: p.meal_name,
        mystery_mode: false,
        profiles: { username: "you", avatar_color: "#FF8FA3" },
      })
    );
    if (local.length > 0) setPosts([...local, ...MOCK_WIDGET_POSTS]);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#1a1208] flex flex-col">
      <div className="flex items-center justify-between px-5 pt-4 pb-3 z-10">
        <span className="font-display text-white/80 text-lg">morsel</span>
        <button
          onClick={() => router.push("/dev/feed")}
          className="text-white/60 hover:text-white transition-colors text-sm min-h-[44px] flex items-center"
        >
          Feed →
        </button>
      </div>

      <div className="flex-1 relative">
        <WidgetCarousel posts={posts} />
      </div>

      <div className="px-5 pb-6 text-center">
        <p className="text-white/30 text-xs">
          Today's meals · {posts.length} drawing{posts.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
