"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

export default function VideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0); // phần trăm tiến độ

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const enterFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  // update progress khi video chạy
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener("timeupdate", updateProgress);
    return () => {
      video.removeEventListener("timeupdate", updateProgress);
    };
  }, []);

  // xử lý tua video khi kéo thanh trượt
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newTime = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  return (
    <div className="relative w-full bg-black rounded overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        className="w-full max-h-[70vh]"
        onEnded={() => setPlaying(false)}
      />

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 flex flex-col gap-2">
        {/* Progress bar */}
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={handleSeek}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer 
                     bg-gray-500 accent-[#28A745]"
          style={{
            background: `linear-gradient(to right, #28A745 ${progress}%, #444 ${progress}%)`,
          }}
        />

        {/* Buttons */}
        <div className="flex items-center justify-between">
          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            className="text-white hover:text-[#28A745] transition-colors"
          >
            {playing ? <Pause /> : <Play />}
          </button>

          {/* Mute */}
          <button
            onClick={toggleMute}
            className="text-white hover:text-[#28A745] transition-colors"
          >
            {muted ? <VolumeX /> : <Volume2 />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={enterFullscreen}
            className="text-white hover:text-[#28A745] transition-colors"
          >
            <Maximize />
          </button>
        </div>
      </div>
    </div>
  );
}
