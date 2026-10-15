'use client';

import React, { useEffect, useState } from 'react';
import { Terminal, Layers, ArrowDownToLine, Clock, ShieldCheck, Filter } from 'lucide-react';

export default function TaskLedgerHistoryPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [funds, setFunds] = useState<any[]>([]);
  const [filterFundId, setFilterFundId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [fRes, lRes] = await Promise.all([
        fetch('/api/funds'),
        fetch(`/api/ledger${filterFundId !== 'all' ? `?fundId=${filterFundId}` : ''}`),
      ]);

      if (fRes.ok) {
        const fData = await fRes.json();
        setFunds(fData.funds || []);
      }
      if (lRes.ok) {
        const lData = await lRes.json();
        setEntries(lData.ledgerEntries || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterFundId]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-800 text-brand-300 text-xs font-mono mb-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>PRD SECTION 8 • IMMUTABLE TASK LEDGER</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Task Ledger History</h1>
          <p className="text-xs text-slate-400">
            Commissions accrue through a deterministic calculation engine based on verified task values.
          </p>
        </div>

        {/* Filter by Fund */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={filterFundId}
            onChange={(e) => setFilterFundId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
          >
            <option value="all">All Fund Portfolios</option>
            {funds.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.baseRateDisplay})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Table (Matching PRD Section 8 Specs) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Ledger ID</th>
                <th className="p-4">Fund Category</th>
                <th className="p-4">Calculation Basis</th>
                <th className="p-4">Credit (INR)</th>
                <th className="p-4">Debit (INR)</th>
                <th className="p-4">Balance After</th>
                <th className="p-4">Ledger Status</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                    No ledger records match the selected filter.
                  </td>
                </tr>
              ) : (
                entries.map((e) => {
                  const fund = funds.find((f) => f.id === e.fund_id);
                  return (
                    <tr key={e.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 text-white font-bold">{e.id}</td>
                      <td className="p-4 text-brand-400">{fund?.name || 'Isolated Fund'}</td>
                      <td className="p-4 text-slate-300">{e.calculation_basis}</td>
                      <td className="p-4 text-emerald-400 font-semibold">
                        {e.credit_amount > 0 ? `+₹${e.credit_amount.toFixed(2)}` : '—'}
                      </td>
                      <td className="p-4 text-red-400 font-semibold">
                        {e.debit_amount > 0 ? `-₹${e.debit_amount.toFixed(2)}` : '—'}
                      </td>
                      <td className="p-4 text-white font-bold">
                        ₹{e.balance_after ? e.balance_after.toFixed(2) : '0.00'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            e.status === 'AVAILABLE'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : e.status === 'PENDING_REVIEW'
                              ? 'bg-amber-950 text-amber-400 border-amber-800'
                              : e.status === 'RESERVED'
                              ? 'bg-purple-950 text-purple-400 border-purple-800'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 text-[11px]">
                        {new Date(e.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
