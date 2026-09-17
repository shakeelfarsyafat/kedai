'use client';

import React from 'react';
import { MenuItem } from '@/types/coffee';
import { formatRupiah } from '@/lib/utils';
import { Plus, SlidersHorizontal, Flame, Award, Ban } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onSelect }) => {
  const isAvailable = item.available !== false;

  return (
    <div
      onClick={() => isAvailable && onSelect(item)}
      className={`group relative rounded-3xl bg-white p-2.5 sm:p-3 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer ${
        isAvailable ? 'hover:-translate-y-1' : 'opacity-60 grayscale'
      }`}
    >
      {/* Top Image Container with Reference Signature Teal Gradient */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#075f7e] via-[#157e9f] via-70% to-[#bde5f0] flex items-center justify-center p-3 shadow-inner">
        {/* Soft atmospheric gradient sheen */}
        <div className="absolute inset-0 bg-radial from-white/10 to-transparent pointer-events-none" />

        {/* Product Image */}
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-contain drop-shadow-[0_12px_14px_rgba(0,0,0,0.22)] group-hover:scale-106 transition-transform duration-300 relative z-10"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-20">
          {!isAvailable ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow">
              <Ban className="w-2.5 h-2.5" />
              Habis
            </span>
          ) : (
            <>
              {item.isBestSeller && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900 shadow">
                  <Flame className="w-2.5 h-2.5 fill-slate-900" />
                  Fav
                </span>
              )}
              {item.isBaristaPick && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400 text-slate-900 shadow">
                  <Award className="w-2.5 h-2.5" />
                  Pilihan
                </span>
              )}
            </>
          )}
        </div>

        {/* Customization badge */}
        {isAvailable && item.allowCustomization && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-white text-[9px] font-medium z-20">
            Kustom
          </div>
        )}
      </div>

      {/* Bottom Title & Details */}
      <div className="pt-3 pb-1 px-1 flex-1 flex flex-col justify-between text-center">
        <div>
          <h3 className="font-bold text-xs sm:text-sm text-[#075f7e] group-hover:text-[#007b9e] transition-colors line-clamp-1">
            {item.name}
          </h3>
          <p className="mt-0.5 text-[11px] sm:text-xs font-semibold text-slate-500">
            {formatRupiah(item.price)}
          </p>
        </div>

        {/* Quick Add / Customize Action on Hover or Mobile */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-center">
          {isAvailable ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item);
              }}
              className="w-full py-1.5 px-3 rounded-full bg-slate-50 group-hover:bg-[#007b9e] text-[#075f7e] group-hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-all duration-200"
            >
              {item.allowCustomization ? (
                <>
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Kustomisasi</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" />
                  <span>Pesan</span>
                </>
              )}
            </button>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium py-1">Stok Habis</span>
          )}
        </div>
      </div>
    </div>
  );
};

