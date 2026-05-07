export default function InfoSection() {
  return (
    
    <section id="info" className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
      <div className="rounded-2xl border border-white bg-white p-6 shadow-md">
        <h2 className="text-2xl font-bold text-emerald-800">Informasi Toko</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-zinc-600">Nama</p>
            <p className="text-sm font-medium text-zinc-600">Aneka Citra Computer</p>
          </div>
          <div>
            <p className="text-sm text-zinc-600">Alamat</p>
            <p className="text-sm font-medium text-zinc-600">Jambu 2, Bogor</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-emerald-800">
          <p className="text-sm">
            Pengiriman: <span className="font-semibold">Coming Soon</span>
          </p>
          <p className="mt-1 text-xs opacity-80">
            Fitur pengiriman akan tersedia nanti.
          </p>
        </div>
      </div>
    </section>
  );
}
