"use client";

import { useEffect, useRef } from "react";

type AnchorAdProps = {
  slot: string;
};

export default function AnchorAd({ slot }: AnchorAdProps) {
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
        console.error("Anchor ad error:", err);
      }
    }
  }, []);

  return (
    <div className="ad-container anchor-ad">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
