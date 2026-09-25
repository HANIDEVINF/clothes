export type BusinessIndustryId = 'casual_men';

export type LanguageCode = 'fr' | 'ar' | 'en';

export interface BusinessTheme {
  primary: string;
  primaryHover: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
  bgDark: string;
  surfaceCard: string;
  surfaceMuted: string;
  borderColor: string;
  textHeading: string;
  textBody: string;
  fontHeadingClass: string;
  fontBodyClass: string;
  glowEffect: string;
  gradientBg: string;
  heroGradient: string;
  accentGlow: string;
}

export interface BusinessProduct {
  id: string;
  sku: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  subtitle: string;
  subtitleAr?: string;
  category: string;
  categoryAr?: string;
  price: number; // in DZD (DA)
  costPrice: number; // in DZD (DA)
  compareAtPrice?: number;
  stock: number;
  sizes: string[];
  colors?: string[];
  images: string[];
  description: string;
  descriptionAr?: string;
  specs: Record<string, string>;
  highlights: string[];
  rating: number;
  reviewsCount: number;
  isFeatured?: boolean;
  badge?: string;
  badgeAr?: string;
}

export interface AlgerianWilaya {
  code: string;
  name: string;
  nameAr: string;
  deliveryHomeDZD: number;
  deliveryStopDeskDZD: number;
  zone: 'centre' | 'ouest' | 'est' | 'sud';
}

export interface BusinessOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerWilaya: string;
  customerCommune?: string;
  deliveryType: 'home' | 'stopdesk';
  shippingCost: number;
  paymentMethod: 'cash_on_delivery';
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    sku: string;
    selectedSize?: string;
  }>;
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  fulfillmentStatus: 'unfulfilled' | 'confirmed_phone' | 'processing' | 'shipped_yalidine' | 'delivered' | 'cancelled';
  date: string;
  trackingNumber?: string;
  notes?: string;
}

export interface BusinessStats {
  grossRevenue: number;
  netProfit: number;
  orderCount: number;
  totalUnitsInStock: number;
  lowStockCount: number;
  activeUsers: number;
  conversionRate: number;
}

export interface BusinessIndustryConfig {
  id: BusinessIndustryId;
  folderName: string;
  clientName: string;
  clientInstagram: string;
  tagline: string;
  taglineAr: string;
  industryLabel: string;
  address: string;
  phone: string;
  whatsappUrl: string;
  instagramUrl: string;
  mapsUrl: string;
  desktopAppTitle: string;
  currencySymbol: string;
  theme: BusinessTheme;
  categories: string[];
  categoriesAr: string[];
  sampleProducts: BusinessProduct[];
  sampleOrders: BusinessOrder[];
  initialStats: BusinessStats;
}
