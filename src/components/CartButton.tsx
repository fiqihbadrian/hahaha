import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";

type CartItem = {
  
  id: number;
  name: string;
  priceCents: number;
  quantity: number;
};


type User = {
  id: number;
  email: string;
  
  name?: string;
  role: string;
};

type CartButtonProps = {
  cart: CartItem[];
  isOpen: boolean;
  onToggle: () => void;
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onRemove: (productId: number) => void;
  formatIDR: (cents: number) => string;
  user?: User | null;
  unreadCount?: number;
};

export default function CartButton({
  cart,
  isOpen,
  onToggle,
  onUpdateQuantity,
  onRemove,
  formatIDR,
  user,
  unreadCount = 0,
}: CartButtonProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cartTotal = cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  // Detect mobile on client side
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Tutup cart dan mobile menu saat scroll
  useEffect(() => {
    if (!isOpen && !showMobileMenu) return;

    const handleScroll = () => {
      if (isOpen) onToggle(); // Tutup cart desktop
      if (showMobileMenu) setShowMobileMenu(false); // Tutup mobile menu
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen, showMobileMenu, onToggle]);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Mobile: Show menu button only when logged in */}
      <button
        onClick={() => {
          if (user && isMobile) {
            setShowMobileMenu(!showMobileMenu);
          } else {
            onToggle();
          }
        }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-zinc-100 border border-zinc-200"
      >
        <FontAwesomeIcon icon={faCartShopping} className="h-6 w-6" />
        {/* Show cart count badge */}
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {cart.length}
          </span>
        )}
      </button>

      {/* Mobile Menu Dropdown (3 options) - Only show on mobile when logged in */}
      {user && showMobileMenu && isMobile && (
        <div className="absolute bottom-16 right-0 w-64 rounded-xl border border-emerald-200 bg-white shadow-lg overflow-hidden">
          <Link
            href="/checkout"
            onClick={() => {
              // Pastikan cart tersimpan sebelum navigate
              console.log("[CartButton Mobile] Saving cart before navigate:", cart);
              localStorage.setItem("cart", JSON.stringify(cart));
              setShowMobileMenu(false);
            }}
            className="flex items-center gap-3 px-4 py-3.5 text-sm text-zinc-800 hover:bg-emerald-50 transition-colors border-b border-zinc-100"
          >
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="flex-1 font-medium">Keranjang</span>
            {cart.length > 0 && (
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full px-2 py-0.5">
                {cart.length}
              </span>
            )}
          </Link>
          <Link
            href="/profile?tab=orders"
            onClick={() => setShowMobileMenu(false)}
            className="flex items-center gap-3 px-4 py-3.5 text-sm text-zinc-800 hover:bg-emerald-50 transition-colors border-b border-zinc-100"
          >
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="flex-1 font-medium">Pesanan Saya</span>
          </Link>
          <Link
            href="/profile?tab=inbox"
            onClick={() => setShowMobileMenu(false)}
            className="flex items-center gap-3 px-4 py-3.5 text-sm text-zinc-800 hover:bg-emerald-50 transition-colors"
          >
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="flex-1 font-medium">Inbox</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>
      )}

      {/* Desktop: Keranjang Dropdown */}
      {isOpen && !isMobile && (
        <div className="absolute bottom-16 right-0 w-80 rounded-xl border border-emerald-200 bg-white p-4 shadow-lg">
          <h3 className="font-bold text-emerald-800">Keranjang Belanja</h3>
          {cart.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">Keranjang kosong</p>
          ) : (
            <>
              <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-emerald-50 p-2 text-xs"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-zinc-900">{item.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="rounded border border-zinc-300 px-1 py-0.5 hover:bg-zinc-200"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="rounded border border-zinc-300 px-1 py-0.5 hover:bg-zinc-200"
                        >
                          +
                        </button>
                        <span className="ml-auto text-emerald-700">
                          {formatIDR(item.priceCents * item.quantity)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t border-emerald-200 pt-3">
                <p className="flex justify-between font-bold text-emerald-800">
                  <span>Total:</span>
                  <span>{formatIDR(cartTotal)}</span>
                </p>
                <Link
                  href="/checkout"
                  onClick={() => {
                    // Pastikan cart tersimpan sebelum navigate
                    console.log("[CartButton Desktop] Saving cart before navigate:", cart);
                    localStorage.setItem("cart", JSON.stringify(cart));
                    onToggle();
                  }}
                  className="mt-2 block w-full rounded-lg bg-emerald-600 py-2 text-center font-semibold text-white hover:bg-emerald-700"
                >
                  Lanjut ke Checkout
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
