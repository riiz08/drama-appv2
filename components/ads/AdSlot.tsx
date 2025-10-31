"use client";

import { useEffect, useRef, useState } from "react";

interface AdSlotProps {
  slot: string;
  format?: "auto" | "autorelaxed" | "fluid" | "rectangle";
  layoutKey?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
  lazy?: boolean;
  isAnchor?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdSlot({
  slot,
  format = "auto",
  layoutKey,
  responsive = true,
  style = { display: "block" },
  lazy = false,
  isAnchor = false,
  className = "",
}: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(!lazy);

  useEffect(() => {
    if (!lazy) {
      loadAd();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !shouldLoad) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px",
      }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, shouldLoad]);

  useEffect(() => {
    if (shouldLoad) {
      loadAd();
    }
  }, [shouldLoad]);

  const loadAd = () => {
    try {
      if (typeof window !== "undefined" && adRef.current) {
        // ✅ Check apakah ad sudah di-load
        const insElement = adRef.current.querySelector(".adsbygoogle");
        if (insElement?.getAttribute("data-adsbygoogle-status")) {
          console.log("Ad already loaded, skipping...", slot);
          return;
        }

        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  };

  if (!shouldLoad) {
    return (
      <div
        ref={adRef}
        className={className}
        style={{ minHeight: "100px", ...style }}
      />
    );
  }

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
        {...(layoutKey && { "data-ad-layout-key": layoutKey })}
        {...(isAnchor && { "data-anchor-status": "displayed" })}
      />
    </div>
  );
}
