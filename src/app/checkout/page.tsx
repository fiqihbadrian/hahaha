"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  priceCents: number;
  imageUrl: string;
};

type CartItem = Product & { quantity: number };

type User = {
  id: number;
  email: string;
  name?: string;
  role: string;
};

function formatIDR(rupiah: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(rupiah);
}

export default function CheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("xendit");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [invoiceId, setInvoiceId] = useState("");
  const [orderId, setOrderId] = useState(0);

  const shippingCost = 0;
  const subtotal = cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const total = subtotal + shippingCost;

  // Load user & cart
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedCart = localStorage.getItem("cart");

    console.log("[Checkout] Loading cart from localStorage:", savedCart);

    if (!savedUser) {
      router.push("/");
      return;
    }

    setUser(JSON.parse(savedUser));
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      console.log("[Checkout] Parsed cart:", parsedCart);
      setCart(parsedCart);
      
      if (parsedCart.length === 0) {
        console.log("[Checkout] Cart is empty, redirecting to homepage");
        setTimeout(() => {
          router.push("/");
        }, 100);
        return;
      }
      
      const user = JSON.parse(savedUser);
      setShippingAddress((prev) => ({
        ...prev,
        fullName: user.name || "",
      }));
    } else {
      console.log("[Checkout] No cart in localStorage");
    }
  }, [router]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
      alert("Isi semua data pengiriman");
      return;
    }

    setLoading(true);
    try {
      // Create order via API
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) throw new Error("Gagal membuat order");

      const data = await res.json();
      setOrderId(data.orderId);
      setInvoiceId(data.invoice.invoiceId);
      setOrderCreated(true);
      // Jangan hapus cart dari localStorage, biarkan user yang hapus manual
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-emerald-50 p-4">
        <div className="mx-auto max-w-7xl">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-emerald-50 p-4">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-lg text-zinc-600">Keranjang kosong</p>
          <Link href="/" className="mt-4 inline-block text-emerald-700 font-semibold hover:underline">
            Kembali ke Belanja
          </Link>
        </div>
      </div>
    );
  }

  // Order berhasil - tampilkan konfirmasi pembayaran
  if (orderCreated) {
    return (
      <div className="min-h-screen bg-emerald-50 p-4">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="text-center">
              <div className="text-5xl">✅</div>
              <h1 className="mt-2 text-2xl font-bold text-emerald-700">Order Berhasil Dibuat!</h1>
              <p className="mt-2 text-zinc-600">
                Nomor Order: <span className="font-semibold">#{orderId}</span>
              </p>
            </div>

            <div className="mt-6 rounded-xl bg-emerald-50 p-4">
              <h2 className="font-semibold text-emerald-800">Instruksi Pembayaran (Sandbox Xendit)</h2>
              <p className="mt-2 text-sm text-zinc-700">
                Invoice ID: <span className="font-mono font-semibold">{invoiceId}</span>
              </p>
              <div className="mt-3 space-y-2 text-sm text-zinc-600">
                <p>
                  <strong>Total yang harus dibayar:</strong> {formatIDR(total)}
                </p>
                <p>
                  <strong>Status:</strong> <span className="inline-block rounded-full bg-yellow-100 px-2 py-1 text-yellow-800">PENDING</span>
                </p>
                <p className="mt-3 text-xs">
                  🔔 Untuk testing: Simulasi pembayaran berhasil dengan tombol di bawah (ini hanya demo mode).
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={async () => {
                    const res = await fetch("/api/orders/payment-status", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        orderId,
                        status: "PAID",
                      }),
                    });
                    if (res.ok) {
                      alert("Pembayaran berhasil (simulasi mode)");
                      router.push("/");
                    }
                  }}
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
                >
                  ✓ Simulasi Pembayaran Berhasil
                </button>
                <Link
                  href="/"
                  onClick={() => {
                    // Trigger cart reload di homepage
                    window.dispatchEvent(new Event('cart-update'));
                  }}
                  className="flex-1 rounded-lg border border-emerald-300 px-4 py-2 text-center font-semibold text-emerald-700 hover:bg-emerald-50"
                >
                  Kembali Belanja
                </Link>
              </div>
            </div>

            <div className="mt-6 text-sm text-zinc-600">
              <p>Order kamu akan diproses setelah pembayaran dikonfirmasi.</p>
              <p className="mt-1">Silakan hubungi toko jika ada pertanyaan.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 p-4">
      {/* Header */}
      <div className="border-b border-emerald-200 bg-white mb-6">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <button
            onClick={() => {
              router.push("/");
              // Trigger storage event untuk reload cart di homepage
              window.dispatchEvent(new Event('cart-update'));
            }}
            className="text-lg font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            ← Kembali
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold text-emerald-800">Checkout</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Ringkasan Produk */}
            <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-emerald-800">Ringkasan Pesanan</h2>
              <div className="mt-4 space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b border-zinc-200 pb-4 last:border-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-zinc-900">{item.name}</p>
                      <p className="mt-1 text-sm text-zinc-600">
                        {item.quantity}x {formatIDR(item.priceCents)}
                      </p>
                      <p className="mt-1 font-medium text-emerald-700">
                        Subtotal: {formatIDR(item.priceCents * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alamat Pengiriman */}
            <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-emerald-800">Alamat Pengiriman</h2>
              <form className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">Nama Lengkap</label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                      }
                      required
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">Nomor Telepon</label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, phone: e.target.value })
                      }
                      required
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">Alamat Lengkap</label>
                  <textarea
                    value={shippingAddress.address}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, address: e.target.value })
                    }
                    required
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">Kota</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, city: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">Kode Pos</label>
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </form>

              {/* Shipping Info */}
              <div className="mt-4 rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-800">📦 Pengiriman: Coming Soon</p>
                <p className="mt-1 text-xs text-blue-700">
                  Fitur pengiriman sedang dalam pengembangan. Hubungi toko untuk info lebih lanjut.
                </p>
              </div>
            </div>

            {/* Catatan Pesanan */}
            <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-emerald-800">Catatan Pesanan (Opsional)</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Tolong segera dikirim, atau request khusus lainnya..."
                rows={3}
                className="mt-3 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Metode Pembayaran */}
            <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-emerald-800">Metode Pembayaran</h2>
              <div className="mt-4 space-y-2">
                <label className="flex items-center rounded-lg border border-emerald-300 p-3 cursor-pointer hover:bg-emerald-50">
                  <input
                    type="radio"
                    name="payment"
                    value="xendit"
                    checked={paymentMethod === "xendit"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-emerald-600"
                  />
                  <span className="ml-3 flex-1">
                    <span className="font-semibold text-emerald-800">💳 Xendit (E-Wallet, Transfer, Kartu Kredit)</span>
                    <p className="text-xs text-zinc-600">Pembayaran aman dan cepat</p>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="h-fit rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-bold text-emerald-800">Ringkasan Total</h2>
            <div className="mt-4 space-y-3 border-b border-zinc-200 pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Subtotal ({cart.length} item)</span>
                <span className="font-medium">{formatIDR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Ongkir</span>
                <span className="font-medium text-blue-600">Gratis (Coming Soon)</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-lg font-bold text-emerald-800">
              <span>Total Pembayaran</span>
              <span>{formatIDR(total)}</span>
            </div>

            <button
              onClick={handleCreateOrder}
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Lanjut Pembayaran"}
            </button>

            <Link
              href="/"
              className="mt-2 block w-full rounded-lg border border-emerald-300 px-4 py-3 text-center font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Kembali ke Belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
