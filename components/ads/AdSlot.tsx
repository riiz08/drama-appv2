"use client"; // Hanya perlu kalau kamu pakai useEffect (dan memang perlu)

import { useEffect, useRef } from "react";

interface AdsenseSlotProps {
  format?: string;
  responsive?: boolean;
  slot: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdsenseSlot({
  slot,
  style = { display: "block" },
  format = "auto",
  responsive = true,
}: AdsenseSlotProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.error("AdSense error", e);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
      ref={adRef}
      style={style}
    />
  );
}
