"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface WidgetPost {
  id: string;
  drawing_url: string;
  meal_name: string;
  mystery_mode: boolean;
  profiles: { username: string; avatar_color: string };
}

interface WidgetCarouselProps {
  posts: WidgetPost[];
}

const CYCLE_INTERVAL = 4000;

export default function WidgetCarousel({ posts }: WidgetCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (posts.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % posts.length);
    }, CYCLE_INTERVAL);
    return () => clearInterval(interval);
  }, [posts.length]);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-white/80">
        <div className="text-6xl">🍽</div>
        <p className="text-lg font-display">Nothing yet today</p>
        <p className="text-sm opacity-70">Check back after lunch!</p>
      </div>
    );
  }

  const post = posts[index];

  return (
    <div className="relative h-full w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={post.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <Image
            src={post.drawing_url}
            alt={post.mystery_mode ? "Mystery meal" : post.meal_name}
            fill
            className="object-contain"
            sizes="100vw"
            unoptimized={post.drawing_url.includes("placehold")}
          />

          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-6 py-8">
            <p className="text-white text-sm font-medium opacity-80 mb-0.5">
              {post.profiles.username}
            </p>
            <p className="text-white font-display text-2xl leading-tight">
              {post.mystery_mode ? "🕵️ Mystery meal" : post.meal_name}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      {posts.length > 1 && (
        <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5">
          {posts.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "bg-white w-4" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
