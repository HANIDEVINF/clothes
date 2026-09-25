import { BusinessIndustryConfig, BusinessIndustryId, BusinessProduct, BusinessOrder, BusinessStats } from './types';
import { CASUAL_BUSINESS_CONFIG } from '../data/casualAlgeriaData';

export const ALL_BUSINESSES: Record<BusinessIndustryId, BusinessIndustryConfig> = {
  casual_men: CASUAL_BUSINESS_CONFIG,
};

export const BUSINESS_IDS: BusinessIndustryId[] = ['casual_men'];

class BusinessStorageManager {
  private getStorageKey(businessId: BusinessIndustryId, entity: string): string {
    return `casual29_store_${businessId}_${entity}`;
  }

  // Get products with local storage persistence
  getProducts(businessId: BusinessIndustryId = 'casual_men'): BusinessProduct[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey(businessId, 'products'));
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading business products', e);
    }
    const initial = ALL_BUSINESSES[businessId]?.sampleProducts || CASUAL_BUSINESS_CONFIG.sampleProducts;
    this.saveProducts(businessId, initial);
    return initial;
  }

  saveProducts(businessId: BusinessIndustryId = 'casual_men', products: BusinessProduct[]): void {
    try {
      localStorage.setItem(this.getStorageKey(businessId, 'products'), JSON.stringify(products));
    } catch (e) {
      console.error('Error saving business products', e);
    }
  }

  // Stock manipulation
  updateStock(businessId: BusinessIndustryId = 'casual_men', productId: string, delta: number): void {
    const products = this.getProducts(businessId);
    const updated = products.map((p) => {
      if (p.id === productId) {
        const nextStock = Math.max(0, p.stock + delta);
        return { ...p, stock: nextStock };
      }
      return p;
    });
    this.saveProducts(businessId, updated);
  }

  // Price adjustment in DZD
  updatePrice(businessId: BusinessIndustryId = 'casual_men', productId: string, newPrice: number): void {
    const products = this.getProducts(businessId);
    const updated = products.map((p) => {
      if (p.id === productId) {
        return { ...p, price: Math.max(100, newPrice) };
      }
      return p;
    });
    this.saveProducts(businessId, updated);
  }

  // Add product
  addProduct(businessId: BusinessIndustryId = 'casual_men', newProduct: BusinessProduct): void {
    const products = this.getProducts(businessId);
    this.saveProducts(businessId, [newProduct, ...products]);
  }

  // Delete product
  deleteProduct(businessId: BusinessIndustryId = 'casual_men', productId: string): void {
    const products = this.getProducts(businessId);
    this.saveProducts(businessId, products.filter((p) => p.id !== productId));
  }

  // Orders
  getOrders(businessId: BusinessIndustryId = 'casual_men'): BusinessOrder[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey(businessId, 'orders'));
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading business orders', e);
    }
    const initial = ALL_BUSINESSES[businessId]?.sampleOrders || CASUAL_BUSINESS_CONFIG.sampleOrders;
    this.saveOrders(businessId, initial);
    return initial;
  }

  saveOrders(businessId: BusinessIndustryId = 'casual_men', orders: BusinessOrder[]): void {
    try {
      localStorage.setItem(this.getStorageKey(businessId, 'orders'), JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving business orders', e);
    }
  }

  addOrder(businessId: BusinessIndustryId = 'casual_men', order: BusinessOrder): void {
    const orders = this.getOrders(businessId);
    this.saveOrders(businessId, [order, ...orders]);
  }

  updateOrderStatus(
    businessId: BusinessIndustryId = 'casual_men',
    orderId: string,
    status: BusinessOrder['fulfillmentStatus']
  ): void {
    const orders = this.getOrders(businessId);
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, fulfillmentStatus: status };
      }
      return o;
    });
    this.saveOrders(businessId, updated);
  }

  // Compute live stats in Algerian Dinar
  getStats(businessId: BusinessIndustryId = 'casual_men'): BusinessStats {
    const products = this.getProducts(businessId);
    const orders = this.getOrders(businessId);

    const grossRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus !== 'refunded' ? o.totalAmount : 0), 0);
    const totalUnitsInStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStockCount = products.filter((p) => p.stock <= 5).length;

    // Approximate cost
    const totalCosts = orders.reduce((sum, o) => {
      return (
        sum +
        o.items.reduce((iSum, item) => {
          const prod = products.find((p) => p.id === item.productId);
          return iSum + (prod ? prod.costPrice * item.quantity : item.price * 0.5 * item.quantity);
        }, 0)
      );
    }, 0);

    const netProfit = Math.max(0, grossRevenue - totalCosts);

    return {
      grossRevenue,
      netProfit,
      orderCount: orders.length,
      totalUnitsInStock,
      lowStockCount,
      activeUsers: 142 + orders.length * 3,
      conversionRate: 4.8,
    };
  }
}

export const businessStorage = new BusinessStorageManager();
