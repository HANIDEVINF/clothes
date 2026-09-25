import React from 'react';
import { Minus, Square, X, Database, Terminal, Shield, Sparkles, Folder } from 'lucide-react';
import { motion } from 'motion/react';
import { BusinessIndustryConfig } from '../types';

interface DesktopWindowFrameProps {
  config: BusinessIndustryConfig;
  children: React.ReactNode;
  activeView: 'stock' | 'stats' | 'orders' | 'settings';
  setActiveView: (view: 'stock' | 'stats' | 'orders' | 'settings') => void;
  onRefreshData?: () => void;
}

export const DesktopWindowFrame: React.FC<DesktopWindowFrameProps> = ({
  config,
  children,
  activeView,
  setActiveView,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      id="desktop-logiciel-window"
      className="max-w-7xl mx-auto my-4 rounded-2xl overflow-hidden border shadow-2xl transition-all duration-300 relative"
      style={{
        borderColor: config.theme.borderColor,
        backgroundColor: config.theme.bgDark,
        boxShadow: `0 25px 60px -15px rgba(0,0,0,0.85), ${config.theme.glowEffect}`,
      }}
    >
      {/* Desktop App OS Titlebar */}
      <div
        className="flex items-center justify-between px-4 py-3 select-none border-b"
        style={{
          backgroundColor: config.theme.surfaceCard,
          borderColor: config.theme.borderColor,
        }}
      >
        {/* Left: Window Traffic Lights */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] cursor-pointer flex items-center justify-center group">
            <X className="w-2 h-2 text-black opacity-0 group-hover:opacity-100" />
          </div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] cursor-pointer flex items-center justify-center group">
            <Minus className="w-2 h-2 text-black opacity-0 group-hover:opacity-100" />
          </div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] cursor-pointer flex items-center justify-center group">
            <Square className="w-1.5 h-1.5 text-black opacity-0 group-hover:opacity-100" />
          </div>
          <span className="text-[10px] font-mono text-zinc-400 ml-2 hidden sm:inline">
            PID 4082 • Desktop Native App
          </span>
        </div>

        {/* Center: App Window Title & Connection */}
        <div className="flex items-center gap-2 text-center">
          <span className="text-xs font-bold font-mono tracking-tight" style={{ color: config.theme.textHeading }}>
            {config.desktopAppTitle}
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>localhost:27017</span>
          </span>
        </div>

        {/* Right: Environment & Folder Marker */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-amber-300 hidden lg:inline font-semibold">
            📁 C:\Users\HANI\Desktop\freelance\{config.folderName}\{config.folderName}desktopapp
          </span>
          <div className="px-2.5 py-0.5 rounded-md bg-zinc-800/90 border border-zinc-700/80 text-[10px] font-mono text-zinc-200 shadow-sm">
            Owner Desktop OS
          </div>
        </div>
      </div>

      {/* Desktop App Navigation Ribbon */}
      <div
        className="flex items-center justify-between px-6 py-2.5 border-b text-xs overflow-x-auto"
        style={{
          backgroundColor: config.theme.surfaceMuted,
          borderColor: config.theme.borderColor,
        }}
      >
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveView('stock')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'stock'
                ? 'bg-zinc-800 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
            style={
              activeView === 'stock'
                ? {
                    borderLeft: `3px solid ${config.theme.primary}`,
                    color: '#ffffff',
                  }
                : {}
            }
          >
            <span>📦 Stock Manipulator</span>
          </button>

          <button
            onClick={() => setActiveView('stats')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'stats'
                ? 'bg-zinc-800 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
            style={
              activeView === 'stats'
                ? {
                    borderLeft: `3px solid ${config.theme.primary}`,
                    color: '#ffffff',
                  }
                : {}
            }
          >
            <span>💰 Money &amp; Analytics</span>
          </button>

          <button
            onClick={() => setActiveView('orders')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'orders'
                ? 'bg-zinc-800 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
            style={
              activeView === 'orders'
                ? {
                    borderLeft: `3px solid ${config.theme.primary}`,
                    color: '#ffffff',
                  }
                : {}
            }
          >
            <span>🚚 Order Dispatch</span>
          </button>
        </div>

        {/* Database stats badge */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
          <Database className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">MongoDB Sync:</span>
          <span className="text-emerald-400 font-bold">100% Synced</span>
        </div>
      </div>

      {/* Main App Workspace Canvas */}
      <div className="p-4 sm:p-6 min-h-[600px]">{children}</div>

      {/* Desktop App Status Bar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-t text-[11px] font-mono select-none"
        style={{
          backgroundColor: config.theme.surfaceCard,
          borderColor: config.theme.borderColor,
          color: '#94a3b8',
        }}
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Logiciel Status: ONLINE</span>
          </span>
          <span className="hidden sm:inline">RAM: 124MB</span>
          <span className="hidden md:inline text-zinc-300">
            Path: C:\Users\HANI\Desktop\freelance\{config.folderName}\{config.folderName}desktopapp
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>AURA Engine v2.4</span>
        </div>
      </div>
    </motion.div>
  );
};
