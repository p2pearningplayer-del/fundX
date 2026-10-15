'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Landmark,
  CreditCard,
  Layers,
} from 'lucide-react';

export default function AccountManagementPage() {
  const [funds, setFunds] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Binding Form State
  const [selectedFundId, setSelectedFundId] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [accountType, setAccountType] = useState<'SAVINGS' | 'CURRENT'>('SAVINGS');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [uRes, fRes, bRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/funds'),
        fetch('/api/bank-account'),
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setUserProfile(uData.user);
        if (uData.user?.legalName) setAccountHolder(uData.user.legalName);
      }
      if (fRes.ok) {
        const fData = await fRes.json();
        setFunds(fData.funds || []);
        if (fData.funds?.length > 0) setSelectedFundId(fData.funds[0].id);
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
  }, []);

  const handleBind = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Frontend pre-validation
    if (accountNumber !== confirmAccountNumber) {
      setError('Account numbers do not match. Double-entry confirmation failed.');
      return;
    }

    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode.trim().toUpperCase())) {
      setError('Invalid RBI IFSC format. Must match standard format (e.g. HDFC0001234 or SBIN0004567).');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/bank-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fundId: selectedFundId,
          accountHolder,
          bankName,
          ifscCode,
          accountNumber,
          confirmAccountNumber,
          accountType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to bind bank account');

      setSuccess('Bank account bound securely with AES-256 encryption. Details are now immutable.');
      setAccountNumber('');
      setConfirmAccountNumber('');
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Binding failed');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedFund = funds.find((f) => f.id === selectedFundId);
  const isSelectedFundActive = selectedFund?.status === 'ACTIVE';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-800 text-brand-300 text-xs font-mono mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>PRD SECTION 5 • BANK ACCOUNT MANAGEMENT & PII VAULT</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Account Management & Banking Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Attach domestic settlement accounts. Protected under AES-256-GCM encryption at rest with UI masking.
          </p>
        </div>
      </div>

      {/* Zero PII Exposure Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Zero PII Exposure Guarantee
            </h4>
            <p className="text-xs text-slate-400">
              Plaintext bank numbers are never stored in plain logs or returned in client API responses. Direct modification is forbidden post-binding.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono bg-purple-950 text-purple-300 border border-purple-800 px-3 py-1 rounded-lg">
          AES-256-GCM
        </span>
      </div>

      {/* Bound Accounts Display */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <span>Currently Bound Accounts</span>
        </h3>

        {bankAccounts.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs font-mono">
            No bank accounts bound yet. Select an ACTIVE fund below to bind your domestic settlement account.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {bankAccounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                    VERIFIED & IMMUTABLE
                  </span>
                  <span className="text-xs font-mono text-slate-400">{acc.accountType}</span>
                </div>

                <div>
                  <span className="text-xs text-brand-400 font-semibold">{acc.fundName}</span>
                  <h4 className="text-lg font-bold text-white mt-0.5">{acc.bankName}</h4>
                </div>

                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Account No:</span>
                    <strong className="text-white tracking-widest">{acc.accountNumberMasked}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>IFSC Code:</span>
                    <strong className="text-brand-300">{acc.ifscCode}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                  <span>Bound: {new Date(acc.createdAt).toLocaleDateString()}</span>
                  <span className="text-emerald-400">Ready for Payout</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bank Account Binding Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-400" />
            <span>Bind Domestic Bank Account</span>
          </h3>
          <p className="text-xs text-slate-400">
            PRD Section 5: Permitted ONLY after parent fund tier is ACTIVE.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl flex items-center space-x-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-center space-x-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleBind} className="space-y-5">
          {/* Target Fund Association */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Associated Fund Tier <span className="text-red-400">*</span>
            </label>
            <div className="grid sm:grid-cols-3 gap-3">
              {funds.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFundId(f.id)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    selectedFundId === f.id
                      ? 'bg-brand-950/40 border-brand-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold">{f.name}</span>
                  <span
                    className={`text-[10px] font-mono mt-1 ${
                      f.status === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    Status: {f.status}
                  </span>
                </button>
              ))}
            </div>
            {!isSelectedFundActive && (
              <p className="text-xs text-amber-400 mt-2 flex items-center gap-1 font-mono">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Notice: Fund is currently LOCKED. Activation required before bank binding can be saved.</span>
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Account Holder */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Account Holder Name <span className="text-red-400">*</span> (Fuzzy Matches KYC: {userProfile?.legalName})
              </label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Full name as per bank records"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Bank Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. HDFC Bank / State Bank of India / ICICI"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            {/* RBI IFSC Code */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Bank IFSC Code <span className="text-red-400">*</span> (RBI Format: ^[A-Z]&#123;4&#125;0[A-Z0-9]&#123;6&#125;$)
              </label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="e.g. HDFC0001234"
                maxLength={11}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 font-mono uppercase"
                required
              />
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Account Type <span className="text-red-400">*</span>
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="SAVINGS">Savings Account</option>
                <option value="CURRENT">Current Account</option>
              </select>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Account Number <span className="text-red-400">*</span> (9 to 18 digits)
              </label>
              <input
                type="password"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 font-mono"
                required
              />
            </div>

            {/* Confirm Account Number */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Confirm Account Number <span className="text-red-400">*</span> (Double-Entry Match)
              </label>
              <input
                type="text"
                value={confirmAccountNumber}
                onChange={(e) => setConfirmAccountNumber(e.target.value)}
                placeholder="Repeat account number"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 font-mono"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-glow-blue transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {submitting ? (
              <span>Encrypting PII & Committing to Vault...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Save & Seal Bank Account Details</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
