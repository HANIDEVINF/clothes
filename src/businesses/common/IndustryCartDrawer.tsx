import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ShieldCheck,
  CheckCircle,
  Download,
  Truck,
  MessageCircle,
  Phone,
  MapPin,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { BusinessIndustryConfig, BusinessProduct, BusinessOrder, LanguageCode } from '../types';
import { businessStorage } from '../registry';
import { jsPDF } from 'jspdf';
import { CASUAL_STORE_INFO, ALGERIAN_WILAYAS, UI_TRANSLATIONS } from '../../data/casualAlgeriaData';

export interface IndustryCartItem {
  product: BusinessProduct;
  quantity: number;
  selectedSize?: string;
}

interface IndustryCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: BusinessIndustryConfig;
  cartItems: IndustryCartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: BusinessOrder) => void;
  lang: LanguageCode;
}

export const IndustryCartDrawer: React.FC<IndustryCartDrawerProps> = ({
  isOpen,
  onClose,
  config,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderPlaced,
  lang,
}) => {
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountDA, setDiscountDA] = useState(0);
  const [promoMsg, setPromoMsg] = useState('');

  // Algerian Customer Checkout State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState('29'); // Default 29 - Mascara
  const [customerCommune, setCustomerCommune] = useState('');
  const [deliveryType, setDeliveryType] = useState<'home' | 'stopdesk'>('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<BusinessOrder | null>(null);

  const t = UI_TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  if (!isOpen) return null;

  // Calculate delivery fee based on selected Algerian wilaya
  const currentWilaya = ALGERIAN_WILAYAS.find((w) => w.code === selectedWilayaCode) || ALGERIAN_WILAYAS[28]; // Default Mascara
  const deliveryFeeDA = deliveryType === 'home' ? currentWilaya.deliveryHomeDZD : currentWilaya.deliveryStopDeskDZD;

  const itemsSubtotalDA = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const finalTotalDA = Math.max(0, itemsSubtotalDA - discountDA + (itemsSubtotalDA > 0 ? deliveryFeeDA : 0));

  // Promo code in Algerian Dinar
  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'CASUAL29' || code === 'FAROUK') {
      const disc = Math.round(itemsSubtotalDA * 0.1); // 10% discount
      setDiscountDA(disc);
      setPromoMsg(lang === 'ar' ? 'تم تطبيق خصم 10% لزبائن معسكر !' : '10% de réduction fidélité appliquée !');
    } else if (code === 'YALIDINE') {
      setDiscountDA(deliveryFeeDA);
      setPromoMsg(lang === 'ar' ? 'توصيل مجاني مع كود ياليدين !' : 'Livraison offerte appliquée !');
    } else {
      setPromoMsg(lang === 'ar' ? 'كود غير صحيح. جرب "CASUAL29"' : 'Code invalide. Essayez "CASUAL29"');
    }
  };

  // Place order with Cash on Delivery
  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert(lang === 'ar' ? 'يرجى إدخال الاسم ورقم الهاتف' : 'Veuillez saisir votre nom et numéro de téléphone');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const newOrder: BusinessOrder = {
        id: `ord-dz-${Date.now()}`,
        orderNumber: `CAS-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerWilaya: `${currentWilaya.code} - ${currentWilaya.name}`,
        customerCommune: customerCommune.trim() || 'Centre',
        deliveryType,
        shippingCost: deliveryFeeDA,
        paymentMethod: 'cash_on_delivery',
        items: cartItems.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          quantity: i.quantity,
          price: i.product.price,
          sku: i.product.sku,
          selectedSize: i.selectedSize || i.product.sizes[0],
        })),
        totalAmount: finalTotalDA,
        paymentStatus: 'pending',
        fulfillmentStatus: 'unfulfilled',
        date: new Date().toISOString().split('T')[0],
        notes: `Commande passée en ligne • Livraison ${deliveryType === 'home' ? 'à domicile' : 'Bureau Yalidine'}`,
      };

      // Save order to store
      businessStorage.addOrder(config.id, newOrder);

      // Decrement stock
      cartItems.forEach((item) => {
        businessStorage.updateStock(config.id, item.product.id, -item.quantity);
      });

      setConfirmedOrder(newOrder);
      setIsProcessing(false);
      onOrderPlaced(newOrder);
      onClearCart();
    }, 600);
  };

  // Confirm directly on WhatsApp with Farouk (0542364246)
  const handleConfirmOnWhatsApp = () => {
    const itemsList = cartItems
      .map((i) => `• ${i.product.name} (Taille: ${i.selectedSize || 'M'}) x${i.quantity} = ${(i.product.price * i.quantity).toLocaleString()} DA`)
      .join('\n');

    const message = lang === 'ar'
      ? `سلام، أود تأكيد هذا الطلب:\n\n*الزبون:* ${customerName || 'زبون المتجر'}\n*الهاتف:* ${customerPhone || '0542364246'}\n*الولاية:* ${currentWilaya.nameAr}\n*العنوان:* ${customerCommune || 'المركز'}\n*طريقة الاستلام:* ${deliveryType === 'home' ? 'توصيل للمنزل' : 'مكتب ياليدين'}\n\n*المنتجات:*\n${itemsList}\n\n*المجموع الإجمالي مع التوصيل:* ${finalTotalDA.toLocaleString()} دج\n(الدفع عند الاستلام)`
      : `Salam Farouk, je souhaite valider ma commande chez CASUAL 29 Mascara :\n\n*Client :* ${customerName || 'Client'}\n*Téléphone :* ${customerPhone || '0542364246'}\n*Wilaya :* ${currentWilaya.name}\n*Adresse :* ${customerCommune || 'Centre'}\n*Mode :* ${deliveryType === 'home' ? 'Livraison à Domicile' : 'Bureau Yalidine'}\n\n*Articles :*\n${itemsList}\n\n*Total à régler à la livraison :* ${finalTotalDA.toLocaleString()} DA\n(Paiement Cash on Delivery)`;

    window.open(`https://wa.me/213542364246?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Export Algerian Delivery Slip / Receipt PDF
  const handleDownloadPDFReceipt = () => {
    if (!confirmedOrder) return;
    try {
      const doc = new jsPDF();

      // Header Banner
      doc.setFillColor(18, 20, 26);
      doc.rect(0, 0, 210, 42, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(212, 175, 55);
      doc.setFontSize(20);
      doc.text('CASUAL 29 - MEN\'S WEAR', 14, 18);

      doc.setFontSize(9);
      doc.setTextColor(200, 200, 200);
      doc.text('Rue 1 Novembre, Mascara, Algérie • Tél: 0542364246 • Instagram: @cas_ual_29', 14, 26);
      doc.text(`BON DE COMMANDE N° : ${confirmedOrder.orderNumber} • Date : ${confirmedOrder.date}`, 14, 34);

      // Customer Block
      doc.setTextColor(20, 24, 30);
      doc.setFontSize(12);
      doc.text('INFORMATIONS DESTINATAIRE (LIVRAISON)', 14, 52);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Nom & Prénom : ${confirmedOrder.customerName}`, 14, 60);
      doc.text(`• Numéro de Téléphone : ${confirmedOrder.customerPhone}`, 14, 67);
      doc.text(`• Wilaya de Destination : ${confirmedOrder.customerWilaya}`, 14, 74);
      doc.text(`• Commune / Adresse : ${confirmedOrder.customerCommune}`, 14, 81);
      doc.text(`• Mode de Réception : ${confirmedOrder.deliveryType === 'home' ? 'Livraison à Domicile' : 'Bureau Stop Desk Yalidine'}`, 14, 88);
      doc.text(`• Mode de Règlement : PAIEMENT CASH À LA LIVRAISON (COD)`, 14, 95);

      // Items Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('ARTICLES COMMANDÉS', 14, 110);

      doc.setFillColor(240, 240, 245);
      doc.rect(14, 116, 182, 8, 'F');
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text('Article & Taille', 16, 122);
      doc.text('Quantité', 110, 122);
      doc.text('Prix Unitaire', 135, 122);
      doc.text('Total (DA)', 170, 122);

      let y = 132;
      doc.setFont('helvetica', 'normal');
      confirmedOrder.items.forEach((item) => {
        doc.text(`${item.name} (Taille: ${item.selectedSize || 'Standard'})`, 16, y);
        doc.text(`x${item.quantity}`, 115, y);
        doc.text(`${item.price.toLocaleString()} DA`, 135, y);
        doc.text(`${(item.price * item.quantity).toLocaleString()} DA`, 170, y);
        y += 8;
      });

      // Total summary box
      y += 6;
      doc.setDrawColor(212, 175, 55);
      doc.line(14, y, 196, y);
      y += 10;

      doc.setFont('helvetica', 'bold');
      doc.text(`Frais de livraison (${confirmedOrder.customerWilaya}) :`, 110, y);
      doc.text(`${confirmedOrder.shippingCost.toLocaleString()} DA`, 170, y);
      y += 8;

      doc.setFontSize(12);
      doc.setTextColor(212, 175, 55);
      doc.text(`TOTAL NET À PAYER AU LIVREUR :`, 65, y);
      doc.text(`${confirmedOrder.totalAmount.toLocaleString()} DA`, 165, y);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(130, 130, 130);
      doc.text('Merci de votre confiance en CASUAL Mascara. À la réception, vérifiez vos articles avant de remettre le montant au livreur.', 14, 280);

      doc.save(`Bon_Commande_${confirmedOrder.orderNumber}.pdf`);
    } catch (err) {
      console.error('Error generating PDF receipt', err);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm ${isRTL ? 'font-arabic' : ''}`}>
      <div className="relative w-full max-w-md bg-[#0e1014] border-l border-zinc-800 h-full flex flex-col shadow-2xl text-left">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-[#12141a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-display">
                {confirmedOrder ? t.orderSuccessTitle : isCheckoutStep ? t.checkoutTitle : t.cartTitle}
              </h2>
              <span className="text-[11px] text-zinc-400">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} {lang === 'ar' ? 'منتجات' : 'articles'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* STATE 1: ORDER CONFIRMED SCREEN */}
          {confirmedOrder ? (
            <div className="space-y-5 text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  {lang === 'ar' ? 'شكراً لطلبك من كاجوال معسكر !' : 'Merci pour votre commande chez CASUAL 29 !'}
                </h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  {t.orderSuccessDesc}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">{t.orderNumber} :</span>
                  <span className="font-mono font-bold text-amber-400">{confirmedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Client :</span>
                  <span className="text-white">{confirmedOrder.customerName} ({confirmedOrder.customerPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Wilaya :</span>
                  <span className="text-white">{confirmedOrder.customerWilaya}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-800 text-sm font-bold">
                  <span className="text-zinc-300">Total à payer à la livraison :</span>
                  <span className="text-amber-400 font-mono">{confirmedOrder.totalAmount.toLocaleString()} DA</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDownloadPDFReceipt}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-zinc-700 transition-colors"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>{t.viewReceipt}</span>
                </button>

                <a
                  href={`https://wa.me/213542364246?text=${encodeURIComponent(`Salam Farouk, je viens de passer la commande ${confirmedOrder.orderNumber} sur votre boutique en ligne.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contacter Farouk sur WhatsApp</span>
                </a>

                <button
                  onClick={() => {
                    setConfirmedOrder(null);
                    setIsCheckoutStep(false);
                    onClose();
                  }}
                  className="w-full py-2 px-4 text-xs text-zinc-400 hover:text-white"
                >
                  Continuer les achats
                </button>
              </div>
            </div>
          ) : isCheckoutStep ? (
            /* STATE 2: ALGERIAN CHECKOUT FORM */
            <form onSubmit={handleConfirmOrder} className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300 flex items-center gap-2">
                <Truck className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Paiement en espèces lors de la réception du colis.</span>
              </div>

              {/* Customer Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">{t.fullName} *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Mohamed Amine"
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Algerian Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">{t.phoneLabel} *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 text-zinc-500" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="05 / 06 / 07 xx xx xx"
                    className="w-full py-2.5 pl-9 pr-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* Wilaya Selection (58 Wilayas) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">{t.wilayaLabel} *</label>
                <select
                  value={selectedWilayaCode}
                  onChange={(e) => setSelectedWilayaCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {ALGERIAN_WILAYAS.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.name} ({deliveryType === 'home' ? w.deliveryHomeDZD : w.deliveryStopDeskDZD} DA)
                    </option>
                  ))}
                </select>
              </div>

              {/* Commune / Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">{t.communeLabel}</label>
                <input
                  type="text"
                  value={customerCommune}
                  onChange={(e) => setCustomerCommune(e.target.value)}
                  placeholder={t.communePlaceholder}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Delivery Type Option */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">{t.deliveryTypeLabel}</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('home')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      deliveryType === 'home'
                        ? 'border-amber-400 bg-amber-400/10 text-white font-bold'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                    }`}
                  >
                    <div>{t.deliveryHome}</div>
                    <div className="text-[11px] text-amber-400 font-mono mt-0.5">{currentWilaya.deliveryHomeDZD} DA</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('stopdesk')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      deliveryType === 'stopdesk'
                        ? 'border-amber-400 bg-amber-400/10 text-white font-bold'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                    }`}
                  >
                    <div>Bureau Yalidine</div>
                    <div className="text-[11px] text-amber-400 font-mono mt-0.5">{currentWilaya.deliveryStopDeskDZD} DA</div>
                  </button>
                </div>
              </div>

              {/* Order Confirmation Buttons */}
              <div className="space-y-2 pt-3 border-t border-zinc-800">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isProcessing ? 'Enregistrement...' : t.confirmOrderBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmOnWhatsApp}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Envoyer la commande sur WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCheckoutStep(false)}
                  className="w-full py-1.5 text-xs text-zinc-400 hover:text-white"
                >
                  ← Retour au panier
                </button>
              </div>
            </form>
          ) : cartItems.length === 0 ? (
            /* STATE 3: EMPTY CART */
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-xs text-zinc-400">{t.cartEmpty}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
              >
                {t.cartContinue}
              </button>
            </div>
          ) : (
            /* STATE 4: CART ITEMS LIST */
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}`}
                  className="flex gap-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 items-center justify-between"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-14 h-16 rounded-xl object-cover bg-zinc-950 shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-white truncate">{item.product.name}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                      <span>Taille: {item.selectedSize || 'M'}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold">{item.product.price.toLocaleString()} DA</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex items-center border border-zinc-800 rounded-lg bg-zinc-900">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="px-2 py-0.5 text-zinc-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono text-white">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="px-2 py-0.5 text-zinc-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-zinc-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold text-xs text-white">
                    {(item.product.price * item.quantity).toLocaleString()} DA
                  </div>
                </div>
              ))}

              {/* Promo Code input */}
              <div className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Code Promo (ex: CASUAL29)"
                    className="flex-1 py-1.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white uppercase focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200"
                  >
                    Appliquer
                  </button>
                </div>
                {promoMsg && <p className="text-[11px] text-amber-300 mt-1">{promoMsg}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer with Financial Summary */}
        {cartItems.length > 0 && !confirmedOrder && !isCheckoutStep && (
          <div className="p-4 sm:p-5 border-t border-zinc-800 bg-[#12141a] space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>{t.subtotal}</span>
                <span className="font-mono text-zinc-200">{itemsSubtotalDA.toLocaleString()} DA</span>
              </div>
              {discountDA > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Remise Promo</span>
                  <span className="font-mono">-{discountDA.toLocaleString()} DA</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>{t.deliveryFee} (Est. Mascara 29)</span>
                <span className="font-mono text-zinc-200">{deliveryFeeDA} DA</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                <span>{t.totalAmount}</span>
                <span className="font-mono text-amber-400 text-base">{finalTotalDA.toLocaleString()} DA</span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutStep(true)}
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <span>{t.proceedCheckout}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
