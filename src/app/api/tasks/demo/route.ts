import { NextRequest, NextResponse } from 'next/server';
import { extractAuthToken, verifyAccessToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateDemoTask, completeDemoTask } from '@/lib/tasks';

export async function GET(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    let userId = 'demo-preview-user';
    if (token) {
      const payload = verifyAccessToken(token);
      if (payload) userId = payload.userId;
    }

    const demoTasks = db.getDemoTasksByUser(userId);
    return NextResponse.json({ demoTasks });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch demo tasks';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    let userId = 'demo-preview-user';
    if (token) {
      const payload = verifyAccessToken(token);
      if (payload) userId = payload.userId;
    }

    const body = await req.json();
    const { action, fundId, taskId } = body;

    if (action === 'GENERATE') {
      const allFunds = db.getAllFunds();
      const targetFundId = fundId || allFunds[0]?.id || 'fnd-gaming-001';
      const task = generateDemoTask(userId, targetFundId);
      return NextResponse.json({
        success: true,
        task,
        notice: 'DEMO MODE: This simulated task has zero financial ledger impact and is used for training only.',
      });
    }

    if (action === 'COMPLETE') {
      if (!taskId) {
        return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
      }
      const task = completeDemoTask(taskId, userId);
      return NextResponse.json({
        success: true,
        message: 'Demo task completed! Notice: Simulated training task does NOT accrue real balance.',
        task,
        watermark: 'DEMO',
      });
    }

    return NextResponse.json({ error: 'Invalid action. Supported: GENERATE, COMPLETE' }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Demo task error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
