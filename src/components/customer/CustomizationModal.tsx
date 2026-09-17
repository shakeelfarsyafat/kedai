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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Container - Bottom Sheet on mobile (rounded-t-3xl), Centered Modal on desktop */}
      <div className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] bg-white border-t sm:border border-slate-200 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
        {/* Mobile Drag Indicator Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center bg-slate-50">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Header with image */}
        <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-gradient-to-b from-[#075f7e] to-[#9ad6e8] flex-shrink-0 flex items-center justify-center">
          <img
            src={item.image}
            alt={item.name}
            className="h-full object-contain p-2 drop-shadow-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Item title in header */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-cyan-200">
              Kustomisasi Minuman
            </span>
            <h2 className="text-lg sm:text-xl font-bold line-clamp-1">{item.name}</h2>
            <p className="text-xs sm:text-sm font-semibold text-cyan-100">
              Mulai {formatRupiah(item.price)}
            </p>
          </div>
        </div>

        {/* Customization Options */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-slate-700">
          {item.allowCustomization ? (
            <>
              {/* Sugar Level */}
              <div>
                <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#075f7e] block mb-2">
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
                          ? 'bg-cyan-50 border-[#007b9e] text-[#007b9e] shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ice Level */}
              <div>
                <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#075f7e] block mb-2">
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
                          ? 'bg-cyan-50 border-[#007b9e] text-[#007b9e] shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {ice.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Milk Option */}
              <div>
                <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#075f7e] block mb-2">
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
                          ? 'bg-cyan-50 border-[#007b9e] text-[#007b9e] shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-semibold">{m.label}</div>
                      <div className="text-[11px] text-[#007b9e] mt-0.5 font-bold">
                        {m.extra > 0 ? `+${formatRupiah(m.extra)}` : 'Termasuk'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add-ons */}
              <div>
                <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#075f7e] block mb-2">
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
                            ? 'bg-cyan-50 border-[#007b9e] text-[#007b9e]'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold">{addon.name}</div>
                          <div className="text-[11px] text-[#007b9e] font-bold">
                            +{formatRupiah(addon.price)}
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isSelected
                              ? 'bg-[#007b9e] border-[#007b9e] text-white'
                              : 'border-slate-300'
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
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              Disajikan dengan resep standar barista terbaik untuk cita rasa otentik.
            </div>
          )}

          {/* Notes for Barista */}
          <div>
            <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#075f7e] block mb-1.5">
              Catatan untuk Barista (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Sedotan kertas, pisah saus..."
              maxLength={120}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007b9e]"
            />
          </div>
        </div>

        {/* Footer: Quantity & Confirm Button */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-full p-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-slate-800">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 px-5 rounded-full bg-[#007b9e] hover:bg-[#006a88] text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-900/20 flex items-center justify-between active:scale-98 transition-all"
          >
            <span>Tambah ke Pesanan</span>
            <span>{formatRupiah(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

