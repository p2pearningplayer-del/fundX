import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateTokenPair } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token is required.' }, { status: 400 });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return NextResponse.json({ error: 'Refresh token is invalid or expired.' }, { status: 401 });
    }

    const user = db.getUserById(decoded.userId);
    if (!user || user.is_suspended) {
      return NextResponse.json({ error: 'User not eligible for session renewal.' }, { status: 403 });
    }

    // Rotated new token pair
    const newTokens = generateTokenPair({
      userId: user.id,
      username: user.username,
      role: user.role,
      isSuspended: false,
    });

    const response = NextResponse.json({
      success: true,
      tokens: newTokens,
    });

    response.cookies.set('fundx_access_token', newTokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60,
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Session refresh failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
