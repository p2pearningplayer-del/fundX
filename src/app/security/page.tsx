'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, KeyRound, AlertTriangle, CheckCircle2, RefreshCw, Smartphone } from 'lucide-react';

export default function SecuritySettingsPage() {
  const [securityData, setSecurityData] = useState<any>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSecurity = async () => {
    try {
      const res = await fetch('/api/security');
      if (res.ok) {
        const data = await res.json();
        setSecurityData(data.securitySummary);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSecurity();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setSuccess('Password updated successfully. Bcrypt cost factor 12 hash committed.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchSecurity();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-800 text-brand-300 text-xs font-mono mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PRD SECTION 4 • ACCESS CONTROL & SESSION GUARD</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Security Settings</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Dual JWT token management, suspicious IP anomaly detection, and cryptographic access controls.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Security Status Cards */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-500">JWT AUTH SHIELD</span>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-400" />
            Dual Token Architecture
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Short-lived 15m access token + rotated 7d refresh token.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-500">LOGIN ANOMALY SHIELD</span>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-brand-400" />
            IP & Fingerprint Audit
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            All logins and IP alterations logged to security ledger.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-500">PII PROTECTION</span>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            AES-256 Vault
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Bank account strings encrypted at rest with zero plaintext exposure.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Update Password Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-brand-400" />
            <span>Update Account Password</span>
          </h3>
          <p className="text-xs text-slate-400">
            PRD Spec: Bcrypt hashed with cost factor 12 upon submission.
          </p>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl flex items-center space-x-2 text-xs text-red-300">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-center space-x-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter existing password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
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
                placeholder="Repeat new password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-glow-blue transition disabled:opacity-60"
            >
              {loading ? 'Re-hashing Credentials...' : 'Save New Password'}
            </button>
          </form>
        </div>

        {/* Security Audit Events */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Recent Security Audit Log</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              All logins and IP alterations logged to security ledger.
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {!securityData?.recentEvents || securityData.recentEvents.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono py-4 text-center">No security alerts recorded.</p>
              ) : (
                securityData.recentEvents.map((ev: any) => (
                  <div
                    key={ev.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-brand-400 font-bold">{ev.event_type}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(ev.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px]">IP: {ev.ip_address}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Last Known IP:</span>
            <strong className="text-white">{securityData?.lastLoginIp || '127.0.0.1'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
