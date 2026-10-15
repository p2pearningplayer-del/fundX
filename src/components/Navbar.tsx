'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/navigation';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Layers,
  CheckCircle2,
  Wallet,
  ArrowDownToLine,
  Building2,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Activity,
  SlidersHorizontal,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        const unread = data.notifications.filter((n: any) => !n.is_read);
        setUnreadCount(unread.length);
        setNotifications(data.notifications.slice(0, 5));
      }
    } catch {}
  };

  useEffect(() => {
    fetchSession();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, [pathname]);

  const handleLogout = () => {
    document.cookie = 'fundx_access_token=; Max-Age=0; path=/;';
    setCurrentUser(null);
    router.push('/login');
  };

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: Activity },
    { label: 'Funds', href: '/funds', icon: Layers },
    { label: 'Tasks', href: '/tasks', icon: CheckCircle2 },
    { label: 'Wallet', href: '/wallet', icon: Wallet },
    { label: 'Bank Binding', href: '/bank-accounts', icon: Building2 },
    { label: 'Withdraw', href: '/withdraw', icon: ArrowDownToLine },
  ];

  return (
    <nav className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-glow-blue">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  Fund<span className="text-brand-400">X</span>
                  <span className="text-[10px] uppercase tracking-wider bg-brand-950 text-brand-300 px-1.5 py-0.5 rounded border border-brand-800 font-mono">
                    PRO
                  </span>
                </span>
                <span className="text-[9px] text-slate-400 font-mono -mt-1">INSTITUTIONAL ORCHESTRATION</span>
              </div>
            </a>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                    isActive
                      ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </a>
              );
            })}

            {/* Admin Link if Superadmin or Finance */}
            {currentUser && (currentUser.role === 'SUPERADMIN' || currentUser.role === 'FINANCE') && (
              <a
                href="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                  pathname.startsWith('/admin')
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                    : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Admin Console</span>
              </a>
            )}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-2">
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 relative transition-colors"
                    title="In-App Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown menu */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-xs font-semibold uppercase text-slate-400">Notifications</span>
                        <a href="/notifications" className="text-xs text-brand-400 hover:underline">
                          View All
                        </a>
                      </div>
                      <div className="divide-y divide-slate-800/60 max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-500 py-3 text-center">No recent alerts</p>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className="py-2">
                              <p className="text-xs font-medium text-slate-200">{n.title}</p>
                              <p className="text-[11px] text-slate-400 line-clamp-2">{n.message}</p>
                              <span className="text-[9px] text-slate-500 font-mono">
                                {new Date(n.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Link */}
                <a
                  href="/profile"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-brand-400" />
                  <span className="text-xs font-medium text-slate-200">{currentUser.username}</span>
                  {currentUser.role === 'SUPERADMIN' && (
                    <span className="text-[9px] bg-red-950 text-red-400 px-1 py-0.2 rounded border border-red-800 font-bold">
                      ROOT
                    </span>
                  )}
                </a>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <a
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-glow-blue transition-all"
                >
                  Get Started
                </a>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center space-x-2">
            {currentUser && (
              <a href="/notifications" className="p-2 text-slate-400 hover:text-white relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </a>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/98 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
            >
              {item.label}
            </a>
          ))}

          {currentUser && (currentUser.role === 'SUPERADMIN' || currentUser.role === 'FINANCE') && (
            <a
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-purple-300 hover:bg-purple-950/40"
            >
              Admin Console
            </a>
          )}

          <div className="pt-4 border-t border-slate-800 flex flex-col space-y-2">
            {currentUser ? (
              <>
                <a
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 flex items-center space-x-2"
                >
                  <UserIcon className="w-4 h-4 text-brand-400" />
                  <span>Profile ({currentUser.username})</span>
                </a>
                <button
                  onClick={handleLogout}
                  className="text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-slate-800 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <a
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-lg text-slate-200 bg-slate-800 font-medium"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-lg text-white bg-brand-600 font-semibold shadow-glow-blue"
                >
                  Get Started
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
