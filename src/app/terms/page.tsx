'use client';

import React from 'react';
import { FileText, ShieldCheck, Scale, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-800 text-brand-300 text-xs font-mono">
          <Scale className="w-3.5 h-3.5" />
          <span>PRD INVENTORY SCREEN 20 • INSTITUTIONAL GOVERNANCE</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Terms of Service</h1>
        <p className="text-xs text-slate-400">Version 1.0 (Stable Baseline) • Effective Date: October 2026</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-xs text-slate-300 leading-relaxed font-sans shadow-xl">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-brand-400">
            1. Fund-Orchestration & Activation Protocols
          </h2>
          <p>
            FundX Panel operates as an institutional fund-orchestration engine. Activation of fund categories
            (Gaming Fund 9%, Stock Fund 18%, Mix Fund 24%) requires explicit confirmation of USDT TRC20 deposits
            against token contract <code className="bg-slate-950 px-1 py-0.5 rounded text-white font-mono">TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t</code>.
            Activation orders are subject to a strict 30-minute expiration timer. Replay vectors or re-used transaction hashes
            trigger immediate rejection and security flagging.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-brand-400">
            2. Double-Entry Financial Ledgering & Segregation
          </h2>
          <p>
            All commissions and balances are governed by an ACID-compliant double-entry ledger. Balances are derived
            dynamically from unspent ledger credits. Fund accounts are isolated; balances, fund states, and withdrawal
            pipelines in one category cannot intermingle or subsidize other tiers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-brand-400">
            3. Domestic Bank Binding & PII Protection
          </h2>
          <p>
            Bank account binding is strictly gated and permitted only after the parent fund is in an ACTIVE status.
            All bank details and account holders are encrypted at rest via AES-256-GCM. Direct editing of bound accounts
            is forbidden; modifications require administrative escalation to protect against unauthorized diversion.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-brand-400">
            4. Withdrawal Settlement & Balance Reservation Pipeline
          </h2>
          <p>
            Initiating a payout request creates an immediate reservation (<code className="bg-slate-950 px-1 py-0.5 rounded text-amber-400 font-mono">RESERVED</code>)
            against the fund ledger, decrementing the available balance in real-time to eliminate double-spending.
            Settlement requires a verifiable payout UTR. Failed or rejected disbursements execute an automated compensating
            transaction that credits the reserved balance back.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-brand-400">
            5. Account Freezes & Suspension
          </h2>
          <p>
            FundX administration retains the authority to enforce instant account freezes in accordance with zero-trust
            compliance standards. All suspensions mandate a logged incident note and produce an immutable cryptographic audit record.
          </p>
        </section>
      </div>
    </div>
  );
}
