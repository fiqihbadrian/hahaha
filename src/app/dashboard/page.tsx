"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

type User = {
  id: number;
  email: string;
  name?: string;
  role: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });

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
    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/orders"),
      ]);

      if (productsRes.ok && ordersRes.ok) {
        const products = await productsRes.json();
        const orders = await ordersRes.json();

        const totalProducts = Array.isArray(products) ? products.length : 0;
        const totalOrders = Array.isArray(orders) ? orders.length : 0;
        const pendingOrders = Array.isArray(orders)
          ? orders.filter((o: any) => o.paymentStatus === "PENDING").length
          : 0;

        setStats({
          totalProducts,
          totalOrders,
          pendingOrders,
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-4">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-zinc-900 dark:text-zinc-100">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Navbar user={user} onLogout={handleLogout} onLoginClick={() => {}} />
      <div className="h-[96px]" />
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard Admin</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Kelola produk, pesanan, dan pengaturan toko
        </p>

        {/* Stats Cards */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm dark:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-100 dark:bg-emerald-900 p-3">
                <svg className="h-6 w-6 text-emerald-700 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Produk</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm dark:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3">
                <svg className="h-6 w-6 text-blue-700 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Pesanan</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm dark:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-100 dark:bg-yellow-900 p-3">
                <svg className="h-6 w-6 text-yellow-700 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Menunggu Pembayaran</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Cards */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Link
            href="/dashboard/products"
            className="group rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm dark:shadow-lg transition-all hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Kelola Produk</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Tambah, edit, atau hapus produk printer
                </p>
              </div>
              <svg className="h-6 w-6 text-emerald-700 dark:text-emerald-400 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/dashboard/orders"
            className="group rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm dark:shadow-lg transition-all hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Kelola Pesanan</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Lihat dan update status pesanan
                </p>
              </div>
              <svg className="h-6 w-6 text-emerald-700 dark:text-emerald-400 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </Link>

          {/* Only show Kelola Admin for super admin */}
          {user.email === "admin@anekacitra.com" && (
            <Link
              href="/dashboard/admins"
              className="group rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm dark:shadow-lg transition-all hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Kelola Admin</h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Tambah atau hapus admin
                  </p>
                </div>
                <svg className="h-6 w-6 text-emerald-700 dark:text-emerald-400 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </Link>
          )}

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm dark:shadow-lg opacity-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Database</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Coming Soon - Export/Import data
                </p>
              </div>
              <svg className="h-6 w-6 text-zinc-400 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
