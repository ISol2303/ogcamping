"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VideoPlayer from "./VideoPlayer";

type MediaItem = {
  type: "image" | "video";
  url: string;
};

export default function MediaLightbox({
  media,
  initialIndex = 0,
  onClose,
}: {
  media: MediaItem[];
  initialIndex?: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(initialIndex);
  const [direction, setDirection] = useState<1 | -1>(1); // để biết đang trượt trái hay phải

  const prev = () => {
    setDirection(-1);
    setCurrent((c) => (c === 0 ? media.length - 1 : c - 1));
  };
  const next = () => {
    setDirection(1);
    setCurrent((c) => (c === media.length - 1 ? 0 : c + 1));
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      onClick={onClose} // click nền đen sẽ đóng
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-[#28A745] text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-[#28A745] text-white transition-colors"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      {/* Next */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-[#28A745] text-white transition-colors"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Content */}
      <div
        className="max-w-5xl max-h-[90%] w-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()} // click vào nội dung không đóng
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={current} // mỗi lần current đổi → animate
            custom={direction}
            initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center w-full"
          >
            {media[current].type === "image" ? (
              <img
                src={media[current].url}
                alt={`media-${current}`}
                className="max-h-[90vh] max-w-full rounded shadow-lg"
              />
            ) : (
              <div className="w-full flex justify-center">
                <VideoPlayer src={media[current].url} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
