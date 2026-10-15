import { NextRequest, NextResponse } from 'next/server';
import { extractAuthToken, verifyAccessToken, getClientIP, getUserAgent } from '@/lib/auth';
import { db } from '@/lib/db';
import { verifyPassword, hashPassword } from '@/lib/crypto';

export async function GET(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const logs = db.getSecurityLogs(payload.userId);
    const user = db.getUserById(payload.userId);

    return NextResponse.json({
      securitySummary: {
        lastLoginAt: user?.last_login_at,
        lastLoginIp: user?.last_login_ip,
        isSuspended: user?.is_suspended,
        recentEvents: logs.slice(0, 15),
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch security info';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    const user = db.getUserById(payload.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const matches = await verifyPassword(currentPassword, user.password_hash);
    if (!matches) {
      return NextResponse.json({ error: 'Current password does not match' }, { status: 400 });
    }

    const newHash = await hashPassword(newPassword);
    db.updateUser(user.id, { password_hash: newHash });

    db.addSecurityLog({
      user_id: user.id,
      event_type: 'PASSWORD_UPDATED',
      ip_address: getClientIP(req),
      user_agent: getUserAgent(req),
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Password update failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
