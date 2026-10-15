import { NextRequest, NextResponse } from 'next/server';
import { extractAuthToken, verifyAccessToken, getClientIP } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateAuditSignature } from '@/lib/crypto';

export async function GET(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'FINANCE')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient administrative privileges' }, { status: 403 });
    }

    const funds = db.getAllFunds();
    return NextResponse.json({ funds });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Admin fetch failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden: Superadmin role required for fund configuration' }, { status: 403 });
    }

    const body = await req.json();
    const { fundId, activationFeePercent, baseRate, minTaskAmount, maxTaskAmount, baselineValuation, isActive } = body;

    if (!fundId) return NextResponse.json({ error: 'Fund ID is required' }, { status: 400 });

    const existing = db.getFundById(fundId);
    if (!existing) return NextResponse.json({ error: 'Fund not found' }, { status: 404 });

    const updates = {
      activation_fee_percent: activationFeePercent !== undefined ? parseFloat(activationFeePercent) : existing.activation_fee_percent,
      base_rate: baseRate !== undefined ? parseFloat(baseRate) : existing.base_rate,
      min_task_amount: minTaskAmount !== undefined ? parseFloat(minTaskAmount) : existing.min_task_amount,
      max_task_amount: maxTaskAmount !== undefined ? parseFloat(maxTaskAmount) : existing.max_task_amount,
      baseline_valuation: baselineValuation !== undefined ? parseFloat(baselineValuation) : existing.baseline_valuation,
      is_active: isActive !== undefined ? Boolean(isActive) : existing.is_active,
    };

    const updated = db.updateFund(fundId, updates);

    // Non-repudiable Admin Audit Log
    const ip = getClientIP(req);
    const now = new Date().toISOString();
    const signature = generateAuditSignature(payload.userId, 'UPDATE_FUND_CONFIG', updates, now);

    db.createAdminAuditLog({
      admin_id: payload.userId,
      admin_username: payload.username,
      action: 'UPDATE_FUND_CONFIG',
      target_type: 'FUND',
      target_id: fundId,
      payload: updates,
      ip_address: ip,
      signature,
    });

    return NextResponse.json({ success: true, fund: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
