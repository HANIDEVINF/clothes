import React, { useState } from 'react';
import { X, Trash2, ShieldCheck, ArrowRight, Tag, ShoppingBag, Truck } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
  currencySymbol: string;
  promoCode: string;
  setPromoCode: (code: string) => void;
  discountAmount: number;
  applyPromoCode: (code: string) => void;
  promoError: string;
  promoSuccess: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  currencySymbol,
  promoCode,
  setPromoCode,
  discountAmount,
  applyPromoCode,
  promoError,
  promoSuccess,
}) => {
  if (!isOpen) return null;

  const [inputCode, setInputCode] = useState(promoCode);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 300;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 25;
  const taxRate = 0.08;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = taxableSubtotal * taxRate;
  const total = taxableSubtotal + shippingFee + tax;

  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        id="cart-drawer-panel"
        className="fixed inset-y-0 right-0 max-w-full flex pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col justify-between text-left">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white font-display">Your Shopping Bag</h2>
              <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full font-mono">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <button
              id="close-cart-drawer-btn"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free shipping progress bar */}
          <div className="bg-zinc-950 px-6 py-3 border-b border-zinc-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                {amountNeeded === 0 ? (
                  <span className="text-emerald-400 font-semibold">Complimentary Express Shipping Unlocked</span>
                ) : (
                  <span>
                    Add <strong className="text-white">{currencySymbol}{amountNeeded.toFixed(2)}</strong> for Free Express Courier
                  </span>
                )}
              </span>
              <span className="font-mono text-[11px] text-zinc-400">{progressToFreeShipping}%</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white">Your bag is empty</h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Explore our curated eyewear, tailored clothing, and leather goods catalog.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={`${item.product.id}-${idx}`}
                  className="flex gap-4 p-3.5 bg-zinc-950/60 rounded-2xl border border-zinc-800/80"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover rounded-xl bg-zinc-900 flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-white line-clamp-1 font-display">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(idx)}
                          className="text-zinc-400 hover:text-rose-400 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[11px] text-zinc-400 mt-1">
                        {item.selectedSize && <span>Size: <strong className="text-zinc-300">{item.selectedSize}</strong></span>}
                        {item.selectedColor && <span>Color: <strong className="text-zinc-300">{item.selectedColor}</strong></span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-900">
                      <div className="flex items-center rounded-lg bg-zinc-900 border border-zinc-800 p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(idx, -1)}
                          className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white text-xs"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(idx, 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white text-xs disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-bold text-white">
                        {currencySymbol}{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-zinc-800 bg-zinc-950/80 space-y-4">
              {/* Promo code input */}
              <div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      placeholder="Promo Code (e.g. LUXE20)"
                      aria-label="Promo Code"
                      className="w-full bg-zinc-900 text-xs text-white placeholder-zinc-500 pl-9 pr-3 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <button
                    onClick={() => applyPromoCode(inputCode)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoSuccess && (
                  <p className="text-[11px] text-emerald-400 mt-1 font-medium">{promoSuccess}</p>
                )}
                {promoError && (
                  <p className="text-[11px] text-rose-400 mt-1">{promoError}</p>
                )}
              </div>

              {/* Cost calculations */}
              <div className="space-y-1.5 text-xs text-zinc-400 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>VIP Promo Discount</span>
                    <span>-{currencySymbol}{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-400">Free</strong> : `${currencySymbol}${shippingFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="text-white">{currencySymbol}{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-zinc-800">
                  <span>Total</span>
                  <span className="text-amber-400">{currencySymbol}{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button
                id="proceed-checkout-btn"
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/10 transition-all cursor-pointer"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>PCI-DSS Level 1 Compliant • 256-Bit Encrypted</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
