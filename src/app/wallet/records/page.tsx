'use client';

import React, { useEffect, useState } from 'react';
import { ListOrdered, CheckCircle2, ArrowRight, Layers } from 'lucide-react';

export default function CommissionRecordsPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ledger')
      .then((res) => res.json())
      .then((data) => {
        const credits = (data.ledgerEntries || []).filter((e: any) => e.entry_type === 'COMMISSION_CREDIT');
        setEntries(credits);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-800 text-brand-300 text-xs font-mono mb-2">
            <ListOrdered className="w-3.5 h-3.5" />
            <span>PRD INVENTORY SCREEN 14 • COMMISSION AUDIT</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Commission Records</h1>
          <p className="text-xs text-slate-400">
            Immutable log of task commission credits committed to the double-entry financial ledger.
          </p>
        </div>

        <a
          href="/wallet"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition"
        >
          Back to Wallet
        </a>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Ledger ID</th>
                <th className="p-4">Calculation Basis</th>
                <th className="p-4">Credited Amount</th>
                <th className="p-4">Balance After</th>
                <th className="p-4">Ledger Status</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                    No commission credits recorded yet. Complete genuine tasks to accrue commissions.
                  </td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 text-white font-bold">{e.id}</td>
                    <td className="p-4 text-brand-400 font-semibold">{e.calculation_basis}</td>
                    <td className="p-4 text-emerald-400 font-bold">+₹{e.credit_amount.toFixed(2)}</td>
                    <td className="p-4 text-white font-semibold">₹{e.balance_after.toFixed(2)}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {e.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-[11px]">
                      {new Date(e.created_at).toLocaleString()}
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
