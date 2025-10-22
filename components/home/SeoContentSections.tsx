"use client";

import { Accordion, AccordionItem } from "@heroui/accordion";

export default function SEOContentSection() {
  const faqItems = [
    {
      key: "1",
      title: "Apa itu Mangeakkk Drama?",
      content: (
        <>
          Mangeakkk Drama adalah platform{" "}
          <strong>streaming drama melayu percuma</strong> yang menyediakan
          koleksi <strong>drama melayu terkini 2025</strong> paling lengkap.
          Anda boleh <strong>tonton drama melayu</strong> dari TV3, Astro, dan
          saluran popular lain dalam satu tempat. Semua{" "}
          <strong>drama melayu episod penuh</strong> tersedia dalam kualiti HD
          untuk pengalaman menonton terbaik tanpa gangguan iklan.
        </>
      ),
    },
    {
      key: "2",
      title: "Drama apa yang boleh ditonton di platform ini?",
      content: (
        <>
          Kami menyediakan <strong>drama malaysia online</strong> dari pelbagai
          genre - drama romantis, drama aksi, drama keluarga, dan banyak lagi.
          Anda boleh <strong>tonton drama TV3 online</strong>,{" "}
          <strong>drama Astro online</strong>, dan{" "}
          <strong>drama melayu best</strong> yang sedang trending. Koleksi kami
          merangkumi drama yang sedang ongoing dan drama yang sudah tamat,
          semuanya dikemaskini setiap hari dengan episod terbaru.
        </>
      ),
    },
    {
      key: "3",
      title: "Adakah percuma untuk menonton drama di sini?",
      content: (
        <>
          Ya, sepenuhnya percuma! Anda boleh{" "}
          <strong>tonton drama online</strong> tanpa sebarang bayaran atau
          langganan. Tidak perlu pendaftaran yang rumit - cuma klik dan tonton.
          Platform kami menyediakan{" "}
          <strong>streaming drama melayu percuma</strong> dalam kualiti HD untuk
          semua pengguna di Malaysia, Singapura, Brunei, dan Thailand. Nikmati
          pengalaman menonton drama tanpa had.
        </>
      ),
    },
    {
      key: "4",
      title: "Bagaimana kualiti video dan kelajuan streaming?",
      content: (
        <>
          Semua <strong>drama melayu terkini</strong> di platform kami
          disediakan dalam kualiti HD untuk pengalaman menonton yang terbaik.
          Platform kami dioptimumkan untuk streaming lancar tanpa buffering pada
          semua peranti - telefon pintar, tablet, atau komputer. Anda boleh
          menonton <strong>drama malaysia episod penuh</strong> dengan resolusi
          tinggi dan audio yang jelas, memberikan pengalaman setanding dengan
          platform premium.
        </>
      ),
    },
    {
      key: "5",
      title: "Berapa kerap drama baru dikemaskini?",
      content: (
        <>
          Kami kemaskini <strong>drama melayu terbaru</strong> setiap hari!
          Episod baru untuk drama yang sedang berjalan akan dimuat naik secepat
          mungkin selepas tayangan asal. Platform{" "}
          <strong>tonton drama melayu</strong> kami memastikan anda tidak
          ketinggalan episod terbaru dari drama kegemaran anda. Daripada drama
          yang baru bermula hingga episod terakhir, semuanya tersedia untuk
          tontonan anda.
        </>
      ),
    },
  ];

  return (
    <section className="container mx-auto px-4 py-12 md:py-16 ">
      <div className="space-y-6">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Soalan Lazim
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            Ketahui lebih lanjut tentang platform streaming drama melayu terbaik
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion
          variant="splitted"
          selectionMode="multiple"
          className="gap-3"
          itemClasses={{
            base: "bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2",
            title: "text-white font-semibold text-base md:text-lg",
            trigger: "py-4 hover:bg-zinc-800/30 rounded-lg transition-colors",
            content:
              "text-gray-400 text-sm md:text-base leading-relaxed pb-4 pt-2",
            indicator: "text-gray-400",
          }}
        >
          {faqItems.map((item) => (
            <AccordionItem
              key={item.key}
              aria-label={item.title}
              title={item.title}
            >
              <p>{item.content}</p>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Bottom CTA */}
        <div className="text-center pt-6">
          <p className="text-gray-500 text-xs md:text-sm">
            Mulakan pengalaman menonton anda hari ini dengan koleksi drama
            terlengkap
          </p>
        </div>
      </div>
    </section>
  );
}
