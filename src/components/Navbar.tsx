"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HiMenu, HiX } from "react-icons/hi";
import { gsap } from "gsap";

type User = {
  id: number;
  
  email: string;
  name?: string;
  role: string;
  image?: string; // opsional kalau nanti pakai foto beneran
};

type NavbarProps = {
  user: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
};

export default function Navbar({ user, onLogout, onLoginClick }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cartDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Animate mobile menu with GSAP
  useEffect(() => {
    if (!mobileMenuRef.current) return;

    if (open) {
      gsap.fromTo(
        mobileMenuRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [open]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
      setAccountOpen(false);
      setOpen(false); // Tutup mobile menu saat scroll
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load notification count
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          const unread = data.notifications.filter((n: any) => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [user]);

  // Tutup mobile menu saat scroll (khusus untuk mobile)
  useEffect(() => {
    if (!open) return;

    const handleScroll = () => {
      setOpen(false);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [open]);

  // close dropdown when click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false);
      }
      if (
        cartDropdownRef.current &&
        !cartDropdownRef.current.contains(e.target as Node)
      ) {
        setCartDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* WRAPPER (STABIL) */}
      <div className="fixed top-0 left-0 w-full z-50 flex justify-center pointer-events-none">
        <nav
          className={`pointer-events-auto transition-all duration-500 ease-out
            flex items-center justify-between
            px-6 md:px-10 py-4
            ${
              scrolled
                ? "mt-4 w-[90%] max-w-6xl rounded-full bg-white/80 dark:bg-[#1a3d2a]/80 backdrop-blur-md shadow-lg"
                : "w-full rounded-none bg-transparent"
            }`}
        >
          {/* LOGO */}
          <Link
            href="/"
            className={`font-bold tracking-wide transition-all duration-500
              ${
                scrolled
                  ? "text-emerald-700 dark:text-emerald-400 text-lg"
                  : "text-white text-xl md:text-2xl"
              }`}
          >
            ACC
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex gap-8">
            {["Produk", "Keunggulan", "Hubungi"].map((item) => (
              <Link
                key={item}
                href={`/#${item.toLowerCase()}`}
                className={`font-medium transition-colors
                  ${
                    scrolled
                      ? "text-zinc-800 dark:text-white hover:text-emerald-600"
                      : "text-white/90 hover:text-white"
                  }`}
              >
                {item}
              </Link>
            ))}
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            {/* AUTH DESKTOP */}
            {user ? (
              <div ref={dropdownRef} className="hidden md:block relative">
                {/* AVATAR ONLY */}
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center transition-all
                    ${
                      scrolled
                        ? "bg-zinc-100 dark:bg-zinc-700"
                        : "bg-white/20"
                    }`}
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {(user.name || user.email)[0].toUpperCase()}
                    </span>
                  )}
                </button>

                {/* DROPDOWN */}
                {accountOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-xl bg-white dark:bg-[#1a3d2a] shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
                      <p className="text-sm font-semibold text-zinc-800 dark:text-white">
                        {user.name || "Akun"}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {user.email}
                      </p>
                      <p className="text-xs mt-1 text-emerald-600 font-medium">
                        {user.role}
                      </p>
                    </div>

                    <Link
                      href="/profile?tab=orders"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span className="flex-1">Pesanan Saya</span>
                    </Link>

                    <Link
                      href="/profile?tab=inbox"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors relative"
                    >
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <span className="flex-1">Inbox</span>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="flex-1">Profil Saya</span>
                    </Link>

                    {user.role === "ADMIN" && (
                      <Link
                        href="/dashboard"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2 text-sm text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      >
                        Dashboard Admin
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setAccountOpen(false);
                        setShowLogoutModal(true);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className={`hidden md:block px-4 py-2 rounded-full font-semibold transition-all
                  ${
                    scrolled
                      ? "bg-emerald-600 text-white"
                      : "bg-white/20 text-white"
                  }`}
              >
                Login
              </button>
            )}

            

            {/* MOBILE BUTTON */}
            <button
              className={`md:hidden text-2xl ${
                scrolled ? "text-zinc-800 dark:text-white" : "text-white"
              }`}
              onClick={() => setOpen(!open)}
            >
              {open ? <HiX /> : <HiMenu />}
            </button>
          </div>
        </nav>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div ref={mobileMenuRef} className="md:hidden fixed top-24 w-full bg-white/90 dark:bg-[#1a3d2a]/90 backdrop-blur z-40 p-4">
          {["Produk", "Keunggulan", "Hubungi"].map((item) => (
            <Link
              key={item}
              href={`/#${item.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="block py-2 font-medium text-white"
            >
              {item}
            </Link>
          ))}

          <hr className="my-3" />

          {user ? (
            <>
              <Link
                href="/profile?tab=orders"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 py-2.5 font-medium text-white"
              >
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Pesanan Saya</span>
              </Link>
              <Link
                href="/profile?tab=inbox"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 py-2.5 font-medium text-white relative"
              >
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>Inbox</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 py-2.5 font-medium text-white"
              >
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profil Saya</span>
              </Link>
              {user.role === "ADMIN" && (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="block py-2 font-medium text-emerald-700"
                >
                  Dashboard Admin
                </Link>
              )}
              <button
                onClick={() => {
                  setOpen(false);
                  setShowLogoutModal(true);
                }}
                className="block py-2 text-red-600 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setOpen(false);
                onLoginClick();
              }}
              className="mt-2 w-full py-2 rounded-lg bg-emerald-600 text-white font-semibold"
            >
              Login / Daftar
            </button>
          )}
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a3d2a] rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Konfirmasi Logout</h3>
            </div>
            <p className="text-zinc-600 dark:text-zinc-300 mb-6">
              Apakah Anda yakin ingin keluar dari akun? Anda harus login kembali untuk mengakses fitur yang memerlukan autentikasi.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
              >
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
