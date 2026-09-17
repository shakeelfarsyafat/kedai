export type CategoryId =
  | 'all'
  | 'coffee'
  | 'espresso'
  | 'fusion-coffee'
  | 'milk-tea'
  | 'macchiato'
  | 'milk-series'
  | 'tea-series'
  | 'lokale-in-250'
  | 'lokale-in-1l'
  | 'pastry'
  | 'main-dish'
  | 'side-dish'
  | 'manual-brew'
  | 'cold-brew'
  | 'snacks'
  | (string & {});

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  tastingNotes?: string[];
  price: number;
  image: string;
  isBestSeller?: boolean;
  isBaristaPick?: boolean;
  available: boolean;
  allowCustomization: boolean;
}

export type SugarLevel = 'normal' | 'less' | 'low' | 'none';
export type IceLevel = 'normal' | 'less' | 'none' | 'hot';
export type MilkOption = 'dairy' | 'oatmilk' | 'almond';

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export interface Customization {
  sugarLevel: SugarLevel;
  iceLevel: IceLevel;
  milkOption: MilkOption;
  selectedAddOns: string[];
  notes?: string;
}

export interface CartItem {
  id: string; // Unique hash or id based on item + options
  menuItem: MenuItem;
  quantity: number;
  customization: Customization;
  itemPrice: number; // base + milk + addons
  totalPrice: number; // itemPrice * quantity
}

export type OrderType = 'dine_in' | 'takeaway';
export type OrderStatus = 'new' | 'brewing' | 'ready' | 'completed' | 'cancelled';
export type PaymentMethod = 'qris' | 'cash' | 'card';
export type PaymentStatus = 'paid' | 'pending';

export interface Order {
  id: string; // e.g. KRO-2401
  customerName: string;
  customerPhone?: string;
  orderType: OrderType;
  tableNumber?: string;
  items: CartItem[];
  subtotal: number;
  tax: number; // 10% PB1
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  notes?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface OrderNotification {
  orderId: string;
  customerName: string;
  total: number;
  type: OrderType;
  tableNumber?: string;
  timestamp: string;
}

export interface HourlySales {
  hour: string;
  revenue: number;
  orders: number;
}

export interface TopSellingItem {
  name: string;
  category: string;
  quantitySold: number;
  revenue: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}

export interface AnalyticsSummary {
  totalRevenueToday: number;
  totalOrdersToday: number;
  averageOrderValue: number;
  activeOrdersCount: number;
  hourlyRevenue: HourlySales[];
  topSellingItems: TopSellingItem[];
  categoryDistribution: CategoryDistribution[];
}
