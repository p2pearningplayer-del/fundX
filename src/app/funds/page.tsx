'use client';

import React, { useEffect, useState } from 'react';
import { Layers, ShieldCheck, CheckCircle2, Lock, ArrowRight, Calculator } from 'lucide-react';

export default function FundSelectionPage() {
  const [funds, setFunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [calcAmount, setCalcAmount] = useState<number>(10000);

  const fetchFunds = async () => {
    try {
      const res = await fetch('/api/funds');
      if (res.ok) {
        const data = await res.json();
        setFunds(data.funds);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunds();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-800 text-brand-300 text-xs font-mono">
          <Layers className="w-3.5 h-3.5" />
          <span>PRD SECTION 2 • 3-TIER ISOLATED ALLOCATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Fund Categories & Activation Specifications
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          The activation fee percentages operate against an administrator-defined baseline valuation per tier.
          Each fund strictly maintains isolated states, ledger balances, and withdrawal pipelines.
        </p>
      </div>

      {/* Fund Tier Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {funds.map((fund) => {
          const isActive = fund.status === 'ACTIVE';
          const isPending = fund.status === 'PENDING_PAYMENT' || fund.status === 'UNDER_REVIEW';

          // Baseline activation fee calculation in INR
          const feeINR = fund.baselineValuation * (fund.activationFeePercent / 100);
          const feeUSDT = (feeINR / 89.5).toFixed(2);

          return (
            <div
              key={fund.id}
              className={`rounded-2xl bg-slate-900 border p-6 flex flex-col justify-between transition-all glow-card ${
                isActive
                  ? 'border-emerald-500/50 shadow-glow-emerald/20'
                  : isPending
                  ? 'border-amber-500/40'
                  : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${
                      isActive
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : isPending
                        ? 'bg-amber-950 text-amber-400 border-amber-800'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {fund.status}
                  </span>
                  <span className="text-2xl font-black font-mono text-white">
                    {fund.baseRateDisplay}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{fund.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">{fund.description}</p>

                {/* Table of Specifications */}
                <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800/80 text-xs font-mono mb-6">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Configured Rate:</span>
                    <strong className="text-brand-400">{fund.baseRateDisplay} Base Rate</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Activation Fee:</span>
                    <strong className="text-white">{fund.activationFeePercent.toFixed(1)}% (≈ ${feeUSDT} USDT)</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Task Quantum Range:</span>
                    <strong className="text-emerald-400">
                      ₹{fund.minTaskAmount.toLocaleString('en-IN')} – ₹{fund.maxTaskAmount.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Ledger Pipeline:</span>
                    <span className="text-blue-400">Strict Isolation</span>
                  </div>
                </div>
              </div>

              <div>
                {isActive ? (
                  <a
                    href={`/tasks?fundId=${fund.id}`}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Launch Tasks ({fund.name})</span>
                  </a>
                ) : (
                  <a
                    href={`/activation/gateway?fundId=${fund.id}`}
                    className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-glow-blue transition"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isPending ? 'Complete Deposit Order' : 'Activate with USDT TRC20'}</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Yield Calculator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-brand-400" />
              <span>Deterministic Commission Calculator</span>
            </h3>
            <p className="text-xs text-slate-400">
              Formula: Commission = Eligible_Task_Quantum × Configured_Fund_Rate (PRD Section 8)
            </p>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-slate-400">Simulate Quantum:</span>
            {[1000, 10000, 25000].map((amt) => (
              <button
                key={amt}
                onClick={() => setCalcAmount(amt)}
                className={`px-3 py-1.5 rounded-lg border text-xs ${
                  calcAmount === amt
                    ? 'bg-brand-600 border-brand-500 text-white font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ₹{amt.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 font-mono">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Gaming Fund (9.0%)</span>
              <span>₹{calcAmount.toLocaleString('en-IN')} task</span>
            </div>
            <div className="text-2xl font-bold text-brand-400">
              ₹{(calcAmount * 0.09).toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Withdrawable upon task completion</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Stock Fund (18.0%)</span>
              <span>₹{calcAmount.toLocaleString('en-IN')} task</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              ₹{(calcAmount * 0.18).toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Withdrawable upon task completion</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Mix Fund (24.0%)</span>
              <span>₹{calcAmount.toLocaleString('en-IN')} task</span>
            </div>
            <div className="text-2xl font-bold text-amber-400">
              ₹{(calcAmount * 0.24).toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Withdrawable upon task completion</p>
          </div>
        </div>
      </div>
    </div>
  );
}
