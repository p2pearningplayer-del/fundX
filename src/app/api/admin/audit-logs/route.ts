import { NextRequest, NextResponse } from 'next/server';
import { extractAuthToken, verifyAccessToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'AUDITOR')) {
      return NextResponse.json({ error: 'Forbidden: Auditor or Superadmin role required' }, { status: 403 });
    }

    const logs = db.getAdminAuditLogs();
    return NextResponse.json({ auditLogs: logs });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Audit log fetch failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
