import React, { useState } from 'react';
import { X, Star, ShieldCheck, Truck, RotateCcw, Check, ShoppingBag, Eye, Layers } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, size?: string, color?: string) => void;
  currencySymbol: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  currencySymbol,
}) => {
  if (!product) return null;

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : ''
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0].name : ''
  );
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedSize || undefined, selectedColor || undefined);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const isLowStock = product.stock > 0 && product.stock <= 8;
  const isOutOfStock = product.stock === 0;

  return (
    <div
      id="product-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="product-detail-modal-container"
        className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-product-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Column */}
          <div className="p-6 bg-zinc-950/60 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800/80">
            {/* Main large image */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
              <img
                src={product.images[selectedImageIdx] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {isLowStock && (
                <span className="absolute top-3 left-3 bg-amber-500/90 text-zinc-950 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider backdrop-blur-sm">
                  Only {product.stock} Units Remaining
                </span>
              )}
            </div>

            {/* Thumbnail carousel */}
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImageIdx === idx
                        ? 'border-amber-400 opacity-100'
                        : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Micro specs pill */}
            <div className="mt-4 pt-4 border-t border-zinc-800/60 grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
              <div>
                <span className="text-zinc-400">SKU Ref:</span>
                <p className="font-mono text-zinc-200">{product.sku}</p>
              </div>
              <div>
                <span className="text-zinc-400">Provenance:</span>
                <p className="text-zinc-200">{product.specs?.origin || 'Atelier Certified'}</p>
              </div>
            </div>
          </div>

          {/* Details & Action Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 max-h-[85vh] overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-white">{product.rating}</span>
                  <span>({product.reviewsCount} verified reviews)</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold font-display text-white tracking-tight">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-3xl font-extrabold text-white">
                  {currencySymbol}{product.price.toFixed(2)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-base text-zinc-400 line-through">
                    {currencySymbol}{product.compareAtPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-xs text-emerald-400 font-medium">In Stock &amp; Insured</span>
              </div>

              {/* Description */}
              <p className="text-sm text-zinc-300 mt-4 leading-relaxed">
                {product.description}
              </p>

              {/* Color picker */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Shade / Finish: <span className="text-white normal-case">{selectedColor}</span>
                  </label>
                  <div className="flex items-center gap-2.5">
                    {product.colors.map((c, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(c.name)}
                        className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${
                          selectedColor === c.name
                            ? 'border-amber-400 bg-amber-500/10 text-white font-semibold'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-zinc-600" style={{ backgroundColor: c.hex }} />
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Select Size: <span className="text-white">{selectedSize}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(s)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          selectedSize === s
                            ? 'bg-zinc-100 text-zinc-950 border-white shadow-md'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Specifications (Eyewear / Apparel / Leather details) */}
              <div className="mt-6 p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-semibold text-zinc-200 mb-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Atelier Blueprint &amp; Technical Specs</span>
                </div>
                {product.specs.frameMaterial && (
                  <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                    <span className="text-zinc-400">Frame Material</span>
                    <span className="text-zinc-200">{product.specs.frameMaterial}</span>
                  </div>
                )}
                {product.specs.lensType && (
                  <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                    <span className="text-zinc-400">Lens Optics</span>
                    <span className="text-zinc-200">{product.specs.lensType}</span>
                  </div>
                )}
                {product.specs.dimensions && (
                  <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                    <span className="text-zinc-400">Dimensions</span>
                    <span className="text-zinc-200">{product.specs.dimensions}</span>
                  </div>
                )}
                {product.specs.material && (
                  <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                    <span className="text-zinc-400">Composition</span>
                    <span className="text-zinc-200">{product.specs.material}</span>
                  </div>
                )}
                {product.specs.weight && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Weight</span>
                    <span className="text-zinc-200">{product.specs.weight}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity & Add to Cart CTA */}
            <div className="pt-4 border-t border-zinc-800/80 space-y-3">
              <div className="flex items-center gap-4">
                {/* Quantity adjuster */}
                <div className="flex items-center rounded-xl bg-zinc-950 border border-zinc-800 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-white disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-white disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                {/* Add button */}
                <button
                  id="modal-add-to-bag-btn"
                  onClick={handleAdd}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm transition-all ${
                    addedNotice
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-lg shadow-amber-400/10'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {addedNotice ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Bag
                    </>
                  ) : isOutOfStock ? (
                    'Sold Out'
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Add to Shopping Bag • {currencySymbol}{(product.price * quantity).toFixed(2)}
                    </>
                  )}
                </button>
              </div>

              {/* Guarantees */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Authenticity Guaranteed
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-400" /> Insured Delivery
                </span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-sky-400" /> 30-Day Returns
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
