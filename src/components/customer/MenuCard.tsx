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
      className={`group relative rounded-2xl border transition-all duration-300 flex flex-col shadow-lg overflow-hidden ${
        isAvailable
          ? 'bg-[#1f150e]/80 hover:bg-[#281c13] border-stone-800/80 hover:border-amber-600/40 hover:shadow-amber-950/20'
          : 'bg-[#180f0a] border-stone-900 opacity-70'
      }`}
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-900">
        <img
          src={item.image}
          alt={item.name}
          className={`w-full h-full object-cover object-center transition-transform duration-500 ${
            isAvailable ? 'group-hover:scale-105' : 'grayscale contrast-75'
          }`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f150e] via-transparent to-black/30" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {!isAvailable ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-red-600 text-white shadow-md">
              <Ban className="w-3 h-3" />
              Stok Habis
            </span>
          ) : (
            <>
              {item.isBestSeller && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-stone-950 shadow-md">
                  <Flame className="w-3 h-3 fill-stone-950" />
                  Best Seller
                </span>
              )}
              {item.isBaristaPick && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/90 text-stone-950 shadow-md">
                  <Award className="w-3 h-3" />
                  Barista Pick
                </span>
              )}
            </>
          )}
        </div>

        {/* Customization Available Indicator */}
        {isAvailable && item.allowCustomization && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-stone-950/70 border border-amber-500/30 text-amber-300 text-[10px] font-medium backdrop-blur-sm">
            Bisa Kustom
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3
            className={`font-bold text-base sm:text-lg line-clamp-1 ${
              isAvailable ? 'text-stone-100 group-hover:text-amber-200' : 'text-stone-400'
            }`}
          >
            {item.name}
          </h3>

          <p className="mt-1 text-xs text-stone-400 line-clamp-2 leading-relaxed font-light">
            {item.description}
          </p>

          {/* Tasting Notes */}
          {item.tastingNotes && item.tastingNotes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.tastingNotes.map((note) => (
                <span
                  key={note}
                  className="px-2 py-0.5 text-[10px] rounded-md bg-amber-950/60 border border-amber-800/40 text-amber-300/90"
                >
                  {note}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Harga</span>
            <span
              className={`text-base sm:text-lg font-bold ${
                isAvailable ? 'text-amber-400' : 'text-stone-500 line-through'
              }`}
            >
              {formatRupiah(item.price)}
            </span>
          </div>

          {isAvailable ? (
            <button
              onClick={() => onSelect(item)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-950/40 transition-all active:scale-95 group/btn"
            >
              {item.allowCustomization ? (
                <>
                  <SlidersHorizontal className="w-3.5 h-3.5 group-hover/btn:rotate-45 transition-transform" />
                  <span>Pilih Opsi</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </>
              )}
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-500 text-xs font-medium cursor-not-allowed">
              Habis
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
