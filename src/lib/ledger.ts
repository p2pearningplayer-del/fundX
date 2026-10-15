// ==============================================================================
// FundX Panel — ACID Double-Entry Financial Ledger Service
// PRD Section 8 & 9: Deterministic Commission Engine & Balance Reservation Pipeline
// ==============================================================================

import crypto from 'crypto';
import { db } from './db';
import { LedgerEntry, Withdrawal } from './types';

export interface FundBalanceSummary {
  fundId: string;
  fundSlug: string;
  fundName: string;
  totalEarned: number;
  availableBalance: number;
  reservedBalance: number;
  withdrawnSettled: number;
}

/**
 * Calculates current balance breakdown dynamically from immutable ledger entries.
 * Eliminates balance manipulation vulnerabilities by deriving state from unspent ledger credits.
 */
export function calculateFundBalance(userId: string, fundId: string): FundBalanceSummary {
  const fund = db.getFundById(fundId);
  const entries = db.getLedgerEntries(userId, fundId);

  let totalEarned = 0;
  let availableBalance = 0;
  let reservedBalance = 0;
  let withdrawnSettled = 0;

  for (const entry of entries) {
    if (entry.entry_type === 'COMMISSION_CREDIT') {
      totalEarned += entry.credit_amount;
      if (entry.status === 'AVAILABLE') {
        availableBalance += entry.credit_amount;
      }
    } else if (entry.entry_type === 'PAYOUT_RESERVATION') {
      // Immediate reservation decrements available balance
      if (entry.status === 'RESERVED') {
        availableBalance -= entry.debit_amount;
        reservedBalance += entry.debit_amount;
      }
    } else if (entry.entry_type === 'PAYOUT_SETTLED') {
      reservedBalance -= entry.debit_amount;
      withdrawnSettled += entry.debit_amount;
    } else if (entry.entry_type === 'PAYOUT_ROLLBACK') {
      // Compensating reversal credits funds back to available
      reservedBalance -= entry.credit_amount;
      availableBalance += entry.credit_amount;
    }
  }

  // Ensure non-negative floating precision
  availableBalance = Math.max(0, parseFloat(availableBalance.toFixed(2)));
  reservedBalance = Math.max(0, parseFloat(reservedBalance.toFixed(2)));

  return {
    fundId,
    fundSlug: fund?.slug || 'unknown',
    fundName: fund?.name || 'Isolated Fund',
    totalEarned: parseFloat(totalEarned.toFixed(2)),
    availableBalance,
    reservedBalance,
    withdrawnSettled: parseFloat(withdrawnSettled.toFixed(2)),
  };
}

/**
 * Credits verified commission to ledger upon task completion
 * Commission = Eligible_Task_Quantum * Configured_Fund_Rate
 */
export function creditTaskCommission(
  userId: string,
  fundId: string,
  taskId: string,
  quantum: number,
  rate: number,
  idempotencyKey: string
): LedgerEntry {
  const fund = db.getFundById(fundId);
  if (!fund) throw new Error('Fund not found');

  // Verify UserFund is active
  const userFund = db.getUserFund(userId, fundId);
  if (!userFund || userFund.status !== 'ACTIVE') {
    throw new Error('Task commission credit rejected: Fund is not active');
  }

  const commission = parseFloat((quantum * rate).toFixed(2));
  const currentBalance = calculateFundBalance(userId, fundId);
  const newBalance = parseFloat((currentBalance.availableBalance + commission).toFixed(2));

  // Determine fund category code prefix
  let prefix = 'LG-GM-';
  if (fund.slug === 'stock') prefix = 'LG-ST-';
  if (fund.slug === 'mix') prefix = 'LG-MX-';
  const ledgerId = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;

  const percentDisplay = (rate * 100).toFixed(1);
  const formattedQuantum = `₹${quantum.toLocaleString('en-IN')}`;
  const calculationBasis = `${formattedQuantum} @ ${percentDisplay}%`;

  const entry: LedgerEntry = {
    id: ledgerId,
    user_id: userId,
    fund_id: fundId,
    task_id: taskId,
    entry_type: 'COMMISSION_CREDIT',
    debit_amount: 0,
    credit_amount: commission,
    calculation_basis: calculationBasis,
    balance_after: newBalance,
    status: 'AVAILABLE',
    idempotency_key: idempotencyKey,
    created_at: new Date().toISOString(),
  };

  db.createLedgerEntry(entry);

  // Send Notification
  db.createNotification({
    user_id: userId,
    title: `Commission Accrued: ₹${commission.toLocaleString('en-IN')}`,
    message: `Earned ${formattedQuantum} @ ${percentDisplay}% for completed transaction task. Ledger entry ${ledgerId} committed.`,
    category: 'COMMISSION',
    is_read: false,
    action_url: '/wallet',
  });

  return entry;
}

