import React from 'react';
import { Minus, Square, X } from 'lucide-react';
import { motion } from 'motion/react';
import { BusinessIndustryConfig } from '../types';

interface DesktopWindowFrameProps {
  config: BusinessIndustryConfig;
  children: React.ReactNode;
  activeView: 'stock' | 'stats' | 'orders' | 'settings';
  setActiveView: (view: 'stock' | 'stats' | 'orders' | 'settings') => void;
  onRefreshData?: () => void;
  themeMode?: 'light' | 'dark';
}

export const DesktopWindowFrame: React.FC<DesktopWindowFrameProps> = ({
  config,
  children,
  activeView,
  setActiveView,
  themeMode = 'dark',
}) => {
  const isDark = themeMode === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      id="desktop-logiciel-window"
      className={`max-w-7xl mx-auto my-4 rounded-2xl overflow-hidden border shadow-xl transition-all duration-300 relative w-full max-w-full ${
        isDark
          ? 'border-zinc-800 bg-[#090a0c] text-white shadow-black/60'
          : 'border-zinc-200 bg-white text-zinc-900 shadow-zinc-300/60'
      }`}
    >
      {/* Desktop App OS Titlebar */}
      <div
        className={`flex items-center justify-between px-4 py-3 select-none border-b ${
          isDark ? 'bg-[#121418] border-zinc-800' : 'bg-zinc-100 border-zinc-200'
        }`}
      >
        {/* Left: Window Traffic Lights */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] cursor-pointer" />
          <span className="text-[10px] font-mono text-zinc-400 ml-2 hidden sm:inline">
            CASUAL 29 OS
          </span>
        </div>

        {/* Center: App Window Title */}
        <div className="flex items-center gap-2 text-center">
          <span className={`text-xs font-bold font-mono tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            CASUAL 29 • Gestion de Stock & Ventes
          </span>
          <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Mascara 29</span>
          </span>
        </div>

        {/* Right: Mode Badge */}
        <div className="flex items-center gap-3">
          <div className={`px-2.5 py-0.5 rounded-md border text-[10px] font-mono shadow-sm ${
            isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-white border-zinc-300 text-zinc-700'
          }`}>
            Administration Magasin
          </div>
        </div>
      </div>

      {/* Main Frame Children */}
      <div className={`p-4 sm:p-6 ${isDark ? 'bg-[#090a0c]' : 'bg-[#fafafa]'}`}>
        {children}
      </div>
    </motion.div>
  );
};
