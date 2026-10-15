'use client';

import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, ShieldCheck, ArrowRight, Zap, ArrowDownToLine } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-800 text-brand-300 text-xs font-mono mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>PRD INVENTORY SCREEN 17</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">In-App Notifications</h1>
          <p className="text-xs text-slate-400">
            Real-time auditable notifications on fund lifecycle, ledger updates, and payout settlements.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs font-mono">
            No system notifications currently pending.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                n.is_read
                  ? 'bg-slate-900/60 border-slate-800 opacity-70'
                  : 'bg-slate-900 border-brand-500/40 shadow-md'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                      n.category === 'ACTIVATION'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : n.category === 'COMMISSION'
                        ? 'bg-blue-950 text-blue-400 border-blue-800'
                        : n.category === 'WITHDRAWAL'
                        ? 'bg-purple-950 text-purple-400 border-purple-800'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {n.category}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                  )}
                </div>

                <h4 className="text-sm font-bold text-white">{n.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                {n.action_url && (
                  <a
                    href={n.action_url}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium flex items-center space-x-1"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="px-3 py-1.5 rounded-lg bg-brand-600/20 text-brand-300 hover:bg-brand-600 hover:text-white text-xs font-medium transition"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
