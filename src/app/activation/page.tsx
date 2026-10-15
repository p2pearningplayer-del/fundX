'use client';

import React from 'react';
import { ShieldCheck, QrCode, Cpu, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export default function ActivationOverviewPage() {
  const states = [
    {
      state: 'State: Pending Payment',
      title: 'Order Generation & Expiration',
      badge: '30-Minute Timer',
      color: 'border-blue-500/40 text-blue-400 bg-blue-950/20',
      desc: 'Order is created with a designated hot wallet destination and exact USDT valuation. Dynamic QR is rendered and the 30-minute expiry timer begins.',
    },
    {
      state: 'State: Under Review',
      title: 'TXID Submission & RPC Polling',
      badge: 'Replay Guard Active',
      color: 'border-amber-500/40 text-amber-400 bg-amber-950/20',
      desc: 'User transmits the 64-character TRON transaction hash. The verification engine checks hash uniqueness, destination wallet, and contract TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t.',
    },
    {
      state: 'State: Active / Expired',
      title: 'Gate Lifted & Account Unlocked',
      badge: 'Immediate Execution',
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20',
      desc: 'On confirmation match, the fund gate lifts immediately. Domestic bank account binding and genuine transaction tasks are unlocked.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-800 text-brand-300 text-xs font-mono">
          <Cpu className="w-3.5 h-3.5" />
          <span>PRD SECTION 3 & 6 SPECIFICATION</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Activation Overview & Blockchain TXID Audit
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Fund activation orders bind directly to designated USDT TRC20 destination wallets.
          The verification engine enforces transaction hash uniqueness to prevent replay vectors.
        </p>
      </div>

      {/* 3 State Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {states.map((s) => (
          <div key={s.state} className={`rounded-2xl border p-6 flex flex-col justify-between ${s.color}`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border border-current">
                  {s.badge}
                </span>
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">{s.state}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cryptographic Contract Disclosure Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-400" />
          <span>USDT TRC20 Protocol Parameters</span>
        </h3>

        <div className="grid sm:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block mb-1">Official TRC20 Token Contract:</span>
            <span className="text-brand-400 font-semibold break-all">
              TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block mb-1">Expiration Safeguard:</span>
            <span className="text-amber-400 font-semibold">
              30-Minute Dynamic Window
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block mb-1">Replay Attack Guard:</span>
            <span className="text-emerald-400 font-semibold">
              Cryptographic Hash Uniqueness Constraint
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block mb-1">FX Peg Reference:</span>
            <span className="text-white font-semibold">
              1 USDT = ₹89.50 INR Reference Peg
            </span>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Ready to unlock tasks and bank account binding?
          </p>
          <a
            href="/activation/gateway"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-glow-blue flex items-center space-x-1.5 transition"
          >
            <span>Proceed to Gateway</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
