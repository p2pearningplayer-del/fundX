-- ==============================================================================
-- FundX Panel — Institutional Double-Entry Ledger & Enterprise Relational Schema
-- Database Engine: PostgreSQL 14+ (ACID Compliant)
-- Specification: Antigravity PRD v1.0 (Stable Baseline)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. ENUMS AND DOMAINS
-- ==============================================================================
CREATE TYPE user_role_type AS ENUM ('USER', 'SUPPORT', 'FINANCE', 'AUDITOR', 'SUPERADMIN');
CREATE TYPE fund_status_type AS ENUM ('LOCKED', 'PENDING_PAYMENT', 'UNDER_REVIEW', 'ACTIVE', 'EXPIRED', 'SUSPENDED');
CREATE TYPE order_status_type AS ENUM ('PENDING_PAYMENT', 'UNDER_REVIEW', 'ACTIVE', 'EXPIRED', 'REJECTED');
CREATE TYPE task_status_type AS ENUM ('AVAILABLE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE ledger_status_type AS ENUM ('AVAILABLE', 'PENDING_REVIEW', 'RESERVED', 'PAID', 'ROLLED_BACK');
CREATE TYPE ledger_entry_type AS ENUM ('COMMISSION_CREDIT', 'PAYOUT_RESERVATION', 'PAYOUT_SETTLED', 'PAYOUT_ROLLBACK', 'ADMIN_ADJUSTMENT');
CREATE TYPE withdrawal_status_type AS ENUM ('RESERVED', 'UNDER_REVIEW', 'PAID', 'REJECTED', 'ROLLED_BACK');
CREATE TYPE bank_account_type AS ENUM ('SAVINGS', 'CURRENT');

-- ==============================================================================
-- 2. USERS & ACCESS CONTROL (PRD Section 4)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name VARCHAR(120) NOT NULL,
    username VARCHAR(40) UNIQUE NOT NULL,
    mobile VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Bcrypt cost factor 12
    referral_code VARCHAR(32) UNIQUE NOT NULL,
    referred_by VARCHAR(32),
    role user_role_type NOT NULL DEFAULT 'USER',
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    suspension_reason TEXT,
    suspended_at TIMESTAMP WITH TIME ZONE,
    suspended_by UUID,
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_mobile ON users(mobile);
CREATE INDEX idx_users_referral ON users(referral_code);

-- User Session Guard & Audit
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL UNIQUE,
    device_fingerprint VARCHAR(120),
    user_agent TEXT,
    ip_address VARCHAR(45) NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(refresh_token_hash);

-- Security Log for IP Anomaly & Auditing
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(64) NOT NULL, -- 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'IP_CHANGE', 'SUSPICIOUS_ACTIVITY'
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_security_logs_user ON security_logs(user_id, created_at DESC);

-- ==============================================================================
-- 3. FUND CATEGORIES & SPECIFICATIONS (PRD Section 2)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS funds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(32) UNIQUE NOT NULL, -- 'gaming', 'stock', 'mix'
    name VARCHAR(64) NOT NULL,
    description TEXT,
    activation_fee_percent NUMERIC(5, 2) NOT NULL, -- 9.00%, 18.00%, 24.00%
    base_rate NUMERIC(5, 4) NOT NULL,             -- 0.0900, 0.1800, 0.2400
    min_task_amount NUMERIC(14, 2) NOT NULL DEFAULT 1000.00,
    max_task_amount NUMERIC(14, 2) NOT NULL DEFAULT 30000.00,
    baseline_valuation NUMERIC(14, 2) NOT NULL DEFAULT 10000.00, -- Admin-defined valuation
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User Fund Association (Strict Isolation)
CREATE TABLE IF NOT EXISTS user_funds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE RESTRICT,
    status fund_status_type NOT NULL DEFAULT 'LOCKED',
    activated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_fund UNIQUE (user_id, fund_id)
);

CREATE INDEX idx_user_funds_status ON user_funds(user_id, fund_id, status);

