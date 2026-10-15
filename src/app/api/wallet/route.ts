import { NextRequest, NextResponse } from 'next/server';
import { extractAuthToken, verifyAccessToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { calculateFundBalance } from '@/lib/ledger';

export async function GET(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const funds = db.getAllFunds();
    let totalPortfolioBalance = 0;
    let totalPortfolioReserved = 0;
    let totalPortfolioEarned = 0;

    const fundBalances = funds.map((f) => {
      const summary = calculateFundBalance(payload.userId, f.id);
      const userFund = db.getUserFund(payload.userId, f.id);
      const bank = db.getBankAccount(payload.userId, f.id);

      totalPortfolioBalance += summary.availableBalance;
      totalPortfolioReserved += summary.reservedBalance;
      totalPortfolioEarned += summary.totalEarned;

      return {
        ...summary,
        slug: f.slug,
        name: f.name,
        baseRate: f.base_rate,
        status: userFund ? userFund.status : 'LOCKED',
        hasBankAccount: !!bank,
        bankAccountMasked: bank?.account_number_masked,
      };
    });

    return NextResponse.json({
      portfolio: {
        totalAvailableINR: parseFloat(totalPortfolioBalance.toFixed(2)),
        totalReservedINR: parseFloat(totalPortfolioReserved.toFixed(2)),
        totalLifetimeEarnedINR: parseFloat(totalPortfolioEarned.toFixed(2)),
      },
      funds: fundBalances,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to retrieve wallet';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
