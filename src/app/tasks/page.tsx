'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Zap,
  Play,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import DemoWatermark from '@/components/DemoWatermark';

function TaskDashboardContent() {
  const searchParams = useSearchParams();
  const fundIdParam = searchParams.get('fundId');

  const [mode, setMode] = useState<'GENUINE' | 'DEMO'>('GENUINE');
  const [funds, setFunds] = useState<any[]>([]);
  const [selectedFundId, setSelectedFundId] = useState<string>('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [demoTasks, setDemoTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [fRes, tRes, dtRes] = await Promise.all([
        fetch('/api/funds'),
        fetch(`/api/tasks${selectedFundId ? `?fundId=${selectedFundId}` : ''}`),
        fetch('/api/tasks/demo'),
      ]);

      if (fRes.ok) {
        const fData = await fRes.json();
        setFunds(fData.funds || []);
        if (!selectedFundId && fData.funds?.length > 0) {
          setSelectedFundId(fundIdParam || fData.funds[0].id);
        }
      }
      if (tRes.ok) {
        const tData = await tRes.json();
        setTasks(tData.tasks || []);
      }
      if (dtRes.ok) {
        const dtData = await dtRes.json();
        setDemoTasks(dtData.demoTasks || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedFundId]);

  const handleGenerateTask = async () => {
    setError(null);
    setMessage(null);
    setGenerating(true);

    try {
      if (mode === 'GENUINE') {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'GENERATE', fundId: selectedFundId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate genuine task');

        setMessage(`Genuine task ${data.task.task_code} allocated successfully.`);
        loadData();
      } else {
        const res = await fetch('/api/tasks/demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'GENERATE', fundId: selectedFundId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate demo task');

        setMessage(`Simulated DEMO task allocated. (Zero financial balance impact).`);
        loadData();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Task allocation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    setError(null);
    setMessage(null);
    setCompletingId(taskId);

    try {
      if (mode === 'GENUINE') {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'COMPLETE', taskId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Task completion failed');

        setMessage(data.message);
        loadData();
      } else {
        const res = await fetch('/api/tasks/demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'COMPLETE', taskId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Demo task completion failed');

        setMessage(data.message);
        loadData();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Execution error');
    } finally {
      setCompletingId(null);
    }
  };

  const activeFund = funds.find((f) => f.id === selectedFundId);
  const isFundActive = activeFund?.status === 'ACTIVE';

  const displayedTasks = mode === 'GENUINE' ? tasks : demoTasks;

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 ${mode === 'DEMO' ? 'demo-watermark-bg' : ''}`}>
      {/* Top Header & Dual Mode Switch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-800 text-brand-300 text-xs font-mono mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>PRD SECTION 7 • DUAL TASK ARCHITECTURE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Transaction Task Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Execute clearing orders to earn commission calculated as: Eligible_Task_Quantum × Configured_Fund_Rate.
          </p>
        </div>

        {/* Dual Mode Switcher */}
        <div className="flex items-center p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setMode('GENUINE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              mode === 'GENUINE'
                ? 'bg-brand-600 text-white shadow-glow-blue'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Genuine Tasks (Real Commission)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('DEMO')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              mode === 'DEMO'
                ? 'bg-amber-600 text-white shadow-glow-gold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>DEMO Simulation Mode</span>
          </button>
        </div>
      </div>

      {mode === 'DEMO' && <DemoWatermark />}

      {/* Fund Tier Selector Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        {funds.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFundId(f.id)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition ${
              selectedFundId === f.id
                ? 'bg-slate-800 border-brand-500 text-white shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>{f.name}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-brand-400 border border-slate-800">
              {f.baseRateDisplay}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                f.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-slate-600'
              }`}
            />
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl flex items-center justify-between text-xs text-red-300">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
          {!isFundActive && mode === 'GENUINE' && (
            <a
              href={`/activation/gateway?fundId=${selectedFundId}`}
              className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white font-semibold rounded-lg"
            >
              Activate Fund
            </a>
          )}
        </div>
      )}

      {message && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl flex items-center space-x-2 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Task Allocation Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>
              {mode === 'GENUINE' ? 'Allocate Next Genuine Task' : 'Generate Simulated Demo Task'}
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            {mode === 'GENUINE'
              ? `Range: ₹${activeFund?.minTaskAmount.toLocaleString('en-IN')} – ₹${activeFund?.maxTaskAmount.toLocaleString('en-IN')} at ${activeFund?.baseRateDisplay} rate.`
              : 'Test task execution safely with simulated balance isolation.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateTask}
          disabled={generating}
          className={`px-5 py-2.5 rounded-xl text-white font-semibold text-xs flex items-center space-x-2 transition ${
            mode === 'GENUINE'
              ? 'bg-brand-600 hover:bg-brand-500 shadow-glow-blue'
              : 'bg-amber-600 hover:bg-amber-500 shadow-glow-gold'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>{generating ? 'Allocating...' : 'Generate Task'}</span>
        </button>
      </div>

      {/* Tasks Queue Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center justify-between">
          <span>Active & Historical Tasks Queue</span>
          <span className="text-xs font-mono text-slate-400">{displayedTasks.length} Records</span>
        </h3>

        {displayedTasks.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs font-mono space-y-2">
            <p>No tasks currently in queue for this fund tier.</p>
            <p className="text-slate-600">Click &quot;Generate Task&quot; above to allocate a transaction task.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {displayedTasks.map((t) => {
              const isCompleted = t.status === 'COMPLETED';
              const isExecuting = completingId === t.id;

              return (
                <div
                  key={t.id}
                  className={`bg-slate-900 border rounded-2xl p-6 flex flex-col justify-between space-y-4 ${
                    isCompleted
                      ? 'border-slate-800/80 opacity-80'
                      : 'border-brand-500/40 glow-card shadow-lg'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-brand-400">{t.task_code}</span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                          isCompleted
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : 'bg-blue-950 text-blue-400 border-blue-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">{t.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>

                    {/* Quantum & Formula breakdown */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-400">
                        <span>Eligible Quantum:</span>
                        <strong className="text-white">₹{t.quantum_amount.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Configured Rate:</span>
                        <strong className="text-brand-400">{(t.configured_rate * 100).toFixed(1)}%</strong>
                      </div>
                      <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1">
                        <span>Expected Commission:</span>
                        <strong className="text-emerald-400">
                          ₹{t.commission_amount.toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div>
                    {!isCompleted ? (
                      <button
                        type="button"
                        onClick={() => handleCompleteTask(t.id)}
                        disabled={isExecuting}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition shadow-glow-emerald disabled:opacity-60"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {isExecuting
                            ? 'Executing Switch Clearance & Disbursing...'
                            : `Complete Task & Claim ₹${t.commission_amount.toLocaleString('en-IN')}`}
                        </span>
                      </button>
                    ) : (
                      <div className="text-center py-2 bg-slate-950/60 rounded-xl text-emerald-400 font-mono text-xs border border-emerald-900/40">
                        ✓ Completed & Disbursed to Ledger
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TaskDashboardPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-slate-400 font-mono text-xs">Loading Task Engine Console...</div>}>
      <TaskDashboardContent />
    </Suspense>
  );
}
