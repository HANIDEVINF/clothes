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
import { ClientHandoffDeploymentModal } from './components/ClientHandoffDeploymentModal';
import { CASUAL_STORE_INFO, UI_TRANSLATIONS } from './data/casualAlgeriaData';
import {
  Store,
  LayoutDashboard,
  ShoppingBag,
  MessageCircle,
  Rocket,
  MapPin,
  Instagram,
  Phone,
  ShieldCheck,
  Truck,
} from 'lucide-react';

export default function App() {
  // Personalized solely for Algerian Men's Wear Boutique: CASUAL 29 Mascara
  const currentBusinessId: BusinessIndustryId = 'casual_men';

  // Primary language: French by default (fr), with instant Arabic (ar) and English (en) support
  const [lang, setLang] = useState<LanguageCode>('fr');

  // Dual View Mode: Client E-Commerce Storefront vs Store Owner/Manager Dashboard
  const [viewMode, setViewMode] = useState<'storefront' | 'desktop_app'>('storefront');

  // Desktop App Internal Ribbon Tab
  const [desktopAppView, setDesktopAppView] = useState<'stock' | 'stats' | 'orders' | 'settings'>('stock');

  // Client Handoff & Deployment (Vercel + Supabase) Modal State
  const [isHandoffModalOpen, setIsHandoffModalOpen] = useState(false);

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
      className={`min-h-screen flex flex-col selection:bg-amber-400 selection:text-black transition-colors duration-300 ${
        isRTL ? 'font-arabic text-right' : 'font-sans text-left'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        backgroundColor: currentConfig.theme.bgDark,
        color: currentConfig.theme.textBody,
      }}
    >
      {/* Top Header Bar */}
      <FreelanceHubHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenHandoffModal={() => setIsHandoffModalOpen(true)}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        lang={lang}
        onSelectLang={setLang}
      />

      {/* Main Experience Canvas */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* VIEW 1: CLIENT E-COMMERCE WEBSITE */}
        {viewMode === 'storefront' && (
          <IndustryStorefront
            config={currentConfig}
            products={products}
            onAddToCart={handleAddToCart}
            onOpenProductDetail={(prod) => setInspectedProduct(prod)}
            lang={lang}
          />
        )}

        {/* VIEW 2: OWNER DESKTOP APP / LOGICIEL GÉRANT */}
        {viewMode === 'desktop_app' && (
          <DesktopWindowFrame
            config={currentConfig}
            activeView={desktopAppView}
            setActiveView={setDesktopAppView}
            onRefreshData={loadBusinessData}
          >
            <IndustryDesktopApp
              config={currentConfig}
              products={products}
              orders={orders}
              onRefreshData={loadBusinessData}
              activeView={desktopAppView}
              setActiveView={setDesktopAppView}
              lang={lang}
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
      />

      {/* Client Handoff & Supabase + Vercel Deployment Guide Modal */}
      <ClientHandoffDeploymentModal
        isOpen={isHandoffModalOpen}
        onClose={() => setIsHandoffModalOpen(false)}
        lang={lang}
      />

      {/* Mobile-First Sticky Bottom Action Bar for Smartphone Shoppers */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0e1014]/95 backdrop-blur-xl border-t border-zinc-800 px-4 py-2 flex items-center justify-around text-xs shadow-2xl">
        <button
          onClick={() => setViewMode('storefront')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            viewMode === 'storefront' ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          <span className="text-[10px]">{t.navStore}</span>
        </button>

        <a
          href={CASUAL_STORE_INFO.whatsappDirect}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 text-emerald-400 font-semibold cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-[10px]">WhatsApp</span>
        </a>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 text-amber-300 font-bold cursor-pointer"
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
            viewMode === 'desktop_app' ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px]">Gérant Farouk</span>
        </button>

        <button
          onClick={() => setIsHandoffModalOpen(true)}
          className="flex flex-col items-center gap-1 text-zinc-400 hover:text-amber-300 cursor-pointer"
        >
          <Rocket className="w-4 h-4" />
          <span className="text-[10px]">Déployer</span>
        </button>
      </div>

      {/* Boutique Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#07080a] py-12 text-xs text-zinc-400 mt-auto pb-20 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Store Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-amber-400/40 flex flex-col items-center justify-center">
                  <span className="text-[9px] font-serif font-bold text-amber-400">C</span>
                  <span className="text-[9px] font-serif text-white">casual</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{CASUAL_STORE_INFO.name}</h3>
                  <p className="text-[11px] text-zinc-400 italic">"{CASUAL_STORE_INFO.tagline}"</p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Magasin de prêt-à-porter masculin à Mascara. Vêtements Old Money, vestes en cuir, pantalons sartoriaux, jeans tendance et sneakers de marque.
              </p>
            </div>

            {/* Column 2: Algerian Delivery & Payment */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                Livraison & Paiement Algérie
              </h4>
              <ul className="space-y-1.5 text-xs text-zinc-400">
                <li className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>58 Wilayas d'Algérie (Yalidine / ZR)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Paiement Cash à la Livraison (COD)</span>
                </li>
                <li>• Livraison rapide à domicile</li>
                <li>• Retrait disponible au bureau Stop Desk</li>
              </ul>
            </div>

            {/* Column 3: Contact Magasin Mascara */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                Boutique & Coordonnées
              </h4>
              <ul className="space-y-1.5 text-xs text-zinc-400">
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{CASUAL_STORE_INFO.location}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <a href={`tel:${CASUAL_STORE_INFO.phone}`} className="hover:text-white">
                    {CASUAL_STORE_INFO.phoneFormatted}
                  </a>
                </li>
                <li className="flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <a
                    href={CASUAL_STORE_INFO.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-pink-400 transition-colors"
                  >
                    @{CASUAL_STORE_INFO.instagramHandle}
                  </a>
                </li>
                <li>Gérant : {CASUAL_STORE_INFO.ownerHandle}</li>
              </ul>
            </div>

            {/* Column 4: Freelance Agency & Deployment */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                Déploiement Vercel & Supabase
              </h4>
              <p className="text-xs text-zinc-400">
                Prototype développé pour présenter la solution e-commerce complète à Farouk (@farouk_habibo).
              </p>
              <button
                onClick={() => setIsHandoffModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Ouvrir Guide Déploiement</span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
            <div>
              © 2026 CASUAL Men's Wear (Mascara, Algérie). Tous droits réservés.
            </div>
            <div className="flex items-center gap-3">
              <a href={CASUAL_STORE_INFO.mapsUrl} target="_blank" rel="noreferrer" className="hover:text-amber-400">
                Google Maps
              </a>
              <span>•</span>
              <a href={CASUAL_STORE_INFO.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-pink-400">
                Instagram @cas_ual_29
              </a>
              <span>•</span>
              <a href={CASUAL_STORE_INFO.whatsappDirect} target="_blank" rel="noreferrer" className="hover:text-emerald-400">
                WhatsApp 0542364246
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
