'use client';

import React, { useEffect, useState } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: string;
  onExpire?: () => void;
}

export default function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number; isExpired: boolean }>({
    minutes: 30,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const target = new Date(expiresAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0, isExpired: true });
        clearInterval(interval);
        if (onExpire) onExpire();
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ minutes, seconds, isExpired: false });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <div className="flex items-center space-x-2 text-red-400 bg-red-950/40 border border-red-800/60 px-3 py-1.5 rounded-lg text-xs font-mono">
        <AlertTriangle className="w-4 h-4 animate-bounce" />
        <span>ORDER EXPIRED (30-MIN LIMIT EXCEEDED)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-brand-300 bg-brand-950/40 border border-brand-800/60 px-3 py-1.5 rounded-lg text-xs font-mono">
      <Timer className="w-4 h-4 text-brand-400 animate-spin" style={{ animationDuration: '6s' }} />
      <span>
        WINDOW EXPIRES IN:{' '}
        <strong className="text-white">
          {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </strong>
      </span>
    </div>
  );
}
