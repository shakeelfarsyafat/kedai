import { neon } from '@neondatabase/serverless';
import { MenuItem, Order, OrderStatus } from '@/types/coffee';
import { MENU_ITEMS, INITIAL_ORDERS } from './mockData';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_yirjuv6V9Wot@ep-super-math-b3pgaeyv-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export const sql = neon(connectionString);

let isDbInitialized = false;

export async function initDatabase() {
  if (isDbInitialized) return;

  try {
    // 1. Create table menu_items
    await sql`
      CREATE TABLE IF NOT EXISTS menu_items (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        tasting_notes TEXT[],
        price INTEGER NOT NULL,
        image TEXT,
        is_best_seller BOOLEAN DEFAULT FALSE,
        is_barista_pick BOOLEAN DEFAULT FALSE,
        available BOOLEAN DEFAULT TRUE,
        allow_customization BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 2. Create table orders
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        order_type VARCHAR(50) NOT NULL,
        table_number VARCHAR(50),
        items JSONB NOT NULL,
        subtotal INTEGER NOT NULL,
        tax INTEGER NOT NULL,
        total INTEGER NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_status VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Check if menu_items needs seeding
    const menuCountRes = await sql`SELECT COUNT(*)::int as count FROM menu_items`;
    const menuCount = menuCountRes[0]?.count || 0;

    if (menuCount === 0) {
      for (const item of MENU_ITEMS) {
        await sql`
          INSERT INTO menu_items (
            id, name, category, description, tasting_notes, price, image,
            is_best_seller, is_barista_pick, available, allow_customization
          ) VALUES (
            ${item.id}, ${item.name}, ${item.category}, ${item.description},
            ${item.tastingNotes || []}, ${item.price}, ${item.image},
            ${!!item.isBestSeller}, ${!!item.isBaristaPick}, ${item.available}, ${item.allowCustomization}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // Check if orders needs seeding
    const orderCountRes = await sql`SELECT COUNT(*)::int as count FROM orders`;
    const orderCount = orderCountRes[0]?.count || 0;

    if (orderCount === 0) {
      for (const ord of INITIAL_ORDERS) {
        await sql`
          INSERT INTO orders (
            id, customer_name, customer_phone, order_type, table_number,
            items, subtotal, tax, total, payment_method, payment_status,
            status, notes, created_at, updated_at
          ) VALUES (
            ${ord.id}, ${ord.customerName}, ${ord.customerPhone || null},
            ${ord.orderType}, ${ord.tableNumber || null},
            ${JSON.stringify(ord.items)}, ${ord.subtotal}, ${ord.tax}, ${ord.total},
            ${ord.paymentMethod}, ${ord.paymentStatus}, ${ord.status},
            ${ord.notes || null}, ${ord.createdAt}, ${ord.updatedAt}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    isDbInitialized = true;
  } catch (error) {
    console.error('Error initializing Neon DB:', error);
  }
}

// Menu Queries
export async function getDbMenuItems(): Promise<MenuItem[]> {
  await initDatabase();
  const rows = await sql`
    SELECT 
      id, name, category, description, tasting_notes, price, image,
      is_best_seller, is_barista_pick, available, allow_customization
    FROM menu_items 
    ORDER BY created_at ASC;
  `;

  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    description: r.description,
    tastingNotes: r.tasting_notes || [],
    price: r.price,
    image: r.image,
    isBestSeller: r.is_best_seller,
    isBaristaPick: r.is_barista_pick,
    available: r.available,
    allowCustomization: r.allow_customization,
  }));
}

export async function insertDbMenuItem(item: MenuItem): Promise<MenuItem> {
  await initDatabase();
  await sql`
    INSERT INTO menu_items (
      id, name, category, description, tasting_notes, price, image,
      is_best_seller, is_barista_pick, available, allow_customization
    ) VALUES (
      ${item.id}, ${item.name}, ${item.category}, ${item.description},
      ${item.tastingNotes || []}, ${item.price}, ${item.image},
      ${!!item.isBestSeller}, ${!!item.isBaristaPick}, ${item.available}, ${item.allowCustomization}
    );
  `;
  return item;
}

export async function updateDbMenuItem(id: string, updates: Partial<MenuItem>) {
  await initDatabase();
  if (updates.name !== undefined) {
    await sql`UPDATE menu_items SET name = ${updates.name} WHERE id = ${id}`;
  }
  if (updates.category !== undefined) {
    await sql`UPDATE menu_items SET category = ${updates.category} WHERE id = ${id}`;
  }
  if (updates.price !== undefined) {
    await sql`UPDATE menu_items SET price = ${updates.price} WHERE id = ${id}`;
  }
  if (updates.description !== undefined) {
    await sql`UPDATE menu_items SET description = ${updates.description} WHERE id = ${id}`;
  }
  if (updates.image !== undefined) {
    await sql`UPDATE menu_items SET image = ${updates.image} WHERE id = ${id}`;
  }
  if (updates.tastingNotes !== undefined) {
    await sql`UPDATE menu_items SET tasting_notes = ${updates.tastingNotes} WHERE id = ${id}`;
  }
  if (updates.isBestSeller !== undefined) {
    await sql`UPDATE menu_items SET is_best_seller = ${updates.isBestSeller} WHERE id = ${id}`;
  }
  if (updates.isBaristaPick !== undefined) {
    await sql`UPDATE menu_items SET is_barista_pick = ${updates.isBaristaPick} WHERE id = ${id}`;
  }
  if (updates.allowCustomization !== undefined) {
    await sql`UPDATE menu_items SET allow_customization = ${updates.allowCustomization} WHERE id = ${id}`;
  }
  if (updates.available !== undefined) {
    await sql`UPDATE menu_items SET available = ${updates.available} WHERE id = ${id}`;
  }
}

export async function toggleDbMenuItemAvailability(id: string) {
  await initDatabase();
  await sql`UPDATE menu_items SET available = NOT available WHERE id = ${id}`;
}

export async function deleteDbMenuItem(id: string) {
  await initDatabase();
  await sql`DELETE FROM menu_items WHERE id = ${id}`;
}

// Order Queries
export async function getDbOrders(): Promise<Order[]> {
  await initDatabase();
  const rows = await sql`
    SELECT * FROM orders 
    ORDER BY created_at DESC;
  `;

  return rows.map((r: any) => ({
    id: r.id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    orderType: r.order_type,
    tableNumber: r.table_number,
    items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
    subtotal: r.subtotal,
    tax: r.tax,
    total: r.total,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    status: r.status,
    notes: r.notes,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  }));
}

export async function insertDbOrder(order: Order): Promise<Order> {
  await initDatabase();
  await sql`
    INSERT INTO orders (
      id, customer_name, customer_phone, order_type, table_number,
      items, subtotal, tax, total, payment_method, payment_status,
      status, notes, created_at, updated_at
    ) VALUES (
      ${order.id}, ${order.customerName}, ${order.customerPhone || null},
      ${order.orderType}, ${order.tableNumber || null},
      ${JSON.stringify(order.items)}, ${order.subtotal}, ${order.tax}, ${order.total},
      ${order.paymentMethod}, ${order.paymentStatus}, ${order.status},
      ${order.notes || null}, ${order.createdAt}, ${order.updatedAt}
    );
  `;
  return order;
}

export async function updateDbOrderStatus(id: string, status: OrderStatus) {
  await initDatabase();
  await sql`
    UPDATE orders 
    SET status = ${status}, updated_at = NOW() 
    WHERE id = ${id};
  `;
}
