import React from 'react';
import { ShoppingBag, ShieldCheck, BarChart3, LayoutDashboard, Database, Search, Sparkles } from 'lucide-react';
import { ActiveTab, ProductCategory } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedCategory: ProductCategory | 'all';
  setSelectedCategory: (cat: ProductCategory | 'all') => void;
  cartCount: number;
  openCart: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currency: 'USD' | 'EUR' | 'GBP';
  setCurrency: (c: 'USD' | 'EUR' | 'GBP') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  cartCount,
  openCart,
  searchQuery,
  setSearchQuery,
  currency,
  setCurrency,
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-40 bg-[#0c0d0f]/90 backdrop-blur-md border-b border-zinc-800/80">
      {/* Top Banner */}
      <div id="top-announcement-bar" className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800/50 text-[11px] font-medium tracking-wider text-zinc-400 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] uppercase font-semibold">
              <Sparkles className="w-3 h-3 text-amber-400" /> Freelance Retail OS
            </span>
            <span className="hidden md:inline text-zinc-300">Fast React + Localhost MongoDB & Flask Backend Architecture</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit TLS Bank Encrypted
            </span>
            <div className="flex items-center gap-1 text-zinc-400">
              <span>Currency:</span>
              <select
                id="currency-selector"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                aria-label="Currency selector"
                className="bg-zinc-800/80 text-zinc-200 text-[11px] rounded px-1.5 py-0.5 border border-zinc-700 focus:outline-none focus:border-amber-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => {
                setActiveTab('shop');
                setSelectedCategory('all');
              }}
              className="text-left group focus:outline-none"
            >
              <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                AURA
              </span>
              <span className="block text-[9px] uppercase tracking-[0.28em] text-zinc-400 -mt-1 font-medium">
                Atelier & Eyewear
              </span>
            </button>
          </div>

          {/* Primary View Switcher */}
          <nav id="primary-nav-tabs" className="hidden lg:flex items-center bg-zinc-900/90 p-1 rounded-full border border-zinc-800 text-xs">
            <button
              id="nav-tab-shop"
              onClick={() => setActiveTab('shop')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeTab === 'shop'
                  ? 'bg-zinc-100 text-zinc-900 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Boutique Storefront
            </button>
            <button
              id="nav-tab-admin"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-black shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Inventory Logiciel
            </button>
            <button
              id="nav-tab-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-zinc-100 text-zinc-900 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Executive Analytics & PDF
            </button>
            <button
              id="nav-tab-database"
              onClick={() => setActiveTab('database')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-medium transition-all ${
                activeTab === 'database'
                  ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              MongoDB & Flask Code
            </button>
          </nav>

          {/* Actions & Cart */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search bar */}
            {activeTab === 'shop' && (
              <div className="relative hidden sm:block w-48 md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  id="search-products-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clothes, glasses..."
                  aria-label="Search clothes, glasses and accessories"
                  className="w-full bg-zinc-900/90 text-xs text-white placeholder-zinc-500 pl-9 pr-4 py-2 rounded-full border border-zinc-800 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            )}

            {/* Shopping Bag Trigger */}
            <button
              id="open-cart-drawer-btn"
              onClick={openCart}
              className="relative flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-3 sm:px-4 py-2 rounded-full border border-zinc-800 hover:border-zinc-700 transition-all focus:outline-none group"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-zinc-300 group-hover:text-amber-400 transition-colors" />
                {cartCount > 0 && (
                  <span
                    id="cart-badge-count"
                    className="absolute -top-1.5 -right-2 bg-amber-500 text-zinc-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse"
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-semibold tracking-wider uppercase">Bag</span>
            </button>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="flex lg:hidden overflow-x-auto pb-3 gap-2 border-t border-zinc-800/50 pt-2 text-xs scrollbar-none">
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${
              activeTab === 'shop' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400'
            }`}
          >
            Storefront
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${
              activeTab === 'admin' ? 'bg-amber-500 text-zinc-950 font-semibold' : 'text-zinc-400'
            }`}
          >
            Inventory Logiciel
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${
              activeTab === 'analytics' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400'
            }`}
          >
            Analytics & PDF
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${
              activeTab === 'database' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400'
            }`}
          >
            MongoDB & Flask
          </button>
        </div>
      </div>
    </header>
  );
};
