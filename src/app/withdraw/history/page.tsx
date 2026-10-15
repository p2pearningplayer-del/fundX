'use client';

import React, { useEffect, useState } from 'react';
import { History, CheckCircle2, Clock, RotateCcw, AlertCircle, ArrowDownToLine } from 'lucide-react';

export default function WithdrawalLogPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/withdrawals')
      .then((res) => res.json())
      .then((data) => setWithdrawals(data.withdrawals || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-800 text-brand-300 text-xs font-mono mb-2">
            <History className="w-3.5 h-3.5" />
            <span>PRD SECTION 9 • WITHDRAWAL LOG</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Withdrawal Settlement Log</h1>
          <p className="text-xs text-slate-400">
            Real-time tracking of reserved payouts, UTR disbursements, and compensating rollbacks.
          </p>
        </div>

        <a
          href="/withdraw"
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-glow-blue flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span>New Payout Request</span>
        </a>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Withdrawal Code</th>
                <th className="p-4">Source Fund</th>
                <th className="p-4">Destination Account</th>
                <th className="p-4">Quantum</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payout UTR / Incident Note</th>
                <th className="p-4">Requested At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-sans">
                    No withdrawal requests initiated yet.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 text-white font-bold">{w.withdrawal_code}</td>
                    <td className="p-4 text-brand-400">{w.fundName}</td>
                    <td className="p-4">
                      <span className="text-white block">{w.bankName}</span>
                      <span className="text-slate-500 text-[10px]">{w.accountNumberMasked}</span>
                    </td>
                    <td className="p-4 text-emerald-400 font-bold">
                      ₹{w.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          w.status === 'PAID'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : w.status === 'RESERVED'
                            ? 'bg-purple-950 text-purple-400 border-purple-800'
                            : w.status === 'ROLLED_BACK'
                            ? 'bg-amber-950 text-amber-400 border-amber-800'
                            : 'bg-red-950 text-red-400 border-red-800'
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {w.payout_utr_hash ? (
                        <span className="text-emerald-400 truncate max-w-[140px] block" title={w.payout_utr_hash}>
                          UTR: {w.payout_utr_hash}
                        </span>
                      ) : w.incident_note ? (
                        <span className="text-amber-400 text-[11px] block">{w.incident_note}</span>
                      ) : (
                        <span className="text-slate-500 italic">Processing in Switch</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 text-[11px]">
                      {new Date(w.requested_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
