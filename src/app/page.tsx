"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ProductsSection from "@/components/ProductsSection";
import ProductDetailModal from "@/components/ProductDetailModal";
import LoginModal from "@/components/LoginModal";
import CartButton from "@/components/CartButton";
import InfoSection from "@/components/InfoSection";
import Footer from "@/components/Footer";
import SuccessPopup from "@/components/SuccessPopup";

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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notification count
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          const unread = data.notifications?.filter((n: any) => !n.isRead).length || 0;
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

  // Load products from API
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // Load user & cart dari localStorage saat mount dan saat kembali ke halaman
  useEffect(() => {
    const loadCartFromStorage = () => {
      const savedUser = localStorage.getItem("user");
      const savedCart = localStorage.getItem("cart");
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        setCart([]);
      }
    };

    // Load saat pertama kali mount
    loadCartFromStorage();

    // Reload saat ada update cart (dari halaman lain)
    const handleCartUpdate = () => {
      loadCartFromStorage();
    };

    window.addEventListener('cart-update', handleCartUpdate);
    window.addEventListener('popstate', handleCartUpdate);
    window.addEventListener('focus', handleCartUpdate);

    return () => {
      window.removeEventListener('cart-update', handleCartUpdate);
      window.removeEventListener('popstate', handleCartUpdate);
      window.removeEventListener('focus', handleCartUpdate);
    };
  }, []);

  // Simpan cart ke localStorage setiap kali berubah
  useEffect(() => {
    console.log("[Homepage] Saving cart to localStorage:", cart);
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const handleAuth = async (email: string, password: string, name: string, isRegister: boolean) => {
    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const payload = isRegister
        ? { email, password, name }
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal login/register");

      const data = await res.json();
      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setShowLoginModal(false);
      setSuccessMessage(`${isRegister ? "Registrasi" : "Login"} berhasil!`);
    } catch (err) {
      throw err;
    }
  };

  const handleLogout = async () => {
    // Clear JWT cookie
    await fetch("/api/auth/logout", { method: "POST" });
    
    setUser(null);
    setCart([]);
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
  };

  const handleAddToCart = (product: Product, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let newCart;
      if (existing) {
        newCart = prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      } else {
        newCart = [...prev, { ...product, quantity: qty }];
      }
      console.log("[Homepage] Cart updated:", newCart);
      return newCart;
    });
    setSuccessMessage(`${product.name} (${qty}x) ditambahkan ke keranjang!`);
  };

  const handleUpdateCart = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleBuyNow = (product: Product, quantity: number) => {
    if (user) {
      handleAddToCart(product, quantity);
      // Tunggu sebentar agar localStorage tersimpan dulu
      setTimeout(() => {
        window.location.href = "/checkout";
      }, 100);
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 text-zinc-900">
      <SuccessPopup
        show={!!successMessage}
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />
      
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onLoginClick={() => setShowLoginModal(true)} 
      />
      <div className="h-[96px]" />
      
      <HeroSection />
      <FeaturesSection />
      <ProductsSection
        products={products}
        loading={productsLoading}
        onProductClick={setSelectedProduct}
        onAddToCart={(p) => handleAddToCart(p, 1)}
        formatIDR={formatIDR}
      />
      
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, qty) => {
          handleAddToCart(p, qty);
          setSelectedProduct(null);
        }}
        onBuyNow={handleBuyNow}
        user={user}
        formatIDR={formatIDR}
      />

      <LoginModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSubmit={handleAuth}
      />

      <CartButton
        cart={cart}
        isOpen={cartOpen}
        onToggle={() => setCartOpen(!cartOpen)}
        onUpdateQuantity={handleUpdateCart}
        onRemove={handleRemoveFromCart}
        formatIDR={formatIDR}
        user={user}
        unreadCount={unreadCount}
      />

      <InfoSection />
      <Footer />
    </div>
  );
}
