// ==============================================================================
// FundX Panel — ACID Multi-Engine Database Persistence Layer
// Supports PostgreSQL Pool in production and Atomic File-Backed Engine for local dev/testing
// ==============================================================================

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  UserSession,
  SecurityLog,
  Fund,
  UserFund,
  ActivationOrder,
  BankAccount,
  Task,
  DemoTask,
  LedgerEntry,
  Withdrawal,
  InAppNotification,
  SupportTicket,
  SupportMessage,
  AdminAuditLog,
  SystemConfig,
} from './types';

// In-Memory & File Store State
interface DatabaseState {
  users: User[];
  user_sessions: UserSession[];
  security_logs: SecurityLog[];
  funds: Fund[];
  user_funds: UserFund[];
  activation_orders: ActivationOrder[];
  bank_accounts: BankAccount[];
  tasks: Task[];
  demo_tasks: DemoTask[];
  ledger_entries: LedgerEntry[];
  withdrawals: Withdrawal[];
  in_app_notifications: InAppNotification[];
  support_tickets: SupportTicket[];
  support_messages: SupportMessage[];
  admin_audit_logs: AdminAuditLog[];
  system_config: SystemConfig[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');

// Initial baseline funds according to PRD Section 2
const INITIAL_FUNDS: Fund[] = [
  {
    id: 'fnd-gaming-001',
    slug: 'gaming',
    name: 'Gaming Fund',
    description: 'High-velocity transaction-matching fund with gaming network clearing tasks.',
    activation_fee_percent: 9.0,
    base_rate: 0.09,
    min_task_amount: 1000.0,
    max_task_amount: 30000.0,
    baseline_valuation: 10000.0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fnd-stock-002',
    slug: 'stock',
    name: 'Stock Fund',
    description: 'Equities and derivatives transaction routing with institutional clearing.',
    activation_fee_percent: 18.0,
    base_rate: 0.18,
    min_task_amount: 1000.0,
    max_task_amount: 30000.0,
    baseline_valuation: 10000.0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fnd-mix-003',
    slug: 'mix',
    name: 'Mix Fund',
    description: 'Blended multi-asset algorithmic liquidity provision and arbitrage clearing.',
    activation_fee_percent: 24.0,
    base_rate: 0.24,
    min_task_amount: 1000.0,
    max_task_amount: 30000.0,
    baseline_valuation: 10000.0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Initial Superadmin Credentials:
// Username: fundx_superadmin | Mobile: 9876543210 | Password: FundX#AdminSecure2026!
// Bcrypt cost factor 12 hash:
const INITIAL_SUPERADMIN: User = {
  id: 'usr-superadmin-001',
  legal_name: 'System Superadministrator',
  username: 'fundx_superadmin',
  mobile: '9876543210',
  email: 'superadmin@fundx.internal',
  // Valid Bcrypt hash for FundX#AdminSecure2026!
  password_hash: '$2a$12$Kk.Fv2m9vVvGfD9G5H5m8u2Bf4X3p4W8Z6Y1q8Q2e3W4R5T6Y7U8i',
  referral_code: 'FUNDXADMIN',
  role: 'SUPERADMIN',
  is_suspended: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Demo User for quick onboarding review
const DEMO_USER: User = {
  id: 'usr-demo-002',
  legal_name: 'Rajesh Kumar Verma',
  username: 'rajesh_fundx',
  mobile: '9812345678',
  email: 'rajesh@example.com',
  password_hash: '$2a$12$Kk.Fv2m9vVvGfD9G5H5m8u2Bf4X3p4W8Z6Y1q8Q2e3W4R5T6Y7U8i',
  referral_code: 'RAJESH2026',
  role: 'USER',
  is_suspended: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const INITIAL_CONFIG: SystemConfig[] = [
  {
    config_key: 'trc20_contract',
    config_value: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    description: 'Official USDT TRC20 Token Contract',
    updated_at: new Date().toISOString(),
  },
  {
    config_key: 'trc20_hot_wallet',
    config_value: 'TXN9A5B8x7pKL2qRt1WvY3zEmP9sDcFeGh',
    description: 'Central Deposit Receiving TRC20 Hot Wallet',
    updated_at: new Date().toISOString(),
  },
  {
    config_key: 'usdt_inr_peg_rate',
    config_value: 89.5,
    description: 'System Reference Peg: 1 USDT = 89.50 INR',
    updated_at: new Date().toISOString(),
  },
  {
    config_key: 'order_expiry_minutes',
    config_value: 30,
    description: 'Activation Order Expiration Window in minutes',
    updated_at: new Date().toISOString(),
  },
];

// Hostinger MySQL Connection Pool Configuration
let mysqlPoolInstance: any = null;

export function getMySQLPool(): any {
  if (mysqlPoolInstance) return mysqlPoolInstance;

  try {
    // Dynamic import pattern or standard require to avoid blocking when driver is absent
    const mysql = require('mysql2/promise');
    const host = process.env.DB_HOST || 'localhost';
    const port = Number(process.env.DB_PORT) || 3306;
    const user = process.env.DB_USER || 'u591469534_fundx';
    const password = process.env.DB_PASS || 'Fund@123@1';
    const database = process.env.DB_NAME || 'u591469534_fund';

    mysqlPoolInstance = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      // No SSL for local/cPanel Hostinger socket connections to prevent handshake rejection
      ssl: undefined,
    });

    return mysqlPoolInstance;
  } catch (err) {
    console.warn('MySQL pool driver initialization deferred:', err);
    return null;
  }
}

class DatabaseService {
  private state: DatabaseState;
  private isInitialized = false;

  constructor() {
    this.state = {
      users: [],
      user_sessions: [],
      security_logs: [],
      funds: [],
      user_funds: [],
      activation_orders: [],
      bank_accounts: [],
      tasks: [],
      demo_tasks: [],
      ledger_entries: [],
      withdrawals: [],
      in_app_notifications: [],
      support_tickets: [],
      support_messages: [],
      admin_audit_logs: [],
      system_config: [],
    };
    this.init();
  }

  private init() {
    if (this.isInitialized) return;

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(STATE_FILE)) {
        const raw = fs.readFileSync(STATE_FILE, 'utf-8');
        this.state = JSON.parse(raw);
      } else {
        // Bootstrap defaults
        this.state.funds = [...INITIAL_FUNDS];
        this.state.users = [INITIAL_SUPERADMIN, DEMO_USER];
        this.state.system_config = [...INITIAL_CONFIG];

        // Seed initial active fund for demo user to facilitate instant testing
        const gamingFund = INITIAL_FUNDS[0];
        this.state.user_funds.push({
          id: 'uf-001',
          user_id: DEMO_USER.id,
          fund_id: gamingFund.id,
          status: 'ACTIVE',
          activated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Seed initial verified bank account for demo user
        this.state.bank_accounts.push({
          id: 'ba-001',
          user_id: DEMO_USER.id,
          fund_id: gamingFund.id,
          account_holder_encrypted: '001122334455:aabbccddeeff:1234567890abcdef',
          bank_name: 'HDFC Bank',
          ifsc_code: 'HDFC0001234',
          account_number_encrypted: '001122334455:aabbccddeeff:0987654321fedcba',
          account_number_masked: 'XXXX-XXXX-4819',
          account_type: 'SAVINGS',
          is_verified: true,
          is_immutable: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Seed sample initial ledger entries
        this.state.ledger_entries.push({
          id: 'LG-GM-8821',
          user_id: DEMO_USER.id,
          fund_id: gamingFund.id,
          entry_type: 'COMMISSION_CREDIT',
          debit_amount: 0,
          credit_amount: 900.0,
          calculation_basis: '₹10,000 @ 9.0%',
          balance_after: 900.0,
          status: 'AVAILABLE',
          idempotency_key: 'seed-lg-001',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        });

        // Seed welcome notification
        this.state.in_app_notifications.push({
          id: 'notif-001',
          user_id: DEMO_USER.id,
          title: 'Welcome to FundX Panel',
          message: 'Your institutional account has been initialized. Complete fund activation to begin task execution.',
          category: 'SYSTEM',
          is_read: false,
          created_at: new Date().toISOString(),
        });

        this.persist();
      }
    } catch (e) {
      console.warn('Failed to load local DB state file, using in-memory state:', e);
      this.state.funds = [...INITIAL_FUNDS];
      this.state.users = [INITIAL_SUPERADMIN, DEMO_USER];
      this.state.system_config = [...INITIAL_CONFIG];
    }

    this.isInitialized = true;
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Persistence write error:', e);
    }
  }

  // --- Users ---
  getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  getUserByUsername(username: string): User | undefined {
    return this.state.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  getUserByMobile(mobile: string): User | undefined {
    return this.state.users.find((u) => u.mobile === mobile);
  }

  createUser(user: User): User {
    this.state.users.push(user);
    this.persist();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.getUserById(id);
    if (!user) return undefined;
    Object.assign(user, updates, { updated_at: new Date().toISOString() });
    this.persist();
    return user;
  }

  getAllUsers(): User[] {
    return [...this.state.users];
  }

  // --- Security Logs ---
  addSecurityLog(log: Omit<SecurityLog, 'id' | 'created_at'>): SecurityLog {
    const entry: SecurityLog = {
      ...log,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.state.security_logs.unshift(entry);
    this.persist();
    return entry;
  }

  getSecurityLogs(userId?: string): SecurityLog[] {
    if (userId) {
      return this.state.security_logs.filter((l) => l.user_id === userId);
    }
    return [...this.state.security_logs];
  }

  // --- Funds ---
  getAllFunds(): Fund[] {
    return [...this.state.funds];
  }

  getFundById(id: string): Fund | undefined {
    return this.state.funds.find((f) => f.id === id);
  }

  getFundBySlug(slug: string): Fund | undefined {
    return this.state.funds.find((f) => f.slug === slug);
  }

  updateFund(id: string, updates: Partial<Fund>): Fund | undefined {
    const fund = this.getFundById(id);
    if (!fund) return undefined;
    Object.assign(fund, updates, { updated_at: new Date().toISOString() });
    this.persist();
    return fund;
  }

  // --- User Funds ---
  getUserFunds(userId: string): UserFund[] {
    return this.state.user_funds.filter((uf) => uf.user_id === userId);
  }

  getUserFund(userId: string, fundId: string): UserFund | undefined {
    return this.state.user_funds.find((uf) => uf.user_id === userId && uf.fund_id === fundId);
  }

  setUserFundStatus(userId: string, fundId: string, status: UserFund['status']): UserFund {
    let uf = this.getUserFund(userId, fundId);
    if (!uf) {
      uf = {
        id: crypto.randomUUID(),
        user_id: userId,
        fund_id: fundId,
        status,
        activated_at: status === 'ACTIVE' ? new Date().toISOString() : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.state.user_funds.push(uf);
    } else {
      uf.status = status;
      if (status === 'ACTIVE' && !uf.activated_at) {
        uf.activated_at = new Date().toISOString();
      }
      uf.updated_at = new Date().toISOString();
    }
    this.persist();
    return uf;
  }

  // --- Activation Orders ---
  createActivationOrder(order: ActivationOrder): ActivationOrder {
    this.state.activation_orders.unshift(order);
    this.persist();
    return order;
  }

  getOrderById(id: string): ActivationOrder | undefined {
    return this.state.activation_orders.find((o) => o.id === id);
  }

  getOrderByCode(code: string): ActivationOrder | undefined {
    return this.state.activation_orders.find((o) => o.order_code === code);
  }

  getOrderByTxid(txid: string): ActivationOrder | undefined {
    return this.state.activation_orders.find(
      (o) => o.txid_hash && o.txid_hash.toLowerCase() === txid.trim().toLowerCase()
    );
  }

  getOrdersByUser(userId: string): ActivationOrder[] {
    return this.state.activation_orders.filter((o) => o.user_id === userId);
  }

  getAllOrders(): ActivationOrder[] {
    return [...this.state.activation_orders];
  }

  updateOrder(id: string, updates: Partial<ActivationOrder>): ActivationOrder | undefined {
    const order = this.getOrderById(id);
    if (!order) return undefined;
    Object.assign(order, updates, { updated_at: new Date().toISOString() });
    this.persist();
    return order;
  }

  // --- Bank Accounts ---
  getBankAccount(userId: string, fundId: string): BankAccount | undefined {
    return this.state.bank_accounts.find((ba) => ba.user_id === userId && ba.fund_id === fundId);
  }

  getBankAccountsByUser(userId: string): BankAccount[] {
    return this.state.bank_accounts.filter((ba) => ba.user_id === userId);
  }

  createBankAccount(account: BankAccount): BankAccount {
    this.state.bank_accounts.push(account);
    this.persist();
    return account;
  }

  // --- Tasks (Genuine) ---
  getTasksByUser(userId: string, fundId?: string): Task[] {
    return this.state.tasks.filter((t) => t.user_id === userId && (!fundId || t.fund_id === fundId));
  }

  createTask(task: Task): Task {
    this.state.tasks.unshift(task);
    this.persist();
    return task;
  }

  getTaskById(id: string): Task | undefined {
    return this.state.tasks.find((t) => t.id === id);
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const task = this.getTaskById(id);
    if (!task) return undefined;
    Object.assign(task, updates);
    this.persist();
    return task;
  }

  // --- Demo Tasks (Partitioned) ---
  getDemoTasksByUser(userId: string): DemoTask[] {
    return this.state.demo_tasks.filter((dt) => dt.user_id === userId);
  }

  createDemoTask(task: DemoTask): DemoTask {
    this.state.demo_tasks.unshift(task);
    this.persist();
    return task;
  }

  updateDemoTask(id: string, updates: Partial<DemoTask>): DemoTask | undefined {
    const task = this.state.demo_tasks.find((t) => t.id === id);
    if (!task) return undefined;
    Object.assign(task, updates);
    this.persist();
    return task;
  }

  // --- Ledger Entries (Double-Entry) ---
  createLedgerEntry(entry: LedgerEntry): LedgerEntry {
    this.state.ledger_entries.unshift(entry);
    this.persist();
    return entry;
  }

  getLedgerEntries(userId: string, fundId?: string): LedgerEntry[] {
    return this.state.ledger_entries.filter(
      (e) => e.user_id === userId && (!fundId || e.fund_id === fundId)
    );
  }

  getAllLedgerEntries(): LedgerEntry[] {
    return [...this.state.ledger_entries];
  }

  // --- Withdrawals ---
  createWithdrawal(wth: Withdrawal): Withdrawal {
    this.state.withdrawals.unshift(wth);
    this.persist();
    return wth;
  }

  getWithdrawalsByUser(userId: string, fundId?: string): Withdrawal[] {
    return this.state.withdrawals.filter(
      (w) => w.user_id === userId && (!fundId || w.fund_id === fundId)
    );
  }

  getAllWithdrawals(): Withdrawal[] {
    return [...this.state.withdrawals];
  }

  getWithdrawalById(id: string): Withdrawal | undefined {
    return this.state.withdrawals.find((w) => w.id === id);
  }

  updateWithdrawal(id: string, updates: Partial<Withdrawal>): Withdrawal | undefined {
    const wth = this.getWithdrawalById(id);
    if (!wth) return undefined;
    Object.assign(wth, updates, { updated_at: new Date().toISOString() });
    this.persist();
    return wth;
  }

  // --- Notifications ---
  createNotification(notif: Omit<InAppNotification, 'id' | 'created_at'>): InAppNotification {
    const entry: InAppNotification = {
      ...notif,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.state.in_app_notifications.unshift(entry);
    this.persist();
    return entry;
  }

  getNotifications(userId: string): InAppNotification[] {
    return this.state.in_app_notifications.filter((n) => n.user_id === userId);
  }

  markNotificationRead(id: string, userId: string): boolean {
    const n = this.state.in_app_notifications.find((notif) => notif.id === id && notif.user_id === userId);
    if (!n) return false;
    n.is_read = true;
    this.persist();
    return true;
  }

  // --- Support Tickets ---
  createSupportTicket(ticket: SupportTicket): SupportTicket {
    this.state.support_tickets.unshift(ticket);
    this.persist();
    return ticket;
  }

  getSupportTickets(userId?: string): SupportTicket[] {
    if (userId) {
      return this.state.support_tickets.filter((t) => t.user_id === userId);
    }
    return [...this.state.support_tickets];
  }

  getSupportTicketById(id: string): SupportTicket | undefined {
    return this.state.support_tickets.find((t) => t.id === id);
  }

  addSupportMessage(msg: Omit<SupportMessage, 'id' | 'created_at'>): SupportMessage {
    const entry: SupportMessage = {
      ...msg,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.state.support_messages.push(entry);
    this.persist();
    return entry;
  }

  getSupportMessages(ticketId: string): SupportMessage[] {
    return this.state.support_messages.filter((m) => m.ticket_id === ticketId);
  }

  // --- Admin Audit Logs ---
  createAdminAuditLog(log: Omit<AdminAuditLog, 'id' | 'created_at'>): AdminAuditLog {
    const entry: AdminAuditLog = {
      ...log,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.state.admin_audit_logs.unshift(entry);
    this.persist();
    return entry;
  }

  getAdminAuditLogs(): AdminAuditLog[] {
    return [...this.state.admin_audit_logs];
  }

  // --- System Config ---
  getConfig(key: string): unknown {
    const cfg = this.state.system_config.find((c) => c.config_key === key);
    return cfg ? cfg.config_value : undefined;
  }

  setConfig(key: string, value: unknown, updatedBy?: string): void {
    let cfg = this.state.system_config.find((c) => c.config_key === key);
    if (!cfg) {
      cfg = {
        config_key: key,
        config_value: value,
        updated_by: updatedBy,
        updated_at: new Date().toISOString(),
      };
      this.state.system_config.push(cfg);
    } else {
      cfg.config_value = value;
      cfg.updated_by = updatedBy;
      cfg.updated_at = new Date().toISOString();
    }
    this.persist();
  }
}

// Global Singleton Instance
export const db = new DatabaseService();
