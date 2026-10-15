'use client';

import React, { useEffect, useState } from 'react';
import {
  LifeBuoy,
  MessageSquare,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  User,
  Bot,
} from 'lucide-react';

export default function SupportDeskPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // New ticket state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Activation Inquiries');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [initialMessage, setInitialMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/support');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        if (data.tickets?.length > 0 && !selectedTicket) {
          setSelectedTicket(data.tickets[0]);
        } else if (selectedTicket) {
          const updated = data.tickets.find((t: any) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_TICKET',
          subject,
          category,
          priority,
          message: initialMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit ticket');

      setShowCreateModal(false);
      setSubject('');
      setInitialMessage('');
      fetchTickets();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ticket submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SEND_MESSAGE',
          ticketId: selectedTicket.id,
          message: newMessage.trim(),
        }),
      });

      if (res.ok) {
        setNewMessage('');
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-800 text-brand-300 text-xs font-mono mb-2">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>PRD INVENTORY SCREEN 23 • 24/7 SUPPORT DESK</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Institutional Support Desk</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Direct operational access to compliance desk and settlement reconciliation specialists.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-glow-blue flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* Ticket Interface (Split Layout) */}
      <div className="grid md:grid-cols-3 gap-6 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-h-[550px] shadow-2xl">
        {/* Left Column: Tickets List */}
        <div className="border-r border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">Tickets Queue</span>
            <span className="text-[11px] font-mono text-slate-500">{tickets.length} Opened</span>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto">
            {tickets.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center font-mono">No active tickets.</p>
            ) : (
              tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`w-full text-left p-3 rounded-xl border transition flex flex-col justify-between space-y-2 ${
                    selectedTicket?.id === t.id
                      ? 'bg-brand-950/40 border-brand-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-brand-400">{t.ticket_code}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded border ${
                        t.priority === 'CRITICAL'
                          ? 'bg-red-950 text-red-400 border-red-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold truncate text-slate-200">{t.subject}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{t.category}</span>
                    <span>{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Ticket Conversation Thread */}
        <div className="md:col-span-2 flex flex-col justify-between p-6">
          {selectedTicket ? (
            <>
              {/* Ticket Top Meta */}
              <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">{selectedTicket.subject}</h3>
                    <span className="text-[10px] font-mono uppercase bg-brand-950 text-brand-400 border border-brand-800 px-2 py-0.5 rounded font-bold">
                      {selectedTicket.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    ID: {selectedTicket.ticket_code} • Category: {selectedTicket.category}
                  </p>
                </div>
              </div>

              {/* Message History */}
              <div className="py-4 space-y-3 flex-1 overflow-y-auto max-h-[380px]">
                {selectedTicket.messages?.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-2.5 ${
                      msg.sender_type === 'USER' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender_type !== 'USER' && (
                      <div className="w-7 h-7 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-brand-500/30">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`p-3 rounded-xl max-w-md text-xs leading-relaxed ${
                        msg.sender_type === 'USER'
                          ? 'bg-brand-600 text-white rounded-tr-none'
                          : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <p>{msg.message}</p>
                      <span
                        className={`text-[9px] font-mono mt-1 block ${
                          msg.sender_type === 'USER' ? 'text-brand-200' : 'text-slate-500'
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </span>
                    </div>

                    {msg.sender_type === 'USER' && (
                      <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Message Reply Box */}
              <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-800 flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type message to desk operations..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs font-mono">
              <LifeBuoy className="w-8 h-8 mb-2 text-slate-600" />
              <span>Select or create a support ticket to begin.</span>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Support Ticket</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of inquiry"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="Activation Inquiries">Activation & TRC20</option>
                    <option value="Task Discrepancies">Task & Commission</option>
                    <option value="Payout & UTR Settlement">Payout & UTR Settlement</option>
                    <option value="Banking & PII Updates">Banking & PII Security</option>
                    <option value="General Inquiry">General Inquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical (SLA 5m)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Message Description</label>
                <textarea
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  placeholder="Provide detailed description or order/transaction reference codes..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-glow-blue"
                >
                  {submitting ? 'Submitting Ticket...' : 'Open Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
