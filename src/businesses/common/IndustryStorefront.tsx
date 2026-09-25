import React, { useState } from 'react';
import {
  Search,
  Filter,
  Star,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Eye,
  MessageCircle,
  Truck,
  CheckCircle,
  MapPin,
  Instagram,
  Flame,
  Zap,
  Phone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BusinessIndustryConfig, BusinessProduct, LanguageCode } from '../types';
import { CASUAL_STORE_INFO, UI_TRANSLATIONS, CASUAL_CATEGORIES_FR, CASUAL_CATEGORIES_AR } from '../../data/casualAlgeriaData';

interface IndustryStorefrontProps {
  config: BusinessIndustryConfig;
  products: BusinessProduct[];
  onAddToCart: (product: BusinessProduct, quantity?: number, selectedSize?: string) => void;
  onOpenProductDetail: (product: BusinessProduct) => void;
  lang: LanguageCode;
}

export const IndustryStorefront: React.FC<IndustryStorefrontProps> = ({
  config,
  products,
  onAddToCart,
  onOpenProductDetail,
  lang,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating'>('featured');
  const [activeSizeFilter, setActiveSizeFilter] = useState<string>('all');

  const t = UI_TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  const categories = lang === 'ar' ? CASUAL_CATEGORIES_AR : CASUAL_CATEGORIES_FR;

  // Filter products
  const filteredProducts = products.filter((p) => {
    let matchesCategory = true;
    if (selectedCategory !== 'All' && !selectedCategory.toLowerCase().includes('all') && !selectedCategory.includes('كل')) {
      if (lang === 'ar') {
        matchesCategory = p.categoryAr === selectedCategory || p.category === selectedCategory;
      } else {
        matchesCategory = p.category.toLowerCase() === selectedCategory.toLowerCase();
      }
    }

    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nameAr && p.nameAr.includes(searchQuery)) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSize =
      activeSizeFilter === 'all' || (p.sizes && p.sizes.includes(activeSizeFilter));

    return matchesCategory && matchesSearch && matchesSize;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  // WhatsApp quick buy helper
  const handleQuickWhatsAppBuy = (p: BusinessProduct) => {
    const defaultSize = p.sizes[0] || 'Standard';
    const text = lang === 'ar'
      ? `سلام، أريد طلب هذا المنتج من متجر كاجوال معسكر:\n- المنتج: ${p.nameAr || p.name}\n- المقاس: ${defaultSize}\n- السعر: ${p.price.toLocaleString()} دج\nيرجى تأكيد التوصيل إلى ولايتي.`
      : `Salam Farouk, je souhaite commander cet article depuis la boutique CASUAL 29 Mascara :\n- Produit : ${p.name}\n- Taille : ${defaultSize}\n- Prix : ${p.price.toLocaleString()} DA\nMerci de me confirmer la livraison.`;
    
    window.open(`https://wa.me/213542364246?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className={`space-y-8 sm:space-y-12 pb-16 relative ${isRTL ? 'text-right font-arabic' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Dynamic Ambient Background Aura Glows */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 blur-3xl opacity-20 pointer-events-none -z-10 rounded-full animate-warm-pulse"
        style={{
          background: `radial-gradient(circle, ${config.theme.primary} 0%, transparent 70%)`,
        }}
      />

      {/* Hero Banner with Mascara Boutique Context & Old Money Aesthetic */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-zinc-800 p-6 sm:p-12 shadow-2xl bg-gradient-to-br from-[#12141a] via-[#0c0d11] to-[#16130d]"
        style={{
          boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8), 0 0 30px rgba(212, 175, 55, 0.08)',
        }}
      >
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          {/* Store Location & Instagram Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/25">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{CASUAL_STORE_INFO.location}</span>
            </span>

            <a
              href={CASUAL_STORE_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 hover:text-pink-400 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-400" />
              <span>@{CASUAL_STORE_INFO.instagramHandle}</span>
            </a>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>58 Wilayas (Yalidine Express)</span>
            </span>
          </div>

          {/* Hero Titles */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display leading-tight">
              {lang === 'ar' ? (
                <>
                  أناقة الرجل الكلاسيكية والعصرية <br />
                  <span className="text-amber-400 font-serif-luxury">في معسكر 29</span>
                </>
              ) : (
                <>
                  L'Élégance Masculine Moderne <br />
                  <span className="text-amber-400 font-serif-luxury">"Stay simple, stay casual"</span>
                </>
              )}
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl font-normal">
              {lang === 'ar'
                ? 'تشكيلة مختارة من ملابس أولد موني، جاكيتات الجلد الفاخرة، سراويل كلاسيك بكسرات، جينزات عالية الجودة وأحذية راقية بأسعار في المتناول مع الدفع عند الاستلام.'
                : 'La boutique de référence pour l\'homme moderne à Mascara : vestes en cuir tendance, pulls et polos Old Money, pantalons à pinces italiens, jeans selvedge et sneakers chunky. Livraison dans toute l\'Algérie avec paiement à la livraison.'}
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={CASUAL_STORE_INFO.whatsappDirect}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.orderOnWhatsApp}</span>
            </a>

            <a
              href={CASUAL_STORE_INFO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs sm:text-sm font-semibold border border-zinc-700 transition-all cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Itinéraire Google Maps</span>
            </a>
          </div>
        </div>
      </motion.section>

      {/* Featured Instagram Feed Spotlight (Directly echoing the screenshot!) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <Instagram className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Articles Vedettes du Feed Instagram</span>
              <span className="text-[10px] text-pink-400 font-mono">@cas_ual_29</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Retrouvez la veste en cuir ("POV: Ça, c'est ton futur regret"), le polo Old Money et les baskets en suédine !
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedCategory('Vestes & Cuir')}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition-colors"
          >
            Vestes Cuir
          </button>
          <button
            onClick={() => setSelectedCategory('Old Money & Polos')}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition-colors"
          >
            Old Money
          </button>
          <button
            onClick={() => setSelectedCategory('Chaussures & Sneakers')}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition-colors"
          >
            Sneakers
          </button>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="space-y-4">
        {/* Search input & Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-zinc-500 ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors ${
                isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'
              }`}
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-2.5 px-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="featured">✨ {lang === 'ar' ? 'المقترحات المميزة' : 'Articles Vedettes'}</option>
              <option value="price_low">⬇️ {lang === 'ar' ? 'السعر: من الأقل إلى الأعلى' : 'Prix : Moins cher au plus cher'}</option>
              <option value="price_high">⬆️ {lang === 'ar' ? 'السعر: من الأعلى إلى الأقل' : 'Prix : Plus cher au moins cher'}</option>
              <option value="rating">⭐ {lang === 'ar' ? 'أعلى تقييماً' : 'Mieux notés'}</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-amber-400 text-black font-bold shadow-md'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            {t.filterAll} ({products.length})
          </button>

          {categories.map((cat, idx) => {
            const isSelected = selectedCategory === cat || (lang === 'ar' && CASUAL_CATEGORIES_FR[idx] === selectedCategory);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-black font-bold shadow-md'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-zinc-400">
            {filteredProducts.length} {lang === 'ar' ? 'قطع معروضة' : 'articles disponibles en boutique'}
          </div>
          <div className="text-xs text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'أسعار مناسبة بالدينار الجزائري' : 'Prix direct magasin (DA)'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          <AnimatePresence>
            {sortedProducts.map((product) => {
              const displayName = lang === 'ar' && product.nameAr ? product.nameAr : product.name;
              const displaySubtitle = lang === 'ar' && product.subtitleAr ? product.subtitleAr : product.subtitle;
              const displayBadge = lang === 'ar' && product.badgeAr ? product.badgeAr : product.badge;

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="group relative rounded-2xl bg-[#121419] border border-zinc-800/90 overflow-hidden flex flex-col hover:border-amber-400/40 transition-all duration-300 shadow-lg hover:shadow-2xl"
                >
                  {/* Product Image Frame */}
                  <div className="relative aspect-4/5 w-full bg-zinc-950 overflow-hidden cursor-pointer" onClick={() => onOpenProductDetail(product)}>
                    <img
                      src={product.images[0]}
                      alt={displayName}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Gradient Overlay for legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121419] via-transparent to-transparent opacity-60" />

                    {/* Badge */}
                    {displayBadge && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-amber-400/30 text-[10px] font-bold text-amber-300 uppercase tracking-wider shadow-md">
                        {displayBadge}
                      </div>
                    )}

                    {/* Stock indicator badge */}
                    {product.stock <= 5 && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-red-950/80 border border-red-500/40 text-[10px] font-semibold text-red-300">
                        {product.stock} {lang === 'ar' ? 'متبقي' : 'restants'}
                      </div>
                    )}

                    {/* Quick View Floating Button on Hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenProductDetail(product);
                      }}
                      className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/80 hover:bg-amber-400 hover:text-black text-white border border-zinc-700 transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 shadow-xl cursor-pointer"
                      title={t.quickView}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card Content Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span>{lang === 'ar' && product.categoryAr ? product.categoryAr : product.category}</span>
                        <span className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{product.rating}</span>
                        </span>
                      </div>

                      <h3
                        onClick={() => onOpenProductDetail(product)}
                        className="font-bold text-white text-sm line-clamp-1 group-hover:text-amber-300 transition-colors cursor-pointer"
                      >
                        {displayName}
                      </h3>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {displaySubtitle}
                      </p>

                      {/* Sizes tags */}
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {product.sizes.slice(0, 4).map((size) => (
                          <span
                            key={size}
                            className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-mono"
                          >
                            {size}
                          </span>
                        ))}
                        {product.sizes.length > 4 && (
                          <span className="text-[10px] text-zinc-500 font-mono">
                            +{product.sizes.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pricing & Order CTA buttons */}
                    <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-extrabold text-amber-400 font-mono">
                            {product.price.toLocaleString()} DA
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-xs text-zinc-500 line-through font-mono">
                              {product.compareAtPrice.toLocaleString()} DA
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {t.inStock}
                        </span>
                      </div>

                      {/* Primary Actions: WhatsApp Direct & Add to Bag */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => handleQuickWhatsAppBuy(product)}
                          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
                          title="Commander directement sur WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          onClick={() => onAddToCart(product, 1, product.sizes[0])}
                          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all shadow-md cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'السلة' : 'Panier'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Algerian Commerce Assurance Badges */}
      <section className="rounded-3xl border border-zinc-800 bg-[#101216] p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="space-y-1.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mx-auto sm:mx-0">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">
              {lang === 'ar' ? 'توصيل لـ 58 ولاية' : 'Livraison 58 Wilayas'}
            </h4>
            <p className="text-xs text-zinc-400">
              {lang === 'ar'
                ? 'شحن سريع عبر ياليدين إكسبريس وزاد آر مع خيار الاستلام من المكتب أو للمنزل.'
                : 'Envoi sécurisé via Yalidine Express avec choix de livraison à domicile ou stop desk.'}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 mx-auto sm:mx-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">
              {lang === 'ar' ? 'الدفع عند الاستلام كاش' : 'Paiement Cash à la Réception'}
            </h4>
            <p className="text-xs text-zinc-400">
              {lang === 'ar'
                ? 'لا داعي لبطاقة بنكية، ادفع نقداً للناقل بعد فحص طردك والتأكد من المقاس.'
                : 'Vérifiez la taille et la qualité de vos vêtements avant de payer le livreur.'}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="w-10 h-10 rounded-2xl bg-pink-400/10 border border-pink-400/20 flex items-center justify-center text-pink-400 mx-auto sm:mx-0">
              <Instagram className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">
              {lang === 'ar' ? 'حساب رسمي موثوق' : 'Boutique Réelle & Instagram'}
            </h4>
            <p className="text-xs text-zinc-400">
              {lang === 'ar'
                ? 'متجر حقيقي في شارع 1 نوفمبر معسكر مع صور وفيديوهات حقيقية على @cas_ual_29.'
                : 'Magasin physique à Mascara et communauté active sur notre page @cas_ual_29.'}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-blue-400 mx-auto sm:mx-0">
              <Phone className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">
              {lang === 'ar' ? 'خدمة الزبائن والواتساب' : 'Service Client Dédié'}
            </h4>
            <p className="text-xs text-zinc-400">
              {lang === 'ar'
                ? 'فريق العمل جاهز للرد على استفساراتكم ومساعدتكم في اختيار المقاس عبر 0542364246.'
                : 'Conseils personnalisés sur les mensurations et suivi de commande au 0542364246.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
