'use client';

import React, { useEffect, useState } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

export default function PwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-900 border border-brand-500/40 rounded-xl p-4 shadow-2xl z-50 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-brand-600/30 text-brand-400 flex items-center justify-center">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">Install FundX Android / PWA</p>
          <p className="text-[11px] text-slate-400">Native presentation viewport with zero state divergence.</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="p-1.5 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
