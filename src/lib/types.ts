// ==============================================================================
// FundX Panel — Core TypeScript Type Definitions & Domain Models
// ==============================================================================

export type UserRole = 'USER' | 'SUPPORT' | 'FINANCE' | 'AUDITOR' | 'SUPERADMIN';

export type FundSlug = 'gaming' | 'stock' | 'mix';

export type FundStatus = 'LOCKED' | 'PENDING_PAYMENT' | 'UNDER_REVIEW' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';

export type OrderStatus = 'PENDING_PAYMENT' | 'UNDER_REVIEW' | 'ACTIVE' | 'EXPIRED' | 'REJECTED';

export type TaskStatus = 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type LedgerStatus = 'AVAILABLE' | 'PENDING_REVIEW' | 'RESERVED' | 'PAID' | 'ROLLED_BACK';

export type LedgerEntryType =
  | 'COMMISSION_CREDIT'
  | 'PAYOUT_RESERVATION'
  | 'PAYOUT_SETTLED'
  | 'PAYOUT_ROLLBACK'
  | 'ADMIN_ADJUSTMENT';

export type WithdrawalStatus = 'RESERVED' | 'UNDER_REVIEW' | 'PAID' | 'REJECTED' | 'ROLLED_BACK';

export type BankAccountType = 'SAVINGS' | 'CURRENT';

export interface User {
  id: string;
  legal_name: string;
  username: string;
  mobile: string;
  email?: string;
  password_hash: string;
  referral_code: string;
  referred_by?: string;
  role: UserRole;
  is_suspended: boolean;
  suspension_reason?: string;
  suspended_at?: string;
  suspended_by?: string;
  last_login_at?: string;
  last_login_ip?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  refresh_token_hash: string;
  device_fingerprint?: string;
  user_agent?: string;
  ip_address: string;
  is_revoked: boolean;
  expires_at: string;
  created_at: string;
}

export interface SecurityLog {
  id: string;
  user_id?: string;
  event_type: string;
  ip_address: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Fund {
  id: string;
  slug: FundSlug;
  name: string;
  description: string;
  activation_fee_percent: number; // e.g. 9.0, 18.0, 24.0
  base_rate: number; // e.g. 0.09, 0.18, 0.24
  min_task_amount: number; // 1,000
  max_task_amount: number; // 30,000
  baseline_valuation: number; // 10,000
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserFund {
  id: string;
  user_id: string;
  fund_id: string;
  status: FundStatus;
  activated_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivationOrder {
  id: string;
  order_code: string;
  user_id: string;
  fund_id: string;
  usdt_amount: number;
  fiat_equivalent_inr: number;
  trc20_deposit_wallet: string;
  trc20_contract_address: string;
  txid_hash?: string;
  status: OrderStatus;
  expires_at: string; // ISO String (30-minute expiration)
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
  qr_payload: string;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  user_id: string;
  fund_id: string;
  account_holder_encrypted: string;
  bank_name: string;
  ifsc_code: string;
  account_number_encrypted: string;
  account_number_masked: string; // XXXX-XXXX-1234
  account_type: BankAccountType;
  is_verified: boolean;
  is_immutable: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  task_code: string;
  user_id: string;
  fund_id: string;
  quantum_amount: number; // ₹1,000 - ₹30,000
  configured_rate: number; // 0.09, 0.18, 0.24
  commission_amount: number; // quantum * configured_rate
  status: TaskStatus;
  idempotency_key: string;
  title: string;
  description?: string;
  completed_at?: string;
  created_at: string;
}

export interface DemoTask {
  id: string;
  task_code: string;
  user_id: string;
  fund_id: string;
  quantum_amount: number;
  configured_rate: number;
  commission_amount: number;
  status: TaskStatus;
  is_demo: true;
  watermark_label: string; // "DEMO"
  title: string;
  completed_at?: string;
  created_at: string;
}

export interface LedgerEntry {
  id: string; // e.g. LG-GM-8821
  user_id: string;
  fund_id: string;
  task_id?: string;
  entry_type: LedgerEntryType;
  debit_amount: number;
  credit_amount: number;
  calculation_basis: string; // e.g. "₹10,000 @ 9.0%"
  balance_after: number;
  status: LedgerStatus;
  idempotency_key: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  withdrawal_code: string;
  user_id: string;
  fund_id: string;
  bank_account_id: string;
  amount: number;
  fee_amount: number;
  net_payout: number;
  status: WithdrawalStatus;
  reservation_ledger_id?: string;
  rollback_ledger_id?: string;
  settlement_ledger_id?: string;
  payout_utr_hash?: string;
  payout_gateway_ref?: string;
  incident_note?: string;
  processed_by?: string;
  requested_at: string;
  processed_at?: string;
  updated_at: string;
}

export interface InAppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  category: 'ACTIVATION' | 'COMMISSION' | 'WITHDRAWAL' | 'SECURITY' | 'SYSTEM';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  ticket_code: string;
  user_id: string;
  subject: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_type: 'USER' | 'AGENT' | 'SYSTEM';
  sender_id?: string;
  message: string;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  admin_username?: string;
  action: string;
  target_type: string;
  target_id: string;
  payload: Record<string, unknown>;
  ip_address: string;
  signature: string;
  created_at: string;
}

export interface SystemConfig {
  config_key: string;
  config_value: unknown;
  description?: string;
  updated_by?: string;
  updated_at: string;
}