/**
 * Initiates payout reservation pipeline:
 * Decrements available balance in real-time by committing a RESERVED ledger entry
 */
export function reserveWithdrawal(
  userId: string,
  fundId: string,
  bankAccountId: string,
  amount: number
): Withdrawal {
  if (amount <= 0) throw new Error('Withdrawal amount must be greater than zero');

  const user = db.getUserById(userId);
  if (!user || user.is_suspended) {
    throw new Error('Account suspended or restricted from initiating payouts');
  }

  // 1. Check Fund status
  const userFund = db.getUserFund(userId, fundId);
  if (!userFund || userFund.status !== 'ACTIVE') {
    throw new Error('Withdrawals permitted only from ACTIVE funds');
  }

  // 2. Check Bank Account binding
  const bankAccount = db.getBankAccount(userId, fundId);
  if (!bankAccount || bankAccount.id !== bankAccountId) {
    throw new Error('No verified bank account bound to this fund');
  }

  // 3. Check Available Balance in isolated ledger
  const balance = calculateFundBalance(userId, fundId);
  if (balance.availableBalance < amount) {
    throw new Error(
      `Insufficient available balance in ${balance.fundName}. Available: ₹${balance.availableBalance}, Requested: ₹${amount}`
    );
  }

  const reservationLedgerId = `LG-RSV-${Math.floor(1000 + Math.random() * 9000)}`;
  const balanceAfter = parseFloat((balance.availableBalance - amount).toFixed(2));

  // 4. Commit Reservation Ledger Entry
  const ledgerEntry: LedgerEntry = {
    id: reservationLedgerId,
    user_id: userId,
    fund_id: fundId,
    entry_type: 'PAYOUT_RESERVATION',
    debit_amount: amount,
    credit_amount: 0,
    calculation_basis: `Payout Reservation ₹${amount.toLocaleString('en-IN')}`,
    balance_after: balanceAfter,
    status: 'RESERVED',
    idempotency_key: `wth-rsv-${Date.now()}-${Math.random()}`,
    created_at: new Date().toISOString(),
  };

  db.createLedgerEntry(ledgerEntry);

  // 5. Create Withdrawal Record
  const withdrawalCode = `WTH-IND-${Math.floor(10000 + Math.random() * 90000)}`;
  const withdrawal: Withdrawal = {
    id: crypto.randomUUID(),
    withdrawal_code: withdrawalCode,
    user_id: userId,
    fund_id: fundId,
    bank_account_id: bankAccountId,
    amount,
    fee_amount: 0,
    net_payout: amount,
    status: 'RESERVED',
    reservation_ledger_id: reservationLedgerId,
    requested_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.createWithdrawal(withdrawal);

  // 6. Security Notification
  db.createNotification({
    user_id: userId,
    title: `Payout Requested: ₹${amount.toLocaleString('en-IN')}`,
    message: `Withdrawal ${withdrawalCode} initiated to account ${bankAccount.account_number_masked}. Reserved in ledger.`,
    category: 'WITHDRAWAL',
    is_read: false,
    action_url: '/withdraw/history',
  });

  return withdrawal;
}

/**
 * Payout Settlement:
 * Settles a reserved withdrawal when confirmed with UTR hash
 */
export function settleWithdrawal(
  withdrawalId: string,
  utrHash: string,
  processedByAdminId: string
): Withdrawal {
  const wth = db.getWithdrawalById(withdrawalId);
  if (!wth) throw new Error('Withdrawal record not found');
  if (wth.status !== 'RESERVED' && wth.status !== 'UNDER_REVIEW') {
    throw new Error(`Cannot settle withdrawal with status: ${wth.status}`);
  }

  const settlementLedgerId = `LG-SET-${Math.floor(1000 + Math.random() * 9000)}`;
  const ledgerEntry: LedgerEntry = {
    id: settlementLedgerId,
    user_id: wth.user_id,
    fund_id: wth.fund_id,
    entry_type: 'PAYOUT_SETTLED',
    debit_amount: wth.amount,
    credit_amount: 0,
    calculation_basis: `UTR Settlement: ${utrHash}`,
    balance_after: 0,
    status: 'PAID',
    idempotency_key: `wth-set-${wth.id}`,
    metadata: { utrHash, adminId: processedByAdminId },
    created_at: new Date().toISOString(),
  };

  db.createLedgerEntry(ledgerEntry);

  const updated = db.updateWithdrawal(wth.id, {
    status: 'PAID',
    payout_utr_hash: utrHash,
    settlement_ledger_id: settlementLedgerId,
    processed_by: processedByAdminId,
    processed_at: new Date().toISOString(),
  });

  db.createNotification({
    user_id: wth.user_id,
    title: `Payout Settled: ₹${wth.amount.toLocaleString('en-IN')}`,
    message: `Funds disbursed successfully. UTR Reference: ${utrHash}`,
    category: 'WITHDRAWAL',
    is_read: false,
    action_url: '/withdraw/history',
  });

  return updated!;
}

/**
 * Compensating Transaction Rollback:
 * If a withdrawal is rejected or failed, rolls back reserved funds safely with an audited entry
 */
export function rollbackWithdrawal(
  withdrawalId: string,
  reason: string,
  adminId: string
): Withdrawal {
  const wth = db.getWithdrawalById(withdrawalId);
  if (!wth) throw new Error('Withdrawal record not found');
  if (wth.status !== 'RESERVED' && wth.status !== 'UNDER_REVIEW') {
    throw new Error(`Cannot rollback withdrawal with status: ${wth.status}`);
  }

  const currentBalance = calculateFundBalance(wth.user_id, wth.fund_id);
  const restoredBalance = parseFloat((currentBalance.availableBalance + wth.amount).toFixed(2));

  const rollbackLedgerId = `LG-RBK-${Math.floor(1000 + Math.random() * 9000)}`;
  const rollbackEntry: LedgerEntry = {
    id: rollbackLedgerId,
    user_id: wth.user_id,
    fund_id: wth.fund_id,
    entry_type: 'PAYOUT_ROLLBACK',
    debit_amount: 0,
    credit_amount: wth.amount,
    calculation_basis: `Rollback for ${wth.withdrawal_code}: ${reason}`,
    balance_after: restoredBalance,
    status: 'ROLLED_BACK',
    idempotency_key: `wth-rbk-${wth.id}`,
    metadata: { reason, adminId },
    created_at: new Date().toISOString(),
  };

  db.createLedgerEntry(rollbackEntry);

  const updated = db.updateWithdrawal(wth.id, {
    status: 'ROLLED_BACK',
    incident_note: reason,
    rollback_ledger_id: rollbackLedgerId,
    processed_by: adminId,
    processed_at: new Date().toISOString(),
  });

  db.createNotification({
    user_id: wth.user_id,
    title: `Payout Cancelled & Refunded: ₹${wth.amount.toLocaleString('en-IN')}`,
    message: `Withdrawal ${wth.withdrawal_code} could not be settled: ${reason}. Reserved funds returned to your balance.`,
    category: 'WITHDRAWAL',
    is_read: false,
    action_url: '/wallet',
  });

  return updated!;
}
