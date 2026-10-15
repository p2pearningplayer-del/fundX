import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { extractAuthToken, verifyAccessToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { SupportTicket } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const tickets = db.getSupportTickets(payload.userId);
    const enriched = tickets.map((t) => {
      const messages = db.getSupportMessages(t.id);
      return {
        ...t,
        messages,
      };
    });

    return NextResponse.json({ tickets: enriched });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch tickets';
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
    const { action, subject, category, priority, message, ticketId } = body;

    if (action === 'CREATE_TICKET') {
      if (!subject || !message) {
        return NextResponse.json({ error: 'Subject and initial message are required.' }, { status: 400 });
      }

      const ticketCode = `TCK-${Math.floor(10000 + Math.random() * 90000)}`;
      const newTicket: SupportTicket = {
        id: crypto.randomUUID(),
        ticket_code: ticketCode,
        user_id: payload.userId,
        subject: subject.trim(),
        category: category || 'General Inquiry',
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.createSupportTicket(newTicket);

      db.addSupportMessage({
        ticket_id: newTicket.id,
        sender_type: 'USER',
        sender_id: payload.userId,
        message: message.trim(),
      });

      // Auto reply from institutional support desk bot
      db.addSupportMessage({
        ticket_id: newTicket.id,
        sender_type: 'AGENT',
        message: `Ticket ${ticketCode} received by FundX Operations Desk. An on-duty compliance officer has been assigned. Typical response SLA is within 15 minutes.`,
      });

      return NextResponse.json({ success: true, ticket: newTicket });
    }

    if (action === 'SEND_MESSAGE') {
      if (!ticketId || !message) {
        return NextResponse.json({ error: 'Ticket ID and message are required.' }, { status: 400 });
      }

      const ticket = db.getSupportTicketById(ticketId);
      if (!ticket || ticket.user_id !== payload.userId) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }

      const msg = db.addSupportMessage({
        ticket_id: ticketId,
        sender_type: 'USER',
        sender_id: payload.userId,
        message: message.trim(),
      });

      return NextResponse.json({ success: true, message: msg });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Support request failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
