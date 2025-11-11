import Link from "next/link";
import { Film, TrendingUp, Clock, List } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    drama: [
      {
        label: "Drama Popular",
        href: "/drama?sort=popular",
        icon: TrendingUp,
      },
      {
        label: "Sedang Tayang",
        href: "/drama?status=ONGOING",
        icon: Clock,
      },
      {
        label: "Baru Selesai",
        href: "/drama?status=TAMAT",
        icon: Film,
      },
      {
        label: "Semua Drama",
        href: "/drama",
        icon: List,
      },
    ],
  };

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            {/* Brand & Description - Wider on Desktop */}
            <div className="md:col-span-7 lg:col-span-8">
              <Link href="/" className="inline-block mb-6 group">
                <h3 className="text-3xl font-bold transition-transform group-hover:scale-105">
                  <span className="text-white">Mangeakkk</span>
                  <span className="text-red-500"> Drama</span>
                </h3>
              </Link>

              <p className="text-gray-300 text-base leading-relaxed mb-6 max-w-2xl">
                Platform{" "}
                <strong className="text-white">streaming drama melayu</strong>{" "}
                terkini secara percuma. Tonton{" "}
                <strong className="text-white">drama Malaysia</strong> dalam
                kualiti HD dengan episod penuh tanpa gangguan.
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-3 py-1.5 bg-zinc-900 text-gray-400 text-xs rounded-full border border-zinc-800">
                  🇲🇾 Malaysia
                </span>
                <span className="px-3 py-1.5 bg-zinc-900 text-gray-400 text-xs rounded-full border border-zinc-800">
                  🇸🇬 Singapura
                </span>
                <span className="px-3 py-1.5 bg-zinc-900 text-gray-400 text-xs rounded-full border border-zinc-800">
                  🇧🇳 Brunei
                </span>
                <span className="px-3 py-1.5 bg-zinc-900 text-gray-400 text-xs rounded-full border border-zinc-800">
                  🇹🇭 Thailand
                </span>
              </div>

              <p className="text-gray-500 text-sm">
                Dikemaskini setiap hari dengan episod terbaru
              </p>
            </div>

            {/* Drama Links - Compact Column */}
            <div className="md:col-span-5 lg:col-span-4">
              <h4 className="text-white font-bold mb-6 text-base flex items-center gap-2">
                <Film className="w-5 h-5 text-red-500" />
                Tonton Drama
              </h4>
              <nav>
                <ul className="space-y-3">
                  {footerLinks.drama.map((link) => {
                    const Icon = link.icon;
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-gray-400 hover:text-white transition-colors flex items-center gap-3 group"
                        >
                          <Icon className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors" />
                          <span className="text-sm">{link.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>
        </div>

        {/* SEO Rich Text Section */}
        <div className="py-8 border-t border-zinc-900">
          <div className="max-w-5xl">
            <h5 className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wider">
              Tentang Platform
            </h5>
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
              ,<strong className="text-gray-400"> drama TV3 online</strong>,{" "}
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
        <div className="py-6 border-t border-zinc-900">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <p className="text-sm text-gray-500">
              © {currentYear}{" "}
              <span className="text-gray-400 font-medium">Mangeakkk Drama</span>
              . All rights reserved.
            </p>
            <p className="text-xs text-gray-600 flex items-center gap-1.5">
              Dibuat dengan{" "}
              <span className="text-red-500 animate-pulse">❤️</span> untuk
              peminat drama
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
