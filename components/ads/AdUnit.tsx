"use client";

import { useEffect, useRef, useState } from "react";

type AdUnitProps = {
  slot: string; // Slot ID dari AdSense dashboard
  format?: "auto" | "rectangle" | "vertical" | "horizontal";
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
};

export default function AdUnit({
  slot,
  format,
  responsive,
  className,
}: AdUnitProps) {
  const adRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Intersection Observer - load ads only when visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px", // Load 200px before visible
      }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("Ad failed", e);
      }
    }
  }, [isVisible]);

  return (
    <div ref={adRef} className={className}>
      {isVisible ? (
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive}
        />
      ) : (
        <div className="h-24 bg-zinc-900 animate-pulse" />
      )}
    </div>
  );
}
