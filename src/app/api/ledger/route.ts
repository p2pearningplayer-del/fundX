import { NextRequest, NextResponse } from 'next/server';
import { extractAuthToken, verifyAccessToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const fundId = searchParams.get('fundId') || undefined;

    const entries = db.getLedgerEntries(payload.userId, fundId);
    return NextResponse.json({ ledgerEntries: entries });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to retrieve ledger';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
