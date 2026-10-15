'use client';

import React, { useEffect, useState } from 'react';
import {
  SlidersHorizontal,
  Layers,
  QrCode,
  ArrowDownToLine,
  BarChart3,
  Users,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Lock,
  Download,
  Terminal,
} from 'lucide-react';

export default function AdminConsolePage() {
  const [tab, setTab] = useState<'funds' | 'txid' | 'disbursements' | 'reconciliation' | 'users' | 'audit'>('funds');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Data states
  const [funds, setFunds] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Action states
  const [utrModal, setUtrModal] = useState<{ id: string; code: string; amount: number } | null>(null);
  const [utrInput, setUtrInput] = useState('');
  const [rollbackModal, setRollbackModal] = useState<{ id: string; code: string; amount: number } | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');
  const [suspendModal, setSuspendModal] = useState<{ id: string; username: string } | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  // Fund Edit modal
  const [editingFund, setEditingFund] = useState<any>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, fRes, qRes, dRes, rRes, usRes, aRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/admin/funds'),
        fetch('/api/admin/txid-queue'),
        fetch('/api/admin/disbursements'),
        fetch('/api/admin/reconciliation'),
        fetch('/api/admin/users'),
        fetch('/api/admin/audit-logs'),
      ]);

      if (uRes.ok) {
        const u = await uRes.json();
        setCurrentUser(u.user);
      }
      if (fRes.ok) {
        const fd = await fRes.json();
        setFunds(fd.funds || []);
      }
      if (qRes.ok) {
        const qd = await qRes.json();
        setOrders(qd.orders || []);
      }
      if (dRes.ok) {
        const dd = await dRes.json();
        setWithdrawals(dd.withdrawals || []);
      }
      if (rRes.ok) {
        const rd = await rRes.json();
        setReconciliation(rd.reconciliation);
      }
      if (usRes.ok) {
        const ud = await usRes.json();
        setUsersList(ud.users || []);
      }
      if (aRes.ok) {
        const ad = await aRes.json();
        setAuditLogs(ad.auditLogs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // TXID Approval
  const handleTxidDecision = async (orderId: string, decision: 'APPROVE' | 'REJECT') => {
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/txid-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, decision }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      setMessage(data.message);
      loadAllAdminData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error in TXID decision');
    }
  };

  // Settle Payout with UTR
  const handleSettlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrModal || !utrInput.trim()) return;
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/disbursements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DISBURSE',
          withdrawalId: utrModal.id,
          utrHash: utrInput.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Disbursement failed');
      setMessage(data.message);
      setUtrModal(null);
      setUtrInput('');
      loadAllAdminData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error settling payout');
    }
  };

  // Compensating Rollback
  const handleRollbackPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollbackModal || !rollbackReason.trim()) return;
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/disbursements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ROLLBACK',
          withdrawalId: rollbackModal.id,
          reason: rollbackReason.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rollback failed');
      setMessage(data.message);
      setRollbackModal(null);
      setRollbackReason('');
      loadAllAdminData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error executing rollback');
    }
  };

  // User Suspension
  const handleUserSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendModal || !suspensionReason.trim()) return;
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: suspendModal.id,
          action: 'SUSPEND',
          reason: suspensionReason.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Suspension failed');
      setMessage(data.message);
      setSuspendModal(null);
      setSuspensionReason('');
      loadAllAdminData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error suspending account');
    }
  };

  const handleUserUnsuspend = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'UNSUSPEND' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
      loadAllAdminData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error lifting suspension');
    }
  };

  // Fund Configuration Update
  const handleUpdateFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFund) return;
    try {
      const res = await fetch('/api/admin/funds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fundId: editingFund.id,
          activationFeePercent: editingFund.activation_fee_percent,
          baseRate: editingFund.base_rate,
          minTaskAmount: editingFund.min_task_amount,
          maxTaskAmount: editingFund.max_task_amount,
          baselineValuation: editingFund.baseline_valuation,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage('Fund configuration committed & signed to audit ledger.');
      setEditingFund(null);
      loadAllAdminData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating fund');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950 border border-purple-800 text-purple-300 text-xs font-mono mb-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>PRD SECTION 10 • ZERO-TRUST ADMINISTRATIVE CONSOLE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Administrative Command Center</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Granular RBAC controls: Live fund toggling, TXID verification queue, disbursement desk with UTR tagging, and non-repudiable audit logs.
          </p>
        </div>

        <button
          onClick={loadAllAdminData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync State</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl flex items-center space-x-3 text-xs text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl flex items-center space-x-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Admin Module Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
        {[
          { key: 'funds', label: 'Fund Configuration', icon: Layers },
          { key: 'txid', label: 'TRC20 TXID Queue', icon: QrCode, badge: orders.filter((o) => o.status === 'PENDING_PAYMENT' || o.status === 'UNDER_REVIEW').length },
          { key: 'disbursements', label: 'Disbursement Desk', icon: ArrowDownToLine, badge: withdrawals.filter((w) => w.status === 'RESERVED').length },
          { key: 'reconciliation', label: 'Multi-Currency Recon', icon: BarChart3 },
          { key: 'users', label: 'User Suspension & KYC', icon: Users },
          { key: 'audit', label: 'Immutable Audit Trail', icon: Terminal },
        ].map((tabItem) => {
          const Icon = tabItem.icon;
          const isActive = tab === tabItem.key;
          return (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
                isActive
                  ? 'bg-purple-600 text-white shadow-glow-blue'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tabItem.label}</span>
              {Boolean(tabItem.badge) && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-bold">
                  {tabItem.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Fund Configuration */}
      {tab === 'funds' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Live Fund Parameters & Base Quantum</h3>
            <span className="text-xs text-slate-400 font-mono">Signed with HMAC-SHA256 signature</span>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {funds.map((f) => (
              <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-white">{f.name}</h4>
                  <span className="text-xs font-mono font-bold text-brand-400">
                    {(f.base_rate * 100).toFixed(1)}% Base
                  </span>
                </div>

                <div className="space-y-2 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Activation Fee:</span>
                    <strong className="text-white">{f.activation_fee_percent}%</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Baseline Valuation:</span>
                    <strong className="text-brand-300">₹{f.baseline_valuation.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Task Min / Max:</span>
                    <strong className="text-emerald-400">
                      ₹{f.min_task_amount.toLocaleString('en-IN')} – ₹{f.max_task_amount.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Status:</span>
                    <span className={f.is_active ? 'text-emerald-400' : 'text-red-400'}>
                      {f.is_active ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setEditingFund({ ...f })}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
                >
                  Configure Parameters
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: TRC20 TXID Queue */}
      {tab === 'txid' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">TRC20 Activation Orders Queue</h3>
            <span className="text-xs font-mono text-slate-400">{orders.length} Total Orders</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Order Code</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Fund Tier</th>
                    <th className="p-4">USDT Quantum</th>
                    <th className="p-4">TXID Hash</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 text-white font-bold">{o.order_code}</td>
                      <td className="p-4">
                        <span className="text-white block">{o.userLegalName || o.username}</span>
                        <span className="text-slate-500 text-[10px]">@{o.username}</span>
                      </td>
                      <td className="p-4 text-brand-400">{o.fundName}</td>
                      <td className="p-4 text-white font-bold">{o.usdt_amount} USDT</td>
                      <td className="p-4">
                        {o.txid_hash ? (
                          <span className="text-emerald-400 truncate max-w-[120px] block" title={o.txid_hash}>
                            {o.txid_hash.substring(0, 12)}...
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">No hash yet</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            o.status === 'ACTIVE'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : o.status === 'REJECTED'
                              ? 'bg-red-950 text-red-400 border-red-800'
                              : 'bg-amber-950 text-amber-400 border-amber-800'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {o.status !== 'ACTIVE' && o.status !== 'REJECTED' && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleTxidDecision(o.id, 'APPROVE')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleTxidDecision(o.id, 'REJECT')}
                              className="px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white rounded text-[11px] font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Disbursement Desk */}
      {tab === 'disbursements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Disbursement Desk & UTR Settlement</h3>
            <span className="text-xs text-slate-400 font-mono">Settlement requires verified UTR</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Code</th>
                    <th className="p-4">Beneficiary</th>
                    <th className="p-4">Bank Details</th>
                    <th className="p-4">Quantum</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">UTR / Note</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 text-white font-bold">{w.withdrawal_code}</td>
                      <td className="p-4">
                        <span className="text-white block">{w.userLegalName || w.username}</span>
                        <span className="text-slate-500 text-[10px]">@{w.username}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-white block">{w.bankName}</span>
                        <span className="text-slate-500 text-[10px]">{w.accountNumberMasked} • {w.ifscCode}</span>
                      </td>
                      <td className="p-4 text-emerald-400 font-bold">₹{w.amount.toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            w.status === 'PAID'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : w.status === 'RESERVED'
                              ? 'bg-purple-950 text-purple-400 border-purple-800'
                              : 'bg-amber-950 text-amber-400 border-amber-800'
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {w.payout_utr_hash ? (
                          <span className="text-emerald-400 block truncate max-w-[120px]">{w.payout_utr_hash}</span>
                        ) : w.incident_note ? (
                          <span className="text-amber-400 block">{w.incident_note}</span>
                        ) : (
                          <span className="text-slate-500 italic">Awaiting Switch</span>
                        )}
                      </td>
                      <td className="p-4">
                        {w.status === 'RESERVED' && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setUtrModal({ id: w.id, code: w.withdrawal_code, amount: w.amount })}
                              className="px-2.5 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded text-[11px] font-bold"
                            >
                              Tag UTR & Pay
                            </button>
                            <button
                              onClick={() => setRollbackModal({ id: w.id, code: w.withdrawal_code, amount: w.amount })}
                              className="px-2.5 py-1 bg-amber-800 hover:bg-amber-700 text-white rounded text-[11px] font-bold"
                            >
                              Rollback
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Multi-Currency Reconciliation */}
      {tab === 'reconciliation' && reconciliation && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-4 gap-6 font-mono">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">TOTAL USDT INFLOWS</span>
              <div className="text-2xl font-bold text-brand-400">
                {reconciliation.cryptoInflow.totalUSDT} USDT
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                ≈ ₹{reconciliation.cryptoInflow.fiatEquivalentINR.toLocaleString('en-IN')} INR
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">COMMISSIONS DISBURSED</span>
              <div className="text-2xl font-bold text-white">
                ₹{reconciliation.fiatLedger.totalCommissionsDisbursedINR.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Unspent ledger credits</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">RESERVED IN PIPELINE</span>
              <div className="text-2xl font-bold text-amber-400">
                ₹{reconciliation.fiatLedger.totalReservedInLimboINR.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Pending UTR settlement</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">NET PLATFORM FLOAT</span>
              <div className="text-2xl font-bold text-emerald-400">
                ₹{reconciliation.fiatLedger.netPlatformFloatINR.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Net liquidity solvency</p>
            </div>
          </div>

          {/* Breakdown per fund tier */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase font-mono">Fund-Specific Segregated Balances</h4>
            <div className="grid md:grid-cols-3 gap-6">
              {reconciliation.funds.map((rf: any) => (
                <div key={rf.fundId} className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
                  <div className="flex justify-between text-white font-bold">
                    <span>{rf.name}</span>
                    <span className="text-brand-400">{rf.baseRate}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Commissions:</span>
                    <strong className="text-white">₹{rf.totalCommissions.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Reserved Payouts:</span>
                    <strong className="text-amber-400">₹{rf.reservedPayouts.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Settled Payouts:</span>
                    <strong className="text-emerald-400">₹{rf.settledPayouts.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Users Suspension */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">User Accounts & Compliance Freeze Guard</h3>
            <span className="text-xs font-mono text-slate-400">{usersList.length} Accounts Registered</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Legal Name</th>
                    <th className="p-4">Username</th>
                    <th className="p-4">Mobile</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 text-white font-bold">{u.legalName}</td>
                      <td className="p-4 text-brand-400">@{u.username}</td>
                      <td className="p-4">{u.mobile}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.isSuspended ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">
                            FROZEN
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {u.role !== 'SUPERADMIN' && (
                          u.isSuspended ? (
                            <button
                              onClick={() => handleUserUnsuspend(u.id)}
                              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-[11px] font-bold"
                            >
                              Lift Freeze
                            </button>
                          ) : (
                            <button
                              onClick={() => setSuspendModal({ id: u.id, username: u.username })}
                              className="px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white rounded text-[11px] font-bold"
                            >
                              Freeze Account
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Immutable Audit Trail */}
      {tab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Immutable Administrative Audit Log</h3>
            <span className="text-xs text-slate-400 font-mono">Signed via HMAC-SHA256</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Action</th>
                    <th className="p-4">Admin UID</th>
                    <th className="p-4">Target</th>
                    <th className="p-4">IP Address</th>
                    <th className="p-4">Cryptographic Signature</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No admin actions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-4 text-brand-400 font-bold">{log.action}</td>
                        <td className="p-4 text-white">@{log.admin_username || 'admin'}</td>
                        <td className="p-4">{log.target_type} ({log.target_id?.substring(0, 8)})</td>
                        <td className="p-4 text-slate-400">{log.ip_address}</td>
                        <td className="p-4 text-purple-400 truncate max-w-[120px]" title={log.signature}>
                          {log.signature?.substring(0, 16)}...
                        </td>
                        <td className="p-4 text-slate-500 text-[11px]">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: UTR Disbursement */}
      {utrModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Settle Payout with UTR Hash
            </h3>
            <p className="text-xs text-slate-400">
              PRD Section 9: Payout settlement requires a cryptographically validated UTR hash to mark PAID.
            </p>
            <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs">
              <span className="text-slate-400 block">Withdrawal Code: {utrModal.code}</span>
              <strong className="text-emerald-400 text-sm">₹{utrModal.amount.toLocaleString('en-IN')}</strong>
            </div>
            <form onSubmit={handleSettlePayout} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Bank Settlement UTR Reference Number
                </label>
                <input
                  type="text"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  placeholder="e.g. UTR-2026-981245890"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 font-mono"
                  required
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setUtrModal(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-glow-blue"
                >
                  Commit Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Compensating Rollback */}
      {rollbackModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Compensating Rollback Trigger</h3>
            <p className="text-xs text-slate-400">
              PRD Section 9: Rolls back reserved funds via an audited compensating transaction crediting the user balance.
            </p>
            <form onSubmit={handleRollbackPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mandatory Incident Reason
                </label>
                <textarea
                  value={rollbackReason}
                  onChange={(e) => setRollbackReason(e.target.value)}
                  placeholder="Beneficiary IFSC mismatch or account frozen..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRollbackModal(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold"
                >
                  Execute Rollback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Suspend User */}
      {suspendModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Instant Account Freeze</h3>
            <p className="text-xs text-slate-400">
              PRD Section 10: Mandatory detailed incident note required for account suspension.
            </p>
            <form onSubmit={handleUserSuspend} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mandatory Incident Note for Freeze
                </label>
                <textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Suspicious multi-IP rapid request pattern..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSuspendModal(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-glow-blue"
                >
                  Freeze User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Fund Parameters */}
      {editingFund && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Configure {editingFund.name}</h3>
            <form onSubmit={handleUpdateFund} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Activation Fee %</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingFund.activation_fee_percent}
                  onChange={(e) => setEditingFund({ ...editingFund, activation_fee_percent: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Configured Base Rate (decimal, e.g. 0.09)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingFund.base_rate}
                  onChange={(e) => setEditingFund({ ...editingFund, base_rate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Baseline Valuation (INR)</label>
                <input
                  type="number"
                  value={editingFund.baseline_valuation}
                  onChange={(e) => setEditingFund({ ...editingFund, baseline_valuation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  required
                />
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFund(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold"
                >
                  Commit Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
