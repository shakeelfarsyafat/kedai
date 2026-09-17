'use client';

import React from 'react';
import { Order } from '@/types/coffee';
import { formatRupiah } from '@/lib/utils';
import { printThermalReceipt } from '@/lib/receiptPrinter';
import { Printer, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
  baristaName?: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  onClose,
  baristaName = 'Barista Shift A',
}) => {
  if (!order) return null;

  const handlePrint = () => {
    printThermalReceipt(order, baristaName);
  };

  const isPaid = order.paymentStatus === 'paid';
  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = orderDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Container Dialog */}
      <div className="bg-[#0c151c] text-slate-100 border border-slate-700/80 rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#13222a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Preview Struk Kasir</h3>
              <p className="text-[11px] text-cyan-300/80 font-mono">No. Order: {order.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Preview Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex justify-center bg-[#070e12]/70">
          {/* Paper Thermal Receipt Card */}
          <div className="w-full max-w-[320px] bg-white text-slate-900 p-5 rounded-2xl shadow-xl font-mono text-xs leading-tight border border-slate-200 select-none">
            {/* Store Branding */}
            <div className="text-center space-y-1 mb-3">
              <div className="w-12 h-12 mx-auto mb-1">
                <img
                  src="/images/icon-brew-bean.png"
                  alt="Brew Bean"
                  className="w-full h-full object-contain mx-auto"
                />
              </div>
              <h2 className="text-base font-black tracking-widest uppercase text-black">
                BREW BEAN
              </h2>
              <p className="text-[10px] text-gray-600 font-sans">Temukan Teman Harimu</p>
              <p className="text-[9px] text-gray-500">Jl. Kopi Harapan No. 10</p>
              <p className="text-[9px] text-gray-500">Telp: 0812-3456-7890</p>
            </div>

            <div className="border-t border-b border-dashed border-gray-400 py-0.5 my-2.5" />

            {/* Transaction Metadata */}
            <div className="space-y-1 text-[11px] text-gray-800">
              <div className="flex justify-between">
                <span className="text-gray-600">No. Order:</span>
                <span className="font-bold text-black">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Waktu:</span>
                <span>
                  {formattedDate} {formattedTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kasir:</span>
                <span>{baristaName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pelanggan:</span>
                <span className="font-bold text-black">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipe:</span>
                <span className="font-bold uppercase text-black">
                  {order.orderType === 'dine_in'
                    ? `DINE IN (${order.tableNumber || 'Meja'})`
                    : 'TAKEAWAY'}
                </span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-400 my-2.5" />

            {/* Order Items */}
            <div className="space-y-2.5 my-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-black flex-1 pr-2">
                      {item.quantity}x {item.menuItem.name}
                    </span>
                    <span className="font-semibold text-black shrink-0">
                      {formatRupiah(item.totalPrice)}
                    </span>
                  </div>

                  {/* Customization Details */}
                  {item.customization && (
                    <div className="pl-3 text-[9.5px] text-gray-600 space-y-0.5">
                      {item.customization.sugarLevel !== 'normal' && (
                        <div>• Gula: {item.customization.sugarLevel}</div>
                      )}
                      {item.customization.iceLevel !== 'normal' && (
                        <div>• Es: {item.customization.iceLevel}</div>
                      )}
                      {item.customization.milkOption !== 'dairy' && (
                        <div>• Susu: {item.customization.milkOption}</div>
                      )}
                      {item.customization.selectedAddOns?.length > 0 && (
                        <div>• Addon: {item.customization.selectedAddOns.join(', ')}</div>
                      )}
                      {item.customization.notes && (
                        <div className="italic text-gray-700">
                          Catatan: &ldquo;{item.customization.notes}&rdquo;
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-400 my-2.5" />

            {/* Financial Summary */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>PB1 (10%)</span>
                <span>{formatRupiah(order.tax)}</span>
              </div>
              <div className="border-t border-dashed border-gray-300 my-1" />
              <div className="flex justify-between text-sm font-black text-black">
                <span>TOTAL</span>
                <span>{formatRupiah(order.total)}</span>
              </div>
              <div className="flex justify-between text-[11px] pt-1 text-gray-800">
                <span>Metode Pembayaran:</span>
                <span className="uppercase font-bold">{order.paymentMethod}</span>
              </div>
            </div>

            {/* Payment Status Banner */}
            <div className={`my-3 py-1.5 px-2 text-center rounded border ${isPaid ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-dashed border-amber-600 bg-amber-50 text-amber-800'}`}>
              <div className="text-xs font-black tracking-wider uppercase">
                {isPaid ? '*** LUNAS (DIBAYAR) ***' : '*** BELUM DIBAYAR ***'}
              </div>
            </div>

            {/* Notes if any */}
            {order.notes && (
              <div className="text-[9.5px] text-gray-600 text-center italic my-1">
                Catatan: {order.notes}
              </div>
            )}

            <div className="border-t border-b border-dashed border-gray-400 py-0.5 my-2.5" />

            {/* Footer */}
            <div className="text-center text-[9px] text-gray-500 space-y-0.5 pt-1">
              <p className="font-bold text-gray-700">Terima kasih atas kunjungan Anda!</p>
              <p>Follow Instagram: @brewbean.coffee</p>
              <p className="text-[8px] text-gray-400 pt-1">
                Simpan struk ini sebagai bukti transaksi sah
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-[#13222a] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#007b9e] hover:bg-[#006e8d] shadow-lg shadow-cyan-950/50 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
