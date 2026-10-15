'use client';

import React, { useEffect, useState } from 'react';
import { History, CheckCircle2, Clock, AlertCircle, ExternalLink, QrCode } from 'lucide-react';

export default function ActivationHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/funds')
      .then(() => {
        // Query user's own orders or all orders
        return fetch('/api/admin/txid-queue');
      })
      .then((res) => {
        if (res.ok) return res.json();
        return { orders: [] };
      })
      .then((data) => {
        setOrders(data.orders || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-800 text-brand-300 text-xs font-mono mb-2">
            <History className="w-3.5 h-3.5" />
            <span>PRD INVENTORY SCREEN 9</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Activation History</h1>
          <p className="text-xs text-slate-400">
            Immutable log of USDT TRC20 deposit orders, blockchain hashes, and verification timestamps.
          </p>
        </div>

        <a
          href="/activation/gateway"
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-glow-blue flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4" />
          <span>New Deposit Order</span>
        </a>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Order Code</th>
                <th className="p-4">Fund Tier</th>
                <th className="p-4">Quantum (USDT / INR)</th>
                <th className="p-4">TXID Hash</th>
                <th className="p-4">Status</th>
                <th className="p-4">Verified At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                    No activation orders recorded yet. Initiate an order from the USDT Gateway.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 text-white font-semibold">{o.order_code}</td>
                    <td className="p-4 text-brand-400">{o.fundName || 'Tier Liquidity'}</td>
                    <td className="p-4">
                      <span className="text-white font-bold">{o.usdt_amount} USDT</span>
                      <span className="text-slate-500 block text-[10px]">
                        ≈ ₹{o.fiat_equivalent_inr?.toLocaleString('en-IN')} INR
                      </span>
                    </td>
                    <td className="p-4">
                      {o.txid_hash ? (
                        <span className="text-emerald-400 truncate max-w-[150px] inline-block" title={o.txid_hash}>
                          {o.txid_hash.substring(0, 14)}...
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Unsubmitted</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          o.status === 'ACTIVE'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : o.status === 'REJECTED' || o.status === 'EXPIRED'
                            ? 'bg-red-950 text-red-400 border-red-800'
                            : 'bg-amber-950 text-amber-400 border-amber-800'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-[11px]">
                      {o.verified_at ? new Date(o.verified_at).toLocaleString() : 'Pending Scan'}
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
