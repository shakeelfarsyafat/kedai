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
      color: 'border-cyan-500/60 bg-cyan-950/25 text-cyan-300',
      items: newOrders,
    },
    {
      id: 'brewing',
      title: 'Sedang Diracik (Brewing)',
      icon: Coffee,
      count: brewingOrders.length,
      color: 'border-[#007b9e]/70 bg-[#007b9e]/20 text-cyan-200',
      items: brewingOrders,
    },
    {
      id: 'ready',
      title: 'Siap Diambil / Diantar',
      icon: Sparkles,
      count: readyOrders.length,
      color: 'border-emerald-500/60 bg-emerald-950/25 text-emerald-300',
      items: readyOrders,
    },
    {
      id: 'finished',
      title: 'Selesai / Riwayat',
      icon: CheckCircle2,
      count: finishedOrders.length,
      color: 'border-slate-800 bg-slate-900/50 text-slate-400',
      items: finishedOrders.slice(0, 15),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Tablet POS Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0d171d] p-3.5 sm:p-4 rounded-2xl border border-[#1c3340] shadow-xl">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID, Nama, atau Meja..."
              className="w-full bg-[#080e12] border border-[#1c3340] rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007b9e] focus:border-transparent transition-all"
            />
          </div>

          {/* Dine-in vs Takeaway filter */}
          <div className="flex items-center bg-[#080e12] p-1 rounded-xl border border-[#1c3340] text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'all' ? 'bg-[#007b9e] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType('dine_in')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                filterType === 'dine_in' ? 'bg-[#007b9e] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Dine-in</span>
            </button>
            <button
              onClick={() => setFilterType('takeaway')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                filterType === 'takeaway' ? 'bg-[#007b9e] text-white shadow-sm' : 'text-slate-400 hover:text-white'
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
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#007b9e] to-[#075f7e] hover:from-[#006e8d] hover:to-[#05516b] text-white text-xs sm:text-sm font-bold shadow-md shadow-cyan-950/50 transition-all active:scale-95 whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Simulasi Pesanan Baru</span>
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const Icon = col.icon;
          return (
            <div
              key={col.id}
              className="flex flex-col rounded-3xl bg-[#0a1318] border border-[#172c38] p-3.5 sm:p-4 min-h-[520px] shadow-lg"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#1c3340] mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center border ${col.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-200">{col.title}</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#080e12] text-cyan-300 border border-[#1c3340]">
                  {col.count}
                </span>
              </div>

              {/* Order Cards Stack */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
                {col.items.length === 0 ? (
                  <div className="h-36 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#1c3340] rounded-2xl">
                    <p className="text-xs text-slate-500">Tidak ada pesanan</p>
                  </div>
                ) : (
                  col.items.map((order) => {
                    const isNew = order.status === 'new';
                    return (
                      <div
                        key={order.id}
                        className={`p-3.5 sm:p-4 rounded-2xl bg-[#0d171d] border transition-all duration-300 space-y-3 shadow-md ${
                          isNew
                            ? 'border-cyan-400/80 shadow-cyan-950/40 ring-1 ring-cyan-400/30'
                            : order.status === 'brewing'
                            ? 'border-[#007b9e]/60 shadow-cyan-950/30'
                            : order.status === 'ready'
                            ? 'border-emerald-500/50 shadow-emerald-950/20'
                            : 'border-[#1c3340] opacity-80'
                        }`}
                      >
                        {/* Order Header: ID, Type badge, Elapsed time */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-cyan-300 tracking-wider">
                              {order.id}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                order.orderType === 'dine_in'
                                  ? 'bg-[#007b9e]/20 text-cyan-300 border border-[#007b9e]/40'
                                  : 'bg-sky-950/50 text-sky-300 border border-sky-800/40'
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

                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {formatTimeAgo(order.createdAt)}
                          </span>
                        </div>

                        {/* Customer name & total */}
                        <div className="flex items-baseline justify-between border-b border-[#1c3340] pb-2">
                          <h4 className="font-bold text-sm text-white">{order.customerName}</h4>
                          <span className="text-xs font-extrabold text-cyan-400">
                            {formatRupiah(order.total)}
                          </span>
                        </div>

                        {/* Items ordered with customizations */}
                        <div className="space-y-1.5 text-xs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="bg-[#080e12] p-2 rounded-xl border border-[#1c3340]/60">
                              <div className="flex justify-between font-semibold text-slate-200">
                                <span>
                                  <strong className="text-cyan-300">{item.quantity}x</strong>{' '}
                                  {item.menuItem.name}
                                </span>
                              </div>

                              {item.customization && (
                                <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-slate-400">
                                  {item.customization.sugarLevel !== 'normal' && (
                                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                      {item.customization.sugarLevel} sugar
                                    </span>
                                  )}
                                  {item.customization.iceLevel !== 'normal' && (
                                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                      {item.customization.iceLevel} ice
                                    </span>
                                  )}
                                  {item.customization.milkOption !== 'dairy' && (
                                    <span className="px-1.5 py-0.5 rounded bg-[#007b9e]/20 text-cyan-300 border border-[#007b9e]/30">
                                      {item.customization.milkOption}
                                    </span>
                                  )}
                                  {item.customization.selectedAddOns.length > 0 && (
                                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                      +{item.customization.selectedAddOns.length} extra
                                    </span>
                                  )}
                                </div>
                              )}

                              {item.customization?.notes && (
                                <p className="text-[10px] text-cyan-200/90 italic mt-0.5">
                                  "{item.customization.notes}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {order.notes && (
                          <div className="text-[11px] p-2 rounded-lg bg-cyan-950/30 border border-cyan-900/30 text-cyan-200">
                            Catatan: {order.notes}
                          </div>
                        )}

                        {/* Large Action Buttons */}
                        <div className="pt-2 border-t border-[#1c3340] flex items-center gap-2">
                          {order.status === 'new' && (
                            <>
                              <button
                                onClick={() => onStatusChange(order.id, 'brewing')}
                                className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl bg-[#007b9e] hover:bg-[#006e8d] active:bg-[#005e78] text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-950/40 transition-all flex items-center justify-center gap-2 active:scale-98"
                              >
                                <Coffee className="w-4 h-4" />
                                <span>Mulai Seduh</span>
                              </button>
                              <button
                                onClick={() => onStatusChange(order.id, 'cancelled')}
                                className="min-h-[44px] px-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-[#080e12] border border-transparent hover:border-red-900 transition-colors flex items-center justify-center"
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
                              className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 hover:text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
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
