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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center space-x-2 group shrink-0" title="Brew Bean">
            <img
              src="/images/logo-brew-bean.png"
              alt="Brew Bean"
              className="h-8 sm:h-10 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Desktop Dine-in vs Takeaway & Table Picker (Centered & Elegant - matching Gambar 3) */}
          <div className="hidden md:flex items-center gap-2.5">
            <div className="flex items-center p-1 rounded-full bg-[#eef4f8] border border-[#dce8f0]">
              <button
                type="button"
                onClick={() => setOrderType('dine_in')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  orderType === 'dine_in'
                    ? 'bg-[#007b9e] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Dine-in</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('takeaway')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  orderType === 'takeaway'
                    ? 'bg-[#007b9e] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Takeaway</span>
              </button>
            </div>

            {orderType === 'dine_in' && (
              <div className="relative">
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="bg-white text-[#075f7e] text-xs font-bold py-1.5 pl-4 pr-8 rounded-full border border-[#dce8f0] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007b9e] cursor-pointer appearance-none"
                >
                  {tableList.map((tbl) => (
                    <option key={tbl} value={tbl} className="bg-white text-slate-800">
                      {tbl}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 pointer-events-none text-[#007b9e]" />
              </div>
            )}
          </div>

          {/* Right Actions: Tracker, Barista Link, and Cart Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {activeOrderId && (
              <button
                onClick={onOpenTracker}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1.5 transition-all animate-pulse"
                title="Status pesanan aktif"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden lg:inline">Pesanan:</span>
                <span>{activeOrderId}</span>
              </button>
            )}

            <Link
              href="/admin"
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium text-slate-500 hover:text-[#007b9e] hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-1"
              title="Dashboard Barista / POS"
            >
              <ShieldCheck className="w-4 h-4 text-[#007b9e]" />
              <span className="hidden lg:inline">Barista</span>
            </Link>

            {/* Cart Button (Always visible on mobile & desktop) */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#007b9e] hover:bg-[#006a88] text-white shadow-md shadow-cyan-900/15 font-bold text-xs sm:text-sm transition-all transform active:scale-95 shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">
                {cartItemCount > 0 ? formatRupiah(cartSubtotal) : 'Keranjang'}
              </span>
              {cartItemCount > 0 && (
                <span className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-[10px] sm:text-[11px] font-black bg-white text-[#007b9e] rounded-full shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Sub-bar: Clean, perfectly centered placement for Dine-in/Takeaway & Table Picker */}
        <div className="md:hidden pb-3 pt-1 flex items-center justify-center gap-2">
          <div className="flex items-center p-0.5 rounded-full bg-[#eef4f8] border border-[#dce8f0]">
            <button
              type="button"
              onClick={() => setOrderType('dine_in')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                orderType === 'dine_in'
                  ? 'bg-[#007b9e] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Dine-in</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderType('takeaway')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 ${
                orderType === 'takeaway'
                  ? 'bg-[#007b9e] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Takeaway</span>
            </button>
          </div>

          {orderType === 'dine_in' && (
            <div className="relative">
              <select
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="bg-white text-[#075f7e] text-[11px] font-bold py-1.5 pl-3 pr-7 rounded-full border border-[#dce8f0] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007b9e] cursor-pointer appearance-none"
              >
                {tableList.map((tbl) => (
                  <option key={tbl} value={tbl} className="bg-white text-slate-800">
                    {tbl}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2.5 top-2.5 pointer-events-none text-[#007b9e]" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
