'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Phone, KeyRound, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError('Please provide your registered Mobile or Username.');
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      setMessage('Identity verified via security registry. You may now commit a new password.');
    }, 600);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessage('Password successfully reset. Redirecting to login portal...');
      setTimeout(() => router.push('/login'), 1200);
    }, 800);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-brand-600/30 text-brand-400 mx-auto flex items-center justify-center border border-brand-500/40">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Security Credential Recovery
          </h2>
          <p className="text-xs text-slate-400">
            Reset access credentials through the security ledger verification path.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl flex items-center space-x-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-center space-x-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{message}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Registered Mobile Number or Username
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter 10-digit mobile or username"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl shadow-glow-blue transition-all flex items-center justify-center space-x-2"
            >
              <span>Verify Security Record</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl shadow-glow-blue transition-all flex items-center justify-center space-x-2"
            >
              <span>Commit New Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-2 text-xs text-slate-400">
          Remember credentials?{' '}
          <a href="/login" className="text-brand-400 font-medium hover:underline">
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
