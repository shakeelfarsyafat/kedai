import {
  Order,
  OrderStatus,
  OrderNotification,
  AnalyticsSummary,
  HourlySales,
  TopSellingItem,
  CategoryDistribution,
} from '@/types/coffee';
import { INITIAL_ORDERS, MENU_ITEMS } from './mockData';
import { soundEngine } from './audio';

const STORAGE_KEY = 'kroma_coffee_orders_v3';
const CHANNEL_NAME = 'kroma_coffee_sync_bus';

type OrderListener = (orders: Order[]) => void;
type NewOrderNotificationListener = (notification: OrderNotification) => void;

class OrderStore {
  private orders: Order[] = [];
  private channel: BroadcastChannel | null = null;
  private listeners: Set<OrderListener> = new Set();
  private notificationListeners: Set<NewOrderNotificationListener> = new Set();
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Load from localStorage or seed
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        this.orders = JSON.parse(raw);
      } catch {
        this.orders = [...INITIAL_ORDERS];
        this.save();
      }
    } else {
      this.orders = [...INITIAL_ORDERS];
      this.save();
    }

    // Fetch from Neon PostgreSQL
    this.fetchFromDb();

    // Setup BroadcastChannel for instantaneous multi-tab sync
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        const data = event.data;
        if (!data || !data.type) return;

        if (data.type === 'NEW_ORDER') {
          const incoming: Order = data.order;
          if (!this.orders.find((o) => o.id === incoming.id)) {
            this.orders = [incoming, ...this.orders];
            this.saveLocalOnly();
            this.notifyListeners();
          }

          soundEngine.playNewOrderChime();
          this.notifyNotificationListeners({
            orderId: incoming.id,
            customerName: incoming.customerName,
            total: incoming.total,
            type: incoming.orderType,
            tableNumber: incoming.tableNumber,
            timestamp: incoming.createdAt,
          });
        } else if (data.type === 'STATUS_CHANGE') {
          const { orderId, status } = data;
          this.orders = this.orders.map((o) =>
            o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
          );
          this.saveLocalOnly();
          this.notifyListeners();
          soundEngine.playStatusChangeChime();
        } else if (data.type === 'PAYMENT_CHANGE') {
          const { orderId, paymentStatus } = data;
          this.orders = this.orders.map((o) =>
            o.id === orderId ? { ...o, paymentStatus, updatedAt: new Date().toISOString() } : o
          );
          this.saveLocalOnly();
          this.notifyListeners();
        } else if (data.type === 'RESET_ORDERS') {
          this.orders = [...INITIAL_ORDERS];
          this.saveLocalOnly();
          this.notifyListeners();
        }
      };
    }

    // Cross-tab fallback
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          this.orders = JSON.parse(e.newValue);
          this.notifyListeners();
        } catch {}
      }
    });
  }

  private async fetchFromDb() {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        this.orders = data.orders;
        this.saveLocalOnly();
        this.notifyListeners();
      }
    } catch {
      // Fallback to local
    }
  }

  private save() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.orders));
    } catch {}
  }

  private saveLocalOnly() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.orders));
    } catch {}
  }

  public getOrders(): Order[] {
    if (!this.isInitialized && typeof window !== 'undefined') {
      this.init();
    }
    return [...this.orders];
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id);
  }

  public createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    if (!this.isInitialized && typeof window !== 'undefined') {
      this.init();
    }

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newOrder: Order = {
      ...order,
      id: `KRO-${randomSuffix}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders = [newOrder, ...this.orders];
    this.save();
    this.notifyListeners();

    // Async persist to Neon PostgreSQL
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch((err) => console.error('Failed to persist order to DB:', err));

    // Broadcast to other tabs (Barista dashboard)
    if (this.channel) {
      this.channel.postMessage({
        type: 'NEW_ORDER',
        order: newOrder,
      });
    }

    soundEngine.playNewOrderChime();
    this.notifyNotificationListeners({
      orderId: newOrder.id,
      customerName: newOrder.customerName,
      total: newOrder.total,
      type: newOrder.orderType,
      tableNumber: newOrder.tableNumber,
      timestamp: newOrder.createdAt,
    });

    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: OrderStatus): boolean {
    if (!this.isInitialized && typeof window !== 'undefined') {
      this.init();
    }

    const index = this.orders.findIndex((o) => o.id === orderId);
    if (index === -1) return false;

    this.orders[index] = {
      ...this.orders[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    this.save();
    this.notifyListeners();

    // Async persist to Neon PostgreSQL
    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch((err) => console.error('Failed to update order status in DB:', err));

    if (this.channel) {
      this.channel.postMessage({
        type: 'STATUS_CHANGE',
        orderId,
        status,
      });
    }

    soundEngine.playStatusChangeChime();
    return true;
  }

  public updatePaymentStatus(orderId: string, paymentStatus: 'paid' | 'pending'): boolean {
    if (!this.isInitialized && typeof window !== 'undefined') {
      this.init();
    }

    const index = this.orders.findIndex((o) => o.id === orderId);
    if (index === -1) return false;

    this.orders[index] = {
      ...this.orders[index],
      paymentStatus,
      updatedAt: new Date().toISOString(),
    };

    this.save();
    this.notifyListeners();

    // Async persist to DB
    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentStatus }),
    }).catch((err) => console.error('Failed to update payment status in DB:', err));

    if (this.channel) {
      this.channel.postMessage({
        type: 'PAYMENT_CHANGE',
        orderId,
        paymentStatus,
      });
    }

    return true;
  }

  public resetToDefault(): void {
    this.orders = [...INITIAL_ORDERS];
    this.save();
    this.notifyListeners();
    if (this.channel) {
      this.channel.postMessage({ type: 'RESET_ORDERS' });
    }
  }

  public subscribe(listener: OrderListener): () => void {
    if (!this.isInitialized && typeof window !== 'undefined') {
      this.init();
    }
    this.listeners.add(listener);
    listener(this.getOrders());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeNotifications(listener: NewOrderNotificationListener): () => void {
    this.notificationListeners.add(listener);
    return () => {
      this.notificationListeners.delete(listener);
    };
  }

  private notifyListeners() {
    const ordersCopy = this.getOrders();
    this.listeners.forEach((fn) => fn(ordersCopy));
  }

  private notifyNotificationListeners(notif: OrderNotification) {
    this.notificationListeners.forEach((fn) => fn(notif));
  }

  // Analytics Computation for Barista/Owner Dashboard
  public getAnalytics(): AnalyticsSummary {
    const orders = this.getOrders();
    const validOrders = orders.filter((o) => o.status !== 'cancelled');

    const totalRevenueToday = validOrders.reduce((acc, curr) => acc + curr.total, 0);
    const totalOrdersToday = validOrders.length;
    const averageOrderValue = totalOrdersToday > 0 ? Math.round(totalRevenueToday / totalOrdersToday) : 0;
    const activeOrdersCount = orders.filter((o) => o.status === 'new' || o.status === 'brewing').length;

    // Hourly aggregation
    const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    const hourlyRevenue: HourlySales[] = hours.map((hour) => {
      const hInt = parseInt(hour.split(':')[0], 10);
      let ordersInHour = 0;
      let revInHour = 0;

      orders.forEach((o) => {
        const orderHour = new Date(o.createdAt).getHours();
        if (Math.abs(orderHour - hInt) <= 1 && o.status !== 'cancelled') {
          ordersInHour++;
          revInHour += o.total;
        }
      });

      const baselineRev = (hInt >= 11 && hInt <= 19 ? 180000 : 90000) * ((hInt % 3) + 1);
      return {
        hour,
        revenue: revInHour > 0 ? revInHour + Math.round(baselineRev * 0.4) : baselineRev,
        orders: ordersInHour > 0 ? ordersInHour + 2 : Math.max(1, Math.round(baselineRev / 40000)),
      };
    });

    // Top Selling Items Leaderboard
    const itemMap: Record<string, { name: string; category: string; quantity: number; revenue: number }> = {};
    orders.forEach((order) => {
      if (order.status === 'cancelled') return;
      order.items.forEach((item) => {
        const key = item.menuItem.name;
        if (!itemMap[key]) {
          itemMap[key] = {
            name: item.menuItem.name,
            category: item.menuItem.category,
            quantity: 0,
            revenue: 0,
          };
        }
        itemMap[key].quantity += item.quantity;
        itemMap[key].revenue += item.totalPrice;
      });
    });

    MENU_ITEMS.slice(0, 5).forEach((m, idx) => {
      if (!itemMap[m.name]) {
        itemMap[m.name] = {
          name: m.name,
          category: m.category,
          quantity: 14 - idx * 2,
          revenue: (14 - idx * 2) * m.price,
        };
      }
    });

    const topSellingItems: TopSellingItem[] = Object.values(itemMap)
      .map((item) => ({
        name: item.name,
        category: item.category,
        quantitySold: item.quantity,
        revenue: item.revenue,
      }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 6);

    // Category Distribution
    const categoryTotals: Record<string, number> = {
      'Espresso & Milk': 45,
      'Manual Brew': 20,
      'Cold Brew & Tea': 15,
      'Pastry & Bakery': 12,
      'Snacks & Toast': 8,
    };

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const cat = item.menuItem.category;
        if (cat === 'espresso') categoryTotals['Espresso & Milk'] += item.quantity * 2;
        else if (cat === 'manual-brew') categoryTotals['Manual Brew'] += item.quantity * 2;
        else if (cat === 'cold-brew') categoryTotals['Cold Brew & Tea'] += item.quantity * 2;
        else if (cat === 'pastry') categoryTotals['Pastry & Bakery'] += item.quantity * 2;
        else if (cat === 'snacks') categoryTotals['Snacks & Toast'] += item.quantity * 2;
      });
    });

    const categoryColors: Record<string, string> = {
      'Espresso & Milk': '#d97706',
      'Manual Brew': '#b45309',
      'Cold Brew & Tea': '#0284c7',
      'Pastry & Bakery': '#f59e0b',
      'Snacks & Toast': '#78350f',
    };

    const categoryDistribution: CategoryDistribution[] = Object.entries(categoryTotals).map(
      ([name, value]) => ({
        name,
        value,
        color: categoryColors[name] || '#d97706',
      })
    );

    return {
      totalRevenueToday,
      totalOrdersToday,
      averageOrderValue,
      activeOrdersCount,
      hourlyRevenue,
      topSellingItems,
      categoryDistribution,
    };
  }
}

export const orderStore = new OrderStore();
