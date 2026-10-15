import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/crypto';
import { generateTokenPair, getClientIP, getUserAgent } from '@/lib/auth';
import { User } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { legalName, username, mobile, email, password, referralCode } = body;

    // PRD Section 4: Frictionless registration without upfront OTP
    // Mandatory fields: Full Legal Name, Unique Username, Mobile Number, Password
    if (!legalName || !username || !mobile || !password) {
      return NextResponse.json(
        { error: 'Mandatory fields missing: Full Legal Name, Unique Username, Mobile Number, and Password are required.' },
        { status: 400 }
      );
    }

    if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters and contain only alphanumeric characters or underscores.' },
        { status: 400 }
      );
    }

    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length < 10) {
      return NextResponse.json(
        { error: 'Mobile number must contain at least 10 valid digits.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters in length.' },
        { status: 400 }
      );
    }

    // Uniqueness checks
    if (db.getUserByUsername(username)) {
      return NextResponse.json({ error: 'Username is already taken by another account.' }, { status: 409 });
    }

    if (db.getUserByMobile(cleanMobile)) {
      return NextResponse.json({ error: 'Mobile number is already registered.' }, { status: 409 });
    }

    // Bcrypt cost factor 12
    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();
    const newReferralCode = `FX${Math.floor(100000 + Math.random() * 900000)}`;

    const newUser: User = {
      id: userId,
      legal_name: legalName.trim(),
      username: username.trim().toLowerCase(),
      mobile: cleanMobile,
      email: email ? email.trim().toLowerCase() : undefined,
      password_hash: passwordHash,
      referral_code: newReferralCode,
      referred_by: referralCode ? referralCode.trim() : undefined,
      role: 'USER',
      is_suspended: false,
      last_login_at: new Date().toISOString(),
      last_login_ip: getClientIP(req),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.createUser(newUser);

    // Initial Fund Associations (all default to LOCKED)
    const allFunds = db.getAllFunds();
    for (const fund of allFunds) {
      db.setUserFundStatus(userId, fund.id, 'LOCKED');
    }

    // Audit Log
    const ip = getClientIP(req);
    const userAgent = getUserAgent(req);
    db.addSecurityLog({
      user_id: userId,
      event_type: 'USER_REGISTERED',
      ip_address: ip,
      user_agent: userAgent,
      metadata: { username: newUser.username, mobile: cleanMobile },
    });

    // Send Welcome Notification
    db.createNotification({
      user_id: userId,
      title: 'Institutional Account Initialized',
      message: 'Welcome to FundX Panel. Select a fund category and complete USDT TRC20 verification to activate transaction tasks.',
      category: 'SYSTEM',
      is_read: false,
      action_url: '/funds',
    });

    const tokens = generateTokenPair({
      userId: newUser.id,
      username: newUser.username,
      role: newUser.role,
      isSuspended: false,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser.id,
        legalName: newUser.legal_name,
        username: newUser.username,
        mobile: newUser.mobile,
        email: newUser.email,
        referralCode: newUser.referral_code,
        role: newUser.role,
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
    const errorMsg = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
