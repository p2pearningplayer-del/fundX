import { NextRequest, NextResponse } from 'next/server';
import { extractAuthToken, verifyAccessToken, getClientIP } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateAuditSignature } from '@/lib/crypto';

export async function GET(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'AUDITOR' && payload.role !== 'SUPPORT')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = db.getAllUsers().map((u) => ({
      id: u.id,
      legalName: u.legal_name,
      username: u.username,
      mobile: u.mobile,
      email: u.email,
      referralCode: u.referral_code,
      role: u.role,
      isSuspended: u.is_suspended,
      suspensionReason: u.suspension_reason,
      suspendedAt: u.suspended_at,
      lastLoginAt: u.last_login_at,
      lastLoginIp: u.last_login_ip,
      createdAt: u.created_at,
    }));

    return NextResponse.json({ users });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'User query failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden: Superadmin role required for account freeze/unfreeze' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, action, reason } = body; // action: 'SUSPEND' | 'UNSUSPEND'

    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and Action are required' }, { status: 400 });
    }

    const user = db.getUserById(userId);
    if (!user) return NextResponse.json({ error: 'Target user not found' }, { status: 404 });

    const ip = getClientIP(req);
    const now = new Date().toISOString();

    if (action === 'SUSPEND') {
      // PRD Spec: Instant freeze with mandatory incident note
      if (!reason || reason.trim().length < 5) {
        return NextResponse.json({ error: 'Mandatory detailed incident note is required for account suspension.' }, { status: 400 });
      }

      db.updateUser(user.id, {
        is_suspended: true,
        suspension_reason: reason.trim(),
        suspended_at: now,
        suspended_by: payload.userId,
      });

      const signature = generateAuditSignature(payload.userId, 'USER_ACCOUNT_SUSPENDED', { userId, reason }, now);
      db.createAdminAuditLog({
        admin_id: payload.userId,
        admin_username: payload.username,
        action: 'USER_ACCOUNT_SUSPENDED',
        target_type: 'USER',
        target_id: user.id,
        payload: { username: user.username, reason },
        ip_address: ip,
        signature,
      });

      db.addSecurityLog({
        user_id: user.id,
        event_type: 'ACCOUNT_SUSPENDED_BY_ADMIN',
        ip_address: ip,
        metadata: { adminId: payload.userId, reason },
      });

      return NextResponse.json({ success: true, message: `Account ${user.username} frozen with incident note committed.` });
    }

    if (action === 'UNSUSPEND') {
      db.updateUser(user.id, {
        is_suspended: false,
        suspension_reason: undefined,
        suspended_at: undefined,
        suspended_by: undefined,
      });

      const signature = generateAuditSignature(payload.userId, 'USER_ACCOUNT_UNSUSPENDED', { userId }, now);
      db.createAdminAuditLog({
        admin_id: payload.userId,
        admin_username: payload.username,
        action: 'USER_ACCOUNT_UNSUSPENDED',
        target_type: 'USER',
        target_id: user.id,
        payload: { username: user.username },
        ip_address: ip,
        signature,
      });

      return NextResponse.json({ success: true, message: `Account ${user.username} restriction lifted.` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'User management action failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
