"use client";

import { cn } from "@/lib/utils";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import Link from "next/link";
import { useEffect } from "react";

const OverlayDonation = () => {
  useEffect(() => {
    addToast({
      color: "danger",
      variant: "flat",
      title: "Mangeakkk Drama",
      description:
        "Nak lihat laman ini terus hidup & berkembang? Jom beri sedikit sumbangan. Sokongan anda amat bermakna!",
      promise: new Promise((resolve) => setTimeout(resolve, 3000)),
      classNames: {
        closeButton: "opacity-100 absolute right-4 top-1/2 -translate-y-1/2",
        base: cn([
          "bg-default-50 dark:bg-background shadow-sm",
          "border border-l-8 rounded-md rounded-l-none",
          "flex flex-col items-start",
          "border-primary-200 dark:border-primary-100 border-l-primary",
        ]),
        icon: "w-6 h-6 fill-current",
      },
      closeIcon: (
        <svg
          fill="none"
          height="32"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="32"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      ),
      endContent: (
        <div className="ms-11 my-2 flex gap-x-2">
          <Button
            color={"danger"}
            size="sm"
            variant="shadow"
            as={Link}
            href="https://sociabuzz.com/riiz85/tribe"
          >
            Sokong Sekarang
          </Button>
        </div>
      ),
    });
  }, []);

  return null;
};

export default OverlayDonation;
