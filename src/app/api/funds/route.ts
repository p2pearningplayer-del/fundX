import { NextRequest, NextResponse } from 'next/server';
import { extractAuthToken, verifyAccessToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { calculateFundBalance } from '@/lib/ledger';

export async function GET(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    let userId: string | null = null;
    if (token) {
      const payload = verifyAccessToken(token);
      if (payload) userId = payload.userId;
    }

    const funds = db.getAllFunds();

    const data = funds.map((f) => {
      let status = 'LOCKED';
      let activatedAt: string | undefined;
      let balanceSummary = null;
      let hasBankAccount = false;

      if (userId) {
        const uf = db.getUserFund(userId, f.id);
        if (uf) {
          status = uf.status;
          activatedAt = uf.activated_at;
        }
        balanceSummary = calculateFundBalance(userId, f.id);
        const bank = db.getBankAccount(userId, f.id);
        hasBankAccount = !!bank;
      }

      return {
        id: f.id,
        slug: f.slug,
        name: f.name,
        description: f.description,
        activationFeePercent: f.activation_fee_percent,
        baseRate: f.base_rate,
        baseRateDisplay: `${(f.base_rate * 100).toFixed(1)}%`,
        minTaskAmount: f.min_task_amount,
        maxTaskAmount: f.max_task_amount,
        baselineValuation: f.baseline_valuation,
        status,
        activatedAt,
        hasBankAccount,
        balance: balanceSummary,
      };
    });

    return NextResponse.json({ funds: data });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch funds';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
