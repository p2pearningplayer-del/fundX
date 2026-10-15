import { NextRequest, NextResponse } from 'next/server';
import { extractAuthToken, verifyAccessToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const notifications = db.getNotifications(payload.userId);
    return NextResponse.json({ notifications });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to retrieve notifications';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const body = await req.json();
    const { id } = body;

    if (!id) return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });

    const success = db.markNotificationRead(id, payload.userId);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
