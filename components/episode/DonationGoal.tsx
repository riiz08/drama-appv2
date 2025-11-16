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
  const [baseCurrency, setBaseCurrency] = useState("IDR");
  const [exchangeRate, setExchangeRate] = useState(1);

  // 🌍 Deteksi currency berdasarkan lokasi user
  const detectUserCurrency = () => {
    if (typeof navigator === "undefined") return "IDR";

    const userLocale = navigator.language || "id-ID";

    // Mapping locale ke currency (tambahkan sesuai kebutuhan)
    const currencyMap: { [key: string]: string } = {
      "ms-MY": "MYR", // Malaysia
      "en-MY": "MYR", // Malaysia (English)
      "id-ID": "IDR", // Indonesia
      "en-SG": "SGD", // Singapore
      "th-TH": "THB", // Thailand
      "en-US": "USD", // United States
      "en-GB": "GBP", // United Kingdom
      "en-AU": "AUD", // Australia
    };

    // Coba exact match dulu
    if (currencyMap[userLocale]) {
      return currencyMap[userLocale];
    }

    // Fallback: ambil country code dari locale (contoh: "ms-MY" -> "MY")
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

  // 💱 Ambil exchange rate dari Frankfurter API (unlimited & gratis)
  const fetchExchangeRate = async (from: string, to: string) => {
    if (from === to) return 1;

    try {
      // Frankfurter API - No limit, no API key needed
      const res = await fetch(
        `https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`
      );
      const data = await res.json();

      return data.rates[to] || 1;
    } catch (err) {
      console.error("Gagal ambil exchange rate:", err);
      return 1; // Fallback ke rate 1:1 jika error
    }
  };

  // 📊 Ambil data donasi + konversi currency
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/donation");
        const data = await res.json();

        const userLocale = navigator.language || "id-ID";
        const userCurrency = detectUserCurrency();
        const apiBaseCurrency = data?.base_currency ?? "IDR";

        setBaseCurrency(apiBaseCurrency);
        setCurrency(userCurrency);
        setLocale(userLocale);

        // Ambil exchange rate
        const rate = await fetchExchangeRate(apiBaseCurrency, userCurrency);
        setExchangeRate(rate);

        // Konversi amount
        const convertedGoal = data.target_amount * rate;
        const convertedCurrent = data.current_amount * rate;

        setGoal(convertedGoal);
        setCurrent(convertedCurrent);

        // Animasi progress
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

  // 🔹 Placeholder loading
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
