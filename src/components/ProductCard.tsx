import React from 'react';
import { ShoppingBag, Eye, Star, AlertCircle, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  currencySymbol: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onAddToCart,
  currencySymbol,
}) => {
  const isLowStock = product.stock > 0 && product.stock <= 8;
  const isOutOfStock = product.stock === 0;

  const categoryLabels: Record<string, string> = {
    glasses: 'Eyewear & Optical',
    clothes: 'Atelier Clothing',
    accessories: 'Leather & Accessories',
    footwear: 'Footwear & Loafers',
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative flex flex-col bg-zinc-900/50 rounded-2xl border border-zinc-800/80 hover:border-zinc-700 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-black/40"
    >
      {/* Image Container with hover zoom & overlays */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-950">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-zinc-950/80 text-zinc-200 backdrop-blur-md rounded-md border border-white/10">
            {categoryLabels[product.category] || product.category}
          </span>
          {product.tags && product.tags[0] && (
            <span className="inline-block px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-amber-500/90 text-zinc-950 rounded-md">
              {product.tags[0]}
            </span>
          )}
        </div>

        {/* Stock Status indicator */}
        <div className="absolute top-3 right-3 z-10">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-rose-950/90 text-rose-300 border border-rose-800/80 rounded-md backdrop-blur-md">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-amber-950/90 text-amber-300 border border-amber-800/80 rounded-md backdrop-blur-md">
              <AlertCircle className="w-3 h-3" /> Only {product.stock} Left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 rounded-md backdrop-blur-md">
              In Stock
            </span>
          )}
        </div>

        {/* Floating Quick Action Overlay */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            id={`btn-quickview-${product.id}`}
            onClick={() => onQuickView(product)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-white text-xs font-semibold backdrop-blur-md border border-zinc-700 shadow-lg transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View &amp; Specs
          </button>
          <button
            id={`btn-add-cart-${product.id}`}
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className="flex items-center justify-center p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            title="Add to Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="flex flex-col flex-1 p-4 space-y-2">
        {/* Rating & reviews */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-zinc-200">{product.rating}</span>
            <span className="text-zinc-400">({product.reviewsCount})</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">{product.sku}</span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onQuickView(product)}
          className="font-display text-sm sm:text-base font-bold text-white line-clamp-1 hover:text-amber-300 cursor-pointer transition-colors"
        >
          {product.name}
        </h3>

        {/* Short Specs / Excerpt */}
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Color Swatches if available */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            {product.colors.map((col, idx) => (
              <span
                key={idx}
                className="w-3 h-3 rounded-full border border-zinc-700"
                style={{ backgroundColor: col.hex }}
                title={col.name}
              />
            ))}
            <span className="text-[10px] text-zinc-400 ml-1">
              {product.colors.length} shades
            </span>
          </div>
        )}

        {/* Price & CTA row */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-extrabold text-white">
              {currencySymbol}{product.price.toFixed(2)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-zinc-400 line-through">
                {currencySymbol}{product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 disabled:text-zinc-600 transition-colors"
          >
            {isOutOfStock ? 'Sold Out' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
};
