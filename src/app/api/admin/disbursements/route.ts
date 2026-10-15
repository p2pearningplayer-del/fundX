import { NextRequest, NextResponse } from 'next/server';
import { extractAuthToken, verifyAccessToken, getClientIP } from '@/lib/auth';
import { db } from '@/lib/db';
import { settleWithdrawal, rollbackWithdrawal } from '@/lib/ledger';
import { generateAuditSignature } from '@/lib/crypto';

export async function GET(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'FINANCE' && payload.role !== 'AUDITOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const withdrawals = db.getAllWithdrawals();
    const enriched = withdrawals.map((w) => {
      const user = db.getUserById(w.user_id);
      const fund = db.getFundById(w.fund_id);
      const bank = db.getBankAccountsByUser(w.user_id).find((b) => b.id === w.bank_account_id);
      return {
        ...w,
        username: user?.username,
        userLegalName: user?.legal_name,
        fundName: fund?.name,
        bankName: bank?.bank_name,
        ifscCode: bank?.ifsc_code,
        accountNumberMasked: bank?.account_number_masked,
      };
    });

    return NextResponse.json({ withdrawals: enriched });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Fetch failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'FINANCE')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { action, withdrawalId, utrHash, reason } = body; // action: 'DISBURSE' | 'ROLLBACK'

    if (!withdrawalId || !action) {
      return NextResponse.json({ error: 'Withdrawal ID and Action required' }, { status: 400 });
    }

    const ip = getClientIP(req);
    const now = new Date().toISOString();

    if (action === 'DISBURSE') {
      if (!utrHash) {
        return NextResponse.json({ error: 'Cryptographic Payout UTR hash is mandatory for settlement.' }, { status: 400 });
      }

      const settled = settleWithdrawal(withdrawalId, utrHash.trim(), payload.userId);

      const signature = generateAuditSignature(payload.userId, 'ADMIN_DISBURSE_PAYOUT', { withdrawalId, utrHash }, now);
      db.createAdminAuditLog({
        admin_id: payload.userId,
        admin_username: payload.username,
        action: 'ADMIN_DISBURSE_PAYOUT',
        target_type: 'WITHDRAWAL',
        target_id: withdrawalId,
        payload: { utrHash, amount: settled.amount },
        ip_address: ip,
        signature,
      });

      return NextResponse.json({ success: true, message: 'Payout settled and UTR committed.', withdrawal: settled });
    }

    if (action === 'ROLLBACK') {
      if (!reason) {
        return NextResponse.json({ error: 'Mandatory incident note / reason required for compensating rollback.' }, { status: 400 });
      }

      const rolledBack = rollbackWithdrawal(withdrawalId, reason.trim(), payload.userId);

      const signature = generateAuditSignature(payload.userId, 'ADMIN_ROLLBACK_PAYOUT', { withdrawalId, reason }, now);
      db.createAdminAuditLog({
        admin_id: payload.userId,
        admin_username: payload.username,
        action: 'ADMIN_ROLLBACK_PAYOUT',
        target_type: 'WITHDRAWAL',
        target_id: withdrawalId,
        payload: { reason, amount: rolledBack.amount },
        ip_address: ip,
        signature,
      });

      return NextResponse.json({
        success: true,
        message: 'Withdrawal rejected and reserved funds automatically rolled back via compensating ledger transaction.',
        withdrawal: rolledBack,
      });
    }

    return NextResponse.json({ error: 'Invalid action. Supported: DISBURSE, ROLLBACK' }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Disbursement action failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
