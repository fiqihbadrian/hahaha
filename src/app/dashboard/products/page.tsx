"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  email: string;
  name?: string;
  role: string;
};

type Product = {
  id: number;
  name: string;
  brand: string;
  priceCents: number;
  stock: number;
  description: string;
  specifications?: string;
  imageUrl: string;
  createdAt: string;
};

export default function ProductsManagement() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    priceCents: "",
    stock: "",
    description: "",
    imageUrl: "",
  });
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      router.push("/");
      return;
    }

    const userData = JSON.parse(savedUser);
    if (userData.role !== "ADMIN") {
      alert("Akses ditolak: Hanya admin yang bisa mengakses halaman ini");
      router.push("/");
      return;
    }

    setUser(userData);
    loadProducts();
  }, [router]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/products");
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data);
      } else {
        alert("Gagal memuat produk: " + data.error);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      alert("Terjadi kesalahan saat memuat produk");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        brand: product.brand,
        priceCents: String(product.priceCents),
        stock: String(product.stock),
        description: product.description,
        imageUrl: product.imageUrl,
      });
      // Parse specifications
      console.log("Product specifications:", product.specifications);
      if (product.specifications) {
        try {
          const parsedSpecs = JSON.parse(product.specifications);
          console.log("Parsed specs:", parsedSpecs);
          setSpecs(parsedSpecs.length > 0 ? parsedSpecs : [
            { key: "Kondisi", value: "Baru" },
            { key: "Garansi", value: "1 Tahun Resmi" }
          ]);
        } catch (e) {
          console.error("Failed to parse specifications:", e);
          setSpecs([
            { key: "Kondisi", value: "Baru" },
            { key: "Garansi", value: "1 Tahun Resmi" }
          ]);
        }
      } else {
        console.log("No specifications found, using default");
        // Set default specifications untuk produk lama
        setSpecs([
          { key: "Kondisi", value: "Baru" },
          { key: "Garansi", value: "1 Tahun Resmi" }
        ]);
      }
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        brand: "",
        priceCents: "",
        stock: "",
        description: "",
        imageUrl: "",
      });
      setSpecs([{ key: "", value: "" }]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      brand: "",
      priceCents: "",
      stock: "",
      description: "",
      imageUrl: "",
    });
    setSpecs([{ key: "", value: "" }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceCents = parseInt(formData.priceCents);
    const stock = parseInt(formData.stock);

    if (isNaN(priceCents) || priceCents < 0) {
      alert("Harga harus berupa angka positif");
      return;
    }

    if (isNaN(stock) || stock < 0) {
      alert("Stok harus berupa angka positif");
      return;
    }

    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";
      
      const method = editingProduct ? "PUT" : "POST";

      // Filter empty specs and stringify
      const validSpecs = specs.filter(s => s.key.trim() && s.value.trim());
      const specificationsJson = validSpecs.length > 0 ? JSON.stringify(validSpecs) : null;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          brand: formData.brand,
          priceCents,
          stock,
          description: formData.description,
          specifications: specificationsJson,
          imageUrl: formData.imageUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(editingProduct ? "Produk berhasil diupdate!" : "Produk berhasil ditambahkan!");
        handleCloseModal();
        loadProducts();
      } else {
        alert("Gagal menyimpan produk: " + data.error);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Terjadi kesalahan saat menyimpan produk");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        alert("Produk berhasil dihapus!");
        loadProducts();
      } else {
        alert("Gagal menghapus produk: " + data.error);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Terjadi kesalahan saat menghapus produk");
    }
  };

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-zinc-50 p-4">
        <div className="mx-auto max-w-7xl">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-lg font-bold text-emerald-700">
                ← Dashboard Admin
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-600">
                <span className="font-semibold">{user.name || user.email}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Kelola Produk</h1>
            <p className="mt-2 text-zinc-600">
              Tambah, edit, atau hapus produk printer
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            + Tambah Produk
          </button>
        </div>

        {/* Products Table */}
        <div className="mt-8 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-zinc-600">Memuat produk...</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-zinc-600">
              Belum ada produk. Tambahkan produk pertama Anda!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                      Gambar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                      Nama Produk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                      Brand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                      Harga
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                      Stok
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-zinc-600">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-zinc-900">{product.name}</div>
                        <div className="text-sm text-zinc-600 line-clamp-1">
                          {product.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-900">{product.brand}</td>
                      <td className="px-6 py-4 font-semibold text-emerald-700">
                        Rp {product.priceCents.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            product.stock === 0
                              ? "bg-red-100 text-red-700"
                              : product.stock < 10
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {product.stock} unit
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="rounded-lg border border-emerald-600 px-3 py-1 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="rounded-lg border border-red-600 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-50"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-zinc-900">
              {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700">
                  Brand *
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700">
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    value={formData.priceCents}
                    onChange={(e) =>
                      setFormData({ ...formData, priceCents: e.target.value })
                    }
                    placeholder="Contoh: 100000"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700">
                    Stok *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700">
                  Deskripsi *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700">
                  Spesifikasi
                </label>
                <p className="mt-1 text-xs text-zinc-500">
                  Tambahkan detail spesifikasi produk (misal: Kondisi, Garansi, Teknologi Cetak, Resolusi, dll)
                </p>
                <div className="mt-2 max-h-64 overflow-y-auto space-y-2 border border-zinc-200 rounded-lg p-3 bg-zinc-50">
                  {specs.map((spec, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nama (contoh: Teknologi Cetak)"
                        value={spec.key}
                        onChange={(e) => {
                          const newSpecs = [...specs];
                          newSpecs[index].key = e.target.value;
                          setSpecs(newSpecs);
                        }}
                        className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                      <input
                        type="text"
                        placeholder="Nilai (contoh: Inkjet)"
                        value={spec.value}
                        onChange={(e) => {
                          const newSpecs = [...specs];
                          newSpecs[index].value = e.target.value;
                          setSpecs(newSpecs);
                        }}
                        className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                      {specs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSpecs(specs.filter((_, i) => i !== index))}
                          className="rounded-lg border border-red-300 px-3 py-2 text-red-600 hover:bg-red-50"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSpecs([...specs, { key: "", value: "" }])}
                    className="mt-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    + Tambah Spesifikasi
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700">
                  URL Gambar *
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  required
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-zinc-300 px-4 py-2 font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
                >
                  {editingProduct ? "Simpan Perubahan" : "Tambah Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
