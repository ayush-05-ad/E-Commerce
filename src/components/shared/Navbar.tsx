"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Search, Menu, User, X, MoreVertical } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { SignInButton, UserButton, useClerk, useAuth, Show } from "@clerk/nextjs";

export function Navbar() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((state) => state.getCartCount());

  // Search input state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 3-dot dropdown menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-neutral-950/85 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-neutral-900 dark:bg-white rounded flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white dark:text-neutral-900" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">
              NXT<span className="text-neutral-500">STORE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          {!isSearchOpen && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/shop" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                Catalog
              </Link>
              <Link href="/shop?category=apparel" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                Apparel
              </Link>
              <Link href="/shop?category=tech" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                Tech
              </Link>
              <Link href="/shop?category=accessories" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                Accessories
              </Link>
              <Link href="/about" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                About
              </Link>
            </nav>
          )}

          {/* Actions / Search Box */}
          <div className="flex items-center gap-4 flex-1 md:flex-initial justify-end">
            
            {/* Sliding Search Input */}
            {isSearchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 w-full max-w-xs md:w-64 animate-in fade-in slide-in-from-right-4 duration-300">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs focus:outline-none w-full text-neutral-900 dark:text-white"
                  autoFocus
                />
                <button type="submit" className="p-0.5 hover:text-neutral-950 text-neutral-500">
                  <Search className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => setIsSearchOpen(false)} className="p-0.5 hover:text-red-500 text-neutral-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            <Show 
              when="signed-in"
              fallback={
                <SignInButton mode="modal">
                  <button className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    <User className="w-5 h-5" />
                  </button>
                </SignInButton>
              }
            >
              <UserButton />
            </Show>

            {/* Cart Link */}
            <Link href="/checkout" className="relative p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors block">
              <ShoppingBag className="w-5 h-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* 3-Dot Dropdown Menu Button */}
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center justify-center"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link 
                    href="/about" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-semibold"
                  >
                    About Us
                  </Link>
                  <Link 
                    href="/developer" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-semibold"
                  >
                    Developer Profile
                  </Link>
                  <Link 
                    href="/seller" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-semibold"
                  >
                    Seller Panel
                  </Link>
                  <Link 
                    href="/admin" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-semibold"
                  >
                    Admin Panel
                  </Link>
                  {mounted && isSignedIn && (
                    <button 
                      onClick={async () => {
                        setIsMenuOpen(false);
                        await signOut();
                        window.location.href = "/";
                      }}
                      className="w-full text-left block px-4 py-2.5 text-sm text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-bold border-t border-neutral-100 dark:border-neutral-850 mt-1"
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              )}
            </div>

            <button className="md:hidden p-2 text-neutral-500 hover:text-neutral-900 transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
