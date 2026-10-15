import { NextRequest, NextResponse } from 'next/server';
import { extractAuthToken, verifyAccessToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Missing session token' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
    }

    const user = db.getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Include fund activation states
    const funds = db.getAllFunds();
    const userFunds = db.getUserFunds(user.id);
    const fundSummary = funds.map((f) => {
      const uf = userFunds.find((item) => item.fund_id === f.id);
      return {
        ...f,
        status: uf ? uf.status : 'LOCKED',
        activatedAt: uf?.activated_at,
      };
    });

    return NextResponse.json({
      user: {
        id: user.id,
        legalName: user.legal_name,
        username: user.username,
        mobile: user.mobile,
        email: user.email,
        referralCode: user.referral_code,
        role: user.role,
        isSuspended: user.is_suspended,
        suspensionReason: user.suspension_reason,
        lastLoginAt: user.last_login_at,
        lastLoginIp: user.last_login_ip,
        created_at: user.created_at,
      },
      funds: fundSummary,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Authentication verification failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
