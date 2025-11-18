"use client";

import { Progress } from "@heroui/progress";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useEffect, useState, useRef } from "react";

export default function DonationGoal() {
  const [progress, setProgress] = useState(0);
  const [goal, setGoal] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);
  const [currency, setCurrency] = useState("IDR");
  const [locale, setLocale] = useState("id-ID");
  const [baseCurrency, setBaseCurrency] = useState("IDR");
  const [exchangeRate, setExchangeRate] = useState(1);

  // ✅ Use ref to track if component is mounted
  const isMountedRef = useRef(true);
  const animationRef = useRef<number | null>(null);

  const detectUserCurrency = () => {
    if (typeof navigator === "undefined") return "IDR";
    const userLocale = navigator.language || "id-ID";

    const currencyMap: { [key: string]: string } = {
      "ms-MY": "MYR",
      "en-MY": "MYR",
      "id-ID": "IDR",
      "en-SG": "SGD",
      "th-TH": "THB",
      "en-US": "USD",
      "en-GB": "GBP",
      "en-AU": "AUD",
    };

    if (currencyMap[userLocale]) {
      return currencyMap[userLocale];
    }

    const countryCode = userLocale.split("-")[1];
    const countryToCurrency: { [key: string]: string } = {
      MY: "MYR",
      ID: "IDR",
      SG: "SGD",
      TH: "THB",
      US: "USD",
      GB: "GBP",
      AU: "AUD",
      PH: "PHP",
      VN: "VND",
    };

    return countryToCurrency[countryCode] || "IDR";
  };

  const fetchExchangeRate = async (from: string, to: string) => {
    if (from === to) return 1;

    try {
      const res = await fetch(
        `https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`
      );
      const data = await res.json();
      return data.rates[to] || 1;
    } catch (err) {
      console.error("Gagal ambil exchange rate:", err);
      return 1;
    }
  };

  // ✅ Optimized animation using requestAnimationFrame
  const animateProgress = (targetProgress: number) => {
    const startTime = performance.now();
    const duration = 800; // 800ms instead of 800ms with 20ms intervals
    const startProgress = progress;

    const animate = (currentTime: number) => {
      if (!isMountedRef.current) return;

      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progressRatio);

      const newProgress =
        startProgress + (targetProgress - startProgress) * easedProgress;
      setProgress(Math.round(newProgress));

      if (progressRatio < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    // Cancel previous animation if exists
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    isMountedRef.current = true;
    let intervalId: NodeJS.Timeout | null = null;

    async function fetchData() {
      // ✅ Check if still mounted before fetching
      if (!isMountedRef.current) return;

      try {
        const res = await fetch("/api/donation");
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();

        // ✅ Check again after async operation
        if (!isMountedRef.current) return;

        const userLocale = navigator.language || "id-ID";
        const userCurrency = detectUserCurrency();
        const apiBaseCurrency = data?.base_currency ?? "IDR";

        setBaseCurrency(apiBaseCurrency);
        setCurrency(userCurrency);
        setLocale(userLocale);

        const rate = await fetchExchangeRate(apiBaseCurrency, userCurrency);

        if (!isMountedRef.current) return;

        setExchangeRate(rate);

        const convertedGoal = data.target_amount * rate;
        const convertedCurrent = data.current_amount * rate;

        setGoal(convertedGoal);
        setCurrent(convertedCurrent);

        // ✅ Use optimized animation
        animateProgress(data.progress);
      } catch (err) {
        console.error("Gagal ambil data donasi:", err);
      }
    }

    fetchData();

    // ✅ Increase interval to reduce server load (every 5 minutes instead of 1 hour)
    // Or remove auto-refresh entirely - let user refresh page manually
    intervalId = setInterval(() => {
      fetchData();
    }, 300000); // 5 minutes = 300,000ms

    // ✅ CRITICAL: Cleanup on unmount
    return () => {
      isMountedRef.current = false;

      if (intervalId) {
        clearInterval(intervalId);
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []); // Empty dependency array - only run once

  const formatNumber = (num: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(num);

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
                user_currency: currency,
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
