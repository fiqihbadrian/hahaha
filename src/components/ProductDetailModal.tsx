import { useState } from "react";

type Product = {
  id: number;
  name: string;
  priceCents: number;
  imageUrl: string;
  brand?: string;
  stock?: number;
  description?: string;
  specifications?: string;
};

type ProductDetailModalProps = {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  user: any;
  formatIDR: (cents: number) => string;
};

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  user,
  formatIDR,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs">("description");

  if (!product) return null;

  const handleClose = () => {
    setQuantity(1);
    setActiveTab("description");
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="text-xl font-bold text-emerald-800">Detail Produk</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="grid gap-6 p-6 lg:grid-cols-2">
          {/* Left: Image */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-4">
            {/* Brand */}
            {product.brand && (
              <div className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                {product.brand}
              </div>
            )}

            {/* Product Name */}
            <h1 className="text-2xl font-bold text-zinc-900">
              {product.name}
            </h1>

            {/* Price */}
            <div className="border-y border-zinc-200 py-4">
              <p className="text-sm text-zinc-600">Harga</p>
              <p className="mt-1 text-3xl font-bold text-emerald-700">
                {formatIDR(product.priceCents)}
              </p>
            </div>

            {/* Stock */}
            {product.stock !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-600">Stok:</span>
                <span className="font-semibold text-zinc-900">
                  {product.stock > 0 ? (
                    <>
                      <span className="text-emerald-600">{product.stock} unit</span>
                      {product.stock < 10 && (
                        <span className="ml-2 text-xs text-orange-600">Tersisa sedikit!</span>
                      )}
                    </>
                  ) : (
                    <span className="text-red-600">Stok habis</span>
                  )}
                </span>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Jumlah</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-100 disabled:opacity-50"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, Math.min(product.stock || 999, val)));
                  }}
                  className="h-10 w-20 rounded-lg border border-zinc-300 text-center text-zinc-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  min="1"
                  max={product.stock || 999}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
                  disabled={quantity >= (product.stock || 999)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-100 disabled:opacity-50"
                >
                  +
                </button>
                <span className="text-sm text-zinc-500">
                  Max: {product.stock || "Unlimited"}
                </span>
              </div>
            </div>

            {/* Subtotal */}
            <div className="rounded-lg bg-emerald-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-700">Subtotal</span>
                <span className="text-xl font-bold text-emerald-700">
                  {formatIDR(product.priceCents * quantity)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => onAddToCart(product, quantity)}
                disabled={!user || (product.stock !== undefined && product.stock === 0)}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 font-bold text-white shadow-sm hover:bg-emerald-700 disabled:bg-zinc-300 disabled:cursor-not-allowed"
              >
                {!user ? "Login untuk Membeli" : product.stock === 0 ? "Stok Habis" : "+ Keranjang"}
              </button>
              <button
                onClick={() => onBuyNow(product, quantity)}
                disabled={product.stock !== undefined && product.stock === 0}
                className="flex-1 rounded-lg border-2 border-emerald-600 px-4 py-3 font-bold text-emerald-700 hover:bg-emerald-50 disabled:border-zinc-300 disabled:text-zinc-400 disabled:cursor-not-allowed"
              >
                Beli Langsung
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-zinc-200">
          <div className="flex border-b border-zinc-200 px-6">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === "description"
                  ? "border-b-2 border-emerald-600 text-emerald-700"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Deskripsi
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === "specs"
                  ? "border-b-2 border-emerald-600 text-emerald-700"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Spesifikasi
            </button>
          </div>

          <div className="p-6">
            {activeTab === "description" ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-zinc-900">Deskripsi Produk</h3>
                <p className="text-sm leading-relaxed text-zinc-700">
                  {product.description || "Deskripsi produk tidak tersedia."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="font-semibold text-zinc-900">Spesifikasi</h3>
                <div className="grid gap-2 text-sm">
                  {/* Default specs from database fields */}
                  <div className="flex border-b border-zinc-100 py-2">
                    <span className="w-40 text-zinc-600">Merek</span>
                    <span className="font-medium text-zinc-900">{product.brand || "-"}</span>
                  </div>
                  <div className="flex border-b border-zinc-100 py-2">
                    <span className="w-40 text-zinc-600">Nama Produk</span>
                    <span className="font-medium text-zinc-900">{product.name}</span>
                  </div>
                  
                  {/* Dynamic specifications from database */}
                  {product.specifications ? (() => {
                    try {
                      const specs = JSON.parse(product.specifications);
                      return specs.map((spec: {key: string, value: string}, index: number) => (
                        <div key={index} className="flex border-b border-zinc-100 py-2">
                          <span className="w-40 text-zinc-600">{spec.key}</span>
                          <span className="font-medium text-zinc-900">{spec.value}</span>
                        </div>
                      ));
                    } catch {
                      return null;
                    }
                  })() : null}
                  
                  <div className="flex py-2">
                    <span className="w-40 text-zinc-600">Stok Tersedia</span>
                    <span className="font-medium text-zinc-900">{product.stock || "Unlimited"} unit</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
