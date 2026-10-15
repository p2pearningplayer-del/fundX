import { NextRequest, NextResponse } from 'next/server';
import { extractAuthToken, verifyAccessToken, getClientIP } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateAuditSignature } from '@/lib/crypto';

export async function GET(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'FINANCE' && payload.role !== 'AUDITOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const orders = db.getAllOrders();
    const enriched = orders.map((o) => {
      const user = db.getUserById(o.user_id);
      const fund = db.getFundById(o.fund_id);
      return {
        ...o,
        username: user?.username,
        userLegalName: user?.legal_name,
        fundName: fund?.name,
      };
    });

    return NextResponse.json({ orders: enriched });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Fetch queue failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload || (payload.role !== 'SUPERADMIN' && payload.role !== 'FINANCE')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { orderId, decision, rejectionReason } = body; // decision: 'APPROVE' | 'REJECT'

    if (!orderId || !decision) {
      return NextResponse.json({ error: 'Order ID and Decision required' }, { status: 400 });
    }

    const order = db.getOrderById(orderId);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const ip = getClientIP(req);
    const now = new Date().toISOString();

    if (decision === 'APPROVE') {
      db.updateOrder(order.id, {
        status: 'ACTIVE',
        verified_at: now,
        verified_by: `ADMIN_${payload.username}`,
      });

      // Lift gate on fund
      db.setUserFundStatus(order.user_id, order.fund_id, 'ACTIVE');

      db.createNotification({
        user_id: order.user_id,
        title: 'Fund Activated by Administration',
        message: `Order ${order.order_code} has been approved. The activation gate is lifted.`,
        category: 'ACTIVATION',
        is_read: false,
        action_url: '/tasks',
      });

      const signature = generateAuditSignature(payload.userId, 'ADMIN_APPROVE_TRC20_ORDER', { orderId }, now);
      db.createAdminAuditLog({
        admin_id: payload.userId,
        admin_username: payload.username,
        action: 'ADMIN_APPROVE_TRC20_ORDER',
        target_type: 'ACTIVATION_ORDER',
        target_id: order.id,
        payload: { orderCode: order.order_code, txid: order.txid_hash },
        ip_address: ip,
        signature,
      });

      return NextResponse.json({ success: true, message: 'Order approved and fund gate lifted.' });
    }

    if (decision === 'REJECT') {
      db.updateOrder(order.id, {
        status: 'REJECTED',
        rejection_reason: rejectionReason || 'Failed blockchain verification',
        verified_at: now,
        verified_by: `ADMIN_${payload.username}`,
      });

      db.createNotification({
        user_id: order.user_id,
        title: 'Activation Order Rejected',
        message: `Deposit order ${order.order_code} was rejected: ${rejectionReason || 'TXID unconfirmed or mismatched value.'}`,
        category: 'ACTIVATION',
        is_read: false,
        action_url: '/activation',
      });

      const signature = generateAuditSignature(payload.userId, 'ADMIN_REJECT_TRC20_ORDER', { orderId, rejectionReason }, now);
      db.createAdminAuditLog({
        admin_id: payload.userId,
        admin_username: payload.username,
        action: 'ADMIN_REJECT_TRC20_ORDER',
        target_type: 'ACTIVATION_ORDER',
        target_id: order.id,
        payload: { orderCode: order.order_code, rejectionReason },
        ip_address: ip,
        signature,
      });

      return NextResponse.json({ success: true, message: 'Order rejected.' });
    }

    return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Queue action failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
