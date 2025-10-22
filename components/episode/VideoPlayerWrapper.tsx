// components/episode/VideoPlayerWrapper.tsx (NEW FILE)
"use client";

import dynamic from "next/dynamic";

const VideoPlayer = dynamic(() => import("./VideoPlayer"), {
  loading: () => (
    <div className="w-full aspect-video bg-zinc-900 animate-pulse flex items-center justify-center rounded-lg">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-white">Memuatkan pemain video...</p>
      </div>
    </div>
  ),
  ssr: false,
});

interface VideoPlayerWrapperProps {
  videoUrl: string;
  title: string;
}

export default function VideoPlayerWrapper({
  videoUrl,
  title,
}: VideoPlayerWrapperProps) {
  return <VideoPlayer videoUrl={videoUrl} title={title} />;
}
