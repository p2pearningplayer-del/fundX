'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  QrCode,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';

function USDTGatewayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fundIdParam = searchParams.get('fundId');

  const [funds, setFunds] = useState<any[]>([]);
  const [selectedFundId, setSelectedFundId] = useState<string>('');
  const [order, setOrder] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [txid, setTxid] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load available funds
  useEffect(() => {
    fetch('/api/funds')
      .then((res) => res.json())
      .then((data) => {
        if (data.funds && data.funds.length > 0) {
          setFunds(data.funds);
          const initial = fundIdParam || data.funds[0].id;
          setSelectedFundId(initial);
          createOrder(initial);
        }
      })
      .catch(console.error);
  }, [fundIdParam]);

  const createOrder = async (fundId: string) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch('/api/funds/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fundId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate order');

      setOrder(data.order);
      setQrDataUrl(data.qrDataUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Order generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    if (!txid || txid.trim().length !== 64) {
      setError('Please enter a valid 64-character TRON TXID hash.');
      return;
    }

    setError(null);
    setVerifying(true);

    try {
      const res = await fetch('/api/funds/verify-txid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, txid: txid.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      setSuccess('Blockchain verification confirmed! Activation gate has been lifted.');
      setTimeout(() => {
        router.push('/tasks');
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  // Helper for quick sandbox testing
  const generateMockTxid = () => {
    const chars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    setTxid(hash);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-800 text-brand-300 text-xs font-mono">
          <QrCode className="w-3.5 h-3.5" />
          <span>PRD SECTION 3 & 6 • USDT TRC20 GATEWAY</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          USDT TRC20 Activation Gateway
        </h1>
        <p className="text-xs text-slate-400">
          Transfer the exact USDT quantum via TRC20 network. Submissions verified via TronGrid RPC scan.
        </p>
      </div>

      {/* Fund Tier Selector Tabs */}
      <div className="flex items-center justify-center space-x-2">
        {funds.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setSelectedFundId(f.id);
              createOrder(f.id);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
              selectedFundId === f.id
                ? 'bg-brand-600 border-brand-500 text-white shadow-glow-blue'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {f.name} ({f.baseRateDisplay})
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl flex items-center space-x-3 text-xs text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl flex items-center space-x-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {order && (
        <div className="grid md:grid-cols-2 gap-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Left: Dynamic QR & Expiry Timer */}
          <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-slate-950 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono text-slate-400">ORDER: {order.order_code}</span>
              <CountdownTimer expiresAt={order.expires_at} onExpire={() => setError('Order expired. Please generate a new deposit order.')} />
            </div>

            {qrDataUrl ? (
              <div className="p-3 bg-white rounded-xl shadow-lg">
                <img src={qrDataUrl} alt="Deposit QR Code" className="w-48 h-48 sm:w-56 sm:h-56" />
              </div>
            ) : (
              <div className="w-48 h-48 bg-slate-800 animate-pulse rounded-xl" />
            )}

            <div className="text-center space-y-1">
              <span className="text-xs text-slate-400 font-mono">Scan via TronLink or Any TRC20 Wallet</span>
              <p className="text-[11px] text-slate-500">Contract: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t</p>
            </div>
          </div>

          {/* Right: Deposit Specifications & TXID Submission */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-500 font-mono">EXACT TRANSFER AMOUNT</span>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {order.usdt_amount} <span className="text-brand-400">USDT</span>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    (₹{order.fiat_equivalent_inr.toLocaleString('en-IN')} INR)
                  </span>
                </div>
              </div>

              {/* Deposit Receiving Wallet */}
              <div>
                <span className="text-xs text-slate-500 font-mono">OFFICIAL DEPOSIT HOT WALLET</span>
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 mt-1">
                  <span className="text-xs font-mono text-slate-300 break-all select-all">
                    {order.trc20_deposit_wallet}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(order.trc20_deposit_wallet, 'wallet')}
                    className="ml-2 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {copied === 'wallet' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submission Form */}
              <form onSubmit={handleVerify} className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-300">
                    Submit TRON TXID Hash (64 Hex Characters)
                  </label>
                  <button
                    type="button"
                    onClick={generateMockTxid}
                    className="text-[11px] text-brand-400 hover:underline font-mono"
                  >
                    Auto-Fill Sandbox TXID
                  </button>
                </div>

                <input
                  type="text"
                  value={txid}
                  onChange={(e) => setTxid(e.target.value)}
                  placeholder="e.g. 3b2a5c9f8e7d1b4a0f... (64 hex characters)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 font-mono"
                  required
                />

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-glow-blue transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Scanning TronGrid FullNode RPC...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit TXID & Lift Activation Gate</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="p-3 bg-brand-950/30 border border-brand-800/40 rounded-xl text-[11px] text-brand-300 font-mono flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-brand-400" />
              <span>Cryptographic hash uniqueness prevents replay attacks.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function USDTGatewayPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto p-12 text-center text-slate-400 font-mono text-xs">Loading TRC20 Gateway Interface...</div>}>
      <USDTGatewayContent />
    </Suspense>
  );
}
