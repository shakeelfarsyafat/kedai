'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem, CategoryId } from '@/types/coffee';
import { menuStore } from '@/lib/menuStore';
import { CATEGORIES } from '@/lib/mockData';
import { formatRupiah } from '@/lib/utils';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Coffee,
  RotateCcw,
  Sparkles,
  Award,
  Flame,
  X,
  SlidersHorizontal,
} from 'lucide-react';

export const MenuManager: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<CategoryId>('all');
  const [filterStock, setFilterStock] = useState<'all' | 'available' | 'out_of_stock'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryId>('espresso');
  const [price, setPrice] = useState<number>(30000);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [tastingNotesStr, setTastingNotesStr] = useState('');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isBaristaPick, setIsBaristaPick] = useState(false);
  const [allowCustomization, setAllowCustomization] = useState(true);

  useEffect(() => {
    setItems(menuStore.getMenuItems());
    const unsub = menuStore.subscribe((updated) => {
      setItems(updated);
    });
    return () => unsub();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setCategory('espresso');
    setPrice(32000);
    setDescription('');
    setImage('https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=800&auto=format&fit=crop');
    setTastingNotesStr('Caramel, Nutty, Sweet Crema');
    setIsBestSeller(false);
    setIsBaristaPick(false);
    setAllowCustomization(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price);
    setDescription(item.description);
    setImage(item.image);
    setTastingNotesStr(item.tastingNotes ? item.tastingNotes.join(', ') : '');
    setIsBestSeller(!!item.isBestSeller);
    setIsBaristaPick(!!item.isBaristaPick);
    setAllowCustomization(item.allowCustomization);
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const notes = tastingNotesStr
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean);

    if (editingItem) {
      menuStore.updateMenuItem(editingItem.id, {
        name: name.trim(),
        category,
        price,
        description: description.trim(),
        image: image.trim() || editingItem.image,
        tastingNotes: notes.length > 0 ? notes : undefined,
        isBestSeller,
        isBaristaPick,
        allowCustomization,
      });
    } else {
      menuStore.addMenuItem({
        name: name.trim(),
        category,
        price,
        description: description.trim(),
        image:
          image.trim() ||
          'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=800&auto=format&fit=crop',
        tastingNotes: notes.length > 0 ? notes : undefined,
        isBestSeller,
        isBaristaPick,
        allowCustomization,
        available: true,
      });
    }

    setIsModalOpen(false);
  };

  const handleToggleStock = (id: string) => {
    menuStore.toggleAvailability(id);
  };

  const handleDelete = (id: string, itemName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus menu "${itemName}"?`)) {
      menuStore.deleteMenuItem(id);
    }
  };

  const handleResetCatalog = () => {
    if (confirm('Kembalikan seluruh menu ke katalog awal standar?')) {
      menuStore.resetToDefault();
    }
  };

  // Filter items
  const filtered = items.filter((it) => {
    const matchesCategory = selectedCat === 'all' || it.category === selectedCat;
    const matchesSearch =
      it.name.toLowerCase().includes(search.toLowerCase()) ||
      it.description.toLowerCase().includes(search.toLowerCase());
    const matchesStock =
      filterStock === 'all' ||
      (filterStock === 'available' && it.available) ||
      (filterStock === 'out_of_stock' && !it.available);

    return matchesCategory && matchesSearch && matchesStock;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar: Search, Category, Stock Filters, Add Button */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#181009] p-4 sm:p-5 rounded-2xl border border-stone-800 shadow-xl">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama menu..."
              className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Stock filter */}
          <div className="flex items-center bg-stone-900 p-0.5 rounded-xl border border-stone-800 text-xs">
            <button
              onClick={() => setFilterStock('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filterStock === 'all' ? 'bg-amber-600 text-white' : 'text-stone-400'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterStock('available')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filterStock === 'available' ? 'bg-emerald-600 text-white' : 'text-stone-400'
              }`}
            >
              Tersedia
            </button>
            <button
              onClick={() => setFilterStock('out_of_stock')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filterStock === 'out_of_stock' ? 'bg-red-600 text-white' : 'text-stone-400'
              }`}
            >
              Stok Habis
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleResetCatalog}
            className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white text-xs font-semibold border border-stone-800 transition-colors flex items-center gap-1.5"
            title="Reset ke katalog asli"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-lg shadow-amber-950 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Menu Baru</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              selectedCat === cat.id
                ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl bg-[#1a110a] border transition-all flex flex-col justify-between gap-3 shadow-lg ${
              item.available
                ? 'border-stone-800/80 hover:border-amber-700/50'
                : 'border-red-900/30 bg-[#160d07] opacity-75'
            }`}
          >
            {/* Top row: Image thumbnail & info */}
            <div className="flex items-start gap-3.5">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-900 flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {!item.available && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[9px] font-bold text-red-400 uppercase text-center p-1 leading-tight">
                    Habis
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-900/50">
                    {item.category}
                  </span>
                  {item.isBestSeller && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5 fill-stone-950" />
                      Best Seller
                    </span>
                  )}
                  {item.isBaristaPick && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/90 text-stone-950 flex items-center gap-0.5">
                      <Award className="w-2.5 h-2.5" />
                      Barista Pick
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-white mt-1 truncate">{item.name}</h4>
                <p className="text-xs font-extrabold text-amber-400 mt-0.5">
                  {formatRupiah(item.price)}
                </p>
                <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">{item.description}</p>
              </div>
            </div>

            {/* Bottom row: Availability Toggle & Edit/Delete actions */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-800/80">
              {/* Availability Stock Toggle */}
              <button
                type="button"
                onClick={() => handleToggleStock(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all border ${
                  item.available
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
                    : 'bg-red-950/60 border-red-500/40 text-red-300 hover:bg-red-900/40'
                }`}
                title="Klik untuk mengubah status ketersediaan di katalog pelanggan"
              >
                {item.available ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tersedia (Ready)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                    <span>Stok Habis (Sold Out)</span>
                  </>
                )}
              </button>

              {/* Edit & Delete */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-colors"
                  title="Edit Menu"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.name)}
                  className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-red-400 border border-stone-800 transition-colors"
                  title="Hapus Menu"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Menu Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg max-h-[90vh] bg-[#1c120a] border border-amber-900/40 rounded-3xl p-6 text-white shadow-2xl overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Coffee className="w-5 h-5 text-amber-500" />
                <span>{editingItem ? 'Edit Menu' : 'Tambah Menu Baru'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-stone-300 block mb-1">
                  Nama Menu <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Sea Salt Caramel Cold Brew"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-300 block mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryId)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="espresso">Espresso & Milk</option>
                    <option value="manual-brew">Manual Brew</option>
                    <option value="cold-brew">Cold Brew & Tea</option>
                    <option value="pastry">Pastry & Bakery</option>
                    <option value="snacks">Snacks & Toast</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-300 block mb-1">
                    Harga (Rp) <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-300 block mb-1">Deskripsi Menu</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi singkat rasa, komposisi, atau cara pembuatan..."
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-300 block mb-1">
                  Tasting Notes (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={tastingNotesStr}
                  onChange={(e) => setTastingNotesStr(e.target.value)}
                  placeholder="Contoh: Bergamot, Wild Berry, Cane Sugar"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-300 block mb-1">URL Foto Produk</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Badges and toggles */}
              <div className="pt-2 border-t border-stone-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-0"
                  />
                  <span className="text-stone-300">Tandai sebagai "Best Seller"</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBaristaPick}
                    onChange={(e) => setIsBaristaPick(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-0"
                  />
                  <span className="text-stone-300">Tandai sebagai "Barista Pick"</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCustomization}
                    onChange={(e) => setAllowCustomization(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-0"
                  />
                  <span className="text-stone-300">
                    Bolehkan Kustomisasi Pelanggan (Pilihan Gula, Es, dan Susu)
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
