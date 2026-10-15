import { NextRequest, NextResponse } from 'next/server';
import { extractAuthToken, verifyAccessToken } from '@/lib/auth';
import { verifyBlockchainTransaction } from '@/lib/trc20';

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
    const { orderId, txid } = body;

    if (!orderId || !txid) {
      return NextResponse.json(
        { error: 'Order ID and Blockchain TXID hash are required.' },
        { status: 400 }
      );
    }

    const result = await verifyBlockchainTransaction(orderId, txid);

    if (!result.isValid) {
      return NextResponse.json({ error: result.message }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      txHash: result.txHash,
      contractVerified: result.contractVerified,
      amountVerified: result.amountVerified,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Transaction verification failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