-- ==============================================================================
-- 4. ACTIVATION ORDERS & TRC20 BLOCKCHAIN AUDIT (PRD Section 3 & 6)
-- USDT TRC20 Contract: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
-- ==============================================================================
CREATE TABLE IF NOT EXISTS activation_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code VARCHAR(32) UNIQUE NOT NULL, -- e.g. ORD-TRC-99214
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE RESTRICT,
    usdt_amount NUMERIC(14, 4) NOT NULL,
    fiat_equivalent_inr NUMERIC(14, 2) NOT NULL,
    trc20_deposit_wallet VARCHAR(64) NOT NULL,
    trc20_contract_address VARCHAR(64) NOT NULL DEFAULT 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    txid_hash VARCHAR(128) UNIQUE, -- Enforce uniqueness to prevent replay attacks
    status order_status_type NOT NULL DEFAULT 'PENDING_PAYMENT',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- 30-minute expiration window
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by VARCHAR(64), -- 'TRON_RPC_SCANNER' or Admin ID
    rejection_reason TEXT,
    qr_payload TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_status ON activation_orders(status, expires_at);
CREATE INDEX idx_orders_txid ON activation_orders(txid_hash);

-- ==============================================================================
-- 5. BANK ACCOUNT MANAGEMENT & PII VAULT (PRD Section 5)
-- AES-256 Encrypted at rest. UI Masked (XXXX-XXXX-1234).
-- Strict dependency: Parent Fund must be ACTIVE.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE RESTRICT,
    account_holder_encrypted TEXT NOT NULL, -- AES-256-GCM cipher
    bank_name VARCHAR(100) NOT NULL,
    ifsc_code VARCHAR(11) NOT NULL, -- RBI format: ^[A-Z]{4}0[A-Z0-9]{6}$
    account_number_encrypted TEXT NOT NULL, -- AES-256-GCM cipher
    account_number_masked VARCHAR(24) NOT NULL, -- e.g. XXXX-XXXX-4819
    account_type bank_account_type NOT NULL DEFAULT 'SAVINGS',
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    is_immutable BOOLEAN NOT NULL DEFAULT TRUE, -- Direct editing forbidden
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_fund_bank UNIQUE (user_id, fund_id)
);

CREATE INDEX idx_bank_ifsc ON bank_accounts(ifsc_code);
CREATE INDEX idx_bank_user_fund ON bank_accounts(user_id, fund_id);

-- ==============================================================================
-- 6. DUAL TASK ENGINE (GENUINE VS SIMULATED DEMO) (PRD Section 7)
-- ==============================================================================
-- Genuine Transaction Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_code VARCHAR(32) UNIQUE NOT NULL, -- e.g. TSK-GEN-49102
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE RESTRICT,
    quantum_amount NUMERIC(14, 2) NOT NULL, -- ₹1,000 - ₹30,000
    configured_rate NUMERIC(5, 4) NOT NULL, -- 0.0900, 0.1800, 0.2400
    commission_amount NUMERIC(14, 2) NOT NULL, -- quantum * configured_rate
    status task_status_type NOT NULL DEFAULT 'AVAILABLE',
    idempotency_key VARCHAR(64) UNIQUE NOT NULL, -- Prevent double-generation
    title VARCHAR(120) NOT NULL,
    description TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_user_fund ON tasks(user_id, fund_id, status);

-- Simulated (DEMO) Tasks Table — Structurally Partitioned / Zero Financial Balance Impact
CREATE TABLE IF NOT EXISTS demo_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_code VARCHAR(32) UNIQUE NOT NULL, -- e.g. TSK-DMO-10294
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE RESTRICT,
    quantum_amount NUMERIC(14, 2) NOT NULL,
    configured_rate NUMERIC(5, 4) NOT NULL,
    commission_amount NUMERIC(14, 2) NOT NULL,
    status task_status_type NOT NULL DEFAULT 'AVAILABLE',
    is_demo BOOLEAN NOT NULL DEFAULT TRUE,
    watermark_label VARCHAR(32) NOT NULL DEFAULT 'DEMO',
    title VARCHAR(120) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_demo_tasks_user ON demo_tasks(user_id, status);

