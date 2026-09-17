'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MenuItem, CategoryId } from '@/types/coffee';
import { menuStore } from '@/lib/menuStore';
import { CATEGORIES } from '@/lib/mockData';
import { formatRupiah } from '@/lib/utils';
import { compressMenuImage, CompressionResult } from '@/lib/imageCompression';
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
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
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
  const [category, setCategory] = useState<CategoryId>('coffee');
  const [price, setPrice] = useState<number>(30000);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [tastingNotesStr, setTastingNotesStr] = useState('');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isBaristaPick, setIsBaristaPick] = useState(false);
  const [allowCustomization, setAllowCustomization] = useState(true);

  // Image Upload & Compression State
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    setCategory('coffee');
    setPrice(28000);
    setDescription('');
    setImage('/images/prod-americano.png');
    setTastingNotesStr('Palm Sugar, Creamy Espresso, Milk');
    setIsBestSeller(false);
    setIsBaristaPick(false);
    setAllowCustomization(true);
    setCompressionInfo(null);
    setUploadError(null);
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
    setCompressionInfo(null);
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleFileProcess = async (file: File) => {
    setUploadError(null);
    setIsCompressing(true);

    try {
      const result = await compressMenuImage(file, { maxDimension: 800, quality: 0.82 });
      setImage(result.dataUrl);
      setCompressionInfo(result);
    } catch (err: any) {
      setUploadError(err?.message || 'Gagal memproses gambar.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
    // reset input so same file can be re-selected if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemovePhoto = () => {
    setImage('');
    setCompressionInfo(null);
    setUploadError(null);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const notes = tastingNotesStr
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean);

    const finalImage = image.trim() || '/images/prod-americano.png';

    if (editingItem) {
      menuStore.updateMenuItem(editingItem.id, {
        name: name.trim(),
        category,
        price,
        description: description.trim(),
        image: finalImage,
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
        image: finalImage,
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
    if (confirm('Kembalikan seluruh menu ke katalog default Brew Bean?')) {
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

  const availableCategories = CATEGORIES.filter((c) => c.id !== 'all');

  return (
    <div className="space-y-6">
      {/* Top Action Bar: Search, Category, Stock Filters, Add Button */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#0d171d] p-4 sm:p-5 rounded-2xl border border-[#1c3340] shadow-xl">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama menu..."
              className="w-full bg-[#080e12] border border-[#1c3340] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007b9e] focus:border-transparent transition-all"
            />
          </div>

          {/* Stock filter */}
          <div className="flex items-center bg-[#080e12] p-1 rounded-xl border border-[#1c3340] text-xs">
            <button
              onClick={() => setFilterStock('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterStock === 'all'
                  ? 'bg-[#007b9e] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterStock('available')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterStock === 'available'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tersedia
            </button>
            <button
              onClick={() => setFilterStock('out_of_stock')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterStock === 'out_of_stock'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Stok Habis
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={handleResetCatalog}
            className="px-3.5 py-2 rounded-xl bg-[#080e12] hover:bg-[#13222a] text-slate-300 hover:text-white text-xs font-semibold border border-[#1c3340] transition-colors flex items-center gap-1.5"
            title="Reset ke katalog asli Brew Bean"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#007b9e]" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#007b9e] to-[#075f7e] hover:from-[#006e8d] hover:to-[#05516b] text-white text-xs font-bold shadow-lg shadow-cyan-950/50 transition-all flex items-center gap-1.5 active:scale-95"
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
                ? 'bg-[#007b9e]/25 border-[#007b9e] text-cyan-200 shadow-sm'
                : 'bg-[#0d171d] border-[#1c3340] text-slate-400 hover:border-slate-600 hover:text-white'
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
            className={`p-4 rounded-2xl bg-[#0d171d] border transition-all flex flex-col justify-between gap-3.5 shadow-lg ${
              item.available
                ? 'border-[#1c3340] hover:border-[#007b9e]/60'
                : 'border-red-900/30 bg-[#120e0e] opacity-75'
            }`}
          >
            {/* Top row: Image thumbnail & info */}
            <div className="flex items-start gap-3.5">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#080e12] border border-[#1c3340] flex-shrink-0 flex items-center justify-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to default cup icon if image link broken
                    (e.target as HTMLImageElement).src = '/images/prod-americano.png';
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#007b9e]/20 text-cyan-300 border border-[#007b9e]/40">
                    {item.category}
                  </span>
                  {item.isBestSeller && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5 text-amber-400" />
                      Best Seller
                    </span>
                  )}
                  {item.isBaristaPick && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-0.5">
                      <Award className="w-2.5 h-2.5 text-purple-400" />
                      Pilihan Barista
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-white mt-1 truncate">{item.name}</h3>
                <p className="text-xs font-extrabold text-cyan-400 mt-0.5">
                  {formatRupiah(item.price)}
                </p>

                {item.description && (
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
            </div>

            {/* Tasting Notes */}
            {item.tastingNotes && item.tastingNotes.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.tastingNotes.map((note, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-[#080e12] border border-[#1c3340] text-slate-300"
                  >
                    {note}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom Row: Stock Toggle & Actions */}
            <div className="pt-2.5 border-t border-[#1c3340] flex items-center justify-between gap-2">
              {/* Toggle Stock */}
              <button
                type="button"
                onClick={() => handleToggleStock(item.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  item.available
                    ? 'bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60'
                    : 'bg-red-950/70 border border-red-800/60 text-red-300 hover:bg-red-900/60'
                }`}
              >
                {item.available ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tersedia</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Habis</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="p-1.5 rounded-lg bg-[#080e12] hover:bg-[#14232b] text-slate-300 hover:text-white border border-[#1c3340] transition-colors"
                  title="Edit menu"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#007b9e]" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.name)}
                  className="p-1.5 rounded-lg bg-[#080e12] hover:bg-red-950/70 text-slate-400 hover:text-red-300 border border-[#1c3340] hover:border-red-900 transition-colors"
                  title="Hapus menu"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg max-h-[90vh] bg-[#0d171d] border border-[#1c3340] rounded-3xl p-6 text-white shadow-2xl overflow-y-auto space-y-4 selection:bg-[#007b9e]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c3340]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#007b9e]/20 border border-[#007b9e]/40 flex items-center justify-center">
                  <Coffee className="w-4 h-4 text-cyan-400" />
                </div>
                <h2 className="text-base font-bold text-white">
                  {editingItem ? 'Edit Informasi Menu' : 'Tambah Menu Baru'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              {/* Nama Menu */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Nama Menu <span className="text-[#007b9e]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Lokale Signature Palm Latte"
                  className="w-full bg-[#080e12] border border-[#1c3340] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#007b9e] transition-all"
                />
              </div>

              {/* Kategori & Harga */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryId)}
                    className="w-full bg-[#080e12] border border-[#1c3340] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#007b9e] transition-all"
                  >
                    {availableCategories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#0d171d] text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Harga (Rp) <span className="text-[#007b9e]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-[#080e12] border border-[#1c3340] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#007b9e] transition-all"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Deskripsi Menu</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi singkat racikan, rasa, atau keunikan menu..."
                  className="w-full bg-[#080e12] border border-[#1c3340] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#007b9e] transition-all resize-none"
                />
              </div>

              {/* Tasting Notes */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Tasting Notes (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={tastingNotesStr}
                  onChange={(e) => setTastingNotesStr(e.target.value)}
                  placeholder="Contoh: Brown Sugar, Creamy, Floral Jasmine"
                  className="w-full bg-[#080e12] border border-[#1c3340] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#007b9e] transition-all"
                />
              </div>

              {/* Foto Produk: File Upload With Auto-Compression */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-300">
                    Foto Produk Menu
                  </label>
                  <span className="text-[10px] text-cyan-400 font-medium">
                    Auto-compress JPG, JPEG, PNG
                  </span>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {image ? (
                  /* Current Image Preview with change/delete actions */
                  <div className="p-3 bg-[#080e12] border border-[#1c3340] rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-b from-[#075f7e] via-[#157e9f] to-[#bde5f0] border border-[#1c3340] shrink-0 flex items-center justify-center p-1 shadow-inner">
                        <img
                          src={image}
                          alt="Pratinjau foto menu"
                          className="w-full h-full object-contain drop-shadow"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          Foto Siap (Tanpa Background Putih)
                        </p>
                        {compressionInfo ? (
                          <p className="text-[11px] text-cyan-300 mt-0.5">
                            {compressionInfo.originalSize} ➔ {compressionInfo.compressedSize}{' '}
                            <span className="text-emerald-400 font-bold">
                              (Hemat {compressionInfo.savedPercentage}%)
                            </span>
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                            Background putih otomatis dibersihkan & transparan
                          </p>
                        )}
                        <p className="text-[10px] text-emerald-400 font-medium">
                          ✓ Format transparan dioptimasi untuk web
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-[#007b9e]/20 hover:bg-[#007b9e]/40 border border-[#007b9e]/40 text-cyan-300 font-semibold text-xs transition-colors"
                      >
                        Ganti Foto
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-3 py-1 rounded-lg hover:bg-red-950/50 text-red-400 text-[11px] transition-colors"
                      >
                        Hapus Foto
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Drag and Drop Zone */
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? 'border-[#007b9e] bg-[#007b9e]/10'
                        : 'border-[#1c3340] bg-[#080e12] hover:border-[#007b9e]/60 hover:bg-[#0b141a]'
                    }`}
                  >
                    {isCompressing ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
                        <p className="text-xs font-semibold text-slate-300">
                          Mengonversi, memotong background putih & mengompres ukuran foto...
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-[#007b9e]/15 border border-[#007b9e]/30 flex items-center justify-center text-cyan-300">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            Klik atau drag & drop foto ke sini
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Format: <span className="text-cyan-300 font-semibold">JPG, JPEG, PNG, WebP</span>
                          </p>
                          <p className="text-[10px] text-emerald-400/90 font-medium mt-1">
                            ✓ Otomatis hilangkan background putih & transparan (ukuran kecil)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Error message */}
                {uploadError && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400 bg-red-950/40 p-2 rounded-xl border border-red-900/50">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              {/* Badges and toggles */}
              <div className="pt-2 border-t border-[#1c3340] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="rounded text-[#007b9e] focus:ring-0 bg-[#080e12] border-[#1c3340]"
                  />
                  <span className="text-slate-300">Tandai sebagai "Best Seller"</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBaristaPick}
                    onChange={(e) => setIsBaristaPick(e.target.checked)}
                    className="rounded text-[#007b9e] focus:ring-0 bg-[#080e12] border-[#1c3340]"
                  />
                  <span className="text-slate-300">Tandai sebagai "Pilihan Barista"</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCustomization}
                    onChange={(e) => setAllowCustomization(e.target.checked)}
                    className="rounded text-[#007b9e] focus:ring-0 bg-[#080e12] border-[#1c3340]"
                  />
                  <span className="text-slate-300">
                    Bolehkan Kustomisasi Pelanggan (Pilihan Gula, Es, dan Susu)
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-[#1c3340] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#080e12] hover:bg-[#16252e] text-slate-300 font-semibold border border-[#1c3340] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#007b9e] hover:bg-[#006e8d] text-white font-bold shadow-lg shadow-cyan-950/40 transition-all active:scale-95"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
