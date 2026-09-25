import React, { useState } from 'react';
import {
  ShoppingBag,
  Store,
  LayoutDashboard,
  MessageCircle,
  Instagram,
  MapPin,
  Rocket,
  Globe,
  ChevronDown,
  Menu,
  X,
  Phone,
} from 'lucide-react';
import { CASUAL_STORE_INFO, UI_TRANSLATIONS } from '../../data/casualAlgeriaData';
import { LanguageCode } from '../types';

interface FreelanceHubHeaderProps {
  viewMode: 'storefront' | 'desktop_app';
  setViewMode: (mode: 'storefront' | 'desktop_app') => void;
  onOpenHandoffModal: () => void;
  cartCount: number;
  onOpenCart: () => void;
  lang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
}

export const FreelanceHubHeader: React.FC<FreelanceHubHeaderProps> = ({
  viewMode,
  setViewMode,
  onOpenHandoffModal,
  cartCount,
  onOpenCart,
  lang,
  onSelectLang,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = UI_TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-40 bg-[#0a0b0e]/95 backdrop-blur-xl border-b border-zinc-800 text-xs shadow-2xl">
      {/* Top Algerian Delivery Announcement Strip */}
      <div className="bg-gradient-to-r from-amber-600/20 via-zinc-900 to-amber-600/20 border-b border-amber-500/20 px-3 sm:px-6 py-1.5 flex items-center justify-between text-[11px] text-zinc-300">
        <div className="flex items-center gap-2 mx-auto sm:mx-0 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-amber-200">{t.deliveryBanner}</span>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-zinc-400 text-[11px]">
          <a
            href={CASUAL_STORE_INFO.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-amber-400 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.mascaraLocation}</span>
          </a>
          <span>•</span>
          <a
            href={CASUAL_STORE_INFO.whatsappDirect}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-emerald-400 transition-colors text-emerald-300 font-semibold"
          >
            <Phone className="w-3 h-3 text-emerald-400" />
            <span>{CASUAL_STORE_INFO.phone}</span>
          </a>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        {/* Brand & Boutique Identity */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setViewMode('storefront')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Logo Badge matching the round badge in the Instagram profile */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 border border-amber-400/40 flex flex-col items-center justify-center shadow-lg group-hover:border-amber-400 transition-colors">
              <span className="text-[9px] font-serif tracking-tighter text-amber-300 font-bold leading-none">C</span>
              <span className="text-[10px] font-serif font-bold tracking-widest text-white leading-none">casual</span>
              <span className="text-[5px] text-zinc-400 tracking-tighter uppercase font-sans">MASCARA</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-white tracking-tight font-display">
                  {CASUAL_STORE_INFO.name}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-amber-300 border border-amber-400/20">
                  29
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block italic">
                "{CASUAL_STORE_INFO.tagline}"
              </p>
            </div>
          </div>
        </div>

        {/* Center: Switcher Mode (Boutique Client vs Logiciel Gérant Farouk) */}
        <div className="hidden md:flex items-center p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setViewMode('storefront')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all text-xs cursor-pointer ${
              viewMode === 'storefront'
                ? 'bg-amber-400 text-black font-bold shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>{t.navStore}</span>
          </button>

          <button
            onClick={() => setViewMode('desktop_app')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all text-xs cursor-pointer ${
              viewMode === 'desktop_app'
                ? 'bg-zinc-800 text-amber-300 font-bold border border-amber-400/30 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{t.navDashboard}</span>
          </button>
        </div>

        {/* Right Tools: Language Switcher, WhatsApp Direct, Handoff Guide, Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher (FR / AR / EN) */}
          <div className="flex items-center p-0.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px]">
            <button
              onClick={() => onSelectLang('fr')}
              className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                lang === 'fr' ? 'bg-amber-400 text-black' : 'text-zinc-400 hover:text-white'
              }`}
              title="Français (Langue principale)"
            >
              FR
            </button>
            <button
              onClick={() => onSelectLang('ar')}
              className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer font-arabic ${
                lang === 'ar' ? 'bg-amber-400 text-black' : 'text-zinc-400 hover:text-white'
              }`}
              title="العربية (الجزائر)"
            >
              عربي
            </button>
            <button
              onClick={() => onSelectLang('en')}
              className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                lang === 'en' ? 'bg-amber-400 text-black' : 'text-zinc-400 hover:text-white'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Direct WhatsApp Contact Button */}
          <a
            href={CASUAL_STORE_INFO.whatsappDirect}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all text-xs font-semibold"
            title="Contacter le magasin sur WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp</span>
          </a>

          {/* Instagram Link */}
          <a
            href={CASUAL_STORE_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 p-2 rounded-xl bg-zinc-900 text-zinc-300 border border-zinc-800 hover:text-pink-400 hover:border-pink-500/30 transition-all text-xs"
            title="Compte Instagram officiel @cas_ual_29"
          >
            <Instagram className="w-3.5 h-3.5" />
          </a>

          {/* Guide Déploiement Vercel & Supabase */}
          <button
            onClick={onOpenHandoffModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all text-xs font-semibold cursor-pointer"
            title="Guide Déploiement Vercel & Supabase pour livrer le client"
          >
            <Rocket className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">{t.navHandoff}</span>
            <span className="lg:hidden">Vercel & DB</span>
          </button>

          {/* Shopping Bag Button with Counter */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs shadow-lg hover:from-amber-300 hover:to-amber-400 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Panier</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-black text-amber-300 text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-[#0d0e12] p-4 space-y-3 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setViewMode('storefront');
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'storefront' ? 'bg-amber-400 text-black' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>{t.navStore}</span>
            </button>

            <button
              onClick={() => {
                setViewMode('desktop_app');
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'desktop_app' ? 'bg-zinc-800 text-amber-300 border border-amber-400/40' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t.navDashboard}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-around text-xs">
            <a
              href={CASUAL_STORE_INFO.whatsappDirect}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 font-semibold"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Direct</span>
            </a>

            <a
              href={CASUAL_STORE_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-pink-400 font-semibold"
            >
              <Instagram className="w-4 h-4" />
              <span>@cas_ual_29</span>
            </a>

            <a
              href={CASUAL_STORE_INFO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-amber-400 font-semibold"
            >
              <MapPin className="w-4 h-4" />
              <span>Mascara</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
