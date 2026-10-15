'use client';

import React, { useEffect, useState } from 'react';
import { User, ShieldCheck, Copy, CheckCircle2, Tag, Calendar, Phone, Mail, Globe } from 'lucide-react';

export default function UserProfileCenterPage() {
  const [profile, setProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setProfile(data.user))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCopyReferral = () => {
    if (!profile?.referralCode) return;
    const url = `${window.location.origin}/register?ref=${profile.referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!profile && !loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        Please sign in to inspect your user profile center.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-800 text-brand-300 text-xs font-mono mb-2">
          <User className="w-3.5 h-3.5" />
          <span>PRD INVENTORY SCREEN 18 • USER PROFILE CENTER</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">User Profile Center</h1>
        <p className="text-xs text-slate-400">
          Account identity, immutable database UID, KYC binding records, and affiliate tracking.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold text-xl border border-brand-500/30">
              {profile?.legalName?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{profile?.legalName}</h2>
              <span className="text-xs font-mono text-slate-400">@{profile?.username}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-center">
            <span className="text-xs font-mono bg-brand-950 text-brand-300 border border-brand-800 px-3 py-1 rounded-full font-bold">
              ROLE: {profile?.role}
            </span>
            {profile?.isSuspended ? (
              <span className="text-xs font-mono bg-red-950 text-red-400 border border-red-800 px-3 py-1 rounded-full font-bold">
                FROZEN
              </span>
            ) : (
              <span className="text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full font-bold">
                ACTIVE
              </span>
            )}
          </div>
        </div>

        {/* Identity Grid */}
        <div className="grid sm:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-400" />
              Immutable Global UUID:
            </span>
            <span className="text-white font-bold break-all select-all">{profile?.id}</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-400" />
              Primary Mobile Credential:
            </span>
            <span className="text-white font-bold">{profile?.mobile}</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-400" />
              Email Address:
            </span>
            <span className="text-white font-bold">{profile?.email || 'Not configured'}</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-400" />
              Registration Date:
            </span>
            <span className="text-white font-bold">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
            </span>
          </div>
        </div>

        {/* Affiliate Association Section */}
        <div className="p-5 bg-gradient-to-r from-brand-950/40 to-slate-950 rounded-xl border border-brand-800/40 space-y-3">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-brand-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Affiliate Tracking & Referral Code
            </h4>
          </div>
          <p className="text-xs text-slate-300">
            Share your institutional invite link to track downstream activations.
          </p>
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-xs font-mono text-brand-300 font-bold tracking-widest">
              {profile?.referralCode}
            </span>
            <button
              onClick={handleCopyReferral}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-semibold flex items-center space-x-1"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied Link</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Invite Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
