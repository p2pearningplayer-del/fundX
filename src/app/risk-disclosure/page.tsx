'use client';

import React from 'react';
import { AlertTriangle, ShieldAlert, Cpu, Landmark } from 'lucide-react';

export default function RiskDisclosurePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-mono">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>PRD INVENTORY SCREEN 22 • COMPLIANCE DISCLOSURE</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Financial & System Risk Disclosure</h1>
        <p className="text-xs text-slate-400">Institutional Notice Concerning Crypto-Fiat Operations & Task Settlement</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-xs text-slate-300 leading-relaxed font-sans shadow-xl">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-amber-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>1. Blockchain Transfer Finality & Irreversibility</span>
          </h2>
          <p>
            USDT transfers executed on the TRON (TRC20) blockchain are cryptographically irreversible once confirmed by network nodes.
            Users are strictly responsible for confirming the receiving wallet address and the exact USDT amount specified in the
            activation order. Funds transmitted to incorrect smart contracts or non-TRC20 networks cannot be recovered.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-amber-400 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            <span>2. Task Quantum & Dynamic Rate Mechanics</span>
          </h2>
          <p>
            Transaction tasks are dynamically generated based on active market liquidity requirements. While base rates
            (Gaming: 9.0%, Stock: 18.0%, Mix: 24.0%) are deterministically applied according to PRD Section 8 formulas,
            task availability and quantum sizes (₹1,000 – ₹30,000) are governed by real-time clearing demand.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-amber-400 flex items-center gap-2">
            <Landmark className="w-4 h-4" />
            <span>3. Banking Settlement Window & Gateway Protocols</span>
          </h2>
          <p>
            Domestic fiat payouts are disbursed through standard banking switches and RBI settlement windows. While balance reservation
            is immediate, final disbursement depends on beneficiary bank IFSC validation and inter-bank network operating hours.
          </p>
        </section>
      </div>
    </div>
  );
}
