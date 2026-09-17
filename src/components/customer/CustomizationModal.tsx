'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem, Customization, SugarLevel, IceLevel, MilkOption, CartItem } from '@/types/coffee';
import { ADD_ONS } from '@/lib/mockData';
import { formatRupiah } from '@/lib/utils';
import { X, Plus, Minus, Check } from 'lucide-react';

interface CustomizationModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [sugarLevel, setSugarLevel] = useState<SugarLevel>('normal');
  const [iceLevel, setIceLevel] = useState<IceLevel>('normal');
  const [milkOption, setMilkOption] = useState<MilkOption>('dairy');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSugarLevel('normal');
      setIceLevel('normal');
      setMilkOption('dairy');
      setSelectedAddOns([]);
      setNotes('');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const milkPrice = milkOption === 'oatmilk' ? 6000 : milkOption === 'almond' ? 8000 : 0;
  const addOnsPrice = selectedAddOns.reduce((total, addonId) => {
    const addon = ADD_ONS.find((a) => a.id === addonId);
    return total + (addon ? addon.price : 0);
  }, 0);

  const unitPrice = item.price + milkPrice + addOnsPrice;
  const totalPrice = unitPrice * quantity;

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const customization: Customization = {
      sugarLevel,
      iceLevel,
      milkOption,
      selectedAddOns,
      notes: notes.trim() || undefined,
    };

    const cartItemId = `${item.id}-${sugarLevel}-${iceLevel}-${milkOption}-${selectedAddOns.sort().join('_')}-${notes.trim()}`;

    const cartItem: CartItem = {
      id: cartItemId,
      menuItem: item,
      quantity,
      customization,
      itemPrice: unitPrice,
      totalPrice,
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Container - Bottom Sheet on mobile (rounded-t-3xl), Centered Modal on desktop */}
      <div className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] bg-[#1a120c] border-t sm:border border-amber-900/40 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
        {/* Mobile Drag Indicator Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center bg-[#20140d]">
          <div className="w-12 h-1.5 rounded-full bg-stone-700" />
        </div>

        {/* Header with image */}
        <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-stone-900 flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a120c] via-black/40 to-black/60" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Item title in header */}
          <div className="absolute bottom-3 left-4 right-4">
            <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-amber-400">
              Kustomisasi Minuman
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white line-clamp-1">{item.name}</h2>
            <p className="text-xs sm:text-sm font-semibold text-amber-300">
              Mulai {formatRupiah(item.price)}
            </p>
          </div>
        </div>

        {/* Customization Options (Touch friendly) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-stone-200">
          {item.allowCustomization ? (
            <>
              {/* Sugar Level */}
              <div>
                <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-300 block mb-2">
                  Tingkat Kemanisan (Sugar Level)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'normal', label: 'Normal (100%)' },
                    { id: 'less', label: 'Less (50%)' },
                    { id: 'low', label: 'Low (25%)' },
                    { id: 'none', label: 'Tanpa Gula (0%)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSugarLevel(s.id as SugarLevel)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all active:scale-98 ${
                        sugarLevel === s.id
                          ? 'bg-amber-600/30 border-amber-500 text-amber-200 shadow-sm'
                          : 'bg-stone-900/70 border-stone-800 text-stone-400'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ice Level */}
              <div>
                <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-300 block mb-2">
                  Pilihan Es & Suhu
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'normal', label: 'Normal Ice 🧊' },
                    { id: 'less', label: 'Less Ice ❄️' },
                    { id: 'none', label: 'No Ice' },
                    { id: 'hot', label: 'Panas (Hot) ☕' },
                  ].map((ice) => (
                    <button
                      key={ice.id}
                      type="button"
                      onClick={() => setIceLevel(ice.id as IceLevel)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all active:scale-98 ${
                        iceLevel === ice.id
                          ? 'bg-amber-600/30 border-amber-500 text-amber-200 shadow-sm'
                          : 'bg-stone-900/70 border-stone-800 text-stone-400'
                      }`}
                    >
                      {ice.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Milk Option */}
              <div>
                <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-300 block mb-2">
                  Pilihan Susu (Milk Base)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'dairy', label: 'Fresh Milk (Dairy)', extra: 0 },
                    { id: 'oatmilk', label: 'Oatmilk (Oatside)', extra: 6000 },
                    { id: 'almond', label: 'Almond Milk', extra: 8000 },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMilkOption(m.id as MilkOption)}
                      className={`p-2.5 rounded-xl text-left border transition-all active:scale-98 ${
                        milkOption === m.id
                          ? 'bg-amber-600/30 border-amber-500 text-amber-200 shadow-sm'
                          : 'bg-stone-900/70 border-stone-800 text-stone-400'
                      }`}
                    >
                      <div className="text-xs font-semibold">{m.label}</div>
                      <div className="text-[11px] text-amber-400 mt-0.5 font-bold">
                        {m.extra > 0 ? `+${formatRupiah(m.extra)}` : 'Termasuk'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add-ons */}
              <div>
                <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-300 block mb-2">
                  Tambahan Ekstra (Add-ons)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ADD_ONS.map((addon) => {
                    const isSelected = selectedAddOns.includes(addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddOn(addon.id)}
                        className={`p-2.5 rounded-xl flex items-center justify-between border text-left transition-all active:scale-98 ${
                          isSelected
                            ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                            : 'bg-stone-900/70 border-stone-800 text-stone-400'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold">{addon.name}</div>
                          <div className="text-[11px] text-amber-400 font-bold">
                            +{formatRupiah(addon.price)}
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isSelected
                              ? 'bg-amber-500 border-amber-400 text-stone-950'
                              : 'border-stone-700'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800 text-xs text-stone-300">
              Disajikan dengan resep standar barista terbaik untuk cita rasa otentik.
            </div>
          )}

          {/* Notes for Barista */}
          <div>
            <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-300 block mb-1.5">
              Catatan untuk Barista (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Sedotan kertas, pisah saus..."
              maxLength={120}
              className="w-full bg-stone-900/90 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Footer: Quantity & Confirm Button */}
        <div className="p-3.5 sm:p-4 bg-[#140e08] border-t border-stone-800 flex items-center justify-between gap-3">
          <div className="flex items-center bg-stone-900 border border-stone-800 rounded-xl p-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-white"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-white">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-amber-950/60 flex items-center justify-between active:scale-98 transition-all"
          >
            <span>Tambah</span>
            <span>{formatRupiah(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
