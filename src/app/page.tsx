'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/customer/Header';
import { MenuCard } from '@/components/customer/MenuCard';
import { CustomizationModal } from '@/components/customer/CustomizationModal';
import { CartDrawer } from '@/components/customer/CartDrawer';
import { OrderStatusModal } from '@/components/customer/OrderStatusModal';
import { CATEGORIES } from '@/lib/mockData';
import { menuStore } from '@/lib/menuStore';
import { MenuItem, CategoryId, CartItem, OrderType, Order } from '@/types/coffee';
import { formatRupiah } from '@/lib/utils';
import {
  Search,
  Coffee,
  Sparkles,
  CupSoda,
  Flame,
  Croissant,
  Utensils,
  ShoppingBag,
  Clock,
  Award,
} from 'lucide-react';

export default function CustomerPortalPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [tableNumber, setTableNumber] = useState('Meja 04');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Customization modal state
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  // Active order tracker state
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  // Load menu items and subscribe to real-time updates from MenuManager
  useEffect(() => {
    setMenuItems(menuStore.getMenuItems());
    const unsubMenu = menuStore.subscribe((updated) => {
      setMenuItems(updated);
    });
    return () => unsubMenu();
  }, []);

  // Restore cart & active order from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('kroma_customer_cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch {}
      }

      const savedOrderId = localStorage.getItem('kroma_active_order_id');
      if (savedOrderId) {
        setActiveOrderId(savedOrderId);
      }
    }
  }, []);

  // Save cart changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kroma_customer_cart', JSON.stringify(cart));
    }
  }, [cart]);

  // Handle category icon
  const getCategoryIcon = (id: CategoryId) => {
    switch (id) {
      case 'all':
        return <Coffee className="w-4 h-4" />;
      case 'espresso':
        return <CupSoda className="w-4 h-4" />;
      case 'manual-brew':
        return <Flame className="w-4 h-4" />;
      case 'cold-brew':
        return <Sparkles className="w-4 h-4" />;
      case 'pastry':
        return <Croissant className="w-4 h-4" />;
      case 'snacks':
        return <Utensils className="w-4 h-4" />;
      default:
        return <Coffee className="w-4 h-4" />;
    }
  };

  // Cart operations
  const handleSelectItem = (item: MenuItem) => {
    if (item.available === false) return;

    if (item.allowCustomization) {
      setCustomizingItem(item);
    } else {
      const cartItemId = `${item.id}-standard`;
      const existing = cart.find((i) => i.id === cartItemId);

      if (existing) {
        setCart(
          cart.map((i) =>
            i.id === cartItemId
              ? {
                  ...i,
                  quantity: i.quantity + 1,
                  totalPrice: (i.quantity + 1) * i.itemPrice,
                }
              : i
          )
        );
      } else {
        const newCartItem: CartItem = {
          id: cartItemId,
          menuItem: item,
          quantity: 1,
          customization: {
            sugarLevel: 'normal',
            iceLevel: 'normal',
            milkOption: 'dairy',
            selectedAddOns: [],
          },
          itemPrice: item.price,
          totalPrice: item.price,
        };
        setCart([...cart, newCartItem]);
      }
    }
  };

  const handleAddToCartWithCustomization = (item: CartItem) => {
    const existingIndex = cart.findIndex((i) => i.id === item.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += item.quantity;
      updated[existingIndex].totalPrice =
        updated[existingIndex].quantity * updated[existingIndex].itemPrice;
      setCart(updated);
    } else {
      setCart([...cart, item]);
    }
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0
              ? { ...item, quantity: newQty, totalPrice: newQty * item.itemPrice }
              : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOrderCreated = (order: Order) => {
    setActiveOrderId(order.id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kroma_active_order_id', order.id);
    }
    setIsTrackerOpen(true);
  };

  // Filter menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tastingNotes &&
        item.tastingNotes.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#120c08] text-stone-100 flex flex-col selection:bg-amber-600 selection:text-white pb-24 sm:pb-12">
      {/* Header */}
      <Header
        orderType={orderType}
        setOrderType={setOrderType}
        tableNumber={tableNumber}
        setTableNumber={setTableNumber}
        cartItemCount={totalCartCount}
        cartSubtotal={cartSubtotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracker={() => setIsTrackerOpen(true)}
        activeOrderId={activeOrderId}
      />

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#1f140e] via-[#170e09] to-[#120c08] border-b border-amber-900/20 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fresh Roastery & Artisan Slow Bar</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Nikmati Racikan Kopi Pilihan & Sensasi Cita Rasa Terbaik.
            </h1>
            <p className="mt-2.5 text-xs sm:text-sm text-stone-400 font-light leading-relaxed">
              Pesan langsung dari meja Anda tanpa perlu antre di kasir. Kustomisasi tingkat gula, es,
              dan pilihan susu sesuai selera Anda.
            </p>

            {/* Quick Highlights */}
            <div className="mt-5 flex flex-wrap gap-4 text-xs text-stone-300 font-medium">
              <div className="flex items-center gap-1.5 text-amber-300/90">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>100% Single Origin Arabika</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300/90">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Pilihan Oat & Almond Milk</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300/90">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Live Barista Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        {/* Search & Category Pills Controls */}
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kopi, manual brew, croissant, tasting notes..."
              className="w-full bg-[#1b120c] border border-stone-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-white"
              >
                Reset
              </button>
            )}
          </div>

          {/* Category Tabs / Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                    isActive
                      ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-950/50 scale-102'
                      : 'bg-[#1b120c] border-stone-800/90 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-amber-500'}>
                    {getCategoryIcon(cat.id)}
                  </span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm sm:text-base font-bold text-stone-200 flex items-center gap-2">
              <span>
                {CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Katalog Menu'}
              </span>
              <span className="text-xs font-normal text-stone-400">
                ({filteredItems.length} menu tersedia)
              </span>
            </h2>
          </div>

          {filteredItems.length === 0 ? (
            <div className="py-16 text-center bg-[#170e09] rounded-3xl border border-stone-800/80 p-8">
              <Coffee className="w-12 h-12 mx-auto text-stone-600 mb-3" />
              <h3 className="text-base font-bold text-stone-300">Menu Tidak Ditemukan</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Tidak ada menu yang sesuai dengan kata kunci "{searchQuery}". Coba kata kunci lain atau
                pilih kategori berbeda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredItems.map((item) => (
                <MenuCard key={item.id} item={item} onSelect={handleSelectItem} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Mobile Sticky Cart Bar */}
      {totalCartCount > 0 && (
        <div className="sm:hidden fixed bottom-4 inset-x-4 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-sm shadow-2xl shadow-amber-950 flex items-center justify-between animate-fadeIn"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-black/30 flex items-center justify-center text-xs font-extrabold">
                {totalCartCount}
              </div>
              <span>Lihat Pesanan</span>
            </div>
            <span className="text-amber-200 font-extrabold">{formatRupiah(cartSubtotal)}</span>
          </button>
        </div>
      )}

      {/* Customization Modal */}
      <CustomizationModal
        item={customizingItem}
        isOpen={!!customizingItem}
        onClose={() => setCustomizingItem(null)}
        onAddToCart={handleAddToCartWithCustomization}
      />

      {/* Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        orderType={orderType}
        tableNumber={tableNumber}
        onOrderCreated={handleOrderCreated}
      />

      {/* Order Status Modal */}
      <OrderStatusModal
        orderId={activeOrderId}
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
      />
    </div>
  );
}
