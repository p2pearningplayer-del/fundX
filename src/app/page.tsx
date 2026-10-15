'use client';

import React from 'react';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Lock,
  Landmark,
  Cpu,
  Layers,
  ChevronRight,
  TrendingUp,
  Award,
  CheckCircle,
} from 'lucide-react';

export default function LandingPage() {
  const fundTiers = [
    {
      name: 'Gaming Fund',
      slug: 'gaming',
      rate: '9.0%',
      rateNum: 0.09,
      taskRange: '₹1,000 – ₹30,000',
      activationFee: '9.0%',
      desc: 'High-frequency transaction-matching nodes for global gaming liquidity settlement.',
      badge: 'Base Liquidity',
      color: 'from-blue-600/20 to-brand-500/10 border-blue-500/30 text-blue-400',
    },
    {
      name: 'Stock Fund',
      slug: 'stock',
      rate: '18.0%',
      rateNum: 0.18,
      taskRange: '₹1,000 – ₹30,000',
      activationFee: '18.0%',
      desc: 'Equities and derivatives clearing pipelines with institutional tier allocation.',
      badge: 'Enterprise Tier',
      color: 'from-purple-600/20 to-purple-500/10 border-purple-500/30 text-purple-400',
    },
    {
      name: 'Mix Fund',
      slug: 'mix',
      rate: '24.0%',
      rateNum: 0.24,
      taskRange: '₹1,000 – ₹30,000',
      activationFee: '24.0%',
      desc: 'Blended multi-asset algorithmic liquidity provision and automated arbitrage clearing.',
      badge: 'Maximum Quantum',
      color: 'from-amber-600/20 to-amber-500/10 border-amber-500/30 text-amber-400',
    },
  ];

  const lifecycleSteps = [
    {
      num: '01',
      title: 'Tier Selection',
      desc: 'Select your isolated fund tier (Gaming 9%, Stock 18%, or Mix 24%) with dedicated ledger segregation.',
    },
    {
      num: '02',
      title: 'USDT TRC20 Order',
      desc: 'Generate a dynamic deposit order with 30-minute countdown and cryptographic QR verification.',
    },
    {
      num: '03',
      title: 'Blockchain RPC Scan',
      desc: 'Submit transaction hash. TronGrid node verifies hash uniqueness, contract, and exact USDT value.',
    },
    {
      num: '04',
      title: 'Gate Lifted & Bank Bound',
      desc: 'Fund state transitions to ACTIVE. Bind domestic bank account secured via AES-256 PII encryption.',
    },
    {
      num: '05',
      title: 'Task & Commission Payout',
      desc: 'Execute verifiable tasks. Commissions disburse automatically to ledger for real-time payout reservation.',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-700/60 text-brand-300 text-xs font-mono">
              <Zap className="w-3.5 h-3.5 text-brand-400" />
              <span>PRD v1.0 STABLE BASELINE • INSTITUTIONAL ORCHESTRATION</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Enterprise Fund Activation & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-blue-400 to-indigo-300">
                Double-Entry Commission Ledger
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              Institutional fund-orchestration engine enabling segmented fund activation,
              transaction-task generation, and auditable multi-tier commission disbursement
              with crypto-fiat segregation.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <a
                href="/register"
                className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-glow-blue flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>Initialize Account</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/dashboard"
                className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center space-x-2 transition-all"
              >
                <span>Launch Workspace</span>
              </a>
            </div>

            {/* Micro stats banner */}
            <div className="grid grid-cols-3 gap-4 pt-10 border-t border-slate-800/80 max-w-xl mx-auto font-mono text-left">
              <div>
                <span className="text-xs text-slate-400">USDT CONTRACT</span>
                <p className="text-xs text-brand-400 font-semibold truncate">TR7NHqje...Lj6t</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">LEDGER ENGINE</span>
                <p className="text-xs text-emerald-400 font-semibold">PostgreSQL ACID</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">ENCRYPTION</span>
                <p className="text-xs text-purple-400 font-semibold">AES-256 PII Vault</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Tier Isolated Fund Architecture */}
      <section className="py-20 bg-slate-925 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-brand-400">
              PRD SECTION 2 SPECIFICATIONS
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              3-Tier Isolated Fund Architecture
            </h2>
            <p className="text-slate-400 text-sm">
              Each fund strictly maintains isolated states, ledger balances, and withdrawal pipelines.
              Percentages operate against an administrator-defined baseline valuation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {fundTiers.map((tier) => (
              <div
                key={tier.slug}
                className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between glow-card relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-slate-800/80 text-slate-300">
                      {tier.badge}
                    </span>
                    <span className="text-2xl font-black text-white font-mono">{tier.rate}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">{tier.desc}</p>

                  <div className="space-y-3 pt-4 border-t border-slate-800/80 text-xs font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Configured Rate:</span>
                      <strong className="text-brand-400">{tier.rate} Base Rate</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Activation Fee:</span>
                      <strong className="text-white">{tier.activationFee}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Task Quantum Range:</span>
                      <strong className="text-emerald-400">{tier.taskRange}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Default Status:</span>
                      <span className="text-amber-400 font-semibold">Independent / Locked</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800">
                  <a
                    href="/funds"
                    className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white font-semibold text-xs transition flex items-center justify-center space-x-1.5"
                  >
                    <span>View Activation Gateway</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* End-to-End System Activation Lifecycle */}
      <section className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-emerald-400">
              PRD SECTION 3 LIFECYCLE
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              End-to-End System Activation Lifecycle
            </h2>
            <p className="text-slate-400 text-sm">
              From cryptographic TRC20 verification to ledger disbursement and settlement.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {lifecycleSteps.map((step, idx) => (
              <div
                key={step.num}
                className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between relative"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/40 text-brand-400 font-mono text-xs font-bold flex items-center justify-center mb-3">
                    {step.num}
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">{step.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
                {idx < 4 && (
                  <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 text-slate-600">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional Security & Ledger Highlights */}
      <section className="py-20 bg-slate-925">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">AES-256 PII Vault</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bank accounts and legal identities are encrypted at rest with AES-256-GCM.
                Zero plaintext exposure across logs, client APIs, or public interfaces.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">ACID Double-Entry Ledger</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every transaction event produces an immutable debit and credit record.
                Balances are derived dynamically from unspent ledger credits.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">TRC20 Verification Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unique TXID verification against TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t prevents
                replay vectors. 30-minute dynamic QR expiration safeguard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
