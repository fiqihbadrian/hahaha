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

type Order = {
  id: number;
  userId: number;
  totalCents: number;
  paymentStatus: string;
  invoiceId: string;
  createdAt: string;
  user?: {
    email: string;
    name?: string;
  };
  items?: any[];
};

export default function OrdersManagement() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");

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
    loadOrders();
  }, [router]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders");
      const data = await response.json();

      if (response.ok) {
        setOrders(Array.isArray(data) ? data : []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) {
      alert("Pilih status baru");
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: newStatus,
        }),
      });

      if (response.ok) {
        alert("Status pesanan berhasil diupdate dan notifikasi telah dikirim ke user!");
        setSelectedOrder(null);
        setNewStatus("");
        loadOrders();
      } else {
        alert("Gagal update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Terjadi kesalahan");
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm("Yakin ingin membatalkan pesanan ini? User akan menerima notifikasi pembatalan.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Pesanan berhasil dibatalkan dan notifikasi telah dikirim ke user!");
        loadOrders();
      } else {
        alert("Gagal membatalkan pesanan");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Terjadi kesalahan");
    }
  };

  const formatIDR = (rupiah: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(rupiah);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Kelola Pesanan</h1>
          <p className="mt-2 text-zinc-600">
            Lihat semua pesanan dan update status pembayaran
          </p>
        </div>

        {/* Orders Table */}
        <div className="mt-8 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-zinc-600">Memuat pesanan...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-zinc-600">
              Belum ada pesanan
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                      ID Pesanan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                      Email Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                      Invoice ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-zinc-600">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-zinc-900">#{order.id}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-600">
                        {order.user?.email || "Unknown"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-emerald-700">
                          {formatIDR(order.totalCents)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            order.paymentStatus === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-700"
                              : order.paymentStatus === "SHIPPED"
                              ? "bg-blue-100 text-blue-700"
                              : order.paymentStatus === "PROCESSING"
                              ? "bg-purple-100 text-purple-700"
                              : order.paymentStatus === "PAID"
                              ? "bg-green-100 text-green-700"
                              : order.paymentStatus === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600">
                        {order.invoiceId}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewStatus(order.paymentStatus);
                            }}
                            className="rounded-lg border border-emerald-600 px-3 py-1 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                          >
                            Update
                          </button>
                          {order.paymentStatus !== "CANCELLED" && order.paymentStatus !== "COMPLETED" && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="rounded-lg border border-red-600 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-50"
                            >
                              Batalkan
                            </button>
                          )}
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

      {/* Modal Update Status */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-zinc-900">
              Update Status Pesanan #{selectedOrder.id}
            </h2>

            <div className="mt-4">
              <p className="text-sm text-zinc-600">
                Email: <span className="font-semibold">{selectedOrder.user?.email}</span>
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                Total: <span className="font-semibold text-emerald-700">
                  {formatIDR(selectedOrder.totalCents)}
                </span>
              </p>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-zinc-700">
                Status Pesanan
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="PENDING">Menunggu Pembayaran</option>
                <option value="PAID">Sudah Dibayar</option>
                <option value="PROCESSING">Sedang Diproses (Pengemasan)</option>
                <option value="SHIPPED">Sudah Dikirim</option>
                <option value="COMPLETED">Selesai</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
              <p className="mt-2 text-xs text-zinc-500">
                User akan menerima notifikasi setelah status diupdate
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg border border-zinc-300 px-4 py-2 font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateStatus}
                className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
