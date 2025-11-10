// file: components/shared/ViewTracker.tsx
"use client";

import { useEffect } from "react";
import { trackDramaView } from "@/app/actions/tracking";

type Props = {
  dramaId: string;
};

export default function ViewTracker({ dramaId }: Props) {
  useEffect(() => {
    // Track view setelah 3 detik (untuk avoid bot/accidental clicks)
    const timer = setTimeout(() => {
      trackDramaView(dramaId);
    }, 3000);

    return () => clearTimeout(timer);
  }, [dramaId]);

  return null; // Component tidak render apa-apa
}
