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
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-amber-900/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/40 group-hover:scale-105 transition-transform">
              <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-amber-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-xl font-extrabold tracking-wider text-amber-100 uppercase">
                  KROMA
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Specialty
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-stone-400 font-light hidden sm:block">
                Artisanal Roastery & Slow Bar
              </p>
            </div>
          </Link>

          {/* Dine-in vs Takeaway Selector & Table Picker */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="flex items-center p-0.5 sm:p-1 rounded-xl bg-stone-900/90 border border-stone-800">
              <button
                type="button"
                onClick={() => setOrderType('dine_in')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all flex items-center gap-1 ${
                  orderType === 'dine_in'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <UtensilsCrossed className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Dine-in</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('takeaway')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all flex items-center gap-1 ${
                  orderType === 'takeaway'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Bawa Pulang</span>
                <span className="sm:hidden">Takeaway</span>
              </button>
            </div>

            {/* Table Selector Dropdown (visible if dine_in) */}
            {orderType === 'dine_in' && (
              <div className="relative">
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="bg-stone-900/90 text-amber-300 text-[11px] sm:text-xs font-bold py-1.5 sm:py-2 pl-2.5 pr-6 sm:pr-7 rounded-xl border border-amber-900/40 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer appearance-none"
                >
                  {tableList.map((tbl) => (
                    <option key={tbl} value={tbl} className="bg-stone-900 text-white">
                      {tbl}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-1.5 sm:right-2 top-2.5 pointer-events-none text-amber-500" />
              </div>
            )}
          </div>

          {/* Right Actions: Tracker, Admin Link, and Cart Button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Active Order Tracker Button */}
            {activeOrderId && (
              <button
                onClick={onOpenTracker}
                className="px-2.5 py-1 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50 flex items-center gap-1.5 transition-all animate-pulse"
                title="Lihat status pesanan aktif"
              >
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Pesanan:</span>
                <span>{activeOrderId}</span>
              </button>
            )}

            {/* Admin Portal Link */}
            <Link
              href="/admin"
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-amber-300 hover:bg-stone-900 border border-transparent hover:border-amber-900/40 transition-all flex items-center gap-1"
              title="Dashboard Barista / Admin"
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span className="hidden lg:inline">Barista POS</span>
            </Link>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-lg shadow-amber-950/50 font-bold text-xs sm:text-sm transition-all transform active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">
                {cartItemCount > 0 ? formatRupiah(cartSubtotal) : 'Keranjang'}
              </span>
              {cartItemCount > 0 && (
                <span className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-[10px] sm:text-[11px] font-black bg-white text-amber-950 rounded-full">
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
