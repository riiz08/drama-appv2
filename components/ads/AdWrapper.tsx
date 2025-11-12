"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@heroui/skeleton";

const AdSlot = dynamic(() => import("@/components/ads/AdSlot"), {
  ssr: false,
  loading: () => (
    <div className="w-full flex justify-center">
      {/* Skeleton HeroUI */}
      <Skeleton className="h-72 max-h-[800] w-full rounded-xl" />
    </div>
  ),
});

export default function AdWrapper({
  slot,
  format,
}: {
  slot: string;
  format: "auto" | string;
}) {
  return <AdSlot slot={slot} format={format} />;
}
