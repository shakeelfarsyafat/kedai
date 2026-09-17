'use client';

import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '@/types/coffee';
import { orderStore } from '@/lib/orderStore';
import { formatRupiah, formatDateTime } from '@/lib/utils';
import {
  X,
  Clock,
  Coffee,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
  Sparkles,
  MapPin,
  UtensilsCrossed,
  ShoppingBag,
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

    // Subscribe to real-time status changes
    const unsubscribe = orderStore.subscribe((orders) => {
      const updated = orders.find((o) => o.id === orderId);
      if (updated) {
        setOrder(updated);
      }
    });

    return () => unsubscribe();
  }, [orderId]);

  if (!isOpen || !order) return null;

  const steps: { key: OrderStatus; title: string; desc: string; icon: any }[] = [
    {
      key: 'new',
      title: 'Pesanan Diterima',
      desc: 'Pesanan masuk antrean kasir & barista.',
      icon: Clock,
    },
    {
      key: 'brewing',
      title: 'Sedang Diracik',
      desc: 'Barista sedang menyeduh pesanan spesial Anda.',
      icon: Coffee,
    },
    {
      key: 'ready',
      title: 'Siap Diambil / Diantar',
      desc: 'Pesanan telah siap! Silakan ambil di counter atau tunggu di meja.',
      icon: Sparkles,
    },
    {
      key: 'completed',
      title: 'Selesai',
      desc: 'Pesanan telah selesai. Selamat menikmati!',
      icon: CheckCircle2,
    },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return 0;
      case 'brewing':
        return 1;
      case 'ready':
        return 2;
      case 'completed':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg max-h-[90vh] bg-[#1a120c] border border-amber-900/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 bg-[#21150e] border-b border-stone-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
                Status Pesanan Realtime
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h2 className="text-lg font-extrabold text-white">{order.id}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Order Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 to-stone-900/80 border border-amber-800/40 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-400">Atas Nama:</span>
              <h3 className="text-base font-bold text-amber-200">{order.customerName}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-stone-300">
                {order.orderType === 'dine_in' ? (
                  <span className="flex items-center gap-1 text-amber-400">
                    <UtensilsCrossed className="w-3 h-3" />
                    {order.tableNumber || 'Dine-in'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sky-400">
                    <ShoppingBag className="w-3 h-3" />
                    Takeaway
                  </span>
                )}
                <span>•</span>
                <span>{formatDateTime(order.createdAt)}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-stone-400">Total Bayar:</span>
              <p className="text-base font-extrabold text-amber-400">{formatRupiah(order.total)}</p>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                {order.paymentMethod.toUpperCase()} (Lunas)
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          {order.status === 'cancelled' ? (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-center gap-3 text-red-200">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Pesanan Dibatalkan</h4>
                <p className="text-xs text-red-300/80 mt-0.5">
                  Pesanan ini telah dibatalkan oleh kasir atau barista.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-800">
              {steps.map((step, idx) => {
                const isCurrent = idx === currentStepIdx;
                const isPassed = idx < currentStepIdx;
                const StepIcon = step.icon;

                return (
                  <div key={step.key} className="relative flex items-start gap-4">
                    {/* Step node indicator */}
                    <div
                      className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/50 ring-4 ring-amber-500/20 animate-bounce'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-900 border border-stone-800 text-stone-600'
                      }`}
                    >
                      <StepIcon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-bold ${
                            isCurrent
                              ? 'text-amber-300'
                              : isPassed
                              ? 'text-emerald-300'
                              : 'text-stone-500'
                          }`}
                        >
                          {step.title}
                        </h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                            Sedang Berlangsung
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5 font-light">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Items Summary in Accordion / List */}
          <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Daftar Item ({order.items.length})
            </h4>
            <div className="divide-y divide-stone-800/60">
              {order.items.map((item, i) => (
                <div key={i} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-300">{item.quantity}x</span>
                      <span className="text-xs font-semibold text-white">{item.menuItem.name}</span>
                    </div>

                    {item.customization && (
                      <div className="text-[11px] text-stone-400 mt-0.5 space-x-1">
                        <span>{item.customization.sugarLevel} sugar</span>
                        <span>•</span>
                        <span>{item.customization.iceLevel} ice</span>
                        <span>•</span>
                        <span>{item.customization.milkOption}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-stone-300">
                    {formatRupiah(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#140e08] border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-white transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
