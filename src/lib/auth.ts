// ==============================================================================
// FundX Panel — Authentication, Dual JWT & Session Guard
// ==============================================================================

import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { UserRole } from './types';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fundx_jwt_access_secret_super_secure_key_32chars_min_2026_x1';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fundx_jwt_refresh_secret_super_secure_key_32chars_min_2026_x2';

export interface TokenPayload {
  userId: string;
  username: string;
  role: UserRole;
  isSuspended: boolean;
}

/**
 * Generates short-lived Access Token (15 mins) and long-lived Refresh Token (7 days)
 */
export function generateTokenPair(payload: TokenPayload): {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ userId: payload.userId }, REFRESH_SECRET, {
    expiresIn: '7d',
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
  };
}

/**
 * Verifies JWT Access Token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Verifies JWT Refresh Token
 */
export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Extracts Client IP address from incoming NextRequest
 */
export function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();
  return '127.0.0.1';
}

/**
 * Extracts User-Agent string from incoming NextRequest
 */
export function getUserAgent(req: NextRequest): string {
  return req.headers.get('user-agent') || 'Unknown Client';
}

/**
 * Extracts bearer token from Authorization header or cookie
 */
export function extractAuthToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  // Check cookie fallback
  const cookieToken = req.cookies.get('fundx_access_token')?.value;
  if (cookieToken) return cookieToken;

  return null;
}
