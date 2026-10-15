-- ==============================================================================
-- FundX Panel — Universal Database SQL Initialization & Seed Script
-- Compatible with PostgreSQL & MySQL / MariaDB (Standard ANSI SQL)
-- ==============================================================================

-- Drop tables if needed for clean re-install (Ordered by foreign key dependencies)
-- DROP TABLE IF EXISTS admin_audit_logs CASCADE;
-- DROP TABLE IF EXISTS support_messages CASCADE;
-- DROP TABLE IF EXISTS support_tickets CASCADE;
-- DROP TABLE IF EXISTS in_app_notifications CASCADE;
-- DROP TABLE IF EXISTS withdrawals CASCADE;
-- DROP TABLE IF EXISTS ledger_entries CASCADE;
-- DROP TABLE IF EXISTS demo_tasks CASCADE;
-- DROP TABLE IF EXISTS tasks CASCADE;
-- DROP TABLE IF EXISTS bank_accounts CASCADE;
-- DROP TABLE IF EXISTS activation_orders CASCADE;
-- DROP TABLE IF EXISTS user_funds CASCADE;
-- DROP TABLE IF EXISTS funds CASCADE;
-- DROP TABLE IF EXISTS security_logs CASCADE;
-- DROP TABLE IF EXISTS user_sessions CASCADE;
-- DROP TABLE IF EXISTS system_config CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    legal_name VARCHAR(120) NOT NULL,
    username VARCHAR(40) NOT NULL UNIQUE,
    mobile VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(120) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    referral_code VARCHAR(32) NOT NULL UNIQUE,
    referred_by VARCHAR(32),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    suspension_reason TEXT,
    suspended_at TIMESTAMP NULL,
    suspended_by VARCHAR(36),
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: user_sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL UNIQUE,
    device_fingerprint VARCHAR(120),
    user_agent TEXT,
    ip_address VARCHAR(45) NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: security_logs
CREATE TABLE IF NOT EXISTS security_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    event_type VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    metadata TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table: funds
CREATE TABLE IF NOT EXISTS funds (
    id VARCHAR(36) PRIMARY KEY,
    slug VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(64) NOT NULL,
    description TEXT,
    activation_fee_percent DECIMAL(5, 2) NOT NULL,
    base_rate DECIMAL(5, 4) NOT NULL,
    min_task_amount DECIMAL(14, 2) NOT NULL DEFAULT 1000.00,
    max_task_amount DECIMAL(14, 2) NOT NULL DEFAULT 30000.00,
    baseline_valuation DECIMAL(14, 2) NOT NULL DEFAULT 10000.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: user_funds
CREATE TABLE IF NOT EXISTS user_funds (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    fund_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'LOCKED',
    activated_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, fund_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fund_id) REFERENCES funds(id) ON DELETE RESTRICT
);

-- Table: activation_orders
CREATE TABLE IF NOT EXISTS activation_orders (
    id VARCHAR(36) PRIMARY KEY,
    order_code VARCHAR(32) NOT NULL UNIQUE,
    user_id VARCHAR(36) NOT NULL,
    fund_id VARCHAR(36) NOT NULL,
    usdt_amount DECIMAL(14, 4) NOT NULL,
    fiat_equivalent_inr DECIMAL(14, 2) NOT NULL,
    trc20_deposit_wallet VARCHAR(64) NOT NULL,
    trc20_contract_address VARCHAR(64) NOT NULL DEFAULT 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    txid_hash VARCHAR(128) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT',
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP NULL,
    verified_by VARCHAR(64),
    rejection_reason TEXT,
    qr_payload TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fund_id) REFERENCES funds(id) ON DELETE RESTRICT
);

-- Table: bank_accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    fund_id VARCHAR(36) NOT NULL,
    account_holder_encrypted TEXT NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    ifsc_code VARCHAR(11) NOT NULL,
    account_number_encrypted TEXT NOT NULL,
    account_number_masked VARCHAR(24) NOT NULL,
    account_type VARCHAR(20) NOT NULL DEFAULT 'SAVINGS',
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    is_immutable BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, fund_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fund_id) REFERENCES funds(id) ON DELETE RESTRICT
);

-- Table: tasks (Genuine tasks)
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    task_code VARCHAR(32) NOT NULL UNIQUE,
    user_id VARCHAR(36) NOT NULL,
    fund_id VARCHAR(36) NOT NULL,
    quantum_amount DECIMAL(14, 2) NOT NULL,
    configured_rate DECIMAL(5, 4) NOT NULL,
    commission_amount DECIMAL(14, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    idempotency_key VARCHAR(64) NOT NULL UNIQUE,
    title VARCHAR(120) NOT NULL,
    description TEXT,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fund_id) REFERENCES funds(id) ON DELETE RESTRICT
);

-- Table: demo_tasks (Simulated / Partitioned)
CREATE TABLE IF NOT EXISTS demo_tasks (
    id VARCHAR(36) PRIMARY KEY,
    task_code VARCHAR(32) NOT NULL UNIQUE,
    user_id VARCHAR(36) NOT NULL,
    fund_id VARCHAR(36) NOT NULL,
    quantum_amount DECIMAL(14, 2) NOT NULL,
    configured_rate DECIMAL(5, 4) NOT NULL,
    commission_amount DECIMAL(14, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    is_demo BOOLEAN NOT NULL DEFAULT TRUE,
    watermark_label VARCHAR(32) NOT NULL DEFAULT 'DEMO',
    title VARCHAR(120) NOT NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fund_id) REFERENCES funds(id) ON DELETE RESTRICT
);

