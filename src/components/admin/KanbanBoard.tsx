'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, OrderType } from '@/types/coffee';
import { formatRupiah, formatTimeAgo } from '@/lib/utils';
import {
  Clock,
  Coffee,
  CheckCircle2,
  AlertCircle,
  UtensilsCrossed,
  ShoppingBag,
  Sparkles,
  Search,
  PlusCircle,
  XCircle,
  Flame,
} from 'lucide-react';

interface KanbanBoardProps {
  orders: Order[];
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onSimulateTestOrder: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  orders,
  onStatusChange,
  onSimulateTestOrder,
}) => {
  const [filterType, setFilterType] = useState<'all' | OrderType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [, setTicker] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTicker((t) => t + 1), 15000);
    return () => clearInterval(timer);
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesType = filterType === 'all' || order.orderType === filterType;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.tableNumber && order.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const newOrders = filteredOrders.filter((o) => o.status === 'new');
  const brewingOrders = filteredOrders.filter((o) => o.status === 'brewing');
  const readyOrders = filteredOrders.filter((o) => o.status === 'ready');
  const finishedOrders = filteredOrders.filter(
    (o) => o.status === 'completed' || o.status === 'cancelled'
  );

  const columns: {
    id: OrderStatus | 'finished';
    title: string;
    icon: any;
    count: number;
    color: string;
    items: Order[];
  }[] = [
    {
      id: 'new',
      title: 'Pesanan Baru',
      icon: Clock,
      count: newOrders.length,
      color: 'border-amber-500/60 bg-amber-950/30 text-amber-400',
      items: newOrders,
    },
    {
      id: 'brewing',
      title: 'Sedang Diracik (Brewing)',
      icon: Coffee,
      count: brewingOrders.length,
      color: 'border-blue-500/60 bg-blue-950/30 text-blue-400',
      items: brewingOrders,
    },
    {
      id: 'ready',
      title: 'Siap Diambil / Diantar',
      icon: Sparkles,
      count: readyOrders.length,
      color: 'border-emerald-500/60 bg-emerald-950/30 text-emerald-400',
      items: readyOrders,
    },
    {
      id: 'finished',
      title: 'Selesai / Riwayat',
      icon: CheckCircle2,
      count: finishedOrders.length,
      color: 'border-stone-700 bg-stone-900/50 text-stone-400',
      items: finishedOrders.slice(0, 15),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Tablet POS Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#19100a] p-3.5 sm:p-4 rounded-2xl border border-stone-800 shadow-lg">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID, Nama, atau Meja..."
              className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Dine-in vs Takeaway filter */}
          <div className="flex items-center bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'all' ? 'bg-amber-600 text-white shadow' : 'text-stone-400'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType('dine_in')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                filterType === 'dine_in' ? 'bg-amber-600 text-white shadow' : 'text-stone-400'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Dine-in</span>
            </button>
            <button
              onClick={() => setFilterType('takeaway')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                filterType === 'takeaway' ? 'bg-amber-600 text-white shadow' : 'text-stone-400'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Takeaway</span>
            </button>
          </div>
        </div>

        {/* Quick Simulation Button */}
        <button
          onClick={onSimulateTestOrder}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-950 transition-all active:scale-95 whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Simulasi Pesanan Baru</span>
        </button>
      </div>

      {/* Kanban Grid (Tablet Landscape 4 cols, Tablet Portrait 2x2 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const ColIcon = col.icon;
          return (
            <div
              key={col.id}
              className="bg-[#170e08]/95 rounded-2xl border border-stone-800/80 p-3.5 sm:p-4 flex flex-col min-h-[550px] shadow-xl"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-800/80">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg border ${col.color}`}>
                    <ColIcon className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-xs sm:text-sm text-stone-200">{col.title}</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-stone-900 text-amber-300 border border-stone-800">
                  {col.count}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[720px] pr-1">
                {col.items.length === 0 ? (
                  <div className="h-36 flex flex-col items-center justify-center text-center p-4 border border-dashed border-stone-800 rounded-2xl">
                    <p className="text-xs text-stone-500">Tidak ada pesanan</p>
                  </div>
                ) : (
                  col.items.map((order) => {
                    const isNew = order.status === 'new';
                    return (
                      <div
                        key={order.id}
                        className={`p-3.5 sm:p-4 rounded-2xl bg-[#20140c] border transition-all duration-300 space-y-3 shadow-md ${
                          isNew
                            ? 'border-amber-500/80 shadow-amber-950/40 pulse-glow ring-1 ring-amber-500/30'
                            : order.status === 'brewing'
                            ? 'border-blue-500/50 shadow-blue-950/20'
                            : order.status === 'ready'
                            ? 'border-emerald-500/50 shadow-emerald-950/20'
                            : 'border-stone-800 opacity-80'
                        }`}
                      >
                        {/* Order Header: ID, Type badge, Elapsed time */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-amber-300 tracking-wider">
                              {order.id}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                order.orderType === 'dine_in'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-900/60'
                                  : 'bg-sky-950 text-sky-300 border border-sky-900/60'
                              }`}
                            >
                              {order.orderType === 'dine_in' ? (
                                <>
                                  <UtensilsCrossed className="w-2.5 h-2.5" />
                                  <span>{order.tableNumber || 'Dine-in'}</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-2.5 h-2.5" />
                                  <span>Takeaway</span>
                                </>
                              )}
                            </span>
                          </div>

                          <span className="text-[11px] text-stone-400 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-stone-500" />
                            {formatTimeAgo(order.createdAt)}
                          </span>
                        </div>

                        {/* Customer name & total */}
                        <div className="flex items-baseline justify-between border-b border-stone-800/80 pb-2">
                          <h4 className="font-bold text-sm text-white">{order.customerName}</h4>
                          <span className="text-xs font-extrabold text-amber-400">
                            {formatRupiah(order.total)}
                          </span>
                        </div>

                        {/* Items ordered with customizations */}
                        <div className="space-y-1.5 text-xs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="bg-stone-900/60 p-2 rounded-xl">
                              <div className="flex justify-between font-semibold text-stone-200">
                                <span>
                                  <strong className="text-amber-300">{item.quantity}x</strong>{' '}
                                  {item.menuItem.name}
                                </span>
                              </div>

                              {item.customization && (
                                <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-stone-400">
                                  {item.customization.sugarLevel !== 'normal' && (
                                    <span className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
                                      {item.customization.sugarLevel} sugar
                                    </span>
                                  )}
                                  {item.customization.iceLevel !== 'normal' && (
                                    <span className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
                                      {item.customization.iceLevel} ice
                                    </span>
                                  )}
                                  {item.customization.milkOption !== 'dairy' && (
                                    <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">
                                      {item.customization.milkOption}
                                    </span>
                                  )}
                                  {item.customization.selectedAddOns.length > 0 && (
                                    <span className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
                                      +{item.customization.selectedAddOns.length} extra
                                    </span>
                                  )}
                                </div>
                              )}

                              {item.customization?.notes && (
                                <p className="text-[10px] text-amber-200/90 italic mt-0.5">
                                  "{item.customization.notes}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {order.notes && (
                          <div className="text-[11px] p-2 rounded-lg bg-amber-950/30 border border-amber-900/30 text-amber-300">
                            Catatan: {order.notes}
                          </div>
                        )}

                        {/* Large, Finger-Friendly Action Buttons for Tablet POS */}
                        <div className="pt-2 border-t border-stone-800/80 flex items-center gap-2">
                          {order.status === 'new' && (
                            <>
                              <button
                                onClick={() => onStatusChange(order.id, 'brewing')}
                                className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                              >
                                <Coffee className="w-4 h-4" />
                                <span>Mulai Seduh</span>
                              </button>
                              <button
                                onClick={() => onStatusChange(order.id, 'cancelled')}
                                className="min-h-[44px] px-3 rounded-xl text-stone-500 hover:text-red-400 hover:bg-stone-900 transition-colors flex items-center justify-center"
                                title="Batalkan"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}

                          {order.status === 'brewing' && (
                            <button
                              onClick={() => onStatusChange(order.id, 'ready')}
                              className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                            >
                              <Sparkles className="w-4 h-4" />
                              <span>Tandai Siap</span>
                            </button>
                          )}

                          {order.status === 'ready' && (
                            <button
                              onClick={() => onStatusChange(order.id, 'completed')}
                              className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 active:bg-stone-900 text-stone-200 hover:text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Selesaikan Pesanan</span>
                            </button>
                          )}

                          {order.status === 'completed' && (
                            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 py-1">
                              <CheckCircle2 className="w-4 h-4" />
                              Selesai
                            </span>
                          )}

                          {order.status === 'cancelled' && (
                            <span className="text-xs text-red-400 font-bold flex items-center gap-1.5 py-1">
                              <AlertCircle className="w-4 h-4" />
                              Dibatalkan
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
