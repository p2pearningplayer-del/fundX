'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowDownToLine,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';

function WithdrawalGatewayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fundIdParam = searchParams.get('fundId');

  const [wallet, setWallet] = useState<any>(null);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [selectedFundId, setSelectedFundId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any>(null);

  const loadData = async () => {
    try {
      const [wRes, bRes] = await Promise.all([
        fetch('/api/wallet'),
        fetch('/api/bank-account'),
      ]);

      if (wRes.ok) {
        const wData = await wRes.json();
        setWallet(wData);
        if (wData.funds?.length > 0) {
          const initial = fundIdParam || wData.funds[0].fundId;
          setSelectedFundId(initial);
        }
      }
      if (bRes.ok) {
        const bData = await bRes.json();
        setBankAccounts(bData.bankAccounts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [fundIdParam]);

  const selectedFund = wallet?.funds?.find((f: any) => f.fundId === selectedFundId);
  const boundAccount = bankAccounts.find((b: any) => b.fundId === selectedFundId);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setReceipt(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please provide a valid withdrawal amount.');
      return;
    }

    if (!selectedFund) {
      setError('Please select a fund portfolio.');
      return;
    }

    if (!boundAccount) {
      setError('No verified bank account bound to this fund. Please bind an account first.');
      return;
    }

    if (numAmount > selectedFund.availableBalance) {
      setError(
        `Insufficient available liquidity in ${selectedFund.name}. Available: ₹${selectedFund.availableBalance.toLocaleString('en-IN')}, Requested: ₹${numAmount.toLocaleString('en-IN')}`
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fundId: selectedFundId,
          bankAccountId: boundAccount.id,
          amount: numAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Withdrawal initiation failed');

      setReceipt(data.withdrawal);
      setAmount('');
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payout request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-800 text-brand-300 text-xs font-mono">
          <ArrowDownToLine className="w-3.5 h-3.5" />
          <span>PRD SECTION 9 • BALANCE RESERVATION PIPELINE</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Withdrawal Gateway</h1>
        <p className="text-xs text-slate-400">
          Real-time balance reservation eliminates double-spending. Available balance is decremented instantly upon submission.
        </p>
      </div>

      {receipt && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-6 space-y-4 shadow-glow-emerald">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">
              PAYOUT RESERVATION COMMITTED
            </span>
            <span className="text-xs font-mono text-slate-400">{receipt.withdrawal_code}</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">
              ₹{receipt.amount.toLocaleString('en-IN')} Reserved in Ledger
            </h3>
            <p className="text-xs text-emerald-200">
              Your available balance has been decremented in real-time. Settlement desk will disburse funds with a cryptographic UTR hash.
            </p>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <a
              href="/withdraw/history"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition"
            >
              Track in Withdrawal Log
            </a>
            <button
              onClick={() => setReceipt(null)}
              className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl flex items-center space-x-3 text-xs text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Payout Reservation Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <form onSubmit={handleWithdraw} className="space-y-6">
          {/* Fund Tier Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Select Isolated Source Fund Tier <span className="text-red-400">*</span>
            </label>
            <div className="grid sm:grid-cols-3 gap-3">
              {wallet?.funds?.map((f: any) => (
                <button
                  key={f.fundId}
                  type="button"
                  onClick={() => setSelectedFundId(f.fundId)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    selectedFundId === f.fundId
                      ? 'bg-brand-950/40 border-brand-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold">{f.name}</span>
                  <div className="font-mono mt-1">
                    <span className="text-slate-500 text-[10px]">Available:</span>
                    <strong className="text-emerald-400 block text-xs">
                      ₹{f.availableBalance.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bound Bank Account Display */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
            <span className="text-xs font-mono text-slate-500 block">DESTINATION SETTLEMENT ACCOUNT</span>
            {boundAccount ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-brand-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{boundAccount.bankName}</h4>
                    <span className="text-xs font-mono text-slate-400">
                      {boundAccount.accountNumberMasked} • IFSC: {boundAccount.ifscCode}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold self-start sm:self-auto">
                  VERIFIED DESTINATION
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-400">No bank account bound for this fund tier.</span>
                <a
                  href={`/bank-accounts?fundId=${selectedFundId}`}
                  className="text-xs font-semibold text-brand-400 hover:underline"
                >
                  Bind Bank Account →
                </a>
              </div>
            )}
          </div>

          {/* Withdrawal Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-300">
                Withdrawal Quantum (INR) <span className="text-red-400">*</span>
              </label>
              {selectedFund && (
                <button
                  type="button"
                  onClick={() => setAmount(String(selectedFund.availableBalance))}
                  className="text-[11px] font-mono text-brand-400 hover:underline"
                >
                  Use Max Available (₹{selectedFund.availableBalance.toLocaleString('en-IN')})
                </button>
              )}
            </div>

            <div className="relative">
              <span className="text-sm font-bold text-slate-400 absolute left-3 top-2.5 font-mono">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min={1}
                step="any"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>

          {/* Settlement Safeguard Notice */}
          <div className="p-3 bg-brand-950/20 border border-brand-800/40 rounded-xl text-[11px] text-brand-300 font-mono space-y-1">
            <span className="font-bold flex items-center gap-1 text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
              Settlement Safeguard:
            </span>
            <p className="text-slate-400 leading-relaxed">
              Marking a withdrawal PAID requires a cryptographically hashed payout UTR or gateway reconciliation payload.
              Rejected or failed payouts automatically roll back reserved funds via an audited compensating transaction.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || !boundAccount || (selectedFund && selectedFund.availableBalance <= 0)}
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-glow-blue transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {submitting ? (
              <span>Reserving Ledger Balance...</span>
            ) : (
              <>
                <ArrowDownToLine className="w-4 h-4" />
                <span>Commit Payout Reservation</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function WithdrawalGatewayPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto p-12 text-center text-slate-400 font-mono text-xs">Loading Withdrawal Gateway...</div>}>
      <WithdrawalGatewayContent />
    </Suspense>
  );
}
