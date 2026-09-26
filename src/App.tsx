/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BusinessIndustryId, BusinessProduct, BusinessOrder, LanguageCode } from './businesses/types';
import { ALL_BUSINESSES, businessStorage } from './businesses/registry';
import { FreelanceHubHeader } from './businesses/common/FreelanceHubHeader';
import { IndustryStorefront } from './businesses/common/IndustryStorefront';
import { DesktopWindowFrame } from './businesses/common/DesktopWindowFrame';
import { IndustryDesktopApp } from './businesses/common/IndustryDesktopApp';
import { IndustryProductModal } from './businesses/common/IndustryProductModal';
import { IndustryCartDrawer, IndustryCartItem } from './businesses/common/IndustryCartDrawer';
import { CASUAL_STORE_INFO, UI_TRANSLATIONS } from './data/casualAlgeriaData';
import {
  Store,
  LayoutDashboard,
  ShoppingBag,
  MessageCircle,
  MapPin,
  Instagram,
  Phone,
  ShieldCheck,
  Truck,
  Sun,
  Moon,
} from 'lucide-react';

export default function App() {
  const currentBusinessId: BusinessIndustryId = 'casual_men';

  // Light Mode & Dark Mode State (default to light mode as requested, with instant toggle)
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  // Primary language: French by default (fr), with instant Arabic (ar) and English (en) support
  const [lang, setLang] = useState<LanguageCode>('fr');

  // Dual View Mode: Client E-Commerce Storefront vs Stock Management Dashboard
  const [viewMode, setViewMode] = useState<'storefront' | 'desktop_app'>('storefront');

  // Desktop App Internal Ribbon Tab
  const [desktopAppView, setDesktopAppView] = useState<'stock' | 'stats' | 'orders' | 'settings'>('stock');

  // Business Data Collections (Products & Orders)
  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [orders, setOrders] = useState<BusinessOrder[]>([]);

  // Shopping Bag State
  const [cartItems, setCartItems] = useState<IndustryCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Selected Product for Quick Inspection Modal
  const [inspectedProduct, setInspectedProduct] = useState<BusinessProduct | null>(null);

  // Refresh current business data from storage
  const loadBusinessData = () => {
    const p = businessStorage.getProducts(currentBusinessId);
    const o = businessStorage.getOrders(currentBusinessId);
    setProducts(p);
    setOrders(o);
  };

  useEffect(() => {
    loadBusinessData();
  }, []);

  const currentConfig = ALL_BUSINESSES[currentBusinessId];
  const t = UI_TRANSLATIONS[lang];
  const isRTL = lang === 'ar';
  const isDark = themeMode === 'dark';

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Cart operations
  const handleAddToCart = (product: BusinessProduct, quantity = 1, selectedSize?: string) => {
    const sizeToUse = selectedSize || product.sizes[0] || 'M';
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id && i.selectedSize === sizeToUse);
      if (idx > -1) {
        const next = [...prev];
        next[idx].quantity = Math.min(product.stock, next[idx].quantity + quantity);
        return next;
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity), selectedSize: sizeToUse }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: Math.min(item.product.stock, nextQty) } : null;
          }
          return item;
        })
        .filter(Boolean) as IndustryCartItem[];
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOrderPlaced = (order: BusinessOrder) => {
    loadBusinessData();
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div
      className={`min-h-screen w-full max-w-full overflow-x-hidden flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-[#090a0c] text-zinc-100 selection:bg-amber-400 selection:text-black' : 'bg-[#fafafa] text-zinc-900 selection:bg-amber-300 selection:text-black'
      } ${isRTL ? 'font-arabic text-right' : 'font-sans text-left'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Top Header Bar */}
      <FreelanceHubHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        lang={lang}
        onSelectLang={setLang}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
      />

      {/* Main Experience Canvas */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 w-full max-w-full overflow-x-hidden">
        {/* VIEW 1: CLIENT E-COMMERCE WEBSITE */}
        {viewMode === 'storefront' && (
          <IndustryStorefront
            config={currentConfig}
            products={products}
            onAddToCart={handleAddToCart}
            onOpenProductDetail={(prod) => setInspectedProduct(prod)}
            lang={lang}
            themeMode={themeMode}
          />
        )}

        {/* VIEW 2: STORE OWNER INVENTORY & STOCK MANAGEMENT */}
        {viewMode === 'desktop_app' && (
          <DesktopWindowFrame
            config={currentConfig}
            activeView={desktopAppView}
            setActiveView={setDesktopAppView}
            onRefreshData={loadBusinessData}
            themeMode={themeMode}
          >
            <IndustryDesktopApp
              config={currentConfig}
              products={products}
              orders={orders}
              onRefreshData={loadBusinessData}
              activeView={desktopAppView}
              setActiveView={setDesktopAppView}
              lang={lang}
              themeMode={themeMode}
            />
          </DesktopWindowFrame>
        )}
      </main>

      {/* Product Detail Modal */}
      <IndustryProductModal
        product={inspectedProduct}
        config={currentConfig}
        onClose={() => setInspectedProduct(null)}
        onAddToCart={handleAddToCart}
        lang={lang}
        themeMode={themeMode}
      />

      {/* Shopping Cart Drawer with Algerian 58-Wilayas Checkout */}
      <IndustryCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        config={currentConfig}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onOrderPlaced={handleOrderPlaced}
        lang={lang}
        themeMode={themeMode}
      />

      {/* Mobile-First Sticky Bottom Action Bar for Smartphone Shoppers */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t px-4 py-2 flex items-center justify-around text-xs shadow-2xl transition-colors ${
        isDark ? 'bg-[#0e1014]/95 border-zinc-800' : 'bg-white/95 border-zinc-200'
      }`}>
        <button
          onClick={() => setViewMode('storefront')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            viewMode === 'storefront'
              ? 'text-amber-500 font-bold'
              : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'
          }`}
        >
          <Store className="w-4 h-4" />
          <span className="text-[10px]">{t.navStore}</span>
        </button>

        <a
          href={CASUAL_STORE_INFO.whatsappDirect}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 text-emerald-600 font-semibold cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-[10px]">WhatsApp</span>
        </a>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 text-amber-500 font-bold cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Panier ({totalCartCount})</span>
        </button>

        <button
          onClick={() => setViewMode('desktop_app')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            viewMode === 'desktop_app'
              ? 'text-amber-500 font-bold'
              : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px]">{t.navDashboard}</span>
        </button>

        <button
          onClick={toggleTheme}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            isDark ? 'text-amber-400' : 'text-amber-600'
          }`}
          title={isDark ? t.themeLight : t.themeDark}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span className="text-[10px]">{isDark ? 'Clair' : 'Sombre'}</span>
        </button>
      </div>

      {/* Clean Boutique Footer */}
      <footer className={`border-t py-12 text-xs transition-colors mt-auto pb-24 md:pb-12 w-full max-w-full overflow-hidden ${
        isDark ? 'border-zinc-800/80 bg-[#07080a] text-zinc-400' : 'border-zinc-200 bg-white text-zinc-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Store Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full border flex flex-col items-center justify-center ${
                  isDark ? 'bg-zinc-900 border-amber-400/40' : 'bg-black border-amber-500/60 shadow-sm'
                }`}>
                  <span className="text-[9px] font-serif font-bold text-amber-400">C</span>
                  <span className="text-[9px] font-serif text-white">casual</span>
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>{CASUAL_STORE_INFO.name}</h3>
                  <p className="text-[11px] text-zinc-500 italic">"{CASUAL_STORE_INFO.tagline}"</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed">
                Magasin de prêt-à-porter masculin à Mascara. Vêtements Old Money, vestes en cuir, pantalons sartoriaux, jeans tendance et sneakers de marque.
              </p>
            </div>

            {/* Column 2: Algerian Delivery & Payment */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-500">
                Livraison & Paiement Algérie
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>58 Wilayas d'Algérie (Yalidine Express / ZR)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Paiement Cash à la Livraison (COD)</span>
                </li>
                <li>• Livraison rapide à domicile</li>
                <li>• Retrait disponible au bureau Stop Desk</li>
              </ul>
            </div>

            {/* Column 3: Contact Magasin Mascara */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-500">
                Boutique & Coordonnées
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{CASUAL_STORE_INFO.location}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <a href={`tel:${CASUAL_STORE_INFO.phone}`} className="hover:underline">
                    {CASUAL_STORE_INFO.phoneFormatted}
                  </a>
                </li>
                <li className="flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                  <a
                    href={CASUAL_STORE_INFO.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    @{CASUAL_STORE_INFO.instagramHandle}
                  </a>
                </li>
                <li className="flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <a
                    href={CASUAL_STORE_INFO.whatsappDirect}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    WhatsApp : 0542364246
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] ${
            isDark ? 'border-zinc-800/80 text-zinc-500' : 'border-zinc-200 text-zinc-500'
          }`}>
            <div>
              © 2026 CASUAL Men's Wear (Mascara, Algérie). Tous droits réservés.
            </div>
            <div className="flex items-center gap-3">
              <a href={CASUAL_STORE_INFO.mapsUrl} target="_blank" rel="noreferrer" className="hover:text-amber-500">
                Google Maps
              </a>
              <span>•</span>
              <a href={CASUAL_STORE_INFO.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-pink-500">
                Instagram @cas_ual_29
              </a>
              <span>•</span>
              <a href={CASUAL_STORE_INFO.whatsappDirect} target="_blank" rel="noreferrer" className="hover:text-emerald-500">
                WhatsApp 0542364246
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