-- ==============================================================================
-- 7. DOUBLE-ENTRY FINANCIAL LEDGER & COMMISSION (PRD Section 8)
-- Strict double-entry accounting with isolated fund-specific balances.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS ledger_entries (
    id VARCHAR(32) PRIMARY KEY, -- e.g. LG-GM-8821, LG-ST-4091, LG-MX-1029
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE RESTRICT,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    entry_type ledger_entry_type NOT NULL,
    debit_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    credit_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    calculation_basis VARCHAR(120) NOT NULL, -- e.g. "₹10,000 @ 9.0%"
    balance_after NUMERIC(14, 2) NOT NULL,
    status ledger_status_type NOT NULL DEFAULT 'AVAILABLE',
    idempotency_key VARCHAR(64) UNIQUE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ledger_user_fund ON ledger_entries(user_id, fund_id, status);
CREATE INDEX idx_ledger_created ON ledger_entries(created_at DESC);

-- ==============================================================================
-- 8. WITHDRAWAL SETTLEMENT & BALANCE RESERVATION (PRD Section 9)
-- Real-time reservation prevents double-spending.
-- Settlement requires cryptographically verified UTR hash.
-- Failed/Rejected withdrawals invoke compensating ledger rollback.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    withdrawal_code VARCHAR(32) UNIQUE NOT NULL, -- e.g. WTH-IND-88190
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE RESTRICT,
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE RESTRICT,
    amount NUMERIC(14, 2) NOT NULL,
    fee_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    net_payout NUMERIC(14, 2) NOT NULL,
    status withdrawal_status_type NOT NULL DEFAULT 'RESERVED',
    reservation_ledger_id VARCHAR(32) REFERENCES ledger_entries(id),
    rollback_ledger_id VARCHAR(32) REFERENCES ledger_entries(id),
    settlement_ledger_id VARCHAR(32) REFERENCES ledger_entries(id),
    payout_utr_hash VARCHAR(128), -- Cryptographically validated UTR
    payout_gateway_ref VARCHAR(128),
    incident_note TEXT,
    processed_by UUID REFERENCES users(id),
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_withdrawals_status ON withdrawals(status, requested_at DESC);
CREATE INDEX idx_withdrawals_user ON withdrawals(user_id, fund_id);

-- ==============================================================================
-- 9. NOTIFICATIONS, SUPPORT & NON-REPUDIABLE AUDIT LOG (PRD Section 10 & 11)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS in_app_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(120) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(32) NOT NULL DEFAULT 'SYSTEM', -- 'ACTIVATION', 'COMMISSION', 'WITHDRAWAL', 'SECURITY'
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    action_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON in_app_notifications(user_id, is_read, created_at DESC);

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_code VARCHAR(32) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',     -- 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- 'USER', 'AGENT', 'SYSTEM'
    sender_id UUID,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Immutable Admin Audit Trail
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(64) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    payload JSONB,
    ip_address VARCHAR(45) NOT NULL,
    signature VARCHAR(128) NOT NULL, -- HMAC-SHA256 non-repudiation signature
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_audit ON admin_audit_logs(admin_id, created_at DESC);

-- ==============================================================================
-- 10. SYSTEM CONFIGURATION PARAMETERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS system_config (
    config_key VARCHAR(64) PRIMARY KEY,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 11. INITIAL SEED DATA
-- ==============================================================================
-- Insert Institutional Funds
INSERT INTO funds (slug, name, description, activation_fee_percent, base_rate, min_task_amount, max_task_amount, baseline_valuation)
VALUES 
    ('gaming', 'Gaming Fund', 'High-velocity transaction-matching fund with gaming network clearing tasks.', 9.00, 0.0900, 1000.00, 30000.00, 10000.00),
    ('stock', 'Stock Fund', 'Equities and derivatives transaction routing with institutional clearing.', 18.00, 0.1800, 1000.00, 30000.00, 10000.00),
    ('mix', 'Mix Fund', 'Blended multi-asset algorithmic liquidity provision and arbitrage clearing.', 24.00, 0.2400, 1000.00, 30000.00, 10000.00)
ON CONFLICT (slug) DO UPDATE 
SET activation_fee_percent = EXCLUDED.activation_fee_percent,
    base_rate = EXCLUDED.base_rate;

-- Insert System Configuration Parameters
INSERT INTO system_config (config_key, config_value, description)
VALUES 
    ('trc20_contract', '"TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"', 'Official USDT TRC20 Token Contract'),
    ('trc20_hot_wallet', '"TXN9A5B8x7pKL2qRt1WvY3zEmP9sDcFeGh"', 'Central Deposit Receiving TRC20 Hot Wallet'),
    ('usdt_inr_peg_rate', '89.50', 'System Reference Peg: 1 USDT = 89.50 INR'),
    ('order_expiry_minutes', '30', 'Activation Order Expiration Window in minutes'),
    ('maintenance_mode', 'false', 'Global platform maintenance flag')
ON CONFLICT (config_key) DO NOTHING;
