"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faCamera, faBox, faArrowLeft, faBell, faEnvelope } from "@fortawesome/free-solid-svg-icons";

type User = {
  id: number;
  email: string;
  name?: string;
  role: string;
  imageUrl?: string;
};

type Order = {
  id: number;
  totalCents: number;
  paymentStatus: string;
  createdAt: string;
  items: {
    id: number;
    productName: string;
    quantity: number;
    priceCents: number;
  }[];
};

type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  orderId?: number;
  createdAt: string;
};

function formatIDR(rupiah: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(rupiah);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "inbox">("profile");
  const [uploading, setUploading] = useState(false);

  // Set active tab dari URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "orders" || tab === "inbox") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      router.push("/");
      return;
    }
    const userData = JSON.parse(savedUser);
    setUser(userData);
    loadOrders(userData.id);
    loadNotifications();

    // Auto-refresh orders dan notifications setiap 5 detik
    const intervalId = setInterval(() => {
      loadOrders(userData.id);
      loadNotifications();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [router]);

  const loadOrders = async (userId: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      if (res.ok) {
        loadNotifications();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validasi file
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      return;
    }

    setUploading(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const updatedUser = { ...user, imageUrl: base64String };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        alert("Foto profil berhasil diubah!");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert("Gagal mengupload foto");
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Menunggu Pembayaran" },
      PAID: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Dibayar" },
      PROCESSING: { bg: "bg-blue-100", text: "text-blue-800", label: "Diproses" },
      SHIPPED: { bg: "bg-purple-100", text: "text-purple-800", label: "Dikirim" },
      COMPLETED: { bg: "bg-green-100", text: "text-green-800", label: "Selesai" },
      CANCELLED: { bg: "bg-red-100", text: "text-red-800", label: "Dibatalkan" },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <p className="text-zinc-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50">
      {/* Header */}
      <div className="border-b border-emerald-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 font-semibold hover:underline">
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              {/* Profile Picture */}
              <div className="relative mx-auto w-32 h-32 group">
                <div className="w-full h-full rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center">
                  {user.imageUrl ? (
                    <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <FontAwesomeIcon icon={faUser} className="h-16 w-16 text-emerald-600" />
                  )}
                </div>
                <label
                  htmlFor="photo-upload"
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faCamera} className="h-8 w-8 text-white" />
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </div>

              <div className="mt-4 text-center">
                <h2 className="text-xl font-bold text-zinc-900">{user.name || "User"}</h2>
                <p className="text-sm text-zinc-600">{user.email}</p>
              </div>

              {/* Navigation */}
              <nav className="mt-6 space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full rounded-lg px-4 py-3 text-left font-medium transition-colors ${
                    activeTab === "profile"
                      ? "bg-emerald-100 text-emerald-800"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <FontAwesomeIcon icon={faUser} className="mr-2 h-4 w-4" />
                  Profil Saya
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full rounded-lg px-4 py-3 text-left font-medium transition-colors ${
                    activeTab === "orders"
                      ? "bg-emerald-100 text-emerald-800"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <FontAwesomeIcon icon={faBox} className="mr-2 h-4 w-4" />
                  Pesanan Saya
                </button>
                <button
                  onClick={() => setActiveTab("inbox")}
                  className={`w-full rounded-lg px-4 py-3 text-left font-medium transition-colors relative ${
                    activeTab === "inbox"
                      ? "bg-emerald-100 text-emerald-800"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <FontAwesomeIcon icon={faBell} className="mr-2 h-4 w-4" />
                  Notifikasi
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-emerald-800">Informasi Profil</h3>
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">Nama Lengkap</label>
                    <input
                      type="text"
                      value={user.name || ""}
                      readOnly
                      className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">Role</label>
                    <input
                      type="text"
                      value={user.role === "ADMIN" ? "Administrator" : "Customer"}
                      readOnly
                      className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-zinc-900"
                    />
                  </div>
                  <p className="text-sm text-zinc-500 italic">
                    💡 Untuk mengubah informasi profil, silakan hubungi administrator.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-emerald-800">Riwayat Pesanan</h3>
                {loading ? (
                  <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                    <p className="text-zinc-600">Memuat pesanan...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                    <FontAwesomeIcon icon={faBox} className="mx-auto h-16 w-16 text-zinc-300" />
                    <p className="mt-4 text-lg text-zinc-600">Belum ada pesanan</p>
                    <Link
                      href="/"
                      className="mt-4 inline-block rounded-lg bg-emerald-600 px-6 py-2 font-semibold text-white hover:bg-emerald-700"
                    >
                      Mulai Belanja
                    </Link>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="rounded-2xl bg-white p-6 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-zinc-600">
                            Order #{order.id} • {formatDate(order.createdAt)}
                          </p>
                          <p className="mt-1 text-lg font-bold text-zinc-900">
                            {formatIDR(order.totalCents)}
                          </p>
                        </div>
                        {getStatusBadge(order.paymentStatus)}
                      </div>

                      <div className="mt-4 space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-zinc-700">
                              {item.productName} x{item.quantity}
                            </span>
                            <span className="font-medium text-zinc-900">
                              {formatIDR(item.priceCents * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "inbox" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-emerald-800">Notifikasi</h3>
                {notifications.length === 0 ? (
                  <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                    <FontAwesomeIcon icon={faBell} className="mx-auto h-16 w-16 text-zinc-300" />
                    <p className="mt-4 text-lg text-zinc-600">Belum ada notifikasi</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`rounded-2xl bg-white p-6 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                          !notif.isRead ? "border-2 border-emerald-500" : ""
                        }`}
                        onClick={() => !notif.isRead && markAsRead(notif.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-bold ${
                                notif.type === "ERROR" ? "text-red-700" :
                                notif.type === "SUCCESS" ? "text-emerald-700" :
                                notif.type === "WARNING" ? "text-yellow-700" :
                                "text-blue-700"
                              }`}>
                                {notif.title}
                              </h4>
                              {!notif.isRead && (
                                <span className="bg-red-500 h-2 w-2 rounded-full"></span>
                              )}
                            </div>
                            <p className="mt-2 text-sm text-zinc-700">{notif.message}</p>
                            <p className="mt-3 text-xs text-zinc-500">
                              {formatDate(notif.createdAt)}
                              {notif.orderId && ` • Pesanan #${notif.orderId}`}
                            </p>
                          </div>
                          <div className={`shrink-0 rounded-full p-3 ${
                            notif.type === "ERROR" ? "bg-red-100" :
                            notif.type === "SUCCESS" ? "bg-emerald-100" :
                            notif.type === "WARNING" ? "bg-yellow-100" :
                            "bg-blue-100"
                          }`}>
                            <FontAwesomeIcon
                              icon={faEnvelope}
                              className={`h-5 w-5 ${
                                notif.type === "ERROR" ? "text-red-700" :
                                notif.type === "SUCCESS" ? "text-emerald-700" :
                                notif.type === "WARNING" ? "text-yellow-700" :
                                "text-blue-700"
                              }`}
                            />
                          </div>
                        </div>
                        {!notif.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notif.id);
                            }}
                            className="mt-3 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            Tandai sudah dibaca
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
