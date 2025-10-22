import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    drama: [
      { label: "Drama Popular", href: "/drama?sort=popular" },
      { label: "Sedang Tayang", href: "/drama?status=ONGOING" },
      { label: "Baru Selesai", href: "/drama?status=TAMAT" },
      { label: "Semua Drama", href: "/drama" },
      { label: "Drama Melayu Terkini", href: "/drama?sort=latest" },
    ],
  };

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Brand & Description */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <h3 className="text-2xl font-bold">
                <span className="text-white">Mangeakkk</span>
                <span className="text-red-500"> Drama</span>
              </h3>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              <strong className="text-white">Tonton drama melayu</strong>{" "}
              terkini secara percuma. Platform{" "}
              <strong className="text-white">streaming drama Malaysia</strong>{" "}
              terlengkap dengan kualiti HD. Episod penuh tanpa iklan.
            </p>
            <p className="text-gray-500 text-xs">
              Melayani penonton dari Malaysia, Singapura, Brunei, dan Thailand.
            </p>
          </div>

          {/* Drama Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Tonton Drama
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.drama.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SEO Rich Text Section */}
        <div className="mt-12 pt-8 border-t border-zinc-900">
          <div className="max-w-4xl">
            <p className="text-gray-500 text-xs leading-relaxed">
              <strong className="text-gray-400">Mangeakkk Drama</strong> adalah
              destinasi utama untuk{" "}
              <strong className="text-gray-400">
                tonton drama melayu online
              </strong>{" "}
              secara percuma. Kami menyediakan koleksi{" "}
              <strong className="text-gray-400">
                drama melayu terkini 2025
              </strong>
              , <strong className="text-gray-400">drama TV3 online</strong>,{" "}
              <strong className="text-gray-400">drama Astro online</strong>, dan
              pelbagai{" "}
              <strong className="text-gray-400">
                drama malaysia episod penuh
              </strong>{" "}
              dalam kualiti HD. Platform{" "}
              <strong className="text-gray-400">
                streaming drama melayu percuma
              </strong>{" "}
              kami dikemaskini setiap hari dengan episod terbaru untuk
              memastikan anda tidak ketinggalan drama kegemaran. Nikmati
              pengalaman menonton terbaik tanpa gangguan iklan.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-zinc-900">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} Mangeakkk Drama.
            </p>
            <p className="text-xs text-gray-600">
              Dibuat dengan ❤️ untuk peminat drama di Asia Tenggara
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