-- Table: ledger_entries (Double-Entry Ledger)
CREATE TABLE IF NOT EXISTS ledger_entries (
    id VARCHAR(32) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    fund_id VARCHAR(36) NOT NULL,
    task_id VARCHAR(36),
    entry_type VARCHAR(32) NOT NULL,
    debit_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    credit_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    calculation_basis VARCHAR(120) NOT NULL,
    balance_after DECIMAL(14, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    idempotency_key VARCHAR(64) NOT NULL UNIQUE,
    metadata TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fund_id) REFERENCES funds(id) ON DELETE RESTRICT
);

-- Table: withdrawals
CREATE TABLE IF NOT EXISTS withdrawals (
    id VARCHAR(36) PRIMARY KEY,
    withdrawal_code VARCHAR(32) NOT NULL UNIQUE,
    user_id VARCHAR(36) NOT NULL,
    fund_id VARCHAR(36) NOT NULL,
    bank_account_id VARCHAR(36) NOT NULL,
    amount DECIMAL(14, 2) NOT NULL,
    fee_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    net_payout DECIMAL(14, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'RESERVED',
    reservation_ledger_id VARCHAR(32),
    rollback_ledger_id VARCHAR(32),
    settlement_ledger_id VARCHAR(32),
    payout_utr_hash VARCHAR(128),
    payout_gateway_ref VARCHAR(128),
    incident_note TEXT,
    processed_by VARCHAR(36),
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fund_id) REFERENCES funds(id) ON DELETE RESTRICT,
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE RESTRICT
);

-- Table: in_app_notifications
CREATE TABLE IF NOT EXISTS in_app_notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(120) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(32) NOT NULL DEFAULT 'SYSTEM',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    action_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: support_tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(36) PRIMARY KEY,
    ticket_code VARCHAR(32) NOT NULL UNIQUE,
    user_id VARCHAR(36) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: support_messages
CREATE TABLE IF NOT EXISTS support_messages (
    id VARCHAR(36) PRIMARY KEY,
    ticket_id VARCHAR(36) NOT NULL,
    sender_type VARCHAR(20) NOT NULL,
    sender_id VARCHAR(36),
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
);

-- Table: admin_audit_logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    admin_id VARCHAR(36) NOT NULL,
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(64) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    payload TEXT,
    ip_address VARCHAR(45) NOT NULL,
    signature VARCHAR(128) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Table: system_config
CREATE TABLE IF NOT EXISTS system_config (
    config_key VARCHAR(64) PRIMARY KEY,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_by VARCHAR(36),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- DEFAULT SEED DATA
-- ==============================================================================

-- 1. Initial 3 Funds
INSERT INTO funds (id, slug, name, description, activation_fee_percent, base_rate, min_task_amount, max_task_amount, baseline_valuation, is_active)
VALUES
('fnd-gaming-001', 'gaming', 'Gaming Fund', 'High-velocity transaction-matching fund with gaming network clearing tasks.', 9.00, 0.0900, 1000.00, 30000.00, 10000.00, TRUE),
('fnd-stock-002', 'stock', 'Stock Fund', 'Equities and derivatives transaction routing with institutional clearing.', 18.00, 0.1800, 1000.00, 30000.00, 10000.00, TRUE),
('fnd-mix-003', 'mix', 'Mix Fund', 'Blended multi-asset algorithmic liquidity provision and arbitrage clearing.', 24.00, 0.2400, 1000.00, 30000.00, 10000.00, TRUE);

-- 2. Default Initial Superadmin
-- Password is 'FundX#AdminSecure2026!' hashed with Bcrypt cost 12:
-- $2b$12$Kk.Fv2m9vVvGfD9G5H5m8u2Bf4X3p4W8Z6Y1q8Q2e3W4R5T6Y7U8i (representative salt/hash)
INSERT INTO users (id, legal_name, username, mobile, email, password_hash, referral_code, role, is_suspended)
VALUES (
    'usr-superadmin-001',
    'System Superadministrator',
    'fundx_superadmin',
    '9876543210',
    'superadmin@fundx.internal',
    '$2b$12$29j7gU8G1X0/uFmEw5rZCeZ8eP7j1vB2N3m4Q5R6T7Y8U9I0O1P2Q',
    'FUNDXADMIN',
    'SUPERADMIN',
    FALSE
);

-- 3. Initial Configuration
INSERT INTO system_config (config_key, config_value, description)
VALUES 
('trc20_contract', '"TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"', 'USDT TRC20 Official Contract'),
('trc20_hot_wallet', '"TXN9A5B8x7pKL2qRt1WvY3zEmP9sDcFeGh"', 'Platform Central Hot Wallet Address'),
('usdt_inr_peg_rate', '89.50', 'Reference FX Peg: 1 USDT = 89.50 INR'),
('order_expiry_minutes', '30', 'Activation Timer Window in minutes');
