import { NextRequest, NextResponse } from 'next/server';
import { extractAuthToken, verifyAccessToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { FX_USDT_INR_RATE } from '@/lib/trc20';

export async function GET(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'FINANCE' && payload.role !== 'AUDITOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const orders = db.getAllOrders();
    const ledger = db.getAllLedgerEntries();
    const withdrawals = db.getAllWithdrawals();

    // 1. Total USDT inflows
    const verifiedOrders = orders.filter((o) => o.status === 'ACTIVE');
    const totalUSDTInflow = verifiedOrders.reduce((sum, o) => sum + (o.usdt_amount || 0), 0);
    const totalINRInflowEquivalent = verifiedOrders.reduce((sum, o) => sum + (o.fiat_equivalent_inr || 0), 0);

    // 2. Ledger Aggregations
    let totalCommissionsDisbursed = 0;
    let totalReservedInLimbo = 0;
    let totalSettledDisbursements = 0;

    for (const e of ledger) {
      if (e.entry_type === 'COMMISSION_CREDIT') {
        totalCommissionsDisbursed += e.credit_amount;
      } else if (e.entry_type === 'PAYOUT_RESERVATION' && e.status === 'RESERVED') {
        totalReservedInLimbo += e.debit_amount;
      } else if (e.entry_type === 'PAYOUT_SETTLED') {
        totalSettledDisbursements += e.debit_amount;
      }
    }

    // 3. Fund-specific ledger breakdown
    const funds = db.getAllFunds();
    const fundReconciliation = funds.map((f) => {
      const fundEntries = ledger.filter((e) => e.fund_id === f.id);
      const earned = fundEntries
        .filter((e) => e.entry_type === 'COMMISSION_CREDIT')
        .reduce((sum, e) => sum + e.credit_amount, 0);
      const settled = fundEntries
        .filter((e) => e.entry_type === 'PAYOUT_SETTLED')
        .reduce((sum, e) => sum + e.debit_amount, 0);
      const reserved = fundEntries
        .filter((e) => e.entry_type === 'PAYOUT_RESERVATION' && e.status === 'RESERVED')
        .reduce((sum, e) => sum + e.debit_amount, 0);

      return {
        fundId: f.id,
        name: f.name,
        slug: f.slug,
        baseRate: `${(f.base_rate * 100).toFixed(1)}%`,
        totalCommissions: parseFloat(earned.toFixed(2)),
        reservedPayouts: parseFloat(reserved.toFixed(2)),
        settledPayouts: parseFloat(settled.toFixed(2)),
      };
    });

    const netPlatformFloat = totalINRInflowEquivalent - totalSettledDisbursements;

    return NextResponse.json({
      reconciliation: {
        timestamp: new Date().toISOString(),
        peggedFxRate: FX_USDT_INR_RATE,
        cryptoInflow: {
          totalUSDT: parseFloat(totalUSDTInflow.toFixed(4)),
          fiatEquivalentINR: parseFloat(totalINRInflowEquivalent.toFixed(2)),
          totalCompletedOrders: verifiedOrders.length,
        },
        fiatLedger: {
          totalCommissionsDisbursedINR: parseFloat(totalCommissionsDisbursed.toFixed(2)),
          totalReservedInLimboINR: parseFloat(totalReservedInLimbo.toFixed(2)),
          totalSettledDisbursementsINR: parseFloat(totalSettledDisbursements.toFixed(2)),
          netPlatformFloatINR: parseFloat(netPlatformFloat.toFixed(2)),
        },
        funds: fundReconciliation,
        withdrawalsSummary: {
          totalCount: withdrawals.length,
          paidCount: withdrawals.filter((w) => w.status === 'PAID').length,
          reservedCount: withdrawals.filter((w) => w.status === 'RESERVED').length,
          rolledBackCount: withdrawals.filter((w) => w.status === 'ROLLED_BACK').length,
        },
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Reconciliation calculation failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
