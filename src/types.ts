export type ProductCategory = 'clothes' | 'glasses' | 'accessories' | 'footwear';

export interface ProductSpecs {
  material?: string;
  frameMaterial?: string;
  lensType?: string;
  dimensions?: string; // e.g., "52-19-145mm" for glasses
  careInstructions?: string;
  weight?: string;
  origin?: string;
}

export interface Product {
  id: string;
  _id: string; // MongoDB ObjectId representation
  name: string;
  slug: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number;
  costPrice: number; // for merchant profit calculation
  stock: number;
  sku: string;
  images: string[];
  description: string;
  features: string[];
  specs: ProductSpecs;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  rating: number;
  reviewsCount: number;
  tags: string[];
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  category: ProductCategory;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  image: string;
}

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type FulfillmentStatus = 'unfulfilled' | 'processing' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  _id: string; // MongoDB ObjectId representation
  orderNumber: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  totalAmount: number;
  paymentMethod: 'credit_card' | 'apple_pay' | 'google_pay' | 'crypto';
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  trackingNumber?: string;
  transactionToken: string;
  createdAt: string;
}

export interface DailyMetric {
  date: string;
  revenue: number;
  orders: number;
  visitors: number;
}

export interface CategoryMetric {
  category: ProductCategory;
  displayName: string;
  revenue: number;
  units: number;
  share: number;
}

export interface AnalyticsSummary {
  grossRevenue: number;
  netProfit: number;
  totalOrders: number;
  totalUnitsSold: number;
  averageOrderValue: number;
  conversionRate: number;
  activeVisitors: number;
  cartAbandonmentRate: number;
  repeatCustomerRate: number;
  dailyMetrics: DailyMetric[];
  categoryMetrics: CategoryMetric[];
  trafficSources: { source: string; percentage: number; visitors: number }[];
}

export type ActiveTab = 'shop' | 'admin' | 'analytics' | 'database';
