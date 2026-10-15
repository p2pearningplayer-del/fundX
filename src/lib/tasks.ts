// ==============================================================================
// FundX Panel — Dual Task Engine (Genuine Tasks vs Simulated DEMO Tasks)
// PRD Section 7: Task Engine & Dual Architecture
// ==============================================================================

import crypto from 'crypto';
import { db } from './db';
import { Task, DemoTask } from './types';
import { creditTaskCommission } from './ledger';

const TASK_CATEGORIES = [
  'Gaming Network Node Liquidity Allocation',
  'P2P High-Frequency Order Settlement',
  'Inter-Exchange Arbitrage Clearing Verification',
  'Automated Market Maker Liquidity Routing',
  'Cross-Network Decentralized Trade Matching',
];

/**
 * Generates an idempotent Genuine Transaction Task
 * Blocked if fund is NOT ACTIVE.
 */
export function generateGenuineTask(
  userId: string,
  fundId: string,
  quantumOverride?: number
): Task {
  const fund = db.getFundById(fundId);
  if (!fund) throw new Error('Fund not found');

  // Verify fund status is ACTIVE
  const userFund = db.getUserFund(userId, fundId);
  if (!userFund || userFund.status !== 'ACTIVE') {
    throw new Error('Fund must be ACTIVE before genuine tasks can be generated');
  }

  // Verify bank account is bound
  const bankAccount = db.getBankAccount(userId, fundId);
  if (!bankAccount) {
    throw new Error('Bank account binding required before genuine tasks can be generated');
  }

  // Calculate task quantum within fund min/max (e.g. ₹1,000 - ₹30,000)
  let quantum = quantumOverride;
  if (!quantum || quantum < fund.min_task_amount || quantum > fund.max_task_amount) {
    // Generate stepped quantum (multiples of 500)
    const steps = Math.floor((fund.max_task_amount - fund.min_task_amount) / 500);
    quantum = fund.min_task_amount + Math.floor(Math.random() * (steps + 1)) * 500;
  }

  const rate = fund.base_rate;
  const commission = parseFloat((quantum * rate).toFixed(2));
  const taskCode = `TSK-GEN-${Math.floor(10000 + Math.random() * 90000)}`;
  const idempotencyKey = `idemp-${userId}-${fundId}-${Date.now()}-${Math.random()}`;

  const categoryTitle = TASK_CATEGORIES[Math.floor(Math.random() * TASK_CATEGORIES.length)];

  const task: Task = {
    id: crypto.randomUUID(),
    task_code: taskCode,
    user_id: userId,
    fund_id: fundId,
    quantum_amount: quantum,
    configured_rate: rate,
    commission_amount: commission,
    status: 'AVAILABLE',
    idempotency_key: idempotencyKey,
    title: `${fund.name} — ${categoryTitle}`,
    description: `Verify and route clearing order of ₹${quantum.toLocaleString('en-IN')} through the institutional switch. Yields ${(rate * 100).toFixed(1)}% base commission.`,
    created_at: new Date().toISOString(),
  };

  db.createTask(task);
  return task;
}

/**
 * Completes a genuine transaction task and triggers double-entry commission disbursement
 */
export function completeGenuineTask(taskId: string, userId: string): { task: Task; commissionEarned: number } {
  const task = db.getTaskById(taskId);
  if (!task || task.user_id !== userId) {
    throw new Error('Task not found or access unauthorized');
  }

  if (task.status === 'COMPLETED') {
    throw new Error('Task has already been completed');
  }

  // 1. Mark task completed
  const updatedTask = db.updateTask(task.id, {
    status: 'COMPLETED',
    completed_at: new Date().toISOString(),
  })!;

  // 2. Disburse commission to immutable ledger
  creditTaskCommission(
    userId,
    task.fund_id,
    task.id,
    task.quantum_amount,
    task.configured_rate,
    `cm-disburse-${task.id}`
  );

  return { task: updatedTask, commissionEarned: task.commission_amount };
}

/**
 * Generates a Simulated (DEMO) Task
 * Partitioned in demo_tasks table with visual DEMO watermark and strictly ZERO balance impact
 */
export function generateDemoTask(userId: string, fundId: string): DemoTask {
  const fund = db.getFundById(fundId) || {
    id: fundId,
    name: 'Training Demo Fund',
    base_rate: 0.18,
    min_task_amount: 1000,
    max_task_amount: 30000,
  };

  const quantum = 5000;
  const rate = fund.base_rate;
  const commission = parseFloat((quantum * rate).toFixed(2));
  const taskCode = `TSK-DMO-${Math.floor(10000 + Math.random() * 90000)}`;

  const demoTask: DemoTask = {
    id: crypto.randomUUID(),
    task_code: taskCode,
    user_id: userId,
    fund_id: fund.id,
    quantum_amount: quantum,
    configured_rate: rate,
    commission_amount: commission,
    status: 'AVAILABLE',
    is_demo: true,
    watermark_label: 'DEMO',
    title: `[DEMO SIMULATION] ${fund.name} Clearing Run`,
    created_at: new Date().toISOString(),
  };

  db.createDemoTask(demoTask);
  return demoTask;
}

/**
 * Completes a simulated DEMO task
 * Explicitly records completion in partitioned table but has ZERO ledger or balance impact!
 */
export function completeDemoTask(taskId: string, userId: string): DemoTask {
  const task = db.updateDemoTask(taskId, {
    status: 'COMPLETED',
    completed_at: new Date().toISOString(),
  });

  if (!task || task.user_id !== userId) {
    throw new Error('Demo task not found');
  }

  return task;
}
