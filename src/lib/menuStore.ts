// Dynamic Menu Management Store with Neon DB persistence & Multi-Tab Broadcast
import { MenuItem } from '@/types/coffee';
import { MENU_ITEMS } from './mockData';

const MENU_STORAGE_KEY = 'kroma_coffee_menu_items_v3';
const MENU_CHANNEL_NAME = 'kroma_coffee_menu_sync_bus';

type MenuListener = (items: MenuItem[]) => void;

class MenuStore {
  private items: MenuItem[] = [];
  private channel: BroadcastChannel | null = null;
  private listeners: Set<MenuListener> = new Set();
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // First load from localStorage for instant display
    const raw = localStorage.getItem(MENU_STORAGE_KEY);
    if (raw) {
      try {
        this.items = JSON.parse(raw);
      } catch {
        this.items = [...MENU_ITEMS];
      }
    } else {
      this.items = [...MENU_ITEMS];
    }

    // Then fetch latest from Neon PostgreSQL database API
    this.fetchFromDb();

    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(MENU_CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        if (event.data?.type === 'MENU_UPDATED') {
          this.items = event.data.items;
          this.saveLocalOnly();
          this.notify();
        }
      };
    }

    window.addEventListener('storage', (e) => {
      if (e.key === MENU_STORAGE_KEY && e.newValue) {
        try {
          this.items = JSON.parse(e.newValue);
          this.notify();
        } catch {}
      }
    });
  }

  private async fetchFromDb() {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (data.success && Array.isArray(data.items) && data.items.length > 0) {
        this.items = data.items;
        this.saveLocalOnly();
        this.notify();
      }
    } catch {
      // Fallback to local
    }
  }

  private save() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(this.items));
      if (this.channel) {
        this.channel.postMessage({ type: 'MENU_UPDATED', items: this.items });
      }
    } catch {}
  }

  private saveLocalOnly() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(this.items));
    } catch {}
  }

  public getMenuItems(): MenuItem[] {
    if (!this.isInitialized && typeof window !== 'undefined') {
      this.init();
    }
    return this.items.length > 0 ? [...this.items] : [...MENU_ITEMS];
  }

  public async addMenuItem(data: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const newItem: MenuItem = {
      ...data,
      id: 'kro-' + Math.random().toString(36).substring(2, 7),
    };

    this.items = [newItem, ...this.items];
    this.save();
    this.notify();

    // Async persist to Neon PostgreSQL
    try {
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
    } catch (err) {
      console.error('Failed to persist menu item to DB:', err);
    }

    return newItem;
  }

  public async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<boolean> {
    const idx = this.items.findIndex((item) => item.id === id);
    if (idx === -1) return false;

    this.items[idx] = {
      ...this.items[idx],
      ...updates,
    };

    this.save();
    this.notify();

    // Async persist to Neon PostgreSQL
    try {
      await fetch(`/api/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error('Failed to update menu in DB:', err);
    }

    return true;
  }

  public async toggleAvailability(id: string): Promise<boolean> {
    const idx = this.items.findIndex((item) => item.id === id);
    if (idx === -1) return false;

    this.items[idx] = {
      ...this.items[idx],
      available: !this.items[idx].available,
    };

    this.save();
    this.notify();

    // Async persist to Neon PostgreSQL
    try {
      await fetch(`/api/menu/${id}`, {
        method: 'PATCH',
      });
    } catch (err) {
      console.error('Failed to toggle availability in DB:', err);
    }

    return true;
  }

  public async deleteMenuItem(id: string): Promise<boolean> {
    const initialLength = this.items.length;
    this.items = this.items.filter((item) => item.id !== id);
    if (this.items.length === initialLength) return false;

    this.save();
    this.notify();

    // Async delete from Neon PostgreSQL
    try {
      await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete menu in DB:', err);
    }

    return true;
  }

  public resetToDefault(): void {
    this.items = [...MENU_ITEMS];
    this.save();
    this.notify();
  }

  public subscribe(listener: MenuListener): () => void {
    if (!this.isInitialized && typeof window !== 'undefined') {
      this.init();
    }
    this.listeners.add(listener);
    listener(this.getMenuItems());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const copy = [...this.items];
    this.listeners.forEach((fn) => fn(copy));
  }
}

export const menuStore = new MenuStore();
