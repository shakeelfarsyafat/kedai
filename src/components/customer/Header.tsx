'use client';

import React from 'react';
import { Coffee, ShoppingBag, Clock, ShieldCheck, UtensilsCrossed, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { OrderType } from '@/types/coffee';
import { formatRupiah } from '@/lib/utils';

interface HeaderProps {
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  cartItemCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
  onOpenTracker: () => void;
  activeOrderId?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  orderType,
  setOrderType,
  tableNumber,
  setTableNumber,
  cartItemCount,
  cartSubtotal,
  onOpenCart,
  onOpenTracker,
  activeOrderId,
}) => {
  const tableList = Array.from({ length: 20 }, (_, i) => `Meja ${String(i + 1).padStart(2, '0')}`);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#007b9e] to-[#075f7e] flex items-center justify-center shadow-md shadow-cyan-900/20 group-hover:scale-105 transition-transform">
              <Coffee className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#075f7e] uppercase">
                  lokale
                </span>
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-[#007b9e] border border-cyan-200">
                  Coffee
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-normal hidden sm:block">
                Temukan Teman Harimu
              </p>
            </div>
          </Link>

          {/* Dine-in vs Takeaway Selector & Table Picker */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setOrderType('dine_in')}
                className={`px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all flex items-center gap-1 ${
                  orderType === 'dine_in'
                    ? 'bg-[#007b9e] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UtensilsCrossed className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Dine-in</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('takeaway')}
                className={`px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all flex items-center gap-1 ${
                  orderType === 'takeaway'
                    ? 'bg-[#007b9e] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Takeaway</span>
                <span className="sm:hidden">Takeaway</span>
              </button>
            </div>

            {/* Table Selector Dropdown (visible if dine_in) */}
            {orderType === 'dine_in' && (
              <div className="relative">
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="bg-white text-[#075f7e] text-[11px] sm:text-xs font-bold py-1.5 sm:py-1.5 pl-3 pr-7 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#007b9e] cursor-pointer appearance-none shadow-sm"
                >
                  {tableList.map((tbl) => (
                    <option key={tbl} value={tbl} className="bg-white text-slate-800">
                      {tbl}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 pointer-events-none text-slate-400" />
              </div>
            )}
          </div>

          {/* Right Actions: Tracker, Admin Link, and Cart Button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Active Order Tracker Button */}
            {activeOrderId && (
              <button
                onClick={onOpenTracker}
                className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1.5 transition-all animate-pulse"
                title="Lihat status pesanan aktif"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">Pesanan:</span>
                <span>{activeOrderId}</span>
              </button>
            )}

            {/* Admin Portal Link */}
            <Link
              href="/admin"
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-[#007b9e] hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-1"
              title="Dashboard Barista / Admin"
            >
              <ShieldCheck className="w-4 h-4 text-[#007b9e]" />
              <span className="hidden lg:inline">Barista POS</span>
            </Link>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#007b9e] hover:bg-[#006a88] text-white shadow-md shadow-cyan-900/20 font-bold text-xs sm:text-sm transition-all transform active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">
                {cartItemCount > 0 ? formatRupiah(cartSubtotal) : 'Keranjang'}
              </span>
              {cartItemCount > 0 && (
                <span className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-[10px] sm:text-[11px] font-black bg-white text-[#007b9e] rounded-full shadow">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
