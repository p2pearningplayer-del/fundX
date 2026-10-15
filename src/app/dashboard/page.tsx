'use client';

import React, { useEffect, useState } from 'react';
import {
  Wallet,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Building2,
  Clock,
  ShieldCheck,
  ChevronRight,
  Layers,
  Sparkles,
  ArrowDownToLine,
} from 'lucide-react';

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [funds, setFunds] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const loadData = async () => {
    try {
      const [authRes, walletRes, fundsRes] = await fetchAll();
      if (authRes.ok) {
        const uData = await authRes.json();
        setUser(uData.user);
      }
      if (walletRes.ok) {
        const wData = await walletRes.json();
        setWallet(wData);
      }
      if (fundsRes.ok) {
        const fData = await fundsRes.json();
        setFunds(fData.funds);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = () =>
    Promise.all([
      fetch('/api/auth/me'),
      fetch('/api/wallet'),
      fetch('/api/funds'),
    ]);

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome & System Announcement */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome, {user ? user.legalName : 'Investor'}
            </h1>
            <span className="text-[10px] font-mono uppercase bg-brand-950 text-brand-300 border border-brand-800 px-2 py-0.5 rounded-full font-bold">
              PORTFOLIO VIEW
            </span>
          </div>
          <p className="text-xs text-slate-400">
            PRD v1.0 Isolated Multi-Ledger Orchestration Console. All mutations executed server-side with ACID integrity.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/tasks"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-glow-blue flex items-center space-x-1.5 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Task Engine</span>
          </a>
          <a
            href="/withdraw"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Withdraw</span>
          </a>
        </div>
      </div>

      {/* Portfolio Financial Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Available Balance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>AVAILABLE LIQUIDITY</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            ₹{wallet ? wallet.portfolio.totalAvailableINR.toLocaleString('en-IN') : '0.00'}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Withdrawable funds derived dynamically from unspent ledger credits.
          </p>
        </div>

        {/* Reserved in Payout Pipeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>RESERVED IN PAYOUT</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
            ₹{wallet ? wallet.portfolio.totalReservedINR.toLocaleString('en-IN') : '0.00'}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Locked in real-time reservation pipeline to prevent double-spending.
          </p>
        </div>

        {/* Total Lifetime Earned */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>LIFETIME COMMISSIONS</span>
            <TrendingUp className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-3xl font-extrabold text-brand-400 font-mono tracking-tight">
            ₹{wallet ? wallet.portfolio.totalLifetimeEarnedINR.toLocaleString('en-IN') : '0.00'}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Accumulated yield across Gaming, Stock, and Mix funds.
          </p>
        </div>
      </div>

      {/* 3-Tier Isolated Funds Status & Gateway */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-400" />
              <span>Isolated Fund Portfolios</span>
            </h2>
            <p className="text-xs text-slate-400">
              PRD Section 2: Strict isolation of balances, fund states, and withdrawal pipelines.
            </p>
          </div>
          <a href="/funds" className="text-xs font-medium text-brand-400 hover:underline flex items-center">
            <span>View All Fund Specs</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {funds.map((f) => {
            const isActive = f.status === 'ACTIVE';
            const isPending = f.status === 'PENDING_PAYMENT' || f.status === 'UNDER_REVIEW';

            return (
              <div
                key={f.id}
                className={`rounded-2xl bg-slate-900 border p-6 flex flex-col justify-between transition-all ${
                  isActive
                    ? 'border-emerald-500/40 shadow-glow-emerald/20'
                    : isPending
                    ? 'border-amber-500/40'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                        isActive
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : isPending
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {f.status}
                    </span>
                    <span className="text-xl font-mono font-bold text-white">
                      {f.baseRateDisplay}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{f.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{f.description}</p>

                  {/* Fund Financial Breakdown */}
                  <div className="p-3 bg-slate-950/80 rounded-xl space-y-2 text-xs font-mono border border-slate-800/80 mb-4">
                    <div className="flex justify-between text-slate-400">
                      <span>Available Balance:</span>
                      <strong className="text-emerald-400">
                        ₹{f.balance ? f.balance.availableBalance.toLocaleString('en-IN') : '0.00'}
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Reserved Payout:</span>
                      <strong className="text-amber-400">
                        ₹{f.balance ? f.balance.reservedBalance.toLocaleString('en-IN') : '0.00'}
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Bank Account Bound:</span>
                      <strong className={f.hasBankAccount ? 'text-white' : 'text-red-400'}>
                        {f.hasBankAccount ? 'Verified' : 'Unbound'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {!isActive ? (
                    <a
                      href={`/activation/gateway?fundId=${f.id}`}
                      className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-glow-blue transition"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{isPending ? 'Resume Activation' : 'Activate via USDT TRC20'}</span>
                    </a>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`/tasks?fundId=${f.id}`}
                        className="py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center transition"
                      >
                        Run Tasks
                      </a>
                      <a
                        href={f.hasBankAccount ? `/withdraw?fundId=${f.id}` : `/bank-accounts?fundId=${f.id}`}
                        className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center transition"
                      >
                        {f.hasBankAccount ? 'Withdraw' : 'Bind Bank'}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Launchpad & Security Disclosures */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Task Allocation Quick Access</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Run genuine transaction tasks with verifiable settlement or test workflows inside the isolated DEMO simulation environment with zero balance impact.
          </p>
          <div className="flex items-center space-x-3 pt-2">
            <a
              href="/tasks"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-brand-600 text-white text-xs font-semibold transition"
            >
              Open Task Dashboard
            </a>
            <a
              href="/tasks/ledger"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Inspect Task Ledger
            </a>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Security & PII Vault Status</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All bank accounts are protected under AES-256-GCM encryption at rest. Double-entry confirmation and RBI IFSC regex validation enforced.
          </p>
          <div className="flex items-center space-x-3 pt-2">
            <a
              href="/bank-accounts"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Manage Bound Accounts
            </a>
            <a
              href="/security"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Security Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
