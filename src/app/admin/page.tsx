'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { orderStore } from '@/lib/orderStore';
import { authService, AdminUser } from '@/lib/auth';
import { Order, OrderStatus, OrderNotification } from '@/types/coffee';
import { MENU_ITEMS } from '@/lib/mockData';
import { AudioAlertManager } from '@/components/admin/AudioAlertManager';
import { KanbanBoard } from '@/components/admin/KanbanBoard';
import { AnalyticsView } from '@/components/admin/AnalyticsView';
import { OrderHistoryTable } from '@/components/admin/OrderHistoryTable';
import { MenuManager } from '@/components/admin/MenuManager';
import { formatRupiah } from '@/lib/utils';
import {
  Coffee,
  LayoutDashboard,
  BarChart3,
  History,
  Store,
  Bell,
  Sparkles,
  CheckCircle2,
  X,
  Volume2,
  UtensilsCrossed,
  LogOut,
  UserCheck,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'kanban' | 'menu' | 'analytics' | 'history'>('kanban');
  const [toastNotification, setToastNotification] = useState<OrderNotification | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Authentication guard
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/admin/login');
    } else {
      setCurrentUser(authService.getCurrentUser());
      setIsAuthChecked(true);
    }
  }, [router]);

  // Subscribe to real-time order store
  useEffect(() => {
    if (!isAuthChecked) return;

    const unsubOrders = orderStore.subscribe((updatedOrders) => {
      setOrders(updatedOrders);
    });

    const unsubNotifs = orderStore.subscribeNotifications((notif) => {
      setToastNotification(notif);
      setTimeout(() => {
        setToastNotification(null);
      }, 7000);
    });

    // Clock
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);

    return () => {
      unsubOrders();
      unsubNotifs();
      clearInterval(clockInterval);
    };
  }, [isAuthChecked]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    orderStore.updateOrderStatus(orderId, newStatus);
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda ingin keluar dari sesi shift barista saat ini?')) {
      authService.logout();
      router.push('/admin/login');
    }
  };

  // Helper to simulate an incoming customer order for real-time demonstration
  const handleSimulateNewOrder = () => {
    const randomItems = [
      MENU_ITEMS[Math.floor(Math.random() * 3)],
      MENU_ITEMS[Math.floor(4 + Math.random() * 4)],
    ];

    const isDineIn = Math.random() > 0.3;
    const randomTable = `Meja ${String(Math.floor(1 + Math.random() * 15)).padStart(2, '0')}`;
    const sampleNames = ['Reza Firmansyah', 'Citra Dewi', 'Bambang Tri', 'Nadya Putri', 'Fahmi Idris'];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];

    const subtotal = randomItems.reduce((acc, curr) => acc + curr.price, 0);
    const tax = Math.round(subtotal * 0.1);

    orderStore.createOrder({
      customerName: randomName,
      customerPhone: '0812' + Math.floor(10000000 + Math.random() * 90000000),
      orderType: isDineIn ? 'dine_in' : 'takeaway',
      tableNumber: isDineIn ? randomTable : undefined,
      items: randomItems.map((item, idx) => ({
        id: `sim-${item.id}-${idx}`,
        menuItem: item,
        quantity: 1,
        customization: {
          sugarLevel: 'less',
          iceLevel: 'normal',
          milkOption: 'dairy',
          selectedAddOns: [],
          notes: idx === 0 ? 'Jangan terlalu manis ya kak' : undefined,
        },
        itemPrice: item.price,
        totalPrice: item.price,
      })),
      subtotal,
      tax,
      total: subtotal + tax,
      paymentMethod: 'qris',
      paymentStatus: 'paid',
      status: 'new',
      notes: 'Pesanan simulasi demo',
    });
  };

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-[#110b07] flex items-center justify-center text-amber-300 text-xs">
        Memverifikasi sesi keamanan...
      </div>
    );
  }

  const activeOrdersCount = orders.filter((o) => o.status === 'new' || o.status === 'brewing').length;
  const newOrdersCount = orders.filter((o) => o.status === 'new').length;

  return (
    <div className="min-h-screen bg-[#110b07] text-stone-100 flex flex-col selection:bg-amber-600 selection:text-white">
      {/* Top Bar Barista Station */}
      <header className="sticky top-0 z-30 glass-panel border-b border-amber-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Title & Brand */}
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg shadow-amber-950/60 border border-amber-500/30">
                <Coffee className="w-6 h-6 text-stone-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-wider text-amber-100 uppercase">
                    KROMA
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Barista Station
                  </span>
                  {newOrdersCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white animate-pulse">
                      {newOrdersCount} Baru!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-400 font-mono mt-0.5">
                  <span>Waktu: {currentTime || '00:00:00'}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold">{activeOrdersCount} Pesanan Aktif</span>
                </div>
              </div>
            </div>

            {/* Middle/Right Controls: Audio Toggle, User Info, Portal Link, Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              <AudioAlertManager />

              {/* User Identity Chip */}
              {currentUser && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900/80 border border-stone-800 text-xs">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <span className="font-bold text-white block leading-tight">{currentUser.name}</span>
                    <span className="text-[10px] text-stone-400 block">{currentUser.shift}</span>
                  </div>
                </div>
              )}

              <Link
                href="/"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white text-xs font-semibold border border-stone-800 transition-all"
              >
                <Store className="w-3.5 h-3.5 text-amber-400" />
                <span>Portal Pelanggan</span>
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl bg-stone-900 hover:bg-red-950 text-stone-400 hover:text-red-300 border border-stone-800 hover:border-red-900 transition-all"
                title="Keluar / Logout Shift"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'kanban'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-950'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Live Orders Kanban</span>
              {newOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-extrabold">
                  {newOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'menu'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-950'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Atur Menu</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-950'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Statistik & Analisis</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-950'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Riwayat Transaksi</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {activeTab === 'kanban' && (
          <KanbanBoard
            orders={orders}
            onStatusChange={handleStatusChange}
            onSimulateTestOrder={handleSimulateNewOrder}
          />
        )}

        {activeTab === 'menu' && <MenuManager />}

        {activeTab === 'analytics' && <AnalyticsView />}

        {activeTab === 'history' && <OrderHistoryTable orders={orders} />}
      </main>

      {/* Real-time Order Popup Toast Alert */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="w-80 bg-gradient-to-r from-amber-600 to-amber-800 text-white p-4 rounded-2xl shadow-2xl border border-amber-400/50 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-amber-950 flex items-center justify-center flex-shrink-0 shadow-md">
                <Bell className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-black tracking-wider bg-black/30 px-1.5 py-0.5 rounded">
                    Pesanan Baru Masuk!
                  </span>
                </div>
                <h4 className="font-extrabold text-sm mt-0.5">{toastNotification.orderId}</h4>
                <p className="text-xs text-amber-100 font-medium">
                  {toastNotification.customerName} •{' '}
                  {toastNotification.tableNumber || 'Takeaway'}
                </p>
                <p className="text-xs font-bold text-amber-200 mt-1">
                  {formatRupiah(toastNotification.total)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setToastNotification(null)}
              className="text-amber-200 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
