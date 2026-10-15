import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/crypto';
import { generateTokenPair, getClientIP, getUserAgent } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Identifier (Username/Mobile) and Password are required.' },
        { status: 400 }
      );
    }

    const ip = getClientIP(req);
    const userAgent = getUserAgent(req);

    // Look up by username or mobile
    let user = db.getUserByUsername(identifier);
    if (!user) {
      const cleanMobile = identifier.replace(/[^0-9]/g, '');
      if (cleanMobile.length >= 10) {
        user = db.getUserByMobile(cleanMobile);
      }
    }

    if (!user) {
      db.addSecurityLog({
        event_type: 'LOGIN_FAILED_UNKNOWN_USER',
        ip_address: ip,
        user_agent: userAgent,
        metadata: { identifier },
      });
      return NextResponse.json({ error: 'Invalid credentials provided.' }, { status: 401 });
    }

    // Check account suspension
    if (user.is_suspended) {
      db.addSecurityLog({
        user_id: user.id,
        event_type: 'LOGIN_BLOCKED_SUSPENDED_ACCOUNT',
        ip_address: ip,
        user_agent: userAgent,
      });
      return NextResponse.json(
        { error: `Account is suspended. Reason: ${user.suspension_reason || 'Compliance freeze.'}` },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      db.addSecurityLog({
        user_id: user.id,
        event_type: 'LOGIN_FAILED_INVALID_PASSWORD',
        ip_address: ip,
        user_agent: userAgent,
      });
      return NextResponse.json({ error: 'Invalid credentials provided.' }, { status: 401 });
    }

    // Suspicious Login Shield: Detect IP anomaly
    const isIpAnomaly = user.last_login_ip && user.last_login_ip !== ip;
    if (isIpAnomaly) {
      db.addSecurityLog({
        user_id: user.id,
        event_type: 'IP_ANOMALY_DETECTED',
        ip_address: ip,
        user_agent: userAgent,
        metadata: { previousIp: user.last_login_ip, currentIp: ip },
      });
    }

    // Update last login
    db.updateUser(user.id, {
      last_login_at: new Date().toISOString(),
      last_login_ip: ip,
    });

    db.addSecurityLog({
      user_id: user.id,
      event_type: 'LOGIN_SUCCESS',
      ip_address: ip,
      user_agent: userAgent,
    });

    const tokens = generateTokenPair({
      userId: user.id,
      username: user.username,
      role: user.role,
      isSuspended: false,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user.id,
        legalName: user.legal_name,
        username: user.username,
        mobile: user.mobile,
        email: user.email,
        referralCode: user.referral_code,
        role: user.role,
      },
      tokens,
    });

    response.cookies.set('fundx_access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60,
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
