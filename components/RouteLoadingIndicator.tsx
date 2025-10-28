"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Spinner } from "@heroui/spinner";

export default function RouteLoadingIndicator() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  // Reset loading saat route selesai berubah
  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  // Setup event listener untuk semua link internal
  useEffect(() => {
    const handleStart = () => setLoading(true);

    const links = document.querySelectorAll('a[href^="/"]');

    links.forEach((link) => {
      link.addEventListener("click", handleStart);
    });

    return () => {
      links.forEach((link) => {
        link.removeEventListener("click", handleStart);
      });
    };
  }, [pathname]); // Re-run saat pathname berubah untuk catch dynamic links

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Spinner
          size="lg"
          color="danger"
          label="Loading..."
          labelColor="secondary"
        />
      </div>
    </div>
  );
}
