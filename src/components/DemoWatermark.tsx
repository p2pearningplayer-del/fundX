import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function DemoWatermark() {
  return (
    <div className="bg-amber-500/10 border-2 border-dashed border-amber-500/50 rounded-xl p-3 flex items-center justify-between my-4 select-none">
      <div className="flex items-center space-x-2 text-amber-400">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <span className="text-xs font-bold tracking-wider uppercase font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800 mr-2">
            SIMULATED DEMO MODE
          </span>
          <span className="text-xs text-amber-200">
            Partitioned environment for training and UI exploration. Zero impact on real financial ledger balances.
          </span>
        </div>
      </div>
    </div>
  );
}
