'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderType, PaymentStatus } from '@/types/coffee';
import { formatRupiah, formatTimeAgo } from '@/lib/utils';
import { ReceiptModal } from './ReceiptModal';
import { printThermalReceipt } from '@/lib/receiptPrinter';
import {
  Search,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  Coffee,
  ShoppingBag,
  Sparkles,
  PlusCircle,
  Filter,
  DollarSign,
  Receipt,
  XCircle,
} from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  onUpdatePaymentStatus: (orderId: string, status: PaymentStatus) => void;
  onSimulateTestOrder: () => void;
  baristaName?: string;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onUpdatePaymentStatus,
  onSimulateTestOrder,
  baristaName = 'Barista Shift A',
}) => {
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | OrderType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
  const [, setTicker] = useState(0);

  // Re-render relative time every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => setTicker((t) => t + 1), 15000);
    return () => clearInterval(timer);
  }, []);

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    const matchesPayment =
      paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    const matchesType = typeFilter === 'all' || order.orderType === typeFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.tableNumber &&
        order.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesPayment && matchesType && matchesSearch;
  });

  // Calculate statistics
  const totalOrdersCount = orders.length;
  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
  const pendingOrders = orders.filter((o) => o.paymentStatus === 'pending');
  const totalRevenue = paidOrders.reduce((acc, curr) => acc + curr.total, 0);
  const pendingRevenue = pendingOrders.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="space-y-5">
      {/* 1. Quick Summary Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Pesanan */}
        <div className="bg-[#0d171d] border border-[#1c3340] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Total Pesanan</span>
            <Receipt className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{totalOrdersCount}</div>
          <span className="text-[11px] text-slate-400 mt-1">Semua pesanan masuk</span>
        </div>

        {/* Sudah Dibayar (Lunas) */}
        <div className="bg-[#0d171d] border border-emerald-900/40 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-xs font-semibold">Sudah Dibayar</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300">
            {paidOrders.length}
          </div>
          <span className="text-[11px] text-emerald-400/80 mt-1">
            {formatRupiah(totalRevenue)}
          </span>
        </div>

        {/* Belum Dibayar (Menunggu) */}
        <div className="bg-[#0d171d] border border-amber-900/40 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-xs font-semibold">Belum Dibayar</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300">
            {pendingOrders.length}
          </div>
          <span className="text-[11px] text-amber-400/80 mt-1">
            {formatRupiah(pendingRevenue)}
          </span>
        </div>

        {/* Total Omset */}
        <div className="bg-[#0d171d] border border-cyan-900/40 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyan-400 mb-1">
            <span className="text-xs font-semibold">Total Pendapatan</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-300">
            {formatRupiah(totalRevenue)}
          </div>
          <span className="text-[11px] text-cyan-400/80 mt-1">Uang Masuk (Lunas)</span>
        </div>
      </div>

      {/* 2. Filter & Search Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0d171d] p-3.5 sm:p-4 rounded-2xl border border-[#1c3340] shadow-xl">
        {/* Left Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Pembayaran Pills */}
          <div className="flex items-center bg-[#070e12] p-1 rounded-xl border border-[#1c3340]">
            <button
              onClick={() => setPaymentFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                paymentFilter === 'all'
                  ? 'bg-[#007b9e] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua ({totalOrdersCount})
            </button>
            <button
              onClick={() => setPaymentFilter('paid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                paymentFilter === 'paid'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Dibayar ({paidOrders.length})</span>
            </button>
            <button
              onClick={() => setPaymentFilter('pending')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                paymentFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Belum ({pendingOrders.length})</span>
            </button>
          </div>

          {/* Tipe Order Dropdown / Buttons */}
          <div className="flex items-center bg-[#070e12] p-1 rounded-xl border border-[#1c3340]">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'all' ? 'bg-[#152733] text-cyan-300' : 'text-slate-400'
              }`}
            >
              Semua Tipe
            </button>
            <button
              onClick={() => setTypeFilter('dine_in')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'dine_in' ? 'bg-[#152733] text-cyan-300' : 'text-slate-400'
              }`}
            >
              Dine In
            </button>
            <button
              onClick={() => setTypeFilter('takeaway')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'takeaway' ? 'bg-[#152733] text-cyan-300' : 'text-slate-400'
              }`}
            >
              Takeaway
            </button>
          </div>
        </div>

        {/* Right Search & Action */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID, Nama, No Meja..."
              className="w-full pl-9 pr-4 py-2 bg-[#070e12] border border-[#1c3340] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#007b9e]"
            />
          </div>

          <button
            onClick={onSimulateTestOrder}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#007b9e]/20 hover:bg-[#007b9e]/30 text-cyan-300 hover:text-cyan-200 border border-[#007b9e]/40 rounded-xl text-xs font-bold transition-all shrink-0"
            title="Simulasikan pesanan masuk baru"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">+ Simulasi Order</span>
          </button>
        </div>
      </div>

      {/* 3. Orders List / Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-[#0d171d] rounded-3xl border border-[#1c3340] space-y-3">
          <Coffee className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">Tidak Ada Pesanan Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || paymentFilter !== 'all' || typeFilter !== 'all'
              ? 'Coba sesuaikan filter atau kata kunci pencarian Anda.'
              : 'Belum ada pesanan masuk. Klik "+ Simulasi Order" untuk mencoba.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const isPaid = order.paymentStatus === 'paid';
            const orderDate = new Date(order.createdAt);
            const timeFormatted = orderDate.toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order.id}
                className={`bg-[#0d171d] rounded-2xl border transition-all flex flex-col justify-between shadow-lg overflow-hidden ${
                  isPaid
                    ? 'border-[#1c3340] hover:border-cyan-500/50'
                    : 'border-amber-600/50 bg-gradient-to-b from-[#131b20] to-[#0d171d]'
                }`}
              >
                {/* Card Header: Order ID, Type, Time */}
                <div className="p-4 border-b border-[#1c3340] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-cyan-300 font-mono tracking-wide">
                        {order.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          order.orderType === 'dine_in'
                            ? 'bg-blue-950/60 border-blue-500/40 text-blue-300'
                            : 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                        }`}
                      >
                        {order.orderType === 'dine_in'
                          ? `Dine In • ${order.tableNumber || 'Meja'}`
                          : 'Takeaway'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{timeFormatted}</span>
                      <span>({formatTimeAgo(order.createdAt)})</span>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Pemesan: </span>
                      <span className="font-bold text-white">{order.customerName}</span>
                    </div>
                    {order.customerPhone && (
                      <span className="text-slate-500 text-[11px]">{order.customerPhone}</span>
                    )}
                  </div>
                </div>

                {/* Payment Status Banner & One-Click Toggle */}
                <div className="px-4 py-2.5 bg-[#081014] border-b border-[#1c3340] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">Status Bayar:</span>
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>DIBAYAR (LUNAS)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>BELUM DIBAYAR</span>
                      </span>
                    )}
                  </div>

                  {/* Toggle button */}
                  {isPaid ? (
                    <button
                      type="button"
                      onClick={() => onUpdatePaymentStatus(order.id, 'pending')}
                      className="text-[10px] font-semibold text-slate-400 hover:text-amber-300 underline transition-all"
                      title="Ubah kembali ke Belum Dibayar jika ada kekeliruan"
                    >
                      Tandai Belum
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onUpdatePaymentStatus(order.id, 'paid')}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-all active:scale-95"
                    >
                      ✓ Tandai Lunas
                    </button>
                  )}
                </div>

                {/* Items List */}
                <div className="p-4 space-y-2.5 flex-1">
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-xs flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <div className="font-semibold text-slate-200">
                            <span className="text-cyan-400 font-bold">{item.quantity}x</span>{' '}
                            {item.menuItem.name}
                          </div>
                          {item.customization && (
                            <div className="text-[10px] text-slate-400 pl-3">
                              {item.customization.sugarLevel !== 'normal' && (
                                <span>Gula: {item.customization.sugarLevel} • </span>
                              )}
                              {item.customization.iceLevel !== 'normal' && (
                                <span>Es: {item.customization.iceLevel} • </span>
                              )}
                              {item.customization.milkOption !== 'dairy' && (
                                <span>Susu: {item.customization.milkOption}</span>
                              )}
                              {item.customization.notes && (
                                <div className="text-amber-300/90 italic">
                                  &ldquo;{item.customization.notes}&rdquo;
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-slate-300 font-mono text-[11px] shrink-0">
                          {formatRupiah(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="text-[11px] p-2 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200">
                      <span className="font-bold">Catatan:</span> {order.notes}
                    </div>
                  )}
                </div>

                {/* Financial Total & Action Row */}
                <div className="p-4 border-t border-[#1c3340] bg-[#091217] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Total Pesanan</span>
                      <span className="text-base font-black text-white font-mono">
                        {formatRupiah(order.total)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Metode Pembayaran</span>
                      <span className="text-xs font-bold text-cyan-300 uppercase">
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>

                  {/* Print Receipt Button Options */}
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderForPrint(order)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#007b9e] hover:bg-[#006e8d] active:scale-98 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 border border-cyan-400/30 transition-all"
                      title="Buka Preview Struk & Cetak"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Struk</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => printThermalReceipt(order, baristaName)}
                      className="p-2.5 rounded-xl bg-[#081014] hover:bg-cyan-950/70 text-cyan-300 hover:text-white border border-[#1c3340] hover:border-cyan-400/50 transition-all shrink-0"
                      title="Cetak Langsung ke Printer Struk"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Print Receipt Modal */}
      {selectedOrderForPrint && (
        <ReceiptModal
          order={selectedOrderForPrint}
          onClose={() => setSelectedOrderForPrint(null)}
          baristaName={baristaName}
        />
      )}
    </div>
  );
};
