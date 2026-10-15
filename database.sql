-- ==============================================================================
-- FundX Panel — Hostinger Production MySQL Database Initialization & Seed Script
-- Target Database: u591469534_fund
-- Target User: u591469534_fundx
-- Engine: InnoDB (ACID Compliant) | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Table: users
CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(36) NOT NULL,
    `legal_name` VARCHAR(120) NOT NULL,
    `username` VARCHAR(40) NOT NULL,
    `mobile` VARCHAR(20) NOT NULL,
    `email` VARCHAR(120) DEFAULT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `referral_code` VARCHAR(32) NOT NULL,
    `referred_by` VARCHAR(32) DEFAULT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'USER',
    `is_suspended` TINYINT(1) NOT NULL DEFAULT 0,
    `suspension_reason` TEXT DEFAULT NULL,
    `suspended_at` DATETIME DEFAULT NULL,
    `suspended_by` VARCHAR(36) DEFAULT NULL,
    `last_login_at` DATETIME DEFAULT NULL,
    `last_login_ip` VARCHAR(45) DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_users_username` (`username`),
    UNIQUE KEY `uq_users_mobile` (`mobile`),
    UNIQUE KEY `uq_users_referral` (`referral_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table: user_sessions
CREATE TABLE IF NOT EXISTS `user_sessions` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `refresh_token_hash` VARCHAR(255) NOT NULL,
    `device_fingerprint` VARCHAR(120) DEFAULT NULL,
    `user_agent` TEXT DEFAULT NULL,
    `ip_address` VARCHAR(45) NOT NULL,
    `is_revoked` TINYINT(1) NOT NULL DEFAULT 0,
    `expires_at` DATETIME NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_sessions_token` (`refresh_token_hash`),
    KEY `idx_sessions_user` (`user_id`),
    CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table: security_logs
CREATE TABLE IF NOT EXISTS `security_logs` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) DEFAULT NULL,
    `event_type` VARCHAR(64) NOT NULL,
    `ip_address` VARCHAR(45) NOT NULL,
    `user_agent` TEXT DEFAULT NULL,
    `metadata` TEXT DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_security_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table: funds
CREATE TABLE IF NOT EXISTS `funds` (
    `id` VARCHAR(36) NOT NULL,
    `slug` VARCHAR(32) NOT NULL,
    `name` VARCHAR(64) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `activation_fee_percent` DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
    `activation_fee_usdt` DECIMAL(12, 2) NOT NULL DEFAULT 100.00,
    `base_rate` DECIMAL(5, 4) NOT NULL,
    `min_task_amount` DECIMAL(14, 2) NOT NULL DEFAULT 1000.00,
    `max_task_amount` DECIMAL(14, 2) NOT NULL DEFAULT 30000.00,
    `baseline_valuation` DECIMAL(14, 2) NOT NULL DEFAULT 10000.00,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_funds_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table: user_funds
CREATE TABLE IF NOT EXISTS `user_funds` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `fund_id` VARCHAR(36) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'LOCKED',
    `activated_at` DATETIME DEFAULT NULL,
    `expires_at` DATETIME DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_user_fund` (`user_id`, `fund_id`),
    KEY `idx_user_funds_user` (`user_id`),
    KEY `idx_user_funds_fund` (`fund_id`),
    CONSTRAINT `fk_user_funds_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_user_funds_fund` FOREIGN KEY (`fund_id`) REFERENCES `funds` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Table: activation_orders
