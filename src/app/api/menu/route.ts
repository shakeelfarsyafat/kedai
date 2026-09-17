import { NextResponse } from 'next/server';
import { getDbMenuItems, insertDbMenuItem } from '@/lib/db';
import { MenuItem } from '@/types/coffee';

export async function GET() {
  try {
    const items = await getDbMenuItems();
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const item: MenuItem = {
      ...body,
      id: body.id || 'kro-' + Math.random().toString(36).substring(2, 7),
    };
    const created = await insertDbMenuItem(item);
    return NextResponse.json({ success: true, item: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
