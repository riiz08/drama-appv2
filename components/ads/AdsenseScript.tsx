"use client";

import Script from "next/script";

export default function AdSenseScript() {
  return (
    <>
      {/* AdSense Main Script */}
      <script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
        crossOrigin="anonymous"
      />
    </>
  );
}
