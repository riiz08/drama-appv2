"use client";

import dynamic from "next/dynamic";

const AdSlot = dynamic(() => import("@/components/ads/AdSlot"), { ssr: false });

export default function AdWrapper({
  slot,
  format,
}: {
  slot: string;
  format: "auto" | string;
}) {
  return <AdSlot slot={slot} format={format} />;
}
