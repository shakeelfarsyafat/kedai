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
      <div className="min-h-screen bg-[#070e12] flex items-center justify-center text-cyan-300 text-xs">
        Memverifikasi sesi keamanan...
      </div>
    );
  }

  const activeOrdersCount = orders.filter((o) => o.status === 'new' || o.status === 'brewing').length;
  const newOrdersCount = orders.filter((o) => o.status === 'new').length;

  return (
    <div className="min-h-screen bg-[#070e12] text-slate-100 flex flex-col selection:bg-[#007b9e] selection:text-white">
      {/* Top Bar Barista Station */}
      <header className="sticky top-0 z-30 bg-[#0a141a]/95 backdrop-blur-md border-b border-[#17303d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Title & Brand */}
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#007b9e] to-[#075f7e] flex items-center justify-center shadow-lg shadow-cyan-950/60 border border-cyan-500/30">
                <Coffee className="w-6 h-6 text-white stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-wider text-white uppercase">
                    LOKALE
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#007b9e]/20 text-cyan-300 border border-[#007b9e]/40">
                    Barista Station
                  </span>
                  {newOrdersCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white animate-pulse">
                      {newOrdersCount} Baru!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
                  <span>Waktu: {currentTime || '00:00:00'}</span>
                  <span>•</span>
                  <span className="text-cyan-400 font-semibold">{activeOrdersCount} Pesanan Aktif</span>
                </div>
              </div>
            </div>

            {/* Middle/Right Controls: Audio Toggle, User Info, Portal Link, Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              <AudioAlertManager />

              {/* User Identity Chip */}
              {currentUser && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0d171d] border border-[#1c3340] text-xs">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <span className="font-bold text-white block leading-tight">{currentUser.name}</span>
                    <span className="text-[10px] text-slate-400 block">{currentUser.shift}</span>
                  </div>
                </div>
              )}

              <Link
                href="/"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0d171d] hover:bg-[#152733] text-slate-300 hover:text-white text-xs font-semibold border border-[#1c3340] transition-all"
              >
                <Store className="w-3.5 h-3.5 text-cyan-400" />
                <span>Portal Pelanggan</span>
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl bg-[#0d171d] hover:bg-red-950/70 text-slate-400 hover:text-red-300 border border-[#1c3340] hover:border-red-900 transition-all"
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
                  ? 'bg-[#007b9e] text-white shadow-lg shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-[#0d171d]'
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
                  ? 'bg-[#007b9e] text-white shadow-lg shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-[#0d171d]'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Atur Menu</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-[#007b9e] text-white shadow-lg shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-[#0d171d]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Statistik & Analisis</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-[#007b9e] text-white shadow-lg shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-[#0d171d]'
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
          <div className="w-80 bg-gradient-to-r from-[#007b9e] to-[#075f7e] text-white p-4 rounded-2xl shadow-2xl border border-cyan-400/40 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-[#075f7e] flex items-center justify-center flex-shrink-0 shadow-md">
                <Bell className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-black tracking-wider bg-black/30 px-1.5 py-0.5 rounded">
                    Pesanan Baru Masuk!
                  </span>
                </div>
                <h4 className="font-extrabold text-sm mt-0.5">{toastNotification.orderId}</h4>
                <p className="text-xs text-cyan-100 font-medium">
                  {toastNotification.customerName} •{' '}
                  {toastNotification.tableNumber || 'Takeaway'}
                </p>
                <p className="text-xs font-bold text-white mt-1">
                  {formatRupiah(toastNotification.total)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setToastNotification(null)}
              className="text-cyan-200 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
