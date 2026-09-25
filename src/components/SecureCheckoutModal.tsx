import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Lock,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Download,
  AlertCircle,
  Truck,
  Sparkles,
} from 'lucide-react';
import { CartItem, CustomerInfo, Order } from '../types';
import { mongoStore } from '../services/mongoStore';
import { generateCustomerReceiptPDF } from '../services/pdfReportGenerator';

interface SecureCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  discountAmount: number;
  currencySymbol: string;
  onOrderSuccess: (order: Order) => void;
}

export const SecureCheckoutModal: React.FC<SecureCheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  discountAmount,
  currencySymbol,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'shipping' | 'payment' | 'processing' | 'confirmed'>('shipping');

  // Customer shipping info
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: 'Alexander Sterling',
    email: 'a.sterling@luxury-ateliers.com',
    phone: '+1 (555) 234-8900',
    address: '742 Evergreen Terrace, Suite 8A',
    city: 'New York',
    state: 'NY',
    postalCode: '10021',
    country: 'United States',
  });

  // Payment form states
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'apple_pay' | 'google_pay' | 'crypto'>('credit_card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('883');
  const [cardName, setCardName] = useState('ALEXANDER STERLING');
  const [saveCard, setSaveCard] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('Initiating TLS 1.3 cryptographic handshake...');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Financial calculations
  const subtotal = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shippingFee = subtotal >= 300 || subtotal === 0 ? 0 : 25;
  const taxable = Math.max(0, subtotal - discountAmount);
  const tax = taxable * 0.08;
  const total = taxable + shippingFee + tax;

  // Format card number with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      setCardExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
    } else {
      setCardExpiry(val);
    }
  };

  // Process secure payment transaction
  const handleProcessPayment = async () => {
    setStep('processing');
    setIsProcessing(true);

    // Realistic cryptographic verification stages
    setProcessingStatus('Securing 256-bit TLS connection...');
    await new Promise((r) => setTimeout(r, 600));

    setProcessingStatus('Tokenizing card details via PCI-DSS Vault...');
    await new Promise((r) => setTimeout(r, 700));

    setProcessingStatus('Simulating 3D-Secure 2.0 biometric authorization...');
    await new Promise((r) => setTimeout(r, 600));

    setProcessingStatus('Executing MongoDB inventory deduction transaction...');
    await new Promise((r) => setTimeout(r, 600));

    // Create Order in MongoDB local store
    const newOrder = mongoStore.insertOrder({
      customer,
      items: cartItems.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        category: item.product.category,
        price: item.product.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        image: item.product.images[0],
      })),
      subtotal,
      discount: discountAmount,
      shippingFee,
      tax,
      totalAmount: total,
      paymentMethod,
      paymentStatus: 'paid',
      fulfillmentStatus: 'processing',
      trackingNumber: `EXP-USPS-${Math.floor(100000000 + Math.random() * 900000000)}`,
      transactionToken: `tok_live_pci_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
    });

    setCompletedOrder(newOrder);
    setIsProcessing(false);
    setStep('confirmed');

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#ffffff', '#fbbf24'],
      });
    } catch {
      // ignore
    }

    onOrderSuccess(newOrder);
  };

  return (
    <div
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="checkout-modal-container"
        className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl my-auto text-left"
      >
        {/* Header with Security Status */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">AURA Secure Gateway</h2>
              <p className="text-[11px] text-zinc-400">256-Bit Encrypted &amp; Tokenized Checkout</p>
            </div>
          </div>

          {step !== 'processing' && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* STEP 1: SHIPPING DETAILS */}
          {step === 'shipping' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                  Step 1 of 2: Shipping Destination
                </h3>
                <span className="text-xs text-amber-400 font-semibold">
                  Total: {currencySymbol}{total.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Email Address (for PDF Receipt)</label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Country / Region</label>
                  <select
                    value={customer.country}
                    onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                    <option value="Canada">Canada</option>
                    <option value="Sweden">Sweden</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1 font-medium">Street Address</label>
                  <input
                    type="text"
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">City</label>
                  <input
                    type="text"
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Postal / ZIP Code</label>
                  <input
                    type="text"
                    value={customer.postalCode}
                    onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Order preview bar */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-400">
                  {cartItems.length} item(s) selected
                </span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Insured Signature Required
                </span>
              </div>

              <button
                id="btn-continue-to-payment"
                onClick={() => setStep('payment')}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>Continue to Secure Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: PAYMENT METHOD & TOKENIZATION */}
          {step === 'payment' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('shipping')}
                  className="text-xs text-zinc-400 hover:text-white underline"
                >
                  &larr; Back to Shipping
                </button>
                <span className="text-xs font-mono text-zinc-400">TLS 1.3 Active</span>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Select Payment Gateway
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'credit_card'
                        ? 'border-amber-400 bg-amber-500/10 text-white'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>Credit Card</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'apple_pay'
                        ? 'border-amber-400 bg-amber-500/10 text-white'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-sm font-bold">Pay</span>
                    <span>Apple Pay</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('google_pay')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'google_pay'
                        ? 'border-amber-400 bg-amber-500/10 text-white'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-sm font-bold text-sky-400">G Pay</span>
                    <span>Google Pay</span>
                  </button>
                </div>
              </div>

              {/* Card input simulated PCI container */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-900 pb-2">
                  <span className="font-semibold text-zinc-300">Encrypted Cardholder Vault</span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-zinc-800 text-[10px] rounded text-zinc-300 font-bold">VISA</span>
                    <span className="px-1.5 py-0.5 bg-zinc-800 text-[10px] rounded text-zinc-300 font-bold">MC</span>
                    <span className="px-1.5 py-0.5 bg-zinc-800 text-[10px] rounded text-zinc-300 font-bold">AMEX</span>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4242 •••• •••• 4242"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm tracking-wider focus:outline-none focus:border-amber-400"
                    />
                    <ShieldCheck className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1">Expiration (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">CVC / Security Code</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="•••"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white text-xs uppercase focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="save-card-check"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-0"
                  />
                  <label htmlFor="save-card-check" className="text-[11px] text-zinc-400 cursor-pointer">
                    Securely save card token for future atelier purchases
                  </label>
                </div>
              </div>

              {/* Order total confirmation */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Total Charged Amount:</span>
                <span className="text-base font-extrabold text-white">
                  {currencySymbol}{total.toFixed(2)}
                </span>
              </div>

              <button
                id="btn-confirm-and-pay"
                onClick={handleProcessPayment}
                className="w-full py-4 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-400/20 transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Authorize &amp; Pay {currencySymbol}{total.toFixed(2)}</span>
              </button>
            </div>
          )}

          {/* STEP 3: PROCESSING OVERLAY */}
          {step === 'processing' && (
            <div className="text-center py-12 space-y-6">
              <div className="w-16 h-16 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-white font-display">Securing Transaction</h3>
                <p className="text-xs text-amber-300 mt-2 font-mono animate-pulse">{processingStatus}</p>
              </div>
              <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                End-to-end tokenization prevents raw card storage on server. MongoDB transactional state is updating.
              </p>
            </div>
          )}

          {/* STEP 4: CONFIRMED & PDF INVOICE DOWNLOAD */}
          {step === 'confirmed' && completedOrder && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
                  Payment Verified &amp; Tokenized
                </span>
                <h3 className="text-2xl font-bold font-display text-white mt-3">
                  Thank You for Your Order!
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Order <strong className="text-white">#{completedOrder.orderNumber}</strong> has been logged in MongoDB and queued for insured dispatch.
                </p>
              </div>

              {/* Order summary box */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-zinc-900 pb-2">
                  <span className="text-zinc-400">Transaction Token</span>
                  <span className="font-mono text-zinc-300 text-[11px]">{completedOrder.transactionToken}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900 pb-2">
                  <span className="text-zinc-400">Delivery To</span>
                  <span className="text-zinc-200">{completedOrder.customer.name}, {completedOrder.customer.city}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900 pb-2">
                  <span className="text-zinc-400">Tracking Reference</span>
                  <span className="font-mono text-amber-400">{completedOrder.trackingNumber}</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-sm">
                  <span className="text-white">Total Amount Paid</span>
                  <span className="text-emerald-400">{currencySymbol}{completedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* PDF Invoice Download Button */}
              <div className="space-y-3 pt-2">
                <button
                  id="download-order-pdf-btn"
                  onClick={() => generateCustomerReceiptPDF(completedOrder)}
                  className="w-full py-3.5 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Official PDF Order Receipt &amp; Proof of Purchase</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
                >
                  Return to Storefront
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
