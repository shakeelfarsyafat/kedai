'use client';

import React, { useState } from 'react';
import { CartItem, OrderType, PaymentMethod, Order } from '@/types/coffee';
import { formatRupiah } from '@/lib/utils';
import { orderStore } from '@/lib/orderStore';
import confetti from 'canvas-confetti';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  QrCode,
  Banknote,
  CreditCard,
  UtensilsCrossed,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  orderType: OrderType;
  tableNumber: string;
  onOrderCreated: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  orderType,
  tableNumber,
  onOrderCreated,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState<any>(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = Math.round(subtotal * 0.1); // 10% PB1
  const grandTotal = subtotal + tax;

  const getCustomizationSummary = (item: CartItem) => {
    const parts: string[] = [];
    if (item.customization.sugarLevel !== 'normal') {
      const sMap = { less: '50% Gula', low: '25% Gula', none: 'Tanpa Gula' };
      parts.push(sMap[item.customization.sugarLevel] || item.customization.sugarLevel);
    }
    if (item.customization.iceLevel !== 'normal') {
      const iMap = { less: 'Less Ice', none: 'No Ice', hot: 'Hot' };
      parts.push(iMap[item.customization.iceLevel] || item.customization.iceLevel);
    }
    if (item.customization.milkOption !== 'dairy') {
      parts.push(item.customization.milkOption === 'oatmilk' ? 'Oatmilk' : 'Almond');
    }
    if (item.customization.selectedAddOns.length > 0) {
      parts.push(`+${item.customization.selectedAddOns.length} Add-on`);
    }
    return parts;
  };

  const handleTriggerCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Mohon masukkan nama pemesan.');
      return;
    }
    if (cart.length === 0) return;

    const orderPayload = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      orderType,
      tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
      items: cart,
      subtotal,
      tax,
      total: grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'qris' ? ('paid' as const) : ('pending' as const),
      status: 'new' as const,
      notes: orderNotes.trim() || undefined,
    };

    if (paymentMethod === 'qris') {
      setPendingOrderData(orderPayload);
      setShowQrisModal(true);
    } else {
      executeOrderCreation(orderPayload);
    }
  };

  const executeOrderCreation = (payload: any) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const createdOrder = orderStore.createOrder(payload);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d97706', '#f59e0b', '#fef3c7', '#ffffff'],
        });
      } catch {}

      setIsSubmitting(false);
      setShowQrisModal(false);
      onClearCart();
      onClose();
      onOrderCreated(createdOrder);
    }, 600);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex w-full sm:w-auto sm:pl-10">
          <div className="w-full sm:w-screen sm:max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#007b9e]">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-800">Keranjang Pesanan</h2>
                  <p className="text-[11px] text-slate-500">
                    {orderType === 'dine_in' ? `Dine-in (${tableNumber})` : 'Takeaway (Bawa Pulang)'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-2.5">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-slate-700 text-sm">Keranjang Masih Kosong</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Pilih menu kopi atau cemilan favorit Anda dan sesuaikan rasa sesuai selera.
                  </p>
                </div>
              ) : (
                cart.map((item) => {
                  const summaryTags = getCustomizationSummary(item);
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-white border border-slate-200 flex flex-col gap-2 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-800">{item.menuItem.name}</h4>
                          <span className="text-xs font-bold text-[#007b9e]">
                            {formatRupiah(item.totalPrice)}
                          </span>

                          {summaryTags.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {summaryTags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] bg-cyan-50 border border-cyan-100 text-[#075f7e]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {item.customization.notes && (
                            <p className="mt-0.5 text-[10px] text-slate-500 italic">
                              "{item.customization.notes}"
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                        <span className="text-[10px] text-slate-500">
                          {formatRupiah(item.itemPrice)} / porsi
                        </span>

                        <div className="flex items-center bg-slate-50 rounded-full p-0.5 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Customer Details Form & Checkout */}
            {cart.length > 0 && (
              <form
                onSubmit={handleTriggerCheckout}
                className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 space-y-3"
              >
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                      Nama Pemesan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Masukkan nama Anda (misal: Budi)"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007b9e]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        No. HP (Opsional)
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="0812..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007b9e]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        Tipe Pesanan
                      </label>
                      <div className="text-xs font-semibold py-1.5 px-2.5 rounded-xl bg-white border border-slate-200 text-[#075f7e] flex items-center gap-1 shadow-sm">
                        {orderType === 'dine_in' ? (
                          <>
                            <UtensilsCrossed className="w-3 h-3 text-[#007b9e]" />
                            <span>{tableNumber}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3 h-3 text-[#007b9e]" />
                            <span>Takeaway</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Metode Pembayaran
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('qris')}
                      className={`py-2 px-2 rounded-xl text-center border transition-all ${
                        paymentMethod === 'qris'
                          ? 'bg-cyan-50 border-[#007b9e] text-[#007b9e] shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5 mx-auto mb-0.5 text-[#007b9e]" />
                      <span className="text-[10px] font-bold block">QRIS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`py-2 px-2 rounded-xl text-center border transition-all ${
                        paymentMethod === 'cash'
                          ? 'bg-cyan-50 border-[#007b9e] text-[#007b9e] shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Banknote className="w-3.5 h-3.5 mx-auto mb-0.5 text-emerald-600" />
                      <span className="text-[10px] font-bold block">Kasir</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-2 px-2 rounded-xl text-center border transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-cyan-50 border-[#007b9e] text-[#007b9e] shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5 mx-auto mb-0.5 text-blue-600" />
                      <span className="text-[10px] font-bold block">Debit</span>
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="pt-2 border-t border-slate-200 space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between text-[11px]">
                    <span>Subtotal</span>
                    <span>{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Pajak Restoran PB1 (10%)</span>
                    <span>{formatRupiah(tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-800 pt-1 border-t border-slate-200">
                    <span>Total Bayar</span>
                    <span className="text-[#007b9e]">{formatRupiah(grandTotal)}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-full bg-[#007b9e] hover:bg-[#006a88] text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-900/20 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Memproses Pesanan...</span>
                  ) : (
                    <>
                      <span>Pesan Sekarang ({formatRupiah(grandTotal)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* QRIS Simulated Payment Dialog */}
      {showQrisModal && pendingOrderData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xs sm:max-w-sm bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl text-center text-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold text-[#007b9e]">Pembayaran QRIS</span>
              <button
                onClick={() => setShowQrisModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl inline-block border border-slate-200 shadow-sm mb-2">
              <svg
                viewBox="0 0 100 100"
                className="w-40 h-40 mx-auto"
                shapeRendering="crispEdges"
              >
                <path fill="#075f7e" d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" />
                <path fill="#075f7e" d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" />
                <path fill="#075f7e" d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                <path fill="#075f7e" d="M40,10 h10 v10 h-10 z M60,10 h5 v5 h-5 z M45,25 h15 v5 h-15 z" />
                <path fill="#075f7e" d="M10,40 h15 v10 h-15 z M35,40 h10 v10 h-10 z M60,40 h20 v10 h-20 z" />
                <path fill="#075f7e" d="M40,55 h10 v10 h-10 z M60,55 h30 v10 h-30 z M25,60 h10 v10 h-10 z" />
                <path fill="#075f7e" d="M40,75 h15 v15 h-15 z M70,75 h20 v20 h-20 z M60,85 h5 v10 h-5 z" />
              </svg>
              <p className="text-[9px] text-[#075f7e] font-bold uppercase tracking-widest mt-1">
                BREW BEAN COFFEE
              </p>
            </div>

            <p className="text-[11px] text-slate-500">
              Scan dengan GoPay, OVO, BCA, Dana, atau mobile banking.
            </p>

            <div className="my-3 py-2 px-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Total Pembayaran</span>
              <span className="text-lg font-bold text-[#007b9e]">
                {formatRupiah(pendingOrderData.total)}
              </span>
            </div>

            <button
              onClick={() => executeOrderCreation(pendingOrderData)}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulasi Bayar Sekarang</span>
            </button>
          </div>
        </div>
      )}

    </>
  );
};
