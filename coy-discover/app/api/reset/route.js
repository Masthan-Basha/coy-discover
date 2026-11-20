import { NextResponse } from 'next/server';
import { resetDb } from '@/lib/db';
export const dynamic = 'force-dynamic';

// Demo helper: restores seed data so the flow can be shown again.
export async function POST() {
  resetDb();
  return NextResponse.json({ ok: true });
}
