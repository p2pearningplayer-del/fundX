'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, User, Phone, Lock, Tag, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    legalName: '',
    username: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.legalName || !formData.username || !formData.mobile || !formData.password) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-brand-600/30 text-brand-400 mx-auto flex items-center justify-center border border-brand-500/40">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Initialize Institutional Account
          </h2>
          <p className="text-xs text-slate-400">
            PRD Section 4: Frictionless onboarding without upfront OTP barrier.
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
            <span>Registration verified. Redirecting to workspace...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Legal Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Full Legal Name <span className="text-red-400">*</span> (Matches Payout KYC)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                name="legalName"
                value={formData.legalName}
                onChange={handleChange}
                placeholder="e.g. Rajesh Kumar Verma"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>

          {/* Unique Username */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Unique Username <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="text-xs text-slate-500 absolute left-3 top-2.5 font-mono">@</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="alphanumeric_slug"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 font-mono"
                required
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Mobile Number <span className="text-red-400">*</span> (Primary Credential)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>

          {/* Email Address (Optional) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email Address (Optional)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="compliance@enterprise.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 chars"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Confirm <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat pass"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Referral Code (Optional) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Referral Code (Optional)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                placeholder="Optional invite code"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl shadow-glow-blue transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {loading ? (
              <span>Signing Encrypted Credentials...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          Already have an account?{' '}
          <a href="/login" className="text-brand-400 font-medium hover:underline">
            Sign In here
          </a>
        </div>
      </div>
    </div>
  );
}
