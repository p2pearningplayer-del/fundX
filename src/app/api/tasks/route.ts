import { NextRequest, NextResponse } from 'next/server';
import { extractAuthToken, verifyAccessToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateGenuineTask, completeGenuineTask } from '@/lib/tasks';

export async function GET(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const fundId = searchParams.get('fundId') || undefined;

    const tasks = db.getTasksByUser(payload.userId, fundId);
    return NextResponse.json({ tasks });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch tasks';
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
    const { action, fundId, taskId, quantum } = body;

    // Action 1: Generate new genuine task
    if (action === 'GENERATE') {
      if (!fundId) {
        return NextResponse.json({ error: 'Fund ID is required to generate a task.' }, { status: 400 });
      }

      // Check Fund active gate
      const userFund = db.getUserFund(payload.userId, fundId);
      if (!userFund || userFund.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Activation Required: Fund must be ACTIVE before real transaction tasks can be allocated.' },
          { status: 403 }
        );
      }

      // Check Bank bound gate
      const bank = db.getBankAccount(payload.userId, fundId);
      if (!bank) {
        return NextResponse.json(
          { error: 'Bank Binding Required: Please bind a verified bank account before allocating transaction tasks.' },
          { status: 403 }
        );
      }

      const task = generateGenuineTask(payload.userId, fundId, quantum);
      return NextResponse.json({ success: true, task });
    }

    // Action 2: Complete task & disburse commission
    if (action === 'COMPLETE') {
      if (!taskId) {
        return NextResponse.json({ error: 'Task ID is required for completion.' }, { status: 400 });
      }

      const result = completeGenuineTask(taskId, payload.userId);
      return NextResponse.json({
        success: true,
        message: `Task completed! Withdrawable commission of ₹${result.commissionEarned.toLocaleString('en-IN')} disbursed to your ledger.`,
        task: result.task,
        commissionEarned: result.commissionEarned,
      });
    }

    return NextResponse.json({ error: 'Invalid action. Supported actions: GENERATE, COMPLETE' }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Task operation failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
