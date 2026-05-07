import Link from "next/link";

type Product = {
  id: number;
  
  name: string;
  priceCents: number;
  imageUrl: string;
  brand?: string;
  stock?: number;
  description?: string;
};

type ProductsSectionProps = {
  
  products: Product[];
  loading: boolean;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  formatIDR: (cents: number) => string;
};

export default function ProductsSection({
  products,
  loading,
  onProductClick,
  onAddToCart,
  formatIDR,
}: ProductsSectionProps) {
  return (
    <section id="produk" className="mx-auto max-w-7xl px-6 pb-12 lg:px-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-emerald-800">
          Produk Printer
        </h2>
        <Link
          href="#"
          className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Lihat semua
        </Link>
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-zinc-600">
            Memuat produk...
          </div>
            ) : products.length === 0 ? (
            <div className="col-span-full py-12 text-center text-zinc-600">
            Belum ada produk tersedia
          </div>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className="group overflow-hidden rounded-xl border border-white bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-emerald-100">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900">
                  {p.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-emerald-700">
                  {formatIDR(p.priceCents)}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => onProductClick(p)}
                    className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 cursor-pointer"
                  >
                    Lihat Detail
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddToCart(p)}
                    className="inline-flex items-center rounded-full border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                  >
                    Tambah ke Keranjang
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
