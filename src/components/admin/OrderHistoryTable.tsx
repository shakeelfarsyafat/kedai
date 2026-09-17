'use client';

import React, { useState } from 'react';
import { Order } from '@/types/coffee';
import { formatRupiah, formatDateTime } from '@/lib/utils';
import { Search, UtensilsCrossed, ShoppingBag, Eye, X } from 'lucide-react';

interface OrderHistoryTableProps {
  orders: Order[];
}

export const OrderHistoryTable: React.FC<OrderHistoryTableProps> = ({ orders }) => {
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (o.tableNumber && o.tableNumber.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-[#19100a] p-4 rounded-2xl border border-stone-800">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi..."
            className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <span className="text-xs text-stone-400">Total {filtered.length} Transaksi</span>
      </div>

      <div className="bg-[#170e08] border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-[#21140d] text-stone-400 font-semibold uppercase text-[10px] tracking-wider border-b border-stone-800">
              <tr>
                <th className="py-3 px-4">No. Order</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Jumlah Item</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-stone-900/40 transition-colors">
                  <td className="py-3 px-4 font-black text-amber-300">{order.id}</td>
                  <td className="py-3 px-4 font-bold text-white">{order.customerName}</td>
                  <td className="py-3 px-4">
                    {order.orderType === 'dine_in' ? (
                      <span className="inline-flex items-center gap-1 text-amber-400">
                        <UtensilsCrossed className="w-3 h-3" />
                        {order.tableNumber || 'Dine-in'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sky-400">
                        <ShoppingBag className="w-3 h-3" />
                        Takeaway
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">{order.items.reduce((s, i) => s + i.quantity, 0)} porsi</td>
                  <td className="py-3 px-4 font-bold text-amber-400">{formatRupiah(order.total)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-stone-900 border border-stone-800">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        order.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : order.status === 'new'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : order.status === 'brewing'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : order.status === 'ready'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-400">{formatDateTime(order.createdAt)}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white"
                      title="Lihat Detail Struk"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#1c120a] border border-amber-900/40 rounded-3xl p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div>
                <span className="text-xs text-stone-400">Rincian Transaksi</span>
                <h3 className="text-lg font-black text-amber-300">{selectedOrder.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 text-xs text-stone-300">
              <p>
                <strong>Pelanggan:</strong> {selectedOrder.customerName}
              </p>
              <p>
                <strong>Tipe:</strong>{' '}
                {selectedOrder.orderType === 'dine_in'
                  ? selectedOrder.tableNumber
                  : 'Takeaway (Bawa Pulang)'}
              </p>
              <p>
                <strong>Waktu:</strong> {formatDateTime(selectedOrder.createdAt)}
              </p>
            </div>

            <div className="divide-y divide-stone-800/80 max-h-56 overflow-y-auto pr-1">
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} className="py-2 flex justify-between text-xs">
                  <div>
                    <div className="font-semibold text-stone-100">
                      {it.quantity}x {it.menuItem.name}
                    </div>
                    {it.customization && (
                      <div className="text-[10px] text-stone-400">
                        {it.customization.sugarLevel}, {it.customization.iceLevel},{' '}
                        {it.customization.milkOption}
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-amber-400">{formatRupiah(it.totalPrice)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-800 text-xs space-y-1">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal</span>
                <span>{formatRupiah(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Pajak (PB1 10%)</span>
                <span>{formatRupiah(selectedOrder.tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1">
                <span>Total</span>
                <span className="text-amber-400">{formatRupiah(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
