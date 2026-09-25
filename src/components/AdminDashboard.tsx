import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Edit2,
  Trash2,
  Package,
  Boxes,
  DollarSign,
  TrendingUp,
  Download,
  ExternalLink,
  CheckCircle,
  Truck,
  RotateCcw,
  X,
  Layers,
} from 'lucide-react';
import { Product, Order, ProductCategory } from '../types';
import { mongoStore } from '../services/mongoStore';
import { generateCustomerReceiptPDF } from '../services/pdfReportGenerator';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onRefreshData: () => void;
  currencySymbol: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  onRefreshData,
  currencySymbol,
}) => {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'inventory' | 'orders'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'glasses' as ProductCategory,
    price: 290,
    compareAtPrice: 340,
    costPrice: 90,
    stock: 12,
    sku: 'AUR-NEW-001',
    image1: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=85',
    image2: '',
    description: '',
    specsMaterial: 'Titanium / Bio-Acetate',
    specsDimensions: '52-19-145 mm',
    tags: 'Atelier, New Drop',
  });

  // Calculate high-level inventory metrics
  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 8).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const totalInventoryValuation = products.reduce((acc, p) => acc + p.stock * p.price, 0);

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesStock =
      stockFilter === 'all'
        ? true
        : stockFilter === 'low'
        ? p.stock > 0 && p.stock <= 8
        : p.stock === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Open modal for new product
  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setFormData({
      name: '',
      slug: '',
      category: 'glasses',
      price: 280,
      compareAtPrice: 320,
      costPrice: 85,
      stock: 15,
      sku: `AUR-${Math.floor(100 + Math.random() * 900)}`,
      image1: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1000&q=85',
      image2: '',
      description: 'Precision engineered luxury silhouette handcrafted with meticulous attention to detail.',
      specsMaterial: 'Japanese Titanium & Cured Bio-Acetate',
      specsDimensions: '50-20-145 mm',
      tags: 'Bespoke, New Arrival',
    });
    setIsProductModalOpen(true);
  };

  // Open modal for editing existing product
  const handleOpenEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setFormData({
      name: p.name,
      slug: p.slug,
      category: p.category,
      price: p.price,
      compareAtPrice: p.compareAtPrice || 0,
      costPrice: p.costPrice,
      stock: p.stock,
      sku: p.sku,
      image1: p.images[0] || '',
      image2: p.images[1] || '',
      description: p.description,
      specsMaterial: p.specs.material || p.specs.frameMaterial || '',
      specsDimensions: p.specs.dimensions || '',
      tags: p.tags.join(', '),
    });
    setIsProductModalOpen(true);
  };

  // Save product to MongoDB collection
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const images = [formData.image1];
    if (formData.image2.trim()) images.push(formData.image2.trim());

    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingProductId) {
      mongoStore.updateProduct(editingProductId, {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        category: formData.category,
        price: Number(formData.price),
        compareAtPrice: Number(formData.compareAtPrice) || undefined,
        costPrice: Number(formData.costPrice),
        stock: Number(formData.stock),
        sku: formData.sku,
        images,
        description: formData.description,
        tags: tagsArray,
        specs: {
          material: formData.specsMaterial,
          dimensions: formData.specsDimensions,
        },
      });
    } else {
      mongoStore.insertProduct({
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        category: formData.category,
        price: Number(formData.price),
        compareAtPrice: Number(formData.compareAtPrice) || undefined,
        costPrice: Number(formData.costPrice),
        stock: Number(formData.stock),
        sku: formData.sku,
        images,
        description: formData.description,
        features: ['Handcrafted artisanal manufacturing', 'Lifetime atelier repair guarantee'],
        specs: {
          material: formData.specsMaterial,
          dimensions: formData.specsDimensions,
        },
        rating: 5.0,
        reviewsCount: 1,
        tags: tagsArray,
      });
    }

    setIsProductModalOpen(false);
    onRefreshData();
  };

  // Inline Stock adjustment
  const handleInlineStockDelta = (productId: string, delta: number) => {
    mongoStore.updateStock(productId, delta);
    onRefreshData();
  };

  // Delete product
  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Confirm removing this product from the MongoDB database?')) {
      mongoStore.deleteProduct(productId);
      onRefreshData();
    }
  };

  // Update order fulfillment status
  const handleUpdateOrderStatus = (
    orderId: string,
    status: Order['fulfillmentStatus']
  ) => {
    mongoStore.updateOrderStatus(orderId, { fulfillmentStatus: status });
    onRefreshData();
  };

  return (
    <div id="admin-dashboard-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Logiciel Dashboard
            </span>
            <span className="text-xs text-zinc-500 font-mono">Connected: mongodb://localhost:27017</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1 tracking-tight">
            Inventory &amp; Store Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time catalog control, low stock alerts, inline inventory adjustments, and order fulfillment.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            id="admin-new-product-btn"
            onClick={handleOpenNewProduct}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-400/10 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Quick KPI Overview Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Total Catalog Products</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-display">{products.length}</p>
          <span className="text-[11px] text-zinc-400 mt-1 block">Active across 4 categories</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Total Units on Hand</span>
            <Boxes className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-display">{totalUnits}</p>
          <span className="text-[11px] text-zinc-400 mt-1 block">Physical warehouse stock</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Low Stock Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400 font-display">{lowStockCount}</p>
          <span className="text-[11px] text-amber-300/80 mt-1 block">Fewer than 8 units left</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Inventory Valuation</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-display">
            {currencySymbol}{totalInventoryValuation.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-400 mt-1 block">Retail asset potential</span>
        </div>
      </div>

      {/* Sub-tab Switcher: Inventory vs Orders */}
      <div className="flex items-center justify-between border-b border-zinc-800">
        <div className="flex gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveAdminSubTab('inventory')}
            className={`pb-3 px-4 border-b-2 transition-all ${
              activeAdminSubTab === 'inventory'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Product Catalog &amp; Stock ({products.length})
          </button>
          <button
            onClick={() => setActiveAdminSubTab('orders')}
            className={`pb-3 px-4 border-b-2 transition-all ${
              activeAdminSubTab === 'orders'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Customer Orders &amp; Invoices ({orders.length})
          </button>
        </div>
      </div>

      {/* ================= INVENTORY TAB ================= */}
      {activeAdminSubTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by product name or SKU..."
                aria-label="Filter by product name or SKU"
                className="w-full bg-zinc-950 text-xs text-white placeholder-zinc-500 pl-9 pr-3 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
                className="bg-zinc-950 text-xs text-zinc-300 px-3 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-amber-400"
              >
                <option value="all">All Departments</option>
                <option value="glasses">Eyewear &amp; Glasses</option>
                <option value="clothes">Atelier Clothes</option>
                <option value="accessories">Bags &amp; Leather</option>
                <option value="footwear">Footwear &amp; Loafers</option>
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                aria-label="Filter by stock health"
                className="bg-zinc-950 text-xs text-zinc-300 px-3 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-amber-400"
              >
                <option value="all">All Stock Health</option>
                <option value="low">Low Stock (&le; 8)</option>
                <option value="out">Out of Stock (0)</option>
              </select>
            </div>
          </div>

          {/* Products Inventory Table */}
          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Item &amp; SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Retail Price</th>
                  <th className="py-3.5 px-4">Cost / Margin</th>
                  <th className="py-3.5 px-4 text-center">Stock Level</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500">
                      No products found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const marginPct = Math.round(((p.price - p.costPrice) / p.price) * 100);
                    const isLow = p.stock > 0 && p.stock <= 8;
                    const isOut = p.stock === 0;

                    return (
                      <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                        {/* Thumbnail & Title */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt=""
                              className="w-12 h-14 rounded-lg object-cover bg-zinc-950 border border-zinc-800"
                            />
                            <div>
                              <p className="font-bold text-white font-display">{p.name}</p>
                              <p className="font-mono text-[10px] text-zinc-400">{p.sku}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="capitalize text-zinc-300 font-medium">
                            {p.category}
                          </span>
                        </td>

                        {/* Retail Price */}
                        <td className="py-3 px-4 font-bold text-white">
                          {currencySymbol}{p.price.toFixed(2)}
                        </td>

                        {/* Cost & Margin */}
                        <td className="py-3 px-4 text-zinc-400">
                          <span>{currencySymbol}{p.costPrice.toFixed(2)}</span>
                          <span className="text-emerald-400 ml-2 font-medium">({marginPct}% margin)</span>
                        </td>

                        {/* Stock Controls */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleInlineStockDelta(p.id, -1)}
                              disabled={p.stock <= 0}
                              className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold disabled:opacity-30"
                              title="Decrease stock by 1"
                            >
                              -
                            </button>
                            <span
                              className={`w-8 text-center font-mono font-bold ${
                                isOut
                                  ? 'text-rose-400'
                                  : isLow
                                  ? 'text-amber-400'
                                  : 'text-zinc-200'
                              }`}
                            >
                              {p.stock}
                            </span>
                            <button
                              onClick={() => handleInlineStockDelta(p.id, 1)}
                              className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold"
                              title="Increase stock by 1"
                            >
                              +
                            </button>

                            {isLow && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-medium">
                                Low
                              </span>
                            )}
                            {isOut && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-medium">
                                Out
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                            title="Edit product details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= ORDERS TAB ================= */}
      {activeAdminSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Client Name &amp; Email</th>
                  <th className="py-3.5 px-4">Items Count</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Fulfillment Status</th>
                  <th className="py-3.5 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        #{o.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-white">{o.customer.name}</p>
                        <p className="text-[11px] text-zinc-400">{o.customer.email}</p>
                      </td>
                      <td className="py-3 px-4 text-zinc-300">
                        {o.items.reduce((s, i) => s + i.quantity, 0)} units
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {currencySymbol}{o.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium capitalize">
                          <CheckCircle className="w-3 h-3" /> {o.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={o.fulfillmentStatus}
                          onChange={(e) =>
                            handleUpdateOrderStatus(o.id, e.target.value as any)
                          }
                          aria-label={`Update fulfillment status for order ${o.orderNumber}`}
                          className="bg-zinc-950 text-xs text-zinc-200 border border-zinc-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-400 capitalize"
                        >
                          <option value="unfulfilled">Unfulfilled</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => generateCustomerReceiptPDF(o)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                          title="Generate PDF Receipt"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-400" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= PRODUCT ADD/EDIT MODAL ================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-left my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
              <h3 className="text-lg font-bold text-white font-display">
                {editingProductId ? 'Edit Atelier Product' : 'Add New Product to Catalog'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. AURA Arc Eclipse Titanium Aviators"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Department Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="glasses">Glasses &amp; Eyewear</option>
                    <option value="clothes">Atelier Clothing</option>
                    <option value="accessories">Bags &amp; Leather</option>
                    <option value="footwear">Footwear &amp; Loafers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">SKU Reference</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Retail Price ($)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Cost Price ($)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Initial Stock</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Primary Image URL</label>
                <input
                  type="url"
                  required
                  value={formData.image1}
                  onChange={(e) => setFormData({ ...formData, image1: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Material / Composition</label>
                  <input
                    type="text"
                    value={formData.specsMaterial}
                    onChange={(e) => setFormData({ ...formData, specsMaterial: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Dimensions / Optics</label>
                  <input
                    type="text"
                    value={formData.specsDimensions}
                    onChange={(e) => setFormData({ ...formData, specsDimensions: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold transition-all shadow-lg"
                >
                  {editingProductId ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
