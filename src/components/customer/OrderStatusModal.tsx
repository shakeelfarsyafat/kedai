'use client';

import React, { useEffect, useState } from 'react';
import { Order } from '@/types/coffee';
import { orderStore } from '@/lib/orderStore';
import { formatRupiah, formatDateTime } from '@/lib/utils';
import { printThermalReceipt } from '@/lib/receiptPrinter';
import {
  X,
  Clock,
  Coffee,
  CheckCircle2,
  Printer,
  Sparkles,
  UtensilsCrossed,
  ShoppingBag,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  Timer,
} from 'lucide-react';

interface OrderStatusModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  orderId,
  isOpen,
  onClose,
}) => {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) return;

    // Initial load
    const current = orderStore.getOrderById(orderId);
    if (current) setOrder(current);

    // Subscribe to real-time status & payment changes
    const unsubscribe = orderStore.subscribe((orders) => {
      const updated = orders.find((o) => o.id === orderId);
      if (updated) {
        setOrder(updated);
      }
    });

    return () => unsubscribe();
  }, [orderId]);

  if (!isOpen || !order) return null;

  const isPaid = order.paymentStatus === 'paid';
  const isDineIn = order.orderType === 'dine_in';

  const handlePrintReceipt = () => {
    printThermalReceipt(order, 'Kasir Brew Bean');
  };

  const getPaymentIcon = () => {
    switch (order.paymentMethod) {
      case 'qris':
        return <QrCode className="w-3.5 h-3.5 text-cyan-400" />;
      case 'card':
        return <CreditCard className="w-3.5 h-3.5 text-indigo-400" />;
      case 'cash':
      default:
        return <Banknote className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getPaymentLabel = () => {
    switch (order.paymentMethod) {
      case 'qris':
        return 'QRIS';
      case 'card':
        return 'Kartu Debit/Kredit';
      case 'cash':
      default:
        return 'Tunai di Kasir';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg max-h-[92vh] bg-[#0c151c] border border-[#1c3340] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#111f27] border-b border-[#1c3340] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider font-bold text-cyan-400">
                  Tiket Pesanan Digital
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h2 className="text-base font-black text-white font-mono tracking-wide">
                {order.id}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#070e12] border border-[#1c3340] text-slate-400 hover:text-white hover:bg-[#152733] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Status Utama Live Card */}
          {isPaid ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-[#0c1e1c] to-[#0a1816] border border-emerald-500/40 space-y-3 shadow-lg shadow-emerald-950/30">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                    <CheckCircle2 className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-0.5">
                      ✓ Sudah Dibayar (Lunas)
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-white">
                      Pesanan Masuk Antrean Barista
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Pembayaran telah terverifikasi. Barista Brew Bean sedang menyiapkan pesanan spesial Anda.
                {isDineIn
                  ? ` Pesanan akan diantar langsung ke ${order.tableNumber || 'meja Anda'}.`
                  : ' Silakan ambil di pick-up counter saat nomor dipanggil.'}
              </p>

              {/* Status mini flow */}
              <div className="pt-2 border-t border-emerald-900/50 flex items-center justify-between text-[11px] font-semibold text-emerald-300/90">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1. Terbayar Lunas</span>
                </div>
                <span className="text-emerald-700">→</span>
                <div className="flex items-center gap-1.5 text-cyan-300">
                  <Coffee className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>2. Disiapkan Barista</span>
                </div>
                <span className="text-emerald-700">→</span>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                  <span>3. Siap Dinikmati</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/70 via-[#21180d] to-[#171109] border border-amber-500/40 space-y-3 shadow-lg shadow-amber-950/30">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-0.5">
                      ⏱ Menunggu Pembayaran di Kasir
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-white">
                      Silakan Selesaikan Pembayaran
                    </h3>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-950/50 rounded-xl border border-amber-800/40 space-y-1">
                <p className="text-xs text-amber-200 leading-relaxed font-medium">
                  Tunjukkan Nomor Pesanan{' '}
                  <span className="font-mono font-black text-amber-300 text-sm underline underline-offset-2">
                    {order.id}
                  </span>{' '}
                  kepada kasir untuk pembayaran tunai/kartu.
                </p>
                <p className="text-[11px] text-amber-300/70">
                  Status akan otomatis berubah menjadi LUNAS setelah kasir memverifikasi pembayaran.
                </p>
              </div>
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* Nama & Tipe */}
            <div className="bg-[#101b22] border border-[#1c3340] rounded-2xl p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Nama Pemesan
              </span>
              <p className="text-xs sm:text-sm font-bold text-white truncate">
                {order.customerName}
              </p>
              <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-cyan-400">
                {isDineIn ? (
                  <>
                    <UtensilsCrossed className="w-3 h-3" />
                    <span>{order.tableNumber || 'Dine-In'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3 h-3 text-sky-400" />
                    <span className="text-sky-400">Takeaway</span>
                  </>
                )}
              </div>
            </div>

            {/* Metode Pembayaran */}
            <div className="bg-[#101b22] border border-[#1c3340] rounded-2xl p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Metode Bayar
              </span>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white">
                {getPaymentIcon()}
                <span>{getPaymentLabel()}</span>
              </div>
              <span
                className={`inline-block mt-1 text-[10px] font-bold ${
                  isPaid ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {isPaid ? 'Sudah Lunas' : 'Belum Bayar'}
              </span>
            </div>

            {/* Estimasi Waktu */}
            <div className="col-span-2 sm:col-span-1 bg-[#101b22] border border-[#1c3340] rounded-2xl p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Estimasi Saji
              </span>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-cyan-300">
                <Timer className="w-3.5 h-3.5 text-cyan-400" />
                <span>~5 - 10 Menit</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                {formatDateTime(order.createdAt)}
              </span>
            </div>
          </div>

          {/* Items Summary in Digital Receipt Style */}
          <div className="p-4 rounded-2xl bg-[#080f14] border border-[#1c3340] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c3340]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Rincian Pesanan ({order.items.length} Menu)
              </h4>
              <span className="text-[11px] text-slate-400">Harga</span>
            </div>

            <div className="divide-y divide-[#152733]/60 space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="pt-2 first:pt-0 flex justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                        {item.quantity}x
                      </span>
                      <span className="text-xs font-bold text-white">{item.menuItem.name}</span>
                    </div>

                    {item.customization && (
                      <div className="text-[11px] text-slate-400 pl-7 space-x-1">
                        <span>{item.customization.sugarLevel} sugar</span>
                        <span>•</span>
                        <span>{item.customization.iceLevel} ice</span>
                        <span>•</span>
                        <span>{item.customization.milkOption}</span>
                        {item.customization.notes && (
                          <p className="text-[10px] text-amber-300/80 italic mt-0.5">
                            &quot;{item.customization.notes}&quot;
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-white font-mono">
                    {formatRupiah(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Calculations */}
            <div className="pt-3 border-t border-[#1c3340] space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono">{formatRupiah(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>PPN (10%)</span>
                <span className="font-mono">{formatRupiah(order.tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-[#1c3340]">
                <span>Total Pembayaran</span>
                <span className="text-cyan-400 font-mono text-base font-black">
                  {formatRupiah(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#0a1217] border-t border-[#1c3340] flex items-center justify-between gap-2.5">
          <button
            onClick={handlePrintReceipt}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#101b22] hover:bg-[#162631] border border-[#1c3340] text-xs font-bold text-slate-300 hover:text-white transition-all shadow"
            title="Cetak atau simpan struk transaksi"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Cetak Struk</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#007b9e] hover:bg-[#006e8d] text-xs font-bold text-white transition-all shadow-lg shadow-cyan-950/50"
          >
            Pesan Menu Lain / Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
