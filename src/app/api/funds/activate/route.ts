import { NextRequest, NextResponse } from 'next/server';
import { extractAuthToken, verifyAccessToken } from '@/lib/auth';
import { createActivationOrderForFund } from '@/lib/trc20';

export async function POST(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    const body = await req.json();
    const { fundId } = body;

    if (!fundId) {
      return NextResponse.json({ error: 'Fund ID is required.' }, { status: 400 });
    }

    const { order, qrDataUrl } = await createActivationOrderForFund(payload.userId, fundId);

    return NextResponse.json({
      success: true,
      message: 'USDT TRC20 deposit order generated. Complete payment within 30 minutes.',
      order,
      qrDataUrl,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Order creation failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
