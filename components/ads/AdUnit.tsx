"use client";

import { useEffect, useRef } from "react";

type AdUnitProps = {
  slot: string; // Slot ID dari AdSense dashboard
  format?: "auto" | "rectangle" | "vertical" | "horizontal";
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
};

export default function AdUnit({
  slot,
  format = "auto",
  responsive = true,
  style,
  className = "",
}: AdUnitProps) {
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
        console.error("AdSense push error:", err);
      }
    }
  }, []);

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
}
