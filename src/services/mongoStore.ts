import { Product, Order, AnalyticsSummary, CategoryMetric, DailyMetric } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { INITIAL_ORDERS } from '../data/initialOrders';

const STORAGE_KEYS = {
  PRODUCTS: 'aura_mongodb_collection_products',
  ORDERS: 'aura_mongodb_collection_orders',
  VISITORS_COUNT: 'aura_mongodb_active_visitors',
};

// Generate a 24-character hexadecimal MongoDB ObjectId
export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const randomHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return (timestamp + randomHex).toLowerCase();
}

export class MongoLocalStore {
  private static instance: MongoLocalStore;

  public static getInstance(): MongoLocalStore {
    if (!MongoLocalStore.instance) {
      MongoLocalStore.instance = new MongoLocalStore();
    }
    return MongoLocalStore.instance;
  }

  // Retrieve all products from the local MongoDB collection
  public getProducts(): Product[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!raw) {
        this.saveProducts(INITIAL_PRODUCTS);
        return INITIAL_PRODUCTS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  // Save products to local MongoDB collection
  public saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.warn('Failed to persist products in localStorage', e);
    }
  }

  // Find product by id or _id
  public getProductById(id: string): Product | undefined {
    const products = this.getProducts();
    return products.find(p => p.id === id || p._id === id);
  }

  // Insert a new product document (MongoDB db.products.insertOne)
  public insertProduct(newProd: Omit<Product, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Product {
    const products = this.getProducts();
    const objectId = generateObjectId();
    const timestamp = new Date().toISOString();

    const product: Product = {
      ...newProd,
      id: `prod_${Date.now()}`,
      _id: objectId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const updated = [product, ...products];
    this.saveProducts(updated);
    return product;
  }

  // Update a product document (MongoDB db.products.updateOne)
  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id || p._id === id);
    if (index === -1) return null;

    const updatedProduct = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updatedProduct;
    this.saveProducts(products);
    return updatedProduct;
  }

  // Adjust stock level directly
  public updateStock(id: string, delta: number): Product | null {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id || p._id === id);
    if (index === -1) return null;

    const currentStock = products[index].stock;
    const newStock = Math.max(0, currentStock + delta);

    products[index] = {
      ...products[index],
      stock: newStock,
      updatedAt: new Date().toISOString(),
    };

    this.saveProducts(products);
    return products[index];
  }

  // Delete product (MongoDB db.products.deleteOne)
  public deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id && p._id !== id);
    if (filtered.length === products.length) return false;
    this.saveProducts(filtered);
    return true;
  }

  // Retrieve orders (MongoDB db.orders.find)
  public getOrders(): Order[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!raw) {
        this.saveOrders(INITIAL_ORDERS);
        return INITIAL_ORDERS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_ORDERS;
    }
  }

  // Save orders to local MongoDB collection
  public saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to persist orders in localStorage', e);
    }
  }

  // Create and record a new completed order (MongoDB db.orders.insertOne)
  public insertOrder(orderData: Omit<Order, 'id' | '_id' | 'orderNumber' | 'createdAt'>): Order {
    const orders = this.getOrders();
    const objectId = generateObjectId();
    const orderNumber = `AUR-${Math.floor(10000 + Math.random() * 90000)}`;
    const timestamp = new Date().toISOString();

    const order: Order = {
      ...orderData,
      id: `ord_${Date.now()}`,
      _id: objectId,
      orderNumber,
      createdAt: timestamp,
    };

    // Deduct stock for each item in the order
    order.items.forEach(item => {
      this.updateStock(item.productId, -item.quantity);
    });

    const updated = [order, ...orders];
    this.saveOrders(updated);
    return order;
  }

  // Update order status
  public updateOrderStatus(orderId: string, status: { paymentStatus?: Order['paymentStatus']; fulfillmentStatus?: Order['fulfillmentStatus']; trackingNumber?: string }): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId || o._id === orderId);
    if (index === -1) return null;

    orders[index] = {
      ...orders[index],
      ...status,
    };
    this.saveOrders(orders);
    return orders[index];
  }

  // Compute aggregated sales performance & analytics
  public getAnalyticsSummary(): AnalyticsSummary {
    const orders = this.getOrders();
    const products = this.getProducts();

    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    const grossRevenue = paidOrders.reduce((acc, o) => acc + o.totalAmount, 0);

    // Calculate approximate net profit based on costPrice of items
    let totalCost = 0;
    let totalUnitsSold = 0;

    paidOrders.forEach(o => {
      o.items.forEach(item => {
        totalUnitsSold += item.quantity;
        const prod = products.find(p => p.id === item.productId);
        const unitCost = prod ? prod.costPrice : item.price * 0.35;
        totalCost += unitCost * item.quantity;
      });
    });

    const netProfit = Math.max(0, grossRevenue - totalCost - (paidOrders.length * 5)); // minus merchant processing
    const averageOrderValue = paidOrders.length > 0 ? grossRevenue / paidOrders.length : 0;

    // Daily metrics (last 7 days)
    const dailyMap = new Map<string, { revenue: number; orders: number; visitors: number }>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap.set(dateStr, {
        revenue: 0,
        orders: 0,
        visitors: 120 + Math.floor(Math.sin(i * 1.5) * 30) + (i === 0 ? 45 : 0),
      });
    }

    paidOrders.forEach(o => {
      const dateStr = o.createdAt.split('T')[0];
      if (dailyMap.has(dateStr)) {
        const curr = dailyMap.get(dateStr)!;
        curr.revenue += o.totalAmount;
        curr.orders += 1;
      }
    });

    const dailyMetrics: DailyMetric[] = Array.from(dailyMap.entries()).map(([date, val]) => ({
      date,
      revenue: Math.round(val.revenue),
      orders: val.orders,
      visitors: val.visitors,
    }));

    // Category breakdown
    const catMap: Record<string, { revenue: number; units: number; displayName: string }> = {
      glasses: { revenue: 0, units: 0, displayName: 'Eyewear & Optical' },
      clothes: { revenue: 0, units: 0, displayName: 'Atelier Clothing' },
      accessories: { revenue: 0, units: 0, displayName: 'Bags & Leather' },
      footwear: { revenue: 0, units: 0, displayName: 'Footwear & Loafers' },
    };

    paidOrders.forEach(o => {
      o.items.forEach(item => {
        const cat = item.category || 'clothes';
        if (catMap[cat]) {
          catMap[cat].revenue += item.price * item.quantity;
          catMap[cat].units += item.quantity;
        }
      });
    });

    const categoryMetrics: CategoryMetric[] = Object.entries(catMap).map(([cat, data]) => ({
      category: cat as any,
      displayName: data.displayName,
      revenue: Math.round(data.revenue),
      units: data.units,
      share: grossRevenue > 0 ? Math.round((data.revenue / grossRevenue) * 100) : 25,
    }));

    // Traffic sources
    const trafficSources = [
      { source: 'Direct & Brand Organic', percentage: 44, visitors: 1420 },
      { source: 'Editorial & Fashion Media', percentage: 28, visitors: 904 },
      { source: 'Instagram / Visual Showcase', percentage: 18, visitors: 580 },
      { source: 'VIP Client Referral', percentage: 10, visitors: 320 },
    ];

    return {
      grossRevenue: Math.round(grossRevenue * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      totalOrders: paidOrders.length,
      totalUnitsSold,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      conversionRate: 3.42,
      activeVisitors: 28,
      cartAbandonmentRate: 21.6,
      repeatCustomerRate: 38.5,
      dailyMetrics,
      categoryMetrics,
      trafficSources,
    };
  }

  // Export full raw MongoDB JSON dataset
  public exportMongoDataset(): {
    database: string;
    exportedAt: string;
    collections: {
      products: Product[];
      orders: Order[];
    };
  } {
    return {
      database: 'aura_store',
      exportedAt: new Date().toISOString(),
      collections: {
        products: this.getProducts(),
        orders: this.getOrders(),
      },
    };
  }

  // Reset collections to default seed
  public resetToSeed(): void {
    this.saveProducts(INITIAL_PRODUCTS);
    this.saveOrders(INITIAL_ORDERS);
  }
}

export const mongoStore = MongoLocalStore.getInstance();
