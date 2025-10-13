"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertCircle } from "lucide-react";
import { Card } from "@heroui/card";
import { Spinner } from "@heroui/spinner";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
}

export default function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset states
    setIsLoading(true);
    setError(null);

    // Check if HLS is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError("Gagal memuat video. Cek koneksi internet Anda.");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError("Terjadi kesalahan pada media.");
              hls.recoverMediaError();
              break;
            default:
              setError("Terjadi kesalahan yang tidak dapat diperbaiki.");
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    }
    // HLS.js is not supported on platforms that natively support HLS (like Safari)
    else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
      });
      video.addEventListener("error", () => {
        setError("Gagal memuat video.");
      });
    } else {
      setError("Browser Anda tidak mendukung HLS streaming.");
    }
  }, [videoUrl]);

  return (
    <Card className="bg-black border-none overflow-hidden">
      <div className="relative aspect-video bg-black">
        {/* Loading State */}
        {isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            <div className="text-center">
              <Spinner size="lg" color="danger" />
              <p className="text-white mt-4">Memuat video...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            <div className="text-center px-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-white font-semibold mb-2">Oops!</p>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Video Player */}
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          controlsList="nodownload"
          playsInline
          preload="metadata"
          aria-label={title}
        >
          <track kind="captions" />
          Browser Anda tidak mendukung video player.
        </video>
      </div>
    </Card>
  );
}
