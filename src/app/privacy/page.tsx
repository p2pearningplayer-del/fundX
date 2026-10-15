'use client';

import React from 'react';
import { Lock, ShieldCheck, EyeOff, Server, Terminal } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-800 text-brand-300 text-xs font-mono">
          <Lock className="w-3.5 h-3.5" />
          <span>PRD INVENTORY SCREEN 21 • AES-256 PII VAULT</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Privacy Policy & PII Protection</h1>
        <p className="text-xs text-slate-400">PRD Section 5 Cryptographic Vault Architecture • Zero PII Exposure</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-xs text-slate-300 leading-relaxed font-sans shadow-xl">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-brand-400">
            1. Zero Plaintext Exposure Policy
          </h2>
          <p>
            FundX Panel enforces a strict Zero Plaintext Exposure security protocol. Sensitive Personally Identifiable
            Information (PII)—including domestic bank account numbers, account holder legal strings, and routing details—are
            never stored, transmitted, or logged in unencrypted plaintext.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-brand-400">
            2. AES-256-GCM Vault Architecture
          </h2>
          <p>
            All banking records stored in persistence are encrypted utilizing AES-256 in Galois/Counter Mode (GCM),
            generating an authenticated ciphertext with dedicated 96-bit initialization vectors (IVs) and 128-bit authentication
            tags. Key derivation occurs through secure system environment keys inaccessible to presentation layers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-brand-400">
            3. User Interface Data Masking
          </h2>
          <p>
            Client applications (web, PWA, and Android TWA viewports) receive only masked identifiers formatted as
            <code className="bg-slate-950 px-1.5 py-0.5 rounded text-white font-mono">XXXX-XXXX-1234</code>.
            At no point does the browser runtime or mobile viewport possess the cryptographic capability to decrypt raw banking identifiers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-brand-400">
            4. Session Auditing & Anomaly Shield
          </h2>
          <p>
            IP alterations, session rotations, and device fingerprints are audited and committed to security logs.
            Access to encrypted payloads requires multi-factor elevated administrative credentials and produces a non-repudiable
            HMAC-SHA256 signature in the compliance ledger.
          </p>
        </section>
      </div>
    </div>
  );
}
