import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative -mt-[96px] pt-[96px] bg-gradient-to-b from-emerald-600 to-emerald-700 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Aneka Citra Computer
          </h1>
          <p className="mt-4 text-lg leading-8 opacity-90">
            Toko Printer &amp; Perlengkapan Komputer
            <br /> Jambu 2, Kota Bogor
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="#produk"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600"
            >
              Lihat Produk
            </Link>
            <Link
              href="#info"
              className="rounded-full border border-white/80 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600"
            >
              Hubungi Toko
            </Link>
          </div>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-600/0 to-emerald-700/30"
      />
    </section>
  );
}
