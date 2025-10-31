import { NextResponse } from 'next/server';
import { ensureDbConnected } from '@/db';

export async function GET() {
  try {
    await ensureDbConnected();
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message ?? 'connection failed' },
      { status: 500 }
    );
  }
}


