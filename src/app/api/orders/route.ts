import { NextResponse } from 'next/server';
import { getDbOrders, insertDbOrder, clearAllDbOrders } from '@/lib/db';
import { Order } from '@/types/coffee';

export async function GET() {
  try {
    const orders = await getDbOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const order: Order = {
      ...body,
      id: body.id || `KRO-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: body.updatedAt || new Date().toISOString(),
    };
    const created = await insertDbOrder(order);
    return NextResponse.json({ success: true, order: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearAllDbOrders();
    return NextResponse.json({ success: true, message: 'Semua pesanan berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

