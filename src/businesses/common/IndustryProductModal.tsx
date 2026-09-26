import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  CheckCircle,
  ShieldCheck,
  Truck,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { BusinessProduct, BusinessIndustryConfig, LanguageCode } from '../types';
import { CASUAL_STORE_INFO, UI_TRANSLATIONS } from '../../data/casualAlgeriaData';

interface IndustryProductModalProps {
  product: BusinessProduct | null;
  config: BusinessIndustryConfig;
  onClose: () => void;
  onAddToCart: (product: BusinessProduct, quantity: number, selectedSize?: string) => void;
  lang: LanguageCode;
  themeMode?: 'light' | 'dark';
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85';

export const IndustryProductModal: React.FC<IndustryProductModalProps> = ({
  product,
  config,
  onClose,
  onAddToCart,
  lang,
  themeMode = 'dark',
}) => {
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes?.[0] || 'M');

  if (!product) return null;

  const t = UI_TRANSLATIONS[lang];
  const isRTL = lang === 'ar';
  const isDark = themeMode === 'dark';
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  const displayName = lang === 'ar' && product.nameAr ? product.nameAr : product.name;
  const displaySubtitle = lang === 'ar' && product.subtitleAr ? product.subtitleAr : product.subtitle;
  const displayDesc = lang === 'ar' && product.descriptionAr ? product.descriptionAr : product.description;
  const displayCategory = lang === 'ar' && product.categoryAr ? product.categoryAr : product.category;
  const displayBadge = lang === 'ar' && product.badgeAr ? product.badgeAr : product.badge;

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedSize);
    onClose();
  };

  const handleWhatsAppOrder = () => {
    const text = lang === 'ar'
      ? `سلام، أريد طلب هذا المنتج من كاجوال معسكر:\n- المنتج: ${displayName}\n- المقاس: ${selectedSize}\n- الكمية: ${quantity}\n- السعر: ${(product.price * quantity).toLocaleString()} دج\nيرجى تأكيد التوصيل.`
      : `Salam, je souhaite commander depuis la boutique CASUAL 29 Mascara :\n- Produit : ${displayName}\n- Taille : ${selectedSize}\n- Quantité : ${quantity}\n- Prix Total : ${(product.price * quantity).toLocaleString()} DA\nMerci de me confirmer la disponibilité et la livraison.`;

    window.open(`https://wa.me/213542364246?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto ${isRTL ? 'text-right font-arabic' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`relative w-full max-w-3xl rounded-3xl border shadow-2xl my-auto max-h-[92vh] overflow-y-auto transition-colors ${
        isDark ? 'bg-[#121419] border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        {/* Top Header */}
        <div className={`flex items-center justify-between p-4 sm:p-5 border-b ${
          isDark ? 'bg-[#15181f] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${
              isDark ? 'bg-amber-400/10 text-amber-300 border-amber-400/25' : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              {displayCategory}
            </span>
            <span className={`text-xs font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{product.sku}</span>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-black hover:bg-zinc-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Gallery Image Column */}
            <div className="space-y-3">
              <div className={`aspect-4/5 rounded-2xl overflow-hidden border relative shadow-inner ${
                isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
              }`}>
                <img
                  src={product.images[activeImageIdx] || product.images[0]}
                  alt={displayName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                  }}
                  className="w-full h-full object-cover"
                />
                {displayBadge && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-xl text-xs font-bold bg-amber-400 text-black shadow-md">
                    {displayBadge}
                  </span>
                )}
              </div>

              {product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImageIdx === idx ? 'border-amber-400 scale-105' : 'border-zinc-300 opacity-60'
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                        }}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details & Actions */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-amber-500">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{product.rating}</span>
                  <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>({product.reviewsCount} {t.reviews})</span>
                </div>

                <h2 className={`text-xl sm:text-2xl font-bold font-display leading-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {displayName}
                </h2>

                <p className={`text-xs font-medium ${isDark ? 'text-amber-200/80' : 'text-amber-800'}`}>
                  {displaySubtitle}
                </p>

                {/* Price In Algerian Dinar (DA) */}
                <div className="flex items-baseline gap-3 py-1">
                  <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                    {product.price.toLocaleString()} DA
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-zinc-400 line-through font-mono">
                      {product.compareAtPrice.toLocaleString()} DA
                    </span>
                  )}
                </div>

                <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  {displayDesc}
                </p>

                {/* Size Selector */}
                <div className={`space-y-2 pt-2 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{t.selectSize} :</span>
                    <span className="text-amber-500 font-bold">{selectedSize}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer ${
                          selectedSize === s
                            ? 'bg-amber-400 text-black font-bold shadow-md scale-105'
                            : isDark
                            ? 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                            : 'bg-zinc-100 text-zinc-700 border border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-3 pt-2">
                  <span className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Quantité :</span>
                  <div className={`flex items-center border rounded-xl ${
                    isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'
                  }`}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 text-zinc-400 hover:text-black"
                    >
                      -
                    </button>
                    <span className={`px-3 py-1 text-xs font-bold font-mono ${isDark ? 'text-white' : 'text-zinc-900'}`}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-1 text-zinc-400 hover:text-black"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    ({product.stock} {t.stockLeft})
                  </span>
                </div>
              </div>

              {/* Order Buttons */}
              <div className={`space-y-2 pt-3 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                {/* 1-Click WhatsApp Order */}
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t.orderOnWhatsApp}</span>
                </button>

                {/* Add To Cart */}
                <button
                  onClick={handleAdd}
                  disabled={isOutOfStock}
                  className="w-full py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-300 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t.addToCart}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Product Specs List */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className={`border-t pt-4 space-y-2 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                {lang === 'ar' ? 'المواصفات والنسيج' : 'Fiche Technique & Matière'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className={`flex justify-between p-2 rounded-xl border ${
                    isDark ? 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                  }`}>
                    <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>{key}</span>
                    <span className="font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
