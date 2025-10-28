"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type AdUnitProps = {
  slot: string;
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
  const adRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Intersection Observer - lazy load
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px" }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Ad refresh on route change
  useEffect(() => {
    if (isVisible && adRef.current) {
      const ins = adRef.current.querySelector(".adsbygoogle");

      if (ins) {
        // Clear previous ad
        ins.innerHTML = "";
        ins.removeAttribute("data-adsbygoogle-status");
      }

      // Push fresh ad request
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error(`Ad push failed for slot ${slot}:`, e);
      }
    }
  }, [isVisible, pathname, slot]);

  return (
    <div ref={adRef} className={className}>
      {isVisible ? (
        <ins
          key={`${pathname}-${slot}`}
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
