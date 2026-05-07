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

export default function AdminsManagement() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Only admin@anekacitra.com can access admin management
    if (userData.email !== "admin@anekacitra.com") {
      alert("Akses ditolak: Hanya Super Admin (admin@anekacitra.com) yang bisa mengelola admin");
      router.push("/dashboard");
      return;
    }

    setUser(userData);
    loadAdmins();
  }, [router]);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/admins");
      const data = await response.json();

      if (response.ok) {
        setAdmins(Array.isArray(data) ? data : []);
      } else {
        console.error("Error response:", response.status, data);
        if (response.status === 403) {
          const message = data.hint || "Sesi Anda sudah kadaluarsa. Silakan login ulang sebagai admin@anekacitra.com";
          alert(message);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          window.location.href = "/";
        }
        setAdmins([]);
      }
    } catch (error) {
      console.error("Error loading admins:", error);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Admin berhasil ditambahkan!");
        setEmail("");
        setName("");
        setPassword("");
        setShowModal(false);
        loadAdmins();
      } else {
        alert(data.error || "Gagal membuat admin");
      }
    } catch (error) {
      console.error("Error adding admin:", error);
      alert("Terjadi kesalahan saat menambahkan admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== "ADMIN" || user.email !== "admin@anekacitra.com") {
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
            <h1 className="text-3xl font-bold text-zinc-900">Kelola Admin</h1>
            <p className="mt-2 text-zinc-600">
              Tambahkan atau kelola akun admin
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            + Tambah Admin
          </button>
        </div>

        {/* Admins Table */}
        <div className="mt-8 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-zinc-600">Memuat data...</div>
          ) : admins.length === 0 ? (
            <div className="p-8 text-center text-zinc-600">
              Belum ada data admin
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                      Role
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-zinc-600">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-zinc-900">{admin.email}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-600">{admin.name || "-"}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          disabled={true}
                          className="cursor-not-allowed rounded-lg border border-red-600 px-3 py-1 text-sm font-semibold text-red-700 opacity-50"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-800">
            <strong>Petunjuk:</strong> Klik tombol "Tambah Admin" untuk menambahkan admin baru. Admin yang ditambahkan akan langsung memiliki akses penuh ke dashboard.
          </p>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-zinc-900">Tambah Admin Baru</h2>

            <form onSubmit={handleAddAdmin} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700">
                  Nama
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700">
                  Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Loading..." : "Tambah Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
