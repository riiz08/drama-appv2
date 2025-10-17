import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    drama: [
      { label: "Drama Popular", href: "/drama?sort=popular" },
      { label: "Sedang Tayang", href: "/drama?status=ONGOING" },
      { label: "Baru Selesai", href: "/drama?status=TAMAT" },
      { label: "Semua Drama", href: "/drama" },
    ],
  };

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <h3 className="text-2xl font-bold">
                <span className="text-white">Mangeakkk</span>
                <span className="text-red-500"> Drama</span>
              </h3>
            </Link>
            <p className="text-gray-400 text-sm max-w-md">
              Platform streaming drama Malaysia terlengkap dengan subtitle
              Indonesia. Nonton drama Malaysia terbaru gratis dengan kualitas
              HD.
            </p>
          </div>

          {/* Drama Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Drama</h4>
            <ul className="space-y-2">
              {footerLinks.drama.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-900">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} Mangeakkk Drama.
            </p>
            <p className="text-xs text-gray-600">
              Dibuat dengan ❤️ untuk pecinta drama Malaysia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
