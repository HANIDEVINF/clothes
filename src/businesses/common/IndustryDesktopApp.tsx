import React, { useState } from 'react';
import {
  Package,
  Boxes,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  Minus,
  Trash2,
  Download,
  Search,
  CheckCircle,
  Truck,
  Sparkles,
  BarChart3,
  Users,
  Activity,
  X,
  Phone,
  MessageCircle,
  MapPin,
  Instagram,
  FileText,
} from 'lucide-react';
import { BusinessIndustryConfig, BusinessProduct, BusinessOrder, LanguageCode } from '../types';
import { businessStorage } from '../registry';
import { jsPDF } from 'jspdf';
import { CASUAL_STORE_INFO, UI_TRANSLATIONS, ALGERIAN_WILAYAS } from '../../data/casualAlgeriaData';

interface IndustryDesktopAppProps {
  config: BusinessIndustryConfig;
  products: BusinessProduct[];
  orders: BusinessOrder[];
  onRefreshData: () => void;
  activeView: 'stock' | 'stats' | 'orders' | 'settings';
  setActiveView: (view: 'stock' | 'stats' | 'orders' | 'settings') => void;
  lang: LanguageCode;
}

export const IndustryDesktopApp: React.FC<IndustryDesktopAppProps> = ({
  config,
  products,
  orders,
  onRefreshData,
  activeView,
  setActiveView,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // New product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdNameAr, setNewProdNameAr] = useState('');
  const [newProdSku, setNewProdSku] = useState(`CAS-${Math.floor(100 + Math.random() * 900)}`);
  const [newProdCategory, setNewProdCategory] = useState(config.categories[1] || 'Vestes & Cuir');
  const [newProdPrice, setNewProdPrice] = useState(4500); // 4,500 DA
  const [newProdCost, setNewProdCost] = useState(2400); // 2,400 DA
  const [newProdStock, setNewProdStock] = useState(12);
  const [newProdSizes, setNewProdSizes] = useState('M, L, XL, XXL');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState(
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85'
  );

  const t = UI_TRANSLATIONS[lang];
  const isRTL = lang === 'ar';
  const stats = businessStorage.getStats(config.id);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nameAr && p.nameAr.includes(searchQuery)) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStock =
      stockFilter === 'all'
        ? true
        : stockFilter === 'low'
        ? p.stock > 0 && p.stock <= 5
        : p.stock === 0;
    return matchesSearch && matchesStock;
  });

  // Rapid inline stock delta handler
  const handleInlineStockDelta = (productId: string, delta: number) => {
    businessStorage.updateStock(config.id, productId, delta);
    onRefreshData();
  };

  // Inline price update in DA
  const handleInlinePriceChange = (productId: string, newPrice: number) => {
    businessStorage.updatePrice(config.id, productId, newPrice);
    onRefreshData();
  };

  // Delete product
  const handleDeleteProduct = (productId: string) => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج من المخزون؟' : 'Supprimer cet article de la base magasin CASUAL 29 ?')) {
      businessStorage.deleteProduct(config.id, productId);
      onRefreshData();
    }
  };

  // Add Product Form Submit
  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const sizesArray = newProdSizes.split(',').map((s) => s.trim()).filter(Boolean);
    const newProduct: BusinessProduct = {
      id: `cas-${Date.now()}`,
      sku: newProdSku,
      name: newProdName,
      nameAr: newProdNameAr || newProdName,
      subtitle: 'Nouvel arrivage boutique Mascara',
      category: newProdCategory,
      price: Number(newProdPrice),
      costPrice: Number(newProdCost),
      stock: Number(newProdStock),
      sizes: sizesArray.length > 0 ? sizesArray : ['M', 'L', 'XL'],
      images: [newProdImage],
      description: newProdDesc || 'Article sélectionné pour la collection CASUAL 29.',
      specs: {
        'Origine': 'Arrivage Boutique Mascara',
        'Qualité': 'Vérifiée par Farouk Habibo',
      },
      highlights: ['Disponible en magasin', 'Livraison 58 wilayas'],
      rating: 5.0,
      reviewsCount: 1,
      badge: 'Nouveauté 2026',
    };

    businessStorage.addProduct(config.id, newProduct);
    setIsAddModalOpen(false);
    onRefreshData();
  };

  // Update order status
  const handleUpdateOrderStatus = (
    orderId: string,
    status: BusinessOrder['fulfillmentStatus']
  ) => {
    businessStorage.updateOrderStatus(config.id, orderId, status);
    onRefreshData();
  };

  // Open direct WhatsApp chat with customer
  const handleChatWithCustomer = (order: BusinessOrder) => {
    const cleanPhone = order.customerPhone.replace(/\s+/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? `213${cleanPhone.slice(1)}` : cleanPhone;
    const msg = `Salam ${order.customerName}, ici Farouk de la boutique CASUAL 29 Mascara concernant votre commande ${order.orderNumber} d'un montant de ${order.totalAmount.toLocaleString()} DA. Êtes-vous disponible pour confirmer la livraison à ${order.customerWilaya} ?`;
    window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Export Executive PDF Business Audit in DZD
  const handleExportPDFReport = () => {
    setIsExportingPDF(true);
    setTimeout(() => {
      try {
        const doc = new jsPDF();

        // Header banner
        doc.setFillColor(18, 20, 26);
        doc.rect(0, 0, 210, 42, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(212, 175, 55);
        doc.setFontSize(18);
        doc.text('CASUAL 29 MASCARA - RAPPORT DE GESTION', 14, 18);

        doc.setFontSize(9);
        doc.setTextColor(200, 200, 200);
        doc.text(`AUDIT FINANCIER & ÉTAT DES STOCKS • GÉRANT : FAROUK HABIBO`, 14, 26);
        doc.text(`Date d'export : ${new Date().toLocaleDateString()} • Magasin : Rue 1 Novembre, Mascara (29)`, 14, 33);

        // KPI Box
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.text('1. APERÇU FINANCIER GLOBAL (DZD)', 14, 52);

        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.text(`• Chiffre d'Affaires Brut : ${stats.grossRevenue.toLocaleString()} DA`, 14, 62);
        doc.text(`• Marge Nette Estimée : ${stats.netProfit.toLocaleString()} DA (~48% de marge)`, 14, 70);
        doc.text(`• Nombre de Commandes Enregistrées : ${stats.orderCount}`, 14, 78);
        doc.text(`• Panier Moyen Client : ${stats.orderCount > 0 ? Math.round(stats.grossRevenue / stats.orderCount).toLocaleString() : 0} DA`, 14, 86);

        // Inventory Status
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('2. SANTÉ DU STOCK EN MAGASIN (MASCARA)', 14, 102);

        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.text(`• Total des Pièces Physiques en Stock : ${stats.totalUnitsInStock} unités`, 14, 112);
        doc.text(`• Articles en Alerte Stock Faible (≤ 5 pièces) : ${stats.lowStockCount} articles`, 14, 120);

        // Products List
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('3. ARTICLES DU CATALOGUE & NIVEAUX DE STOCK', 14, 136);

        let yPos = 146;
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');

        products.forEach((p, idx) => {
          if (yPos > 265) {
            doc.addPage();
            yPos = 20;
          }
          const line = `${idx + 1}. [${p.sku}] ${p.name.substring(0, 45)} | Stock: ${p.stock} pcs | Prix: ${p.price.toLocaleString()} DA`;
          doc.text(line, 14, yPos);
          yPos += 7;
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text('Document certifié par CASUAL 29 OS Gérant • Prêt pour comptabilité et inventaire', 14, 285);

        doc.save(`Rapport_Gestion_CASUAL29_${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (err) {
        console.error('PDF export error', err);
      } finally {
        setIsExportingPDF(false);
      }
    }, 400);
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right font-arabic' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Ribbon Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white font-display">
              {config.desktopAppTitle}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Gérant : Farouk (@farouk_habibo)
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Magasin de Mascara (29) • Gestion des stocks, commandes 58 Wilayas et suivi Yalidine Express
          </p>
        </div>

        {/* Global Export & Add Product CTAs */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addNewProduct}</span>
          </button>

          <button
            onClick={handleExportPDFReport}
            disabled={isExportingPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>{isExportingPDF ? 'Export...' : 'Rapport PDF'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip in Algerian Dinars */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#12141a] border border-zinc-800/90 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>{t.kpiGrossRevenue}</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            {stats.grossRevenue.toLocaleString()} DA
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% ce mois</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12141a] border border-zinc-800/90 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>{t.kpiNetProfit}</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {stats.netProfit.toLocaleString()} DA
          </div>
          <div className="text-[11px] text-zinc-400">Marge brute ~48%</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12141a] border border-zinc-800/90 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>{t.kpiOrders}</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {orders.length}
          </div>
          <div className="text-[11px] text-zinc-400">58 Wilayas d'Algérie</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12141a] border border-zinc-800/90 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>{t.kpiStock}</span>
            <Boxes className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {stats.totalUnitsInStock} <span className="text-xs font-normal text-zinc-400">pcs</span>
          </div>
          <div className="text-[11px] text-amber-300">
            {stats.lowStockCount} articles en stock faible
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-zinc-800 gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveView('stock')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeView === 'stock'
              ? 'border-amber-400 text-amber-400 bg-amber-400/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t.tabStock} ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveView('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeView === 'orders'
              ? 'border-amber-400 text-amber-400 bg-amber-400/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>{t.tabOrders} ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveView('stats')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeView === 'stats'
              ? 'border-amber-400 text-amber-400 bg-amber-400/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{t.tabStats}</span>
        </button>

        <button
          onClick={() => setActiveView('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeView === 'settings'
              ? 'border-amber-400 text-amber-400 bg-amber-400/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{t.tabSettings} (Mascara)</span>
        </button>
      </div>

      {/* VIEW 1: PRODUCTS & INVENTORY MANAGEMENT */}
      {activeView === 'stock' && (
        <div className="space-y-4">
          {/* Search & Stock Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par article ou SKU..."
                className="w-full py-2 pl-9 pr-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-xl border border-zinc-800 text-xs">
              <button
                onClick={() => setStockFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  stockFilter === 'all' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setStockFilter('low')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  stockFilter === 'low' ? 'bg-amber-400/20 text-amber-300 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Stock Faible (≤ 5)
              </button>
              <button
                onClick={() => setStockFilter('out')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  stockFilter === 'out' ? 'bg-red-400/20 text-red-300 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Rupture (0)
              </button>
            </div>
          </div>

          {/* Table of Products */}
          <div className="rounded-2xl border border-zinc-800 bg-[#12141a] overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#161820] border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Article & Photo</th>
                    <th className="p-3">Catégorie</th>
                    <th className="p-3">Tailles</th>
                    <th className="p-3">Prix de Vente (DA)</th>
                    <th className="p-3">Stock Magasin</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3 flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-10 h-12 rounded-lg object-cover bg-zinc-950 shrink-0 border border-zinc-800"
                        />
                        <div>
                          <div className="font-bold text-white line-clamp-1">{p.name}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">{p.sku}</div>
                        </div>
                      </td>

                      <td className="p-3 text-zinc-300">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px]">
                          {p.category}
                        </span>
                      </td>

                      <td className="p-3 text-zinc-400 font-mono text-[11px]">
                        {p.sizes.join(', ')}
                      </td>

                      {/* Inline Editable Price */}
                      <td className="p-3 font-mono">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            defaultValue={p.price}
                            onBlur={(e) => handleInlinePriceChange(p.id, Number(e.target.value))}
                            className="w-20 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-amber-400 font-bold focus:outline-none focus:border-amber-400"
                          />
                          <span className="text-zinc-500 text-[10px]">DA</span>
                        </div>
                      </td>

                      {/* Inline Editable Stock */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-zinc-800 rounded bg-zinc-900">
                            <button
                              onClick={() => handleInlineStockDelta(p.id, -1)}
                              className="px-2 py-0.5 text-zinc-400 hover:text-white hover:bg-zinc-800"
                            >
                              -
                            </button>
                            <span className={`px-2 font-mono font-bold ${p.stock <= 5 ? 'text-amber-400' : 'text-white'}`}>
                              {p.stock}
                            </span>
                            <button
                              onClick={() => handleInlineStockDelta(p.id, 1)}
                              className="px-2 py-0.5 text-zinc-400 hover:text-white hover:bg-zinc-800"
                            >
                              +
                            </button>
                          </div>
                          {p.stock <= 5 && (
                            <span className="w-2 h-2 rounded-full bg-amber-400" title="Stock faible" />
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                          title="Supprimer l'article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ORDERS & ALGERIAN WILAYA FULFILLMENT */}
      {activeView === 'orders' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="p-4 rounded-2xl bg-[#12141a] border border-zinc-800/90 space-y-3 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400">{o.orderNumber}</span>
                    <span className="text-[10px] text-zinc-500">{o.date}</span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      o.fulfillmentStatus === 'delivered'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : o.fulfillmentStatus === 'shipped_yalidine'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : o.fulfillmentStatus === 'confirmed_phone'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {o.fulfillmentStatus === 'delivered'
                      ? 'Livré & Encaissé'
                      : o.fulfillmentStatus === 'shipped_yalidine'
                      ? 'Expédié Yalidine'
                      : o.fulfillmentStatus === 'confirmed_phone'
                      ? 'Confirmé par tél'
                      : 'En attente'}
                  </span>
                </div>

                {/* Customer Details */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{o.customerName}</span>
                    <button
                      onClick={() => handleChatWithCustomer(o)}
                      className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{o.customerPhone}</span>
                    </button>
                  </div>
                  <div className="text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{o.customerWilaya} {o.customerCommune && `• ${o.customerCommune}`}</span>
                  </div>
                </div>

                {/* Ordered Items */}
                <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1 text-xs">
                  {o.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-zinc-300">
                      <span>• {i.name} (Taille: {i.selectedSize || 'M'}) x{i.quantity}</span>
                      <span className="font-mono text-amber-300">{(i.price * i.quantity).toLocaleString()} DA</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1 border-t border-zinc-800 font-bold text-white text-xs">
                    <span>Total Cash à la Livraison :</span>
                    <span className="font-mono text-amber-400">{o.totalAmount.toLocaleString()} DA</span>
                  </div>
                </div>

                {/* Status Switcher for Store Manager Farouk */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <span>Statut :</span>
                    <select
                      value={o.fulfillmentStatus}
                      onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                      className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="unfulfilled">En attente de confirmation</option>
                      <option value="confirmed_phone">Confirmé par téléphone</option>
                      <option value="shipped_yalidine">Expédié Yalidine Express</option>
                      <option value="delivered">Livré & Encaissé</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleChatWithCustomer(o)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: STATS & ANALYTICS */}
      {activeView === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#12141a] border border-zinc-800 space-y-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Performance des Ventes (DZD)</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Chiffre d'affaires cumulé généré par la boutique en ligne et WhatsApp pour CASUAL 29 Mascara.
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Ventes Vêtements & Vestes Cuir :</span>
                  <span className="font-mono text-white">28,500 DA (75%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '75%' }} />
                </div>

                <div className="flex justify-between text-xs pt-2">
                  <span className="text-zinc-400">Ventes Sneakers & Baskets :</span>
                  <span className="font-mono text-white">9,300 DA (25%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#12141a] border border-zinc-800 space-y-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400" />
                <span>Répartition Géographique des Commandes</span>
              </h3>
              <ul className="text-xs space-y-2 text-zinc-300">
                <li className="flex justify-between p-2 rounded bg-zinc-900">
                  <span>Wilaya de Mascara (29) :</span>
                  <span className="font-bold text-amber-400">35% des commandes (Boutique & Livraison locale)</span>
                </li>
                <li className="flex justify-between p-2 rounded bg-zinc-900">
                  <span>Wilaya d'Oran (31) :</span>
                  <span className="font-bold text-white">25% (Yalidine Akid Lotfi)</span>
                </li>
                <li className="flex justify-between p-2 rounded bg-zinc-900">
                  <span>Wilaya d'Alger (16) :</span>
                  <span className="font-bold text-white">20% (Livraison à domicile)</span>
                </li>
                <li className="flex justify-between p-2 rounded bg-zinc-900">
                  <span>Autres Wilayas (Sétif, Constantine, etc.) :</span>
                  <span className="font-bold text-white">20%</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: STORE SETTINGS & CONTACT CARD */}
      {activeView === 'settings' && (
        <div className="p-6 rounded-3xl bg-[#12141a] border border-zinc-800 max-w-2xl mx-auto space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-amber-400/40 flex items-center justify-center font-serif font-bold text-amber-400 text-lg">
              C
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{CASUAL_STORE_INFO.name}</h3>
              <p className="text-xs text-zinc-400">Magasin de vêtements homme • Mascara (29)</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-400">Propriétaire / Gérant :</span>
              <span className="font-bold text-white">{CASUAL_STORE_INFO.ownerHandle} (Farouk Habibo)</span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-400">Adresse Physique :</span>
              <span className="font-bold text-white">{CASUAL_STORE_INFO.location}</span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-400">Téléphone & WhatsApp :</span>
              <span className="font-bold text-emerald-400">{CASUAL_STORE_INFO.phoneFormatted}</span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-400">Compte Instagram :</span>
              <a
                href={CASUAL_STORE_INFO.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-pink-400 hover:underline"
              >
                @{CASUAL_STORE_INFO.instagramHandle}
              </a>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-400">Localisation Google Maps :</span>
              <a
                href={CASUAL_STORE_INFO.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-amber-400 hover:underline"
              >
                Ouvrir sur Maps
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#12141a] p-6 space-y-4 text-left my-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-base">Ajouter un Vêtement ou Chaussure</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewProduct} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold">Nom de l'Article (Français) *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Ex: Polo Old Money Tricot Col Blanc"
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold">Nom en Arabe (Optionnel)</label>
                <input
                  type="text"
                  value={newProdNameAr}
                  onChange={(e) => setNewProdNameAr(e.target.value)}
                  placeholder="مثال: بولو أولد موني راقي"
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-400 text-right font-arabic"
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Catégorie *</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {config.categories.filter((c) => !c.toLowerCase().includes('all') && !c.includes('Tous')).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Tailles (séparées par virgule) *</label>
                  <input
                    type="text"
                    value={newProdSizes}
                    onChange={(e) => setNewProdSizes(e.target.value)}
                    placeholder="M, L, XL, XXL ou 40, 41, 42"
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Prix Vente (DA) *</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 font-bold font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Coût Achat (DA)</label>
                  <input
                    type="number"
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Stock Initial *</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold">URL de la Photo</label>
                <input
                  type="text"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold"
                >
                  Enregistrer l'Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
