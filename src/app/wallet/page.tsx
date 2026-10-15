'use client';

import React, { useEffect, useState } from 'react';
import {
  Wallet,
  ArrowDownToLine,
  TrendingUp,
  Clock,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  ListOrdered,
} from 'lucide-react';

export default function CommissionWalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/wallet');
      if (res.ok) {
        const data = await res.json();
        setWallet(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-800 text-brand-300 text-xs font-mono mb-2">
            <Wallet className="w-3.5 h-3.5" />
            <span>PRD INVENTORY SCREEN 13 • MULTI-LEDGER WALLET</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Commission Wallet</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time balance derivation from unspent ledger credits. Strict crypto-fiat segregation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/wallet/records"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition"
          >
            <ListOrdered className="w-4 h-4" />
            <span>Commission Records</span>
          </a>
          <a
            href="/withdraw"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-glow-blue flex items-center space-x-1.5 transition"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Withdraw Funds</span>
          </a>
        </div>
      </div>

      {/* Portfolio Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <span className="text-xs font-mono text-slate-400 block mb-1">TOTAL AVAILABLE LIQUIDITY</span>
          <div className="text-3xl font-black text-white font-mono">
            ₹{wallet ? wallet.portfolio.totalAvailableINR.toLocaleString('en-IN') : '0.00'}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Unreserved credits ready for payout disbursement.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <span className="text-xs font-mono text-slate-400 block mb-1">ACTIVE RESERVATIONS</span>
          <div className="text-3xl font-black text-amber-400 font-mono">
            ₹{wallet ? wallet.portfolio.totalReservedINR.toLocaleString('en-IN') : '0.00'}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Held in reservation pipeline awaiting UTR gateway confirmation.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <span className="text-xs font-mono text-slate-400 block mb-1">TOTAL LIFETIME EARNINGS</span>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            ₹{wallet ? wallet.portfolio.totalLifetimeEarnedINR.toLocaleString('en-IN') : '0.00'}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Cumulative yield earned through completed transaction tasks.</p>
        </div>
      </div>

      {/* Fund Segregated Balances */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-400" />
          <span>Fund Segregated Ledger Accounts</span>
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          {wallet?.funds?.map((f: any) => (
            <div
              key={f.fundId}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 glow-card"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-white">{f.name}</span>
                  <span className="text-xs font-mono text-brand-400 font-semibold">
                    {(f.baseRate * 100).toFixed(1)}% Rate
                  </span>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-xs space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Available Balance:</span>
                    <strong className="text-emerald-400">
                      ₹{f.availableBalance.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Reserved Payout:</span>
                    <strong className="text-amber-400">
                      ₹{f.reservedBalance.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Settled Disbursements:</span>
                    <strong className="text-slate-300">
                      ₹{f.withdrawnSettled.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-2">
                    <span>Total Fund Accrual:</span>
                    <strong className="text-white">
                      ₹{f.totalEarned.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Bound Account:</span>
                  <span className={f.hasBankAccount ? 'text-white' : 'text-amber-400'}>
                    {f.hasBankAccount ? f.bankAccountMasked : 'Unbound'}
                  </span>
                </div>
              </div>

              <div>
                <a
                  href={`/withdraw?fundId=${f.fundId}`}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-brand-600 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                  <span>Withdraw from {f.name}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
