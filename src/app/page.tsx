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
      selectedCategory === 'all' ||
      item.category === selectedCategory ||
      (selectedCategory === 'side-dish' && (item.category === 'snacks' || item.category === 'side-dish')) ||
      (selectedCategory === 'snacks' && (item.category === 'side-dish' || item.category === 'snacks')) ||
      (selectedCategory === 'main-dish' && (item.category === 'toast' || item.category === 'main-dish')) ||
      (selectedCategory === 'toast' && (item.category === 'main-dish' || item.category === 'toast')) ||
      (selectedCategory === 'dessert' && item.category === 'dessert');
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col selection:bg-[#007b9e] selection:text-white pb-24 sm:pb-12">
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

      {/* Hero Welcome Banner with Floating Coffee Cups Overflowing Out of the Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-10 pb-3 sm:pb-6 w-full">
        <div className="relative rounded-3xl sm:rounded-[36px] bg-gradient-to-r from-[#086a87] via-[#0d85a8] via-50% to-[#50abc3] px-5 sm:px-12 lg:px-14 py-6 sm:py-12 lg:py-14 overflow-visible shadow-md shadow-cyan-950/10">
          {/* Subtle atmospheric cloud texture inside the banner */}
          <div className="absolute inset-0 rounded-3xl sm:rounded-[36px] overflow-hidden pointer-events-none opacity-40">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 -right-10 w-80 h-80 bg-white/25 rounded-full blur-3xl" />
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white/15 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-row items-center justify-between gap-3 sm:gap-8">
            {/* Left Big Typography */}
            <div className="flex-1 max-w-xl text-left">
              <h1 className="text-xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight sm:leading-[1.12] tracking-tight drop-shadow-sm">
                Temukan
                <br />
                Teman Harimu.
              </h1>
            </div>

            {/* Right: Flawless Floating Coffee Cups Duo (Pure coffee, zero background, overflowing out of the top box) */}
            <div className="relative shrink-0 flex items-center justify-center pointer-events-none -mt-8 sm:-mt-14 md:-mt-22">
              <img
                src="/images/hero-floating-duo.png"
                alt="Brew Bean Floating Coffee Duo"
                className="w-36 sm:w-60 md:w-80 lg:w-96 h-auto object-contain drop-shadow-[0_16px_25px_rgba(0,0,0,0.28)] animate-hero-cup-1"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 flex-1 w-full space-y-5 sm:space-y-6">
        {/* Sub-header Bar: Subtitle on Left, Search Bar on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 py-1 sm:py-2">
          <p className="text-xs sm:text-sm font-medium text-slate-600">
            Temukan menu favorit untuk melengkapi aktivitasmu hari ini.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk..."
                className="w-full bg-white border border-slate-200 rounded-full pl-4 pr-9 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007b9e] focus:border-transparent transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="button"
              className="px-4 sm:px-5 py-2 rounded-full bg-[#007b9e] hover:bg-[#006e8d] text-white text-xs sm:text-sm font-bold shadow-sm shadow-cyan-900/10 transition-all shrink-0"
            >
              Search
            </button>
          </div>
        </div>

        {/* 2-Column Layout: Sidebar Categories on Left, Grid Cards on Right */}
        <div className="flex flex-col md:flex-row gap-5 lg:gap-8 items-start">
          {/* Left Category Sidebar / Mobile Pill Bar */}
          <aside className="w-full md:w-48 lg:w-56 shrink-0 bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-100 shadow-sm md:sticky md:top-24">
            <h2 className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2 sm:mb-3 px-1 sm:px-3">
              KATEGORI
            </h2>
            <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-1 md:pb-0 scrollbar-none -mx-1 px-1">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-left px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 md:shrink md:w-full ${
                      isActive
                        ? 'bg-[#007b9e] text-white shadow-sm shadow-cyan-900/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Product Grid */}
          <div className="flex-1 min-w-0 w-full">
            {filteredItems.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <Coffee className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-slate-700">Menu Tidak Ditemukan</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Tidak ada menu yang sesuai dengan kata kunci "{searchQuery}".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {filteredItems.map((item) => (
                  <MenuCard key={item.id} item={item} onSelect={handleSelectItem} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Mobile Sticky Cart Bar */}
      {totalCartCount > 0 && (
        <div className="sm:hidden fixed bottom-4 inset-x-4 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-full bg-[#007b9e] text-white font-bold text-sm shadow-2xl shadow-cyan-900/40 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-extrabold">
                {totalCartCount}
              </div>
              <span>Lihat Pesanan</span>
            </div>
            <span className="text-white font-extrabold">{formatRupiah(cartSubtotal)}</span>
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

