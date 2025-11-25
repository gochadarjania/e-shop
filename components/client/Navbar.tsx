'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MdMenu, MdClose, MdShoppingCart, MdSearch, MdPerson } from 'react-icons/md';
import { useClientAuth } from '@/lib/context/ClientAuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated, user, logout } = useClientAuth();

  const toggleAccountMenu = () => {
    if (!isAuthenticated) return;
    setIsAccountMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setIsAccountMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-[#FF6B3D]">EShop</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-[#FF6B3D] transition-colors">
              მთავარი
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-[#FF6B3D] transition-colors">
              პროდუქტები
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-[#FF6B3D] transition-colors">
              კატეგორიები
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-[#FF6B3D] transition-colors">
              ჩვენ შესახებ
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-[#FF6B3D] transition-colors">
              კონტაქტი
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-700 hover:text-[#FF6B3D] transition-colors"
              aria-label="Search"
            >
              <MdSearch className="text-xl" />
            </button>

            {/* Account */}
            <div className="hidden sm:block">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={toggleAccountMenu}
                    className="flex items-center space-x-2 p-2 text-gray-700 hover:text-[#FF6B3D] transition-colors"
                    aria-label="Account"
                  >
                    <MdPerson className="text-xl" />
                    <span className="text-sm font-medium">
                      {user?.fullName || user?.email}
                    </span>
                  </button>

                  {isAccountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10">
                      <div className="px-4 pb-2 text-sm text-gray-600 border-b border-gray-100">
                        <p className="font-semibold text-gray-800">{user?.fullName || 'მომხმარებელი'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        გამოსვლა
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center space-x-2 rounded-full border border-gray-200 px-3 py-1.5 text-gray-700 hover:border-[#FF6B3D] hover:text-[#FF6B3D] transition"
                  aria-label="Account"
                >
                  <MdPerson className="text-xl" />
                  <span className="text-sm font-medium">შესვლა</span>
                </button>
              )}
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-[#FF6B3D] transition-colors"
              aria-label="Cart"
            >
              <MdShoppingCart className="text-xl" />
              <span className="absolute top-0 right-0 bg-[#FF6B3D] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-[#FF6B3D] transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
            </button>
          </div>
        </div>

        {/* Search Bar (toggleable) */}
        {isSearchOpen && (
          <div className="py-4 border-t">
            <input
              type="text"
              placeholder="ძიება..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B3D] focus:border-transparent"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              მთავარი
            </Link>
            <Link
              href="/products"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              პროდუქტები
            </Link>
            <Link
              href="/categories"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              კატეგორიები
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              ჩვენ შესახებ
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              კონტაქტი
            </Link>
            <button
              className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              onClick={() => {
                setIsMenuOpen(false);
                setIsAuthModalOpen(true);
              }}
            >
              შესვლა / რეგისტრაცია
            </button>
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
}
