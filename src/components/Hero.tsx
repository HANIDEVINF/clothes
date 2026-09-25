import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { ProductCategory } from '../types';

interface HeroProps {
  onSelectCategory: (cat: ProductCategory | 'all') => void;
  selectedCategory: ProductCategory | 'all';
}

export const Hero: React.FC<HeroProps> = ({ onSelectCategory, selectedCategory }) => {
  return (
    <section id="store-hero-section" className="relative border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-[#0e1013] to-[#0c0d0f] py-12 md:py-16 overflow-hidden">
      {/* Subtle architectural ambient lights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-80 h-80 bg-zinc-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Main Headline & Curation */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-medium text-amber-300">Autumn / Winter Atelier Capsule</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">Exclusive Run</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display leading-[1.08]">
              Sculptural Eyewear <br />
              <span className="font-serif-luxury italic font-normal text-amber-200/90">&amp;</span> Pure Tailoring.
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
              Curated precision optics in Japanese beta-titanium and Italian Mazzucchelli bio-acetate, paired with virgin Mongolian cashmere and Okayama selvedge denim.
            </p>

            {/* Category Quick Pills */}
            <div className="pt-2">
              <span className="block text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                Explore Departments
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All Catalog' },
                  { id: 'glasses', label: 'Eyewear & Glasses' },
                  { id: 'clothes', label: 'Atelier Clothes' },
                  { id: 'accessories', label: 'Leather & Accessories' },
                  { id: 'footwear', label: 'Footwear & Loafers' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    id={`filter-pill-${cat.id}`}
                    onClick={() => onSelectCategory(cat.id as any)}
                    className={`text-xs font-semibold px-4 py-2 rounded-full transition-all border ${
                      selectedCategory === cat.id
                        ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Editorial Visual Feature Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800/90 bg-zinc-900/60 p-3 shadow-2xl group">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=85"
                  alt="AURA Titanium Aviators"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                    Design Masterpiece
                  </span>
                  <h3 className="text-white font-display text-lg font-bold mt-1">
                    Arc Eclipse Titanium Aviators
                  </h3>
                  <div className="flex items-center justify-between mt-1 text-xs text-zinc-300">
                    <span>Hand-assembled in Sabae, Japan</span>
                    <span className="font-bold text-amber-400 text-sm">$340.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Value Prop Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-10 mt-10 border-t border-zinc-900 text-xs text-zinc-400">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-zinc-200">256-Bit Encrypted Gateway</p>
              <p className="text-[11px] text-zinc-400">Card tokenization &amp; instant fraud shields</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
            <Truck className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-zinc-200">Express Insured Transit</p>
              <p className="text-[11px] text-zinc-400">Complimentary courier on orders over $300</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
            <RefreshCw className="w-5 h-5 text-sky-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-zinc-200">30-Day Atelier Guarantee</p>
              <p className="text-[11px] text-zinc-400">Free exchanges &amp; verifiable provenance</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
