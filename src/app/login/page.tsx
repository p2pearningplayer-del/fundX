'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier || !password) {
      setError('Please provide your Username/Mobile and Password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setSuccess(true);
      setTimeout(() => {
        if (data.user.role === 'SUPERADMIN' || data.user.role === 'FINANCE') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }, 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (userType: 'superadmin' | 'user') => {
    if (userType === 'superadmin') {
      setIdentifier('fundx_superadmin');
      setPassword('FundX#AdminSecure2026!');
    } else {
      setIdentifier('rajesh_fundx');
      setPassword('FundX#AdminSecure2026!');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-brand-600/30 text-brand-400 mx-auto flex items-center justify-center border border-brand-500/40">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            FundX Institutional Portal
          </h2>
          <p className="text-xs text-slate-400">
            Dual JWT session guard & suspicious login shield active.
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
            <span>Authenticated. Launching presentation viewport...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Username or Mobile Number
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="fundx_superadmin or 9812345678"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-300">
                Password
              </label>
              <a href="/forgot-password" className="text-xs text-brand-400 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl shadow-glow-blue transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {loading ? (
              <span>Verifying Session Signature...</span>
            ) : (
              <>
                <span>Sign In to Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Seed Credential Fillers for Demonstration */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <p className="text-[11px] text-slate-500 font-mono text-center uppercase tracking-wider">
            Quick Auto-Fill (PRD Seed Credentials)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('superadmin')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-[11px] font-mono text-slate-300 hover:text-white hover:border-purple-500 transition text-center"
            >
              Superadmin Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('user')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-[11px] font-mono text-slate-300 hover:text-white hover:border-brand-500 transition text-center"
            >
              Investor User Demo
            </button>
          </div>
        </div>

        <div className="text-center pt-2 text-xs text-slate-400">
          Need an account?{' '}
          <a href="/register" className="text-brand-400 font-medium hover:underline">
            Register without OTP
          </a>
        </div>
      </div>
    </div>
  );
}