CREATE TABLE IF NOT EXISTS `activation_orders` (
    `id` VARCHAR(36) NOT NULL,
    `order_code` VARCHAR(32) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `fund_id` VARCHAR(36) NOT NULL,
    `usdt_amount` DECIMAL(14, 4) NOT NULL,
    `fiat_equivalent_inr` DECIMAL(14, 2) NOT NULL,
    `trc20_deposit_wallet` VARCHAR(64) NOT NULL,
    `trc20_contract_address` VARCHAR(64) NOT NULL DEFAULT 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    `txid_hash` VARCHAR(128) DEFAULT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT',
    `expires_at` DATETIME NOT NULL,
    `verified_at` DATETIME DEFAULT NULL,
    `verified_by` VARCHAR(64) DEFAULT NULL,
    `rejection_reason` TEXT DEFAULT NULL,
    `qr_payload` TEXT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_activation_order_code` (`order_code`),
    UNIQUE KEY `uq_activation_txid` (`txid_hash`),
    KEY `idx_activation_user` (`user_id`),
    CONSTRAINT `fk_activation_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_activation_fund` FOREIGN KEY (`fund_id`) REFERENCES `funds` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Table: bank_accounts
CREATE TABLE IF NOT EXISTS `bank_accounts` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `fund_id` VARCHAR(36) NOT NULL,
    `account_holder_encrypted` TEXT NOT NULL,
    `bank_name` VARCHAR(100) NOT NULL,
    `ifsc_code` VARCHAR(11) NOT NULL,
    `account_number_encrypted` TEXT NOT NULL,
    `account_number_masked` VARCHAR(24) NOT NULL,
    `account_type` VARCHAR(20) NOT NULL DEFAULT 'SAVINGS',
    `is_verified` TINYINT(1) NOT NULL DEFAULT 1,
    `is_immutable` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_bank_user_fund` (`user_id`, `fund_id`),
    KEY `idx_bank_user` (`user_id`),
    CONSTRAINT `fk_bank_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_bank_fund` FOREIGN KEY (`fund_id`) REFERENCES `funds` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Table: tasks
CREATE TABLE IF NOT EXISTS `tasks` (
    `id` VARCHAR(36) NOT NULL,
    `task_code` VARCHAR(32) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `fund_id` VARCHAR(36) NOT NULL,
    `quantum_amount` DECIMAL(14, 2) NOT NULL,
    `configured_rate` DECIMAL(5, 4) NOT NULL,
    `commission_amount` DECIMAL(14, 2) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    `idempotency_key` VARCHAR(64) NOT NULL,
    `title` VARCHAR(120) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `completed_at` DATETIME DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_task_code` (`task_code`),
    UNIQUE KEY `uq_task_idempotency` (`idempotency_key`),
    KEY `idx_tasks_user_fund` (`user_id`, `fund_id`),
    CONSTRAINT `fk_tasks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_tasks_fund` FOREIGN KEY (`fund_id`) REFERENCES `funds` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Table: demo_tasks
CREATE TABLE IF NOT EXISTS `demo_tasks` (
    `id` VARCHAR(36) NOT NULL,
    `task_code` VARCHAR(32) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `fund_id` VARCHAR(36) NOT NULL,
    `quantum_amount` DECIMAL(14, 2) NOT NULL,
    `configured_rate` DECIMAL(5, 4) NOT NULL,
    `commission_amount` DECIMAL(14, 2) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    `is_demo` TINYINT(1) NOT NULL DEFAULT 1,
    `watermark_label` VARCHAR(32) NOT NULL DEFAULT 'DEMO',
    `title` VARCHAR(120) NOT NULL,
    `completed_at` DATETIME DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_demo_task_code` (`task_code`),
    KEY `idx_demo_tasks_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Table: ledger_entries
CREATE TABLE IF NOT EXISTS `ledger_entries` (
    `id` VARCHAR(32) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `fund_id` VARCHAR(36) NOT NULL,
    `task_id` VARCHAR(36) DEFAULT NULL,
    `entry_type` VARCHAR(32) NOT NULL,
    `debit_amount` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `credit_amount` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `calculation_basis` VARCHAR(120) NOT NULL,
    `balance_after` DECIMAL(14, 2) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    `idempotency_key` VARCHAR(64) NOT NULL,
    `metadata` TEXT DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_ledger_idempotency` (`idempotency_key`),
    KEY `idx_ledger_user_fund` (`user_id`, `fund_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Table: withdrawals
CREATE TABLE IF NOT EXISTS `withdrawals` (
    `id` VARCHAR(36) NOT NULL,
    `withdrawal_code` VARCHAR(32) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `fund_id` VARCHAR(36) NOT NULL,
    `bank_account_id` VARCHAR(36) NOT NULL,
    `amount` DECIMAL(14, 2) NOT NULL,
    `fee_amount` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `net_payout` DECIMAL(14, 2) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'RESERVED',
    `reservation_ledger_id` VARCHAR(32) DEFAULT NULL,
    `rollback_ledger_id` VARCHAR(32) DEFAULT NULL,
    `settlement_ledger_id` VARCHAR(32) DEFAULT NULL,
    `payout_utr_hash` VARCHAR(128) DEFAULT NULL,
    `payout_gateway_ref` VARCHAR(128) DEFAULT NULL,
    `incident_note` TEXT DEFAULT NULL,
    `processed_by` VARCHAR(36) DEFAULT NULL,
    `requested_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `processed_at` DATETIME DEFAULT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_withdrawal_code` (`withdrawal_code`),
    KEY `idx_withdrawals_user` (`user_id`),
    CONSTRAINT `fk_withdrawals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_withdrawals_fund` FOREIGN KEY (`fund_id`) REFERENCES `funds` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_withdrawals_bank` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Table: in_app_notifications
CREATE TABLE IF NOT EXISTS `in_app_notifications` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(120) NOT NULL,
    `message` TEXT NOT NULL,
    `category` VARCHAR(32) NOT NULL DEFAULT 'SYSTEM',
    `is_read` TINYINT(1) NOT NULL DEFAULT 0,
    `action_url` VARCHAR(255) DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_notifs_user` (`user_id`),
    CONSTRAINT `fk_notifs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Table: support_tickets
CREATE TABLE IF NOT EXISTS `support_tickets` (
    `id` VARCHAR(36) NOT NULL,
    `ticket_code` VARCHAR(32) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `subject` VARCHAR(150) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `priority` VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    `status` VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_ticket_code` (`ticket_code`),
    KEY `idx_support_tickets_user` (`user_id`),
    CONSTRAINT `fk_support_tickets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Table: support_messages
CREATE TABLE IF NOT EXISTS `support_messages` (
    `id` VARCHAR(36) NOT NULL,
    `ticket_id` VARCHAR(36) NOT NULL,
    `sender_type` VARCHAR(20) NOT NULL,
    `sender_id` VARCHAR(36) DEFAULT NULL,
    `message` TEXT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_support_msg_ticket` (`ticket_id`),
    CONSTRAINT `fk_support_msg_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Table: admin_audit_logs
CREATE TABLE IF NOT EXISTS `admin_audit_logs` (
    `id` VARCHAR(36) NOT NULL,
    `admin_id` VARCHAR(36) NOT NULL,
    `action` VARCHAR(64) NOT NULL,
    `target_type` VARCHAR(64) NOT NULL,
    `target_id` VARCHAR(64) NOT NULL,
    `payload` TEXT DEFAULT NULL,
    `ip_address` VARCHAR(45) NOT NULL,
    `signature` VARCHAR(128) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_admin_audit_admin` (`admin_id`),
    CONSTRAINT `fk_admin_audit_user` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Table: system_config
CREATE TABLE IF NOT EXISTS `system_config` (
    `config_key` VARCHAR(64) NOT NULL,
    `config_value` TEXT NOT NULL,
    `description` TEXT DEFAULT NULL,
    `updated_by` VARCHAR(36) DEFAULT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- DEFAULT SEED DATA
-- ==============================================================================

-- 1. Initial 3 Funds (Explicit Fixed USDT Activation Fees)
INSERT INTO `funds` (`id`, `slug`, `name`, `description`, `activation_fee_percent`, `activation_fee_usdt`, `base_rate`, `min_task_amount`, `max_task_amount`, `baseline_valuation`, `is_active`)
VALUES
('fnd-gaming-001', 'gaming', 'Gaming Fund', 'High-velocity transaction-matching fund with gaming network clearing tasks.', 9.00, 100.00, 0.0900, 1000.00, 30000.00, 10000.00, 1),
('fnd-stock-002', 'stock', 'Stock Fund', 'Equities and derivatives transaction routing with institutional clearing.', 18.00, 150.00, 0.1800, 1000.00, 30000.00, 10000.00, 1),
('fnd-mix-003', 'mix', 'Mix Fund', 'Blended multi-asset algorithmic liquidity provision and arbitrage clearing.', 24.00, 200.00, 0.2400, 1000.00, 30000.00, 10000.00, 1)
ON DUPLICATE KEY UPDATE `activation_fee_usdt` = VALUES(`activation_fee_usdt`), `activation_fee_percent` = VALUES(`activation_fee_percent`), `base_rate` = VALUES(`base_rate`);

-- 2. Default Initial Superadmin
-- Password: FundX#AdminSecure2026! (Bcrypt cost factor 12)
INSERT INTO `users` (`id`, `legal_name`, `username`, `mobile`, `email`, `password_hash`, `referral_code`, `role`, `is_suspended`)
VALUES (
    'usr-superadmin-001',
    'System Superadministrator',
    'fundx_superadmin',
    '9876543210',
    'superadmin@fundx.internal',
    '$2a$12$.0tTGnjkkPoOEskbztL3v.RiaEpfKAnxlxYVjjFFO3tqlGllxdPIu',
    'FUNDXADMIN',
    'SUPERADMIN',
    0
)
ON DUPLICATE KEY UPDATE `password_hash` = VALUES(`password_hash`), `role` = 'SUPERADMIN';

-- 3. Initial Configuration
INSERT INTO `system_config` (`config_key`, `config_value`, `description`)
VALUES 
('usdt_address', 'TEaZq1K2vhWUi5i8AWqC4tNE57VvHi6xJX', 'USDT TRC20 Destination Wallet Address'),
('usdt_qr_path', '', 'Path or URL to Custom USDT QR Code Image'),
('trc20_contract', 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', 'USDT TRC20 Official Contract'),
('trc20_hot_wallet', 'TEaZq1K2vhWUi5i8AWqC4tNE57VvHi6xJX', 'Platform Central Hot Wallet Address'),
('usdt_inr_peg_rate', '89.50', 'Reference FX Peg: 1 USDT = 89.50 INR'),
('order_expiry_minutes', '30', 'Activation Timer Window in minutes')
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);

SET FOREIGN_KEY_CHECKS = 1;

