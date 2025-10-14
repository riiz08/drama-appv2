"use client";

import { useEffect, useRef } from "react";

type InFeedAdProps = {
  slot: string;
  layoutKey?: string;
  className?: string;
};

export default function InFeedAd({
  slot,
  layoutKey = "-6t+ed+2i-1n-4w", // Default layout key
  className = "",
}: InFeedAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isAdPushed = useRef(false);

  useEffect(() => {
    if (!isAdPushed.current && adRef.current) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
          {}
        );
        isAdPushed.current = true;
      } catch (err) {
        console.error("In-feed ad error:", err);
      }
    }
  }, []);

  return (
    <div className={`ad-container in-feed ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-format="fluid"
        data-ad-layout-key={layoutKey}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
      />
    </div>
  );
}
