"use client";

import { Progress } from "@heroui/progress";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useEffect, useState } from "react";

export default function DonationGoal() {
  const [progress, setProgress] = useState(0);
  const [goal, setGoal] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);
  const [currency, setCurrency] = useState("IDR");
  const [locale, setLocale] = useState("id-ID");

  // Ambil data donasi
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/donation", { cache: "no-store" });
        const data = await res.json();

        const localeDetected =
          typeof navigator !== "undefined" ? navigator.language : "id-ID";
        const formattedCurrency = new Intl.NumberFormat(localeDetected, {
          style: "currency",
          currency: data?.base_currency ?? "IDR",
          minimumFractionDigits: 0,
        });

        setCurrency(formattedCurrency.resolvedOptions().currency || "IDR");
        setGoal(data.target_amount);
        setCurrent(data.current_amount);
        setLocale(navigator.language || "id-ID");

        let start = 0;
        const target = data.progress;
        const step = target / 40;
        const animate = setInterval(() => {
          start += step;
          if (start >= target) {
            start = target;
            clearInterval(animate);
          }
          setProgress(Math.round(start));
        }, 20);
      } catch (err) {
        console.error("Gagal ambil data donasi:", err);
      }
    }

    fetchData();

    // Auto refresh setiap 1 jam
    const interval = setInterval(() => {
      fetchData();
    }, 3600000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(num);

  // 🔹 Placeholder agar tidak picu LCP
  if (!goal) {
    return (
      <Card className="bg-black border-none rounded-2xl p-6 w-full mx-auto shadow-lg animate-pulse">
        <CardBody className="flex flex-col gap-3">
          <div className="h-4 w-40 bg-gray-700 rounded-md"></div>
          <div className="h-3 w-48 bg-gray-800 rounded-md"></div>
          <div className="h-3 w-full bg-gray-700 rounded-full mt-2"></div>
          <div className="h-3 w-32 bg-gray-800 rounded-md mt-2"></div>
          <div className="h-9 w-32 bg-gray-700 rounded-lg mt-4"></div>
        </CardBody>
      </Card>
    );
  }

  // 🔹 Konten utama
  return (
    <Card className="bg-black border-none rounded-2xl p-6 text-white w-full mx-auto shadow-lg transition-opacity duration-500 opacity-100 shadow-red-600">
      <CardBody className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          🎬 Seronok tengok drama ni?
        </h2>

        <p className="text-sm text-gray-300">
          {formatNumber(current)} / {formatNumber(goal)}
        </p>

        <Progress
          value={progress}
          color="danger"
          showValueLabel={true}
          aria-label="Kemajuan sokongan"
          className="mt-2"
        />

        <p className="text-sm text-gray-400 mt-2">
          ❤️ Bantu aku kekalkan server & update setiap hari
        </p>

        <Button
          className="mt-3 text-white font-medium hover:opacity-90"
          radius="lg"
          variant="solid"
          color="danger"
          onPress={() => {
            if (typeof window !== "undefined") {
              window.gtag?.("event", "click_donate_cta", {
                event_category: "Donation",
                event_label: "Support button clicked",
              });
            }

            window.open("https://sociabuzz.com/riiz85/support", "_blank");
          }}
        >
          Sokong Sekarang
        </Button>
      </CardBody>
    </Card>
  );
}
