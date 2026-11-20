import { NextResponse } from 'next/server';
import { getFeed } from '@/lib/logic';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ profiles: getFeed() });
}
