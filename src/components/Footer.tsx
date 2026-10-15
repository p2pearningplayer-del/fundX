import React from 'react';
import { ShieldCheck, Lock, Cpu, Landmark, Terminal, Radio } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand & Architecture */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Fund<span className="text-brand-400">X</span> Panel
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Institutional fund-orchestration engine enforcing double-entry ledgering, crypto-fiat segregation,
              and AES-256 encrypted PII vaults for multi-tier commission disbursement.
            </p>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-md w-fit">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>TRON FullNode RPC Online • Block Synced</span>
            </div>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wider uppercase text-[11px]">Core Modules</h4>
            <ul className="space-y-2">
              <li><a href="/funds" className="hover:text-white transition">Fund Selection</a></li>
              <li><a href="/activation" className="hover:text-white transition">Activation Overview</a></li>
              <li><a href="/activation/gateway" className="hover:text-white transition">USDT TRC20 Gateway</a></li>
              <li><a href="/tasks" className="hover:text-white transition">Task Dashboard</a></li>
              <li><a href="/wallet" className="hover:text-white transition">Commission Wallet</a></li>
            </ul>
          </div>

          {/* Ledger & History */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wider uppercase text-[11px]">Ledger & Banking</h4>
            <ul className="space-y-2">
              <li><a href="/bank-accounts" className="hover:text-white transition">Account Management</a></li>
              <li><a href="/tasks/ledger" className="hover:text-white transition">Task Ledger History</a></li>
              <li><a href="/wallet/records" className="hover:text-white transition">Commission Records</a></li>
              <li><a href="/withdraw" className="hover:text-white transition">Withdrawal Gateway</a></li>
              <li><a href="/withdraw/history" className="hover:text-white transition">Withdrawal Log</a></li>
            </ul>
          </div>

          {/* Governance & Trust */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wider uppercase text-[11px]">Compliance & Support</h4>
            <ul className="space-y-2">
              <li><a href="/security" className="hover:text-white transition">Security Settings</a></li>
              <li><a href="/terms" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="/privacy" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="/risk-disclosure" className="hover:text-white transition">Risk Disclosure</a></li>
              <li><a href="/support" className="hover:text-white transition">24/7 Support Desk</a></li>
            </ul>
          </div>
        </div>

        {/* Technical Badges Banner */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Lock className="w-3.5 h-3.5 text-brand-400" /> AES-256 PII Vault
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Landmark className="w-3.5 h-3.5 text-brand-400" /> RBI IFSC Standard RegEx
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-brand-400" /> Contract: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-brand-400" /> PostgreSQL ACID Ledger
            </span>
          </div>

          <div>
            © {new Date().getFullYear()} FundX Panel. All rights reserved. PRD v1.0 Enterprise Baseline.
          </div>
        </div>
      </div>
    </footer>
  );
}
