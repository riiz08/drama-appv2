"use client";

import { useEffect } from "react";

export default function AdSenseScript() {
  useEffect(() => {
    // Cek apakah script sudah ada
    const existingScript = document.querySelector(
      `script[src*="adsbygoogle.js"]`
    );

    if (existingScript) {
      return; // Script sudah dimuat
    }

    // Buat script element secara manual
    const script = document.createElement("script");
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`;
    script.async = true;
    script.crossOrigin = "anonymous";

    script.onerror = () => {
      console.error("AdSense script failed to load");
    };

    // Append ke head
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return null;
}
