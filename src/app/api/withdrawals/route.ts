import { NextRequest, NextResponse } from 'next/server';
import { extractAuthToken, verifyAccessToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { reserveWithdrawal } from '@/lib/ledger';

export async function GET(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const fundId = searchParams.get('fundId') || undefined;

    const withdrawals = db.getWithdrawalsByUser(payload.userId, fundId);
    const enriched = withdrawals.map((w) => {
      const fund = db.getFundById(w.fund_id);
      const bank = db.getBankAccountsByUser(payload.userId).find((b) => b.id === w.bank_account_id);
      return {
        ...w,
        fundName: fund?.name || 'Isolated Fund',
        bankName: bank?.bank_name,
        accountNumberMasked: bank?.account_number_masked,
      };
    });

    return NextResponse.json({ withdrawals: enriched });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to retrieve withdrawals';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const body = await req.json();
    const { fundId, bankAccountId, amount } = body;

    if (!fundId || !bankAccountId || !amount) {
      return NextResponse.json(
        { error: 'Fund ID, Bank Account ID, and Withdrawal Amount are required.' },
        { status: 400 }
      );
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Invalid payout amount requested.' }, { status: 400 });
    }

    // PRD Section 9: Real-time balance reservation on payout request to eliminate double-spending
    const withdrawal = reserveWithdrawal(payload.userId, fundId, bankAccountId, numAmount);

    return NextResponse.json({
      success: true,
      message: `Withdrawal request initiated. ₹${numAmount.toLocaleString('en-IN')} has been reserved in your ledger.`,
      withdrawal,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Withdrawal initiation failed';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
