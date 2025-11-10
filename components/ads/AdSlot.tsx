"use client"; // Hanya perlu kalau kamu pakai useEffect (dan memang perlu)

import { usePathname } from "next/navigation";
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

export default function AdSlot({
  slot,
  style = { display: "block" },
  format = "auto",
  responsive = true,
}: AdsenseSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const adEl = adRef.current;
    if (!adEl) return;

    adEl.removeAttribute("data-adsbygoogle-status");
    adEl.innerHTML = "";

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("AdSense Error", error);
    }
  }, [pathname]);

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
