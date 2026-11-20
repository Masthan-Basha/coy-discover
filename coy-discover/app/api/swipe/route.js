import { NextResponse } from 'next/server';
import { recordSwipe } from '@/lib/logic';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  let data;
  try { data = await req.json(); } catch { data = null; }
  if (!data || typeof data.profileId !== 'string') {
    return NextResponse.json({ error: 'profileId and action are required' }, { status: 400 });
  }
  const r = recordSwipe(data.profileId, data.action);
  return NextResponse.json(r.error ? { error: r.error } : r.body, { status: r.status });
}
