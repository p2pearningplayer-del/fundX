<?php
/**
 * ==============================================================================
 * FundX Panel — Institutional Fund-Orchestration, Transaction Tasks & Multi-Ledger Commission Platform
 * PRD v1.0 Production Implementation (100% Native PHP & MySQL — Zero Node.js Requirement)
 * Target Domain: https://fundxx.in/
 * Target Database: u591469534_fund
 * ==============================================================================
 */

require_once __DIR__ . '/config.php';
$pdo = getDBConnection();
ensureDatabaseSchema($pdo);
?>
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>FundX Panel — Institutional Commission & Fund Orchestration</title>
    
    <!-- PWA, Favicon & Mobile Metadata -->
    <meta name="theme-color" content="#090d16">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="icon" type="image/svg+xml" href="/public/favicon.svg">
    <link rel="shortcut icon" href="/public/favicon.svg">
    <link rel="manifest" href="/public/manifest.json">
    
    <!-- Modern Tailwind CSS & Lucide Icons CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        brand: {
                            50: '#eff6ff',
                            500: '#3b82f6',
                            600: '#2563eb',
                            700: '#1d4ed8',
                            900: '#1e3a8a',
                        },
                        darkbg: '#090d16',
                        cardbg: '#111827',
                        cardborder: '#1f2937'
                    }
                }
            }
        }
    </script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- QRCode.js Library for TRC20 Wallet QRs -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

    <style>
        body {
            background-color: #090d16;
            color: #f3f4f6;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            -webkit-tap-highlight-color: transparent;
        }
        .demo-watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-25deg);
            font-size: 5rem;
            font-weight: 900;
            color: rgba(239, 68, 68, 0.12);
            pointer-events: none;
            user-select: none;
            z-index: 10;
        }
        .glass-nav {
            background: rgba(17, 24, 39, 0.85);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid #1f2937;
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="min-h-screen flex flex-col justify-between">

    <!-- Global App Top Navigation Bar -->
    <header class="glass-nav sticky top-0 z-50 px-4 py-3">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex items-center space-x-3 cursor-pointer" onclick="navigateTo('dashboard')">
                <!-- High-definition SVG Logo Mark -->
                <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-600/30 to-purple-600/20 border border-blue-500/40 flex items-center justify-center p-1 shadow-lg shadow-blue-500/20">
                    <svg viewBox="0 0 100 100" fill="none" class="w-full h-full">
                        <defs>
                            <linearGradient id="navGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#38bdf8" />
                                <stop offset="50%" stop-color="#3b82f6" />
                                <stop offset="100%" stop-color="#8b5cf6" />
                            </linearGradient>
                            <linearGradient id="navX" x1="0%" y1="100%" x2="100%" y2="0%">
                                <stop offset="0%" stop-color="#06b6d4" />
                                <stop offset="100%" stop-color="#a855f7" />
                            </linearGradient>
                        </defs>
                        <path d="M50 8 L90 30 L90 70 L50 92 L10 70 L10 30 Z" stroke="url(#navGrad)" stroke-width="6" fill="#0b1329" />
                        <path d="M32 32 L68 68 M68 32 L32 68" stroke="url(#navX)" stroke-width="9" stroke-linecap="round" />
                        <circle cx="50" cy="50" r="5" fill="#38bdf8" />
                    </svg>
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-xl font-black tracking-tight text-white">Fund<span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">X</span></span>
                        <span class="text-[10px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono font-bold">PRO v1.0</span>
                    </div>
                    <p class="text-[10px] tracking-wider text-gray-400 uppercase font-semibold">Institutional Clearing</p>
                </div>
            </div>

            <!-- Header Actions / User Pill -->
            <div id="header-actions" class="flex items-center space-x-3">
                <!-- Dynamically populated via JS: Auth or Login/Register buttons -->
            </div>
        </div>
    </header>

    <!-- Main Dynamic View Container -->
    <main id="app-viewport" class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 mb-16">
        <!-- Views rendered here dynamically based on navigation state -->
        <div id="loading-spinner" class="py-24 text-center">
            <div class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p class="mt-4 text-sm text-gray-400">Initializing Secure FundX Session...</p>
        </div>
    </main>

    <!-- Mobile Bottom Navigation Bar (Logged in state) -->
    <nav id="mobile-nav" class="fixed bottom-0 left-0 right-0 glass-nav border-t border-gray-800 py-2 px-6 flex justify-around items-center z-40 hidden">
        <button onclick="navigateTo('dashboard')" class="flex flex-col items-center text-xs text-gray-400 hover:text-blue-400 nav-btn" data-target="dashboard">
            <i data-lucide="layout-dashboard" class="w-5 h-5 mb-1"></i>
            Dashboard
        </button>
        <button onclick="navigateTo('funds')" class="flex flex-col items-center text-xs text-gray-400 hover:text-blue-400 nav-btn" data-target="funds">
            <i data-lucide="layers" class="w-5 h-5 mb-1"></i>
            Funds
        </button>
        <button onclick="navigateTo('tasks')" class="flex flex-col items-center text-xs text-gray-400 hover:text-blue-400 nav-btn" data-target="tasks">
            <i data-lucide="check-square" class="w-5 h-5 mb-1"></i>
            Tasks
        </button>
        <button onclick="navigateTo('wallet')" class="flex flex-col items-center text-xs text-gray-400 hover:text-blue-400 nav-btn" data-target="wallet">
            <i data-lucide="wallet" class="w-5 h-5 mb-1"></i>
            Wallet
        </button>
        <button onclick="navigateTo('profile')" class="flex flex-col items-center text-xs text-gray-400 hover:text-blue-400 nav-btn" data-target="profile">
            <i data-lucide="user" class="w-5 h-5 mb-1"></i>
            Profile
        </button>
    </nav>

    <!-- Global Modal Notification Toast Container -->
    <div id="toast" class="fixed bottom-20 right-6 z-50 hidden max-w-sm w-full bg-gray-900 border border-gray-700 p-4 rounded-xl shadow-2xl flex items-center space-x-3 transition-all duration-300">
        <i id="toast-icon" data-lucide="info" class="w-6 h-6 text-blue-400"></i>
        <div class="flex-1">
            <p id="toast-message" class="text-sm font-medium text-white"></p>
        </div>
    </div>

    <!-- Global Fund Unlock Payment Modal -->
    <div id="fund-unlock-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <div class="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-left my-8">
            <button onclick="closeFundUnlockModal()" class="absolute top-5 right-5 p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
            <div id="fund-unlock-modal-content">
                <!-- Dynamically injected payment details -->
            </div>
        </div>
    </div>

    <!-- Application JavaScript Engine -->
    <script>
        // Global Application State
        const AppState = {
            user: null,
            funds: [],
            currentRoute: 'dashboard',
            activeOrder: null,
            timerInterval: null
        };

        // Utility: Toast notification
        function showToast(message, type = 'info') {
            const toast = document.getElementById('toast');
            const icon = document.getElementById('toast-icon');
            const msg = document.getElementById('toast-message');
            msg.innerText = message;
            
            toast.className = `fixed bottom-20 right-6 z-50 max-w-sm w-full bg-gray-900 border p-4 rounded-xl shadow-2xl flex items-center space-x-3 transition-all duration-300 ${
                type === 'error' ? 'border-red-500/50 text-red-400' :
                type === 'success' ? 'border-emerald-500/50 text-emerald-400' : 'border-blue-500/50 text-blue-400'
            }`;
            
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 4000);
            lucide.createIcons();
        }

        // Utility: Robust API Caller with JSON connection error protection
        async function apiCall(endpoint, method = 'GET', data = null) {
            const token = localStorage.getItem('fundx_token');
            const headers = { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const cleanEndpoint = endpoint.replace(/^\/+/, '');
            const url = `/api.php?endpoint=${encodeURIComponent(cleanEndpoint)}`;
            const opts = { method, headers };
            if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
                opts.body = JSON.stringify(data);
            }

            try {
                let res = await fetch(url, opts);

                // Auto-fallback to direct route /api/{cleanEndpoint} if rewrite issue
                if ((res.status === 404 || res.status === 500) && !url.includes('/api/')) {
                    try {
                        const fallbackRes = await fetch(`/api/${cleanEndpoint}`, opts);
                        if (fallbackRes.ok || [400, 401, 403, 409].includes(fallbackRes.status)) {
                            res = fallbackRes;
                        }
                    } catch (fbErr) {}
                }

                const rawText = await res.text();
                let json;
                try {
                    json = JSON.parse(rawText);
                } catch (parseErr) {
                    console.error("Non-JSON API Output:", rawText);
                    return {
                        success: false,
                        error: `API Server Warning (${res.status}): Server returned non-JSON response. Check network or database.`
                    };
                }

                if (res.status === 401 && cleanEndpoint !== 'auth/me' && cleanEndpoint !== 'me') {
                    localStorage.removeItem('fundx_token');
                    AppState.user = null;
                    navigateTo('login');
                }
                return json;
            } catch (err) {
                console.error("Network/API Connection Error:", err);
                return { success: false, error: err.message || 'Connection to FundX API failed.' };
            }
        }

        // Router & Navigation Engine
        async function navigateTo(view, params = {}, updateUrl = true) {
            AppState.currentRoute = view;
            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (updateUrl) {
                try {
                    const cleanPath = (view === 'dashboard' ? '/' : '/' + view);
                    if (window.location.pathname !== cleanPath) {
                        window.history.pushState(null, '', cleanPath);
                    }
                } catch (e) {}
            }

            const viewport = document.getElementById('app-viewport');
            renderHeader();

            // Special Admin Guard
            if (view === 'admin') {
                if (!AppState.user || (AppState.user.role !== 'SUPERADMIN' && AppState.user.role !== 'ADMIN')) {
                    viewport.innerHTML = renderAdminLoginView();
                    lucide.createIcons();
                    updateNavPills();
                    return;
                }
            } else {
                // Public & Standard Authentication guards
                const publicRoutes = ['login', 'register', 'forgot-password', 'terms', 'privacy', 'risk-disclosure'];
                if (!AppState.user && !publicRoutes.includes(view)) {
                    return navigateTo('login', {}, false);
                }
            }

            // Route matching
            switch (view) {
                case 'login':
                    viewport.innerHTML = renderLoginView();
                    break;
                case 'register':
                    viewport.innerHTML = renderRegisterView();
                    break;
                case 'dashboard':
                    viewport.innerHTML = await renderDashboardView();
                    break;
                case 'funds':
                    viewport.innerHTML = await renderFundsView();
                    break;
                case 'activation-gateway':
                    viewport.innerHTML = renderActivationGatewayView(params);
                    initQRCode(params.qr_payload);
                    startCountdownTimer(params.expires_in_seconds || 1800);
                    break;
                case 'tasks':
                    viewport.innerHTML = await renderTasksView(params.fund_id);
                    break;
                case 'bank-accounts':
                    viewport.innerHTML = await renderBankView();
                    break;
                case 'withdraw':
                    viewport.innerHTML = await renderWithdrawView();
                    break;
                case 'withdraw-history':
                    viewport.innerHTML = await renderWithdrawHistoryView();
                    break;
                case 'wallet':
                    viewport.innerHTML = await renderWalletView();
                    break;
                case 'profile':
                    viewport.innerHTML = renderProfileView();
                    break;
                case 'support':
                    viewport.innerHTML = await renderSupportView();
                    break;
                case 'admin':
                    viewport.innerHTML = await renderAdminView();
                    break;
                case 'terms':
                    viewport.innerHTML = renderTermsView();
                    break;
                case 'privacy':
                    viewport.innerHTML = renderPrivacyView();
                    break;
                case 'risk-disclosure':
                    viewport.innerHTML = renderRiskView();
                    break;
                default:
                    viewport.innerHTML = await renderDashboardView();
            }

            lucide.createIcons();
            updateNavPills();
        }

        function updateNavPills() {
            document.querySelectorAll('.nav-btn').forEach(btn => {
                const target = btn.getAttribute('data-target');
                if (target === AppState.currentRoute) {
                    btn.classList.add('text-blue-500');
                    btn.classList.remove('text-gray-400');
                } else {
                    btn.classList.remove('text-blue-500');
                    btn.classList.add('text-gray-400');
                }
            });
        }

        function renderHeader() {
            const container = document.getElementById('header-actions');
            const mobileNav = document.getElementById('mobile-nav');
            if (AppState.user) {
                mobileNav.classList.remove('hidden');
                container.innerHTML = `
                    <div class="flex items-center space-x-3">
                        ${AppState.user.role === 'SUPERADMIN' ? `
                            <button onclick="navigateTo('admin')" class="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/20">
                                <i data-lucide="shield-alert" class="w-3.5 h-3.5"></i>
                                <span>Zero-Trust Admin</span>
                            </button>
                        ` : ''}
                        <button onclick="navigateTo('notifications')" class="relative p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
                            <i data-lucide="bell" class="w-5 h-5"></i>
                            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
                        </button>
                        <div onclick="navigateTo('profile')" class="flex items-center space-x-2 pl-2 border-l border-gray-800 cursor-pointer">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center font-bold text-sm text-white">
                                ${AppState.user.legal_name.charAt(0)}
                            </div>
                            <span class="text-sm font-medium text-gray-200 hidden md:inline">${AppState.user.legal_name.split(' ')[0]}</span>
                        </div>
                    </div>
                `;
            } else {
                mobileNav.classList.add('hidden');
                container.innerHTML = `
                    <div class="flex items-center space-x-2">
                        <button onclick="navigateTo('login')" class="px-3.5 py-1.5 text-sm font-semibold text-gray-300 hover:text-white rounded-lg">Sign In</button>
                        <button onclick="navigateTo('register')" class="px-3.5 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30">Get Started</button>
                    </div>
                `;
            }
            lucide.createIcons();
        }

        // =====================================================================
        // VIEW RENDERERS (All 23 Screens Matching PRD v1.0)
        // =====================================================================

        // 1. LOGIN VIEW
        function renderLoginView() {
            return `
                <div class="max-w-md mx-auto my-12 bg-gray-900/90 border border-gray-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                    <div class="text-center mb-8">
                        <div class="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-600/30 to-purple-600/20 border border-blue-500/40 items-center justify-center p-2 mb-3 shadow-xl shadow-blue-500/20">
                            <svg viewBox="0 0 100 100" fill="none" class="w-full h-full">
                                <defs>
                                    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stop-color="#38bdf8" />
                                        <stop offset="50%" stop-color="#3b82f6" />
                                        <stop offset="100%" stop-color="#8b5cf6" />
                                    </linearGradient>
                                    <linearGradient id="cardX" x1="0%" y1="100%" x2="100%" y2="0%">
                                        <stop offset="0%" stop-color="#06b6d4" />
                                        <stop offset="100%" stop-color="#a855f7" />
                                    </linearGradient>
                                </defs>
                                <path d="M50 8 L90 30 L90 70 L50 92 L10 70 L10 30 Z" stroke="url(#cardGrad)" stroke-width="6" fill="#0b1329" />
                                <path d="M32 32 L68 68 M68 32 L32 68" stroke="url(#cardX)" stroke-width="9" stroke-linecap="round" />
                                <circle cx="50" cy="50" r="5" fill="#38bdf8" />
                            </svg>
                        </div>
                        <h2 class="text-2xl font-black text-white tracking-tight">Institutional Terminal</h2>
                        <p class="text-xs text-gray-400 mt-1">Authenticate into your multi-fund commission ledger</p>
                    </div>

                    <form onsubmit="handleLogin(event)" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1">Username or Mobile Number</label>
                            <input id="login-identifier" type="text" required placeholder="e.g. fundx_user or 9876543210" class="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1">Password</label>
                            <input id="login-password" type="password" required placeholder="••••••••••••" class="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm">
                        </div>
                        <div class="flex items-center justify-between text-xs pt-1">
                            <label class="flex items-center text-gray-400 cursor-pointer">
                                <input type="checkbox" checked class="rounded bg-gray-800 border-gray-700 text-blue-600 mr-2"> Remember terminal
                            </label>
                            <a href="#" onclick="showToast('Password reset link has been dispatched to compliance desk.', 'info')" class="text-blue-400 hover:underline">Forgot password?</a>
                        </div>
                        <button type="submit" id="login-btn" class="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2">
                            <span>Sign In to Terminal</span>
                            <i data-lucide="arrow-right" class="w-4 h-4"></i>
                        </button>
                    </form>

                    <div class="mt-6 pt-6 border-t border-gray-800 text-center">
                        <p class="text-xs text-gray-400">
                            New partner? <a href="#" onclick="navigateTo('register')" class="text-blue-400 font-semibold hover:underline">Frictionless Registration</a>
                        </p>
                    </div>
                </div>
            `;
        }

        // 2. REGISTER VIEW (Frictionless, No upfront OTP)
        function renderRegisterView() {
            return `
                <div class="max-w-md mx-auto my-6 bg-gray-900/90 border border-gray-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                    <div class="text-center mb-6">
                        <div class="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-600/30 to-purple-600/20 border border-blue-500/40 items-center justify-center p-2 mb-3 shadow-xl shadow-blue-500/20">
                            <svg viewBox="0 0 100 100" fill="none" class="w-full h-full">
                                <defs>
                                    <linearGradient id="regGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stop-color="#38bdf8" />
                                        <stop offset="50%" stop-color="#3b82f6" />
                                        <stop offset="100%" stop-color="#8b5cf6" />
                                    </linearGradient>
                                    <linearGradient id="regX" x1="0%" y1="100%" x2="100%" y2="0%">
                                        <stop offset="0%" stop-color="#06b6d4" />
                                        <stop offset="100%" stop-color="#a855f7" />
                                    </linearGradient>
                                </defs>
                                <path d="M50 8 L90 30 L90 70 L50 92 L10 70 L10 30 Z" stroke="url(#regGrad)" stroke-width="6" fill="#0b1329" />
                                <path d="M32 32 L68 68 M68 32 L32 68" stroke="url(#regX)" stroke-width="9" stroke-linecap="round" />
                                <circle cx="50" cy="50" r="5" fill="#38bdf8" />
                            </svg>
                        </div>
                        <h2 class="text-2xl font-black text-white tracking-tight">Create Partner Account</h2>
                        <p class="text-xs text-gray-400 mt-1">Frictionless onboarding &bull; No upfront OTP required</p>
                    </div>

                    <form onsubmit="handleRegister(event)" class="space-y-3.5">
                        <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1">Full Legal Name *</label>
                            <input id="reg-name" type="text" required placeholder="e.g. Ramesh Kumar Verma" class="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1">Unique Username *</label>
                            <input id="reg-username" type="text" required placeholder="e.g. ramesh_trader" class="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1">Mobile Number (India +91) *</label>
                            <input id="reg-mobile" type="tel" required maxlength="10" placeholder="e.g. 9876543210" class="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1">Password *</label>
                            <input id="reg-password" type="password" required minlength="6" placeholder="Minimum 6 characters" class="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1">Referral Code (Optional)</label>
                            <input id="reg-referral" type="text" placeholder="e.g. FUNDXADMIN" class="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 uppercase">
                        </div>
                        <div class="pt-2">
                            <button type="submit" id="reg-btn" class="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2">
                                <span>Complete Registration</span>
                                <i data-lucide="check" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </form>

                    <div class="mt-4 pt-4 border-t border-gray-800 text-center">
                        <p class="text-xs text-gray-400">
                            Already registered? <a href="#" onclick="navigateTo('login')" class="text-blue-400 font-semibold hover:underline">Sign In</a>
                        </p>
                    </div>
                </div>
            `;
        }

        // 3. USER DASHBOARD VIEW
        async function renderDashboardView() {
            const [walletRes, fundsRes] = await Promise.all([
                apiCall('wallet/balances'),
                apiCall('funds/list')
            ]);

            const totalBalance = walletRes.total_balance || 0;
            const totalReserved = walletRes.total_reserved || 0;
            const funds = fundsRes.funds || [];

            return `
                <div class="space-y-6">
                    <!-- Top Summary Card -->
                    <div class="bg-gradient-to-r from-gray-900 via-blue-950/40 to-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <span class="text-xs font-semibold text-blue-400 uppercase tracking-wider">Multi-Tier Portfolio Balance</span>
                                <h2 class="text-3xl sm:text-4xl font-extrabold text-white mt-1">₹${Number(totalBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                                <p class="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                                    <span class="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                                    Reserved Payout In-Flight: ₹${Number(totalReserved).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div class="flex items-center space-x-2.5">
                                <button onclick="navigateTo('funds')" class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 flex items-center space-x-1.5">
                                    <i data-lucide="zap" class="w-4 h-4"></i>
                                    <span>Activate Fund</span>
                                </button>
                                <button onclick="navigateTo('withdraw')" class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold text-xs flex items-center space-x-1.5">
                                    <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
                                    <span>Withdraw</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 3 Isolated Fund Quick Cards -->
                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="text-base font-bold text-white flex items-center gap-2">
                                <i data-lucide="layers" class="w-4 h-4 text-blue-400"></i>
                                <span>3-Tier Fund Matrix</span>
                            </h3>
                            <button onclick="navigateTo('funds')" class="text-xs text-blue-400 hover:underline">View All &rarr;</button>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            ${funds.map(f => `
                                <div class="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition relative">
                                    <div class="flex items-center justify-between mb-3">
                                        <h4 class="font-bold text-white">${f.name}</h4>
                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${f.user_state === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}">
                                            ${f.user_state}
                                        </span>
                                    </div>
                                    <div class="space-y-1.5 text-xs text-gray-400">
                                        <div class="flex justify-between"><span>Base Commission Rate:</span> <span class="font-semibold text-blue-400">${(f.base_rate * 100).toFixed(1)}%</span></div>
                                        <div class="flex justify-between"><span>Eligible Task Quantum:</span> <span class="text-gray-300">₹1k - ₹30k</span></div>
                                        <div class="flex justify-between border-t border-gray-800 pt-1.5 mt-2">
                                            <span>Current Balance:</span> 
                                            <span class="font-bold text-white">₹${Number(f.user_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                    <div class="mt-4 pt-3 border-t border-gray-800">
                                        ${f.user_state === 'ACTIVE' ? `
                                            <button onclick="navigateTo('tasks', { fund_id: '${f.id}' })" class="w-full py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-semibold text-xs hover:bg-emerald-600/30 flex items-center justify-center space-x-1">
                                                <span>Execute Tasks</span>
                                                <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                                            </button>
                                        ` : `
                                            <button onclick="openFundUnlockModal('${f.id}')" class="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center space-x-1 shadow-md shadow-blue-600/20">
                                                <i data-lucide="key" class="w-3.5 h-3.5"></i>
                                                <span>Activate (${f.activation_fee_usdt || (f.slug === 'gaming' ? 100 : (f.slug === 'stock' ? 150 : 200))} USDT)</span>
                                            </button>
                                        `}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Fast Action Grid -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <button onclick="navigateTo('tasks')" class="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-blue-500/50 flex flex-col items-center text-center transition">
                            <i data-lucide="check-circle-2" class="w-6 h-6 text-blue-400 mb-2"></i>
                            <span class="text-xs font-semibold text-white">Dual Task Desk</span>
                            <span class="text-[10px] text-gray-500 mt-0.5">Genuine & Simulated</span>
                        </button>
                        <button onclick="navigateTo('bank-accounts')" class="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-blue-500/50 flex flex-col items-center text-center transition">
                            <i data-lucide="landmark" class="w-6 h-6 text-indigo-400 mb-2"></i>
                            <span class="text-xs font-semibold text-white">Bank Account Vault</span>
                            <span class="text-[10px] text-gray-500 mt-0.5">AES-256 Encrypted</span>
                        </button>
                        <button onclick="navigateTo('wallet')" class="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-blue-500/50 flex flex-col items-center text-center transition">
                            <i data-lucide="file-text" class="w-6 h-6 text-emerald-400 mb-2"></i>
                            <span class="text-xs font-semibold text-white">Financial Ledger</span>
                            <span class="text-[10px] text-gray-500 mt-0.5">Double-Entry Audit</span>
                        </button>
                        <button onclick="navigateTo('support')" class="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-blue-500/50 flex flex-col items-center text-center transition">
                            <i data-lucide="headphones" class="w-6 h-6 text-amber-400 mb-2"></i>
                            <span class="text-xs font-semibold text-white">Support Desk</span>
                            <span class="text-[10px] text-gray-500 mt-0.5">24/7 Ticketing</span>
                        </button>
                    </div>
                </div>
            `;
        }

        // 4. 3-TIER FUNDS VIEW
        async function renderFundsView() {
            const res = await apiCall('funds/list');
            const funds = res.funds || [];

            return `
                <div class="space-y-6">
                    <div>
                        <h2 class="text-xl font-bold text-white">3-Tier Isolated Fund Architecture</h2>
                        <p class="text-xs text-gray-400 mt-1">PRD Section 2: Strict isolation of balances, fund states, and withdrawal pipelines</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        ${funds.map(f => `
                            <div class="bg-gray-900 border ${f.user_state === 'ACTIVE' ? 'border-emerald-500/40 shadow-emerald-500/5' : 'border-gray-800'} rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                                <div>
                                    <div class="flex items-center justify-between mb-4">
                                        <div class="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                            ${f.slug.toUpperCase().substring(0, 2)}
                                        </div>
                                        <span class="px-3 py-1 rounded-full text-xs font-bold ${f.user_state === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400'}">
                                            ${f.user_state}
                                        </span>
                                    </div>
                                    <h3 class="text-lg font-bold text-white mb-1">${f.name}</h3>
                                    <p class="text-xs text-gray-400 mb-4">${f.description}</p>

                                    <div class="space-y-2 text-xs border-t border-gray-800 pt-3">
                                        <div class="flex justify-between"><span class="text-gray-400">Base Commission:</span> <span class="font-bold text-emerald-400">${(f.base_rate * 100).toFixed(1)}%</span></div>
                                        <div class="flex justify-between"><span class="text-gray-400">Fixed Activation Fee:</span> <span class="font-bold text-emerald-400">${f.activation_fee_usdt || (f.slug === 'gaming' ? 100 : (f.slug === 'stock' ? 150 : 200))} USDT</span></div>
                                        <div class="flex justify-between"><span class="text-gray-400">Task Quantum Range:</span> <span class="font-semibold text-white">₹${f.min_task_amount} - ₹${f.max_task_amount}</span></div>
                                        <div class="flex justify-between"><span class="text-gray-400">Baseline Allocation:</span> <span class="font-bold text-blue-400">₹${Number(f.baseline_valuation).toLocaleString()}</span></div>
                                    </div>
                                </div>

                                <div class="mt-6 pt-4 border-t border-gray-800">
                                    ${f.user_state === 'ACTIVE' ? `
                                        <button onclick="navigateTo('tasks', { fund_id: '${f.id}' })" class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-1.5">
                                            <span>Enter Execution Desk</span>
                                            <i data-lucide="arrow-right" class="w-4 h-4"></i>
                                        </button>
                                    ` : `
                                        <button onclick="openFundUnlockModal('${f.id}')" class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-1.5">
                                            <i data-lucide="key" class="w-4 h-4"></i>
                                            <span>Unlock with ${f.activation_fee_usdt || (f.slug === 'gaming' ? 100 : (f.slug === 'stock' ? 150 : 200))} USDT</span>
                                        </button>
                                    `}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // 5. TRC20 ACTIVATION GATEWAY VIEW (Dynamic QR Code, 30-min Timer)
        function renderActivationGatewayView(order) {
            const qrPayload = order.qr_payload || `tron:${order.wallet_address}?value=${order.usdt_amount}`;
            const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrPayload)}`;
            const qrImageSrc = order.custom_qr_url ? order.custom_qr_url : dynamicQrUrl;

            return `
                <div class="max-w-xl mx-auto bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                    <div class="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
                        <div>
                            <span class="text-xs font-semibold text-blue-400">TRC20 Activation Gateway</span>
                            <h2 class="text-xl font-bold text-white mt-0.5">${order.fund_name}</h2>
                        </div>
                        <div class="text-right">
                            <span class="text-[10px] text-gray-400 block font-mono">Timer Window</span>
                            <span id="countdown-timer" class="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">30:00</span>
                        </div>
                    </div>

                    <div class="flex flex-col items-center justify-center mb-6">
                        <div class="p-3 bg-white rounded-2xl shadow-xl mb-4 border border-gray-700">
                            <img src="${qrImageSrc}" alt="USDT TRC20 QR Code" class="w-48 h-48 object-contain" onerror="this.onerror=null; this.src='${dynamicQrUrl}';">
                        </div>
                        <span class="text-xs text-gray-400">Scan QR via TronLink, Binance, TrustWallet, or OKX</span>
                    </div>

                    <div class="space-y-3 bg-gray-950 p-4 rounded-xl border border-gray-800 text-xs mb-6">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">Fixed Activation Fee (Locked):</span>
                            <span class="text-xl font-black text-emerald-400 font-mono flex items-center gap-1.5">
                                <i data-lucide="lock" class="w-4 h-4"></i>
                                ${order.usdt_amount} USDT
                            </span>
                        </div>
                        <div class="flex justify-between items-center text-[11px] text-gray-500 border-t border-gray-800/60 pt-2">
                            <span>FX Peg Reference:</span>
                            <span>1 USDT = ₹89.50 (₹${Number(order.inr_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })})</span>
                        </div>
                        <div class="border-t border-gray-800/60 pt-2">
                            <span class="text-gray-400 block mb-1">Central Deposit Wallet (TRC20):</span>
                            <div class="flex items-center justify-between bg-gray-900 p-2.5 rounded-lg font-mono text-[11px] text-blue-400 break-all select-all">
                                <span>${order.wallet_address}</span>
                                <button onclick="navigator.clipboard.writeText('${order.wallet_address}'); showToast('Wallet address copied!', 'success');" class="ml-2 px-2 py-1 rounded bg-blue-600/30 text-blue-300 hover:text-white flex items-center gap-1">
                                    <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                                    <span>Copy</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- TXID Submission Form -->
                    <form onsubmit="submitTXID(event, '${order.id}')" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold text-gray-300 mb-1">Enter Blockchain TXID (64-Char Hash) *</label>
                            <input id="txid-input" type="text" required maxlength="64" placeholder="e.g. 7f9a1c8d5e... (64 hex characters)" class="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500">
                            <p class="text-[11px] text-gray-500 mt-1">Strict anti-replay verification enabled. Unique hash required.</p>
                        </div>
                        <button type="submit" id="txid-btn" class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-1.5">
                            <i data-lucide="shield-check" class="w-4 h-4"></i>
                            <span>Verify Transaction & Unlock Fund</span>
                        </button>
                    </form>
                </div>
            `;
        }

        // 6. DUAL TASK ENGINE VIEW (Genuine & Simulated Demo)
        async function renderTasksView(fundId = null) {
            const res = await apiCall(`tasks/list${fundId ? `?fund_id=${fundId}` : ''}`);
            const tasks = res.tasks || [];
            const demoTasks = res.demo_tasks || [];
            const isFundActive = res.is_fund_active;
            const fund = res.fund || {};

            return `
                <div class="space-y-6">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 class="text-xl font-bold text-white flex items-center gap-2">
                                <i data-lucide="check-square" class="w-5 h-5 text-blue-400"></i>
                                <span>Dual Task Engine & Commission Clearing</span>
                            </h2>
                            <p class="text-xs text-gray-400 mt-1">PRD Section 4: Deterministic Formula (Commission = Task Quantum &times; Fund Rate)</p>
                        </div>
                        <div class="flex items-center space-x-2 bg-gray-900 p-1 rounded-xl border border-gray-800">
                            <button id="tab-genuine" onclick="switchTaskTab('genuine')" class="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white">Genuine Tasks</button>
                            <button id="tab-demo" onclick="switchTaskTab('demo')" class="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-gray-400 hover:text-white">Simulated DEMO</button>
                        </div>
                    </div>

                    <!-- Genuine Tasks Section -->
                    <div id="section-genuine" class="space-y-4">
                        ${!isFundActive ? `
                            <div class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center">
                                <i data-lucide="alert-triangle" class="w-8 h-8 text-amber-400 mx-auto mb-2"></i>
                                <h3 class="text-base font-bold text-white">Fund Activation Required</h3>
                                <p class="text-xs text-gray-300 mt-1 max-w-md mx-auto">To execute genuine clearing tasks and earn withdrawable commissions, activate this fund tier via TRC20 activation gateway.</p>
                                <button onclick="navigateTo('funds')" class="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs">Go to Fund Activation</button>
                            </div>
                        ` : `
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                ${tasks.map(t => `
                                    <div class="bg-gray-900 border ${t.status === 'COMPLETED' ? 'border-gray-800/60 opacity-60' : 'border-gray-800 hover:border-gray-700'} rounded-2xl p-5 shadow-lg relative flex flex-col justify-between">
                                        <div>
                                            <div class="flex items-center justify-between mb-3">
                                                <span class="text-[11px] font-mono text-blue-400">${t.task_type.replace('_', ' ')}</span>
                                                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'COMPLETED' ? 'bg-gray-800 text-gray-400' : 'bg-emerald-500/20 text-emerald-400'}">${t.status}</span>
                                            </div>
                                            <div class="space-y-1 mb-4">
                                                <div class="text-xs text-gray-400">Eligible Quantum: <span class="font-bold text-white">₹${Number(t.quantum).toLocaleString()}</span></div>
                                                <div class="text-xs text-gray-400">Commission Rate: <span class="font-semibold text-blue-400">${(t.commission_rate * 100).toFixed(1)}%</span></div>
                                                <div class="text-xs text-gray-400">Net Return: <span class="font-bold text-emerald-400">₹${Number(t.commission_amount).toLocaleString()}</span></div>
                                            </div>
                                        </div>
                                        <div>
                                            ${t.status === 'COMPLETED' ? `
                                                <button disabled class="w-full py-2 rounded-xl bg-gray-800 text-gray-500 font-semibold text-xs cursor-not-allowed">Settled & Credited</button>
                                            ` : `
                                                <button onclick="executeTask('${t.id}')" class="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center space-x-1">
                                                    <span>Execute Clearance</span>
                                                    <i data-lucide="check" class="w-4 h-4"></i>
                                                </button>
                                            `}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>

                    <!-- Simulated DEMO Tasks Section (Watermarked) -->
                    <div id="section-demo" class="space-y-4 hidden relative">
                        <div class="demo-watermark">DEMO</div>
                        <div class="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <i data-lucide="info" class="w-5 h-5 text-red-400"></i>
                                <div>
                                    <h4 class="text-xs font-bold text-red-300">Simulated Sandbox Environment</h4>
                                    <p class="text-[11px] text-gray-400">Simulated tasks carry zero financial balance impact and are isolated in separate storage.</p>
                                </div>
                            </div>
                            <button onclick="executeDemoTask()" class="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow">Run Simulation</button>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${demoTasks.map(d => `
                                <div class="bg-gray-900 border border-gray-800 rounded-2xl p-4 relative overflow-hidden">
                                    <div class="absolute top-2 right-2 px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-[10px] font-black text-red-400">DEMO</div>
                                    <div class="text-xs text-gray-400">Simulated Quantum: <span class="font-bold text-white">₹${Number(d.quantum).toLocaleString()}</span></div>
                                    <div class="text-xs text-gray-400 mt-1">Virtual Commission: <span class="font-bold text-emerald-400">₹${Number(d.simulated_commission).toLocaleString()}</span></div>
                                    <span class="text-[10px] text-gray-500 mt-2 block font-mono">${d.created_at}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }

        // 7. BANK ACCOUNT VAULT (RBI IFSC & AES-256 GCM)
        async function renderBankView() {
            const res = await apiCall('bank/get');
            const bank = res.bank_account;

            return `
                <div class="max-w-xl mx-auto space-y-6">
                    <div>
                        <h2 class="text-xl font-bold text-white">Bank Account Binding Vault</h2>
                        <p class="text-xs text-gray-400 mt-1">PRD Section 5: AES-256 encrypted at rest &bull; Gate: Active fund required</p>
                    </div>

                    ${bank ? `
                        <div class="bg-gradient-to-tr from-gray-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative">
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center space-x-2">
                                    <i data-lucide="shield-check" class="w-5 h-5 text-emerald-400"></i>
                                    <span class="text-xs font-bold text-emerald-400">Verified PII Vault</span>
                                </div>
                                <span class="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">AES-256-GCM</span>
                            </div>
                            <div class="space-y-2 text-xs">
                                <div><span class="text-gray-400">Beneficiary Name:</span> <span class="font-bold text-white ml-2">${bank.account_holder_name}</span></div>
                                <div><span class="text-gray-400">Bank Name:</span> <span class="font-semibold text-white ml-2">${bank.bank_name}</span></div>
                                <div><span class="text-gray-400">Masked Account:</span> <span class="font-mono font-bold text-blue-400 ml-2">${bank.masked_account}</span></div>
                                <div><span class="text-gray-400">RBI IFSC Code:</span> <span class="font-mono font-bold text-white ml-2">${bank.ifsc_code}</span></div>
                            </div>
                        </div>
                    ` : `
                        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
                            <form onsubmit="handleBankBind(event)" class="space-y-4">
                                <div>
                                    <label class="block text-xs font-semibold text-gray-400 mb-1">Bank Name *</label>
                                    <input id="bank-name" type="text" required placeholder="e.g. HDFC Bank Ltd" class="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs focus:outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-gray-400 mb-1">Account Holder Full Legal Name *</label>
                                    <input id="bank-holder" type="text" required placeholder="Must match bank records" class="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs focus:outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-gray-400 mb-1">Account Number *</label>
                                    <input id="bank-account" type="password" required placeholder="Enter bank account number" class="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs focus:outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-gray-400 mb-1">Confirm Account Number *</label>
                                    <input id="bank-confirm" type="text" required placeholder="Re-enter bank account number" class="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs focus:outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-gray-400 mb-1">RBI IFSC Code *</label>
                                    <input id="bank-ifsc" type="text" required maxlength="11" placeholder="e.g. HDFC0001234" class="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white uppercase font-mono text-xs focus:outline-none focus:border-blue-500">
                                    <p class="text-[10px] text-gray-500 mt-1">Regex check: 4 alpha, 0, 6 alphanumeric.</p>
                                </div>
                                <button type="submit" id="bind-btn" class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20">
                                    Encrypt & Bind Account to Vault
                                </button>
                            </form>
                        </div>
                    `}
                </div>
            `;
        }

        // 8. WITHDRAWAL VIEW (Real-Time Balance Reservation)
        async function renderWithdrawView() {
            const [fundsRes, bankRes] = await Promise.all([
                apiCall('funds/list'),
                apiCall('bank/get')
            ]);
            const funds = fundsRes.funds || [];
            const bank = bankRes.bank_account;

            return `
                <div class="max-w-xl mx-auto space-y-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-xl font-bold text-white">Withdrawal & Balance Reservation</h2>
                            <p class="text-xs text-gray-400 mt-1">PRD Section 6: Real-time balance reservation prevents double-spending</p>
                        </div>
                        <button onclick="navigateTo('withdraw-history')" class="text-xs text-blue-400 hover:underline">History & UTR &rarr;</button>
                    </div>

                    ${!bank ? `
                        <div class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center">
                            <i data-lucide="alert-circle" class="w-8 h-8 text-amber-400 mx-auto mb-2"></i>
                            <h3 class="text-sm font-bold text-white">No Bank Account Bound</h3>
                            <p class="text-xs text-gray-400 mt-1">Bind your verified bank account in the PII Vault before requesting payouts.</p>
                            <button onclick="navigateTo('bank-accounts')" class="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold">Bind Account Now</button>
                        </div>
                    ` : `
                        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
                            <form onsubmit="handleWithdrawalSubmit(event)" class="space-y-4">
                                <div>
                                    <label class="block text-xs font-semibold text-gray-400 mb-1">Select Disbursing Fund Tier *</label>
                                    <select id="w-fund" class="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs focus:outline-none focus:border-blue-500">
                                        ${funds.filter(f => f.user_state === 'ACTIVE').map(f => `
                                            <option value="${f.id}">${f.name} &bull; Available: ₹${Number(f.user_balance).toLocaleString()}</option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-gray-400 mb-1">Withdrawal Quantum (INR) *</label>
                                    <input id="w-amount" type="number" required min="500" step="100" placeholder="Minimum ₹500" class="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs focus:outline-none focus:border-blue-500">
                                </div>
                                <div class="bg-gray-950 p-3.5 rounded-xl border border-gray-800 text-xs text-gray-400 space-y-1">
                                    <div class="flex justify-between"><span>Destination:</span> <span class="text-white font-mono">${bank.bank_name} (${bank.masked_account})</span></div>
                                    <div class="flex justify-between"><span>IFSC:</span> <span class="text-white font-mono">${bank.ifsc_code}</span></div>
                                    <div class="flex justify-between"><span>Disbursement Gateway:</span> <span class="text-emerald-400">IMPS / NEFT Direct</span></div>
                                </div>
                                <button type="submit" id="w-btn" class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20">
                                    Reserve Balance & Submit Payout Request
                                </button>
                            </form>
                        </div>
                    `}
                </div>
            `;
        }

        // 9. WITHDRAWAL HISTORY VIEW
        async function renderWithdrawHistoryView() {
            const res = await apiCall('withdrawals/history');
            const withdrawals = res.withdrawals || [];

            return `
                <div class="space-y-6">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-bold text-white">Withdrawal & Settlement Records</h2>
                        <button onclick="navigateTo('withdraw')" class="text-xs text-blue-400 hover:underline">&larr; Request Payout</button>
                    </div>

                    <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs">
                                <thead class="bg-gray-950 text-gray-400 border-b border-gray-800 uppercase font-semibold text-[10px]">
                                    <tr>
                                        <th class="p-3.5">Date / ID</th>
                                        <th class="p-3.5">Fund</th>
                                        <th class="p-3.5">Amount</th>
                                        <th class="p-3.5">Account</th>
                                        <th class="p-3.5">Status</th>
                                        <th class="p-3.5">UTR Reference</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-800">
                                    ${withdrawals.length === 0 ? `
                                        <tr><td colspan="6" class="p-6 text-center text-gray-500">No withdrawal records found</td></tr>
                                    ` : withdrawals.map(w => `
                                        <tr class="hover:bg-gray-800/40">
                                            <td class="p-3.5 font-mono text-[11px] text-gray-400">${w.created_at}</td>
                                            <td class="p-3.5 font-semibold text-white">${w.fund_name}</td>
                                            <td class="p-3.5 font-bold text-white">₹${Number(w.amount).toLocaleString()}</td>
                                            <td class="p-3.5 font-mono text-gray-400">${w.masked_account || 'Bank'}</td>
                                            <td class="p-3.5">
                                                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    w.status === 'DISBURSED' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    w.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                                                }">${w.status}</span>
                                            </td>
                                            <td class="p-3.5 font-mono text-blue-400">${w.utr_number || '—'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }

        // 10. WALLET & FINANCIAL LEDGER VIEW
        async function renderWalletView() {
            const [balancesRes, ledgerRes] = await Promise.all([
                apiCall('wallet/balances'),
                apiCall('wallet/ledger')
            ]);
            const ledger = ledgerRes.ledger || [];
            const funds = balancesRes.funds || [];

            return `
                <div class="space-y-6">
                    <h2 class="text-xl font-bold text-white">Double-Entry Financial Ledger</h2>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        ${funds.map(f => `
                            <div class="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                                <span class="text-xs text-gray-400">${f.name}</span>
                                <h3 class="text-xl font-bold text-white mt-1">₹${Number(f.balance).toLocaleString()}</h3>
                                <p class="text-[10px] text-gray-500 mt-1">Reserved: ₹${Number(f.balance_reserved).toLocaleString()}</p>
                            </div>
                        `).join('')}
                    </div>

                    <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                        <div class="p-4 border-b border-gray-800 flex justify-between items-center">
                            <h3 class="text-xs font-bold text-gray-300 uppercase">Immutable Audit Trail</h3>
                            <span class="text-[10px] text-gray-500">ACID Compliant</span>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs">
                                <thead class="bg-gray-950 text-gray-400 text-[10px] uppercase font-semibold">
                                    <tr>
                                        <th class="p-3">Timestamp</th>
                                        <th class="p-3">Fund</th>
                                        <th class="p-3">Entry Type</th>
                                        <th class="p-3">Quantum</th>
                                        <th class="p-3">Balance After</th>
                                        <th class="p-3">Audit Details</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-800">
                                    ${ledger.length === 0 ? `
                                        <tr><td colspan="6" class="p-6 text-center text-gray-500">No ledger transactions recorded yet</td></tr>
                                    ` : ledger.map(l => `
                                        <tr class="hover:bg-gray-800/40">
                                            <td class="p-3 font-mono text-[11px] text-gray-400">${l.created_at}</td>
                                            <td class="p-3 font-semibold text-white">${l.fund_name}</td>
                                            <td class="p-3 font-mono text-blue-400">${l.entry_type}</td>
                                            <td class="p-3 font-bold ${l.entry_type.includes('CREDIT') ? 'text-emerald-400' : 'text-amber-400'}">
                                                ${l.entry_type.includes('CREDIT') ? '+' : '-'}₹${Number(l.amount).toLocaleString()}
                                            </td>
                                            <td class="p-3 font-mono text-white">₹${Number(l.balance_after).toLocaleString()}</td>
                                            <td class="p-3 text-gray-400 text-[11px]">${l.description || '—'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }

        // 11. PROFILE VIEW
        function renderProfileView() {
            const user = AppState.user || {};
            const refLink = `${window.location.origin}/?ref=${user.referral_code}`;

            return `
                <div class="max-w-xl mx-auto space-y-6">
                    <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                        <div class="flex items-center space-x-4 mb-6">
                            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-extrabold text-2xl text-white">
                                ${user.legal_name ? user.legal_name.charAt(0) : 'U'}
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-white">${user.legal_name}</h3>
                                <p class="text-xs font-mono text-gray-400">@${user.username} &bull; ${user.role}</p>
                            </div>
                        </div>

                        <div class="space-y-3 text-xs border-t border-gray-800 pt-4">
                            <div class="flex justify-between"><span class="text-gray-400">Mobile Number:</span> <span class="font-mono text-white">${user.mobile}</span></div>
                            <div class="flex justify-between"><span class="text-gray-400">Referral Code:</span> <span class="font-mono font-bold text-blue-400 select-all">${user.referral_code}</span></div>
                            <div class="border-t border-gray-800 pt-2">
                                <span class="text-gray-400 block mb-1">Affiliate Referral Link:</span>
                                <div class="flex items-center justify-between bg-gray-950 p-2 rounded-lg font-mono text-[11px] text-gray-300">
                                    <span class="truncate">${refLink}</span>
                                    <button onclick="navigator.clipboard.writeText('${refLink}'); showToast('Referral link copied!', 'success');" class="ml-2 text-blue-400">Copy</button>
                                </div>
                            </div>
                        </div>

                        <div class="mt-6 pt-4 border-t border-gray-800">
                            <button onclick="handleLogout()" class="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-xs transition">
                                Terminate Session & Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        // 12. SUPPORT VIEW
        async function renderSupportView() {
            const res = await apiCall('support/tickets');
            const tickets = res.tickets || [];

            return `
                <div class="max-w-xl mx-auto space-y-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-xl font-bold text-white">Institutional Support Desk</h2>
                            <p class="text-xs text-gray-400 mt-1">Direct communication channel with compliance & ledger operators</p>
                        </div>
                    </div>

                    <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                        <h3 class="text-sm font-bold text-white mb-3">Open New Compliance Ticket</h3>
                        <form onsubmit="handleSupportSubmit(event)" class="space-y-3 text-xs">
                            <div>
                                <label class="block text-gray-400 mb-1">Subject *</label>
                                <input id="ticket-subject" type="text" required placeholder="e.g. TRC20 TXID Verification Query" class="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-gray-400 mb-1">Category *</label>
                                <select id="ticket-category" class="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500">
                                    <option value="ACTIVATION">TRC20 Activation Query</option>
                                    <option value="WITHDRAWAL">Withdrawal & UTR Query</option>
                                    <option value="TASK_CLEARING">Task & Commission Clearing</option>
                                    <option value="GENERAL">General Inquiries</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-gray-400 mb-1">Message *</label>
                                <textarea id="ticket-message" required rows="3" placeholder="Provide detailed explanation..." class="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"></textarea>
                            </div>
                            <button type="submit" class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/20">Submit Ticket</button>
                        </form>
                    </div>

                    <div class="space-y-3">
                        <h4 class="text-xs font-bold text-gray-400 uppercase">Recent Tickets</h4>
                        ${tickets.length === 0 ? `
                            <p class="text-xs text-gray-500">No support tickets filed.</p>
                        ` : tickets.map(t => `
                            <div class="bg-gray-900 border border-gray-800 rounded-xl p-4 text-xs">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="font-bold text-white">${t.subject}</span>
                                    <span class="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400">${t.status}</span>
                                </div>
                                <span class="text-gray-400 text-[11px] block">${t.category} &bull; ${t.created_at}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // 13. ZERO-TRUST ADMIN CONSOLE VIEW
        async function renderAdminView() {
            const [statsRes, usersRes, txidsRes, disbRes, settingsRes, fundsRes] = await Promise.all([
                apiCall('admin/stats'),
                apiCall('admin/users'),
                apiCall('admin/txids'),
                apiCall('admin/disbursements'),
                apiCall('admin/settings'),
                apiCall('admin/funds')
            ]);
            const stats = statsRes.stats || {};
            const users = usersRes.users || [];
            const orders = txidsRes.orders || [];
            const disbursements = disbRes.disbursements || [];
            const settings = (settingsRes && settingsRes.settings) ? settingsRes.settings : {
                usdt_address: 'TEaZq1K2vhWUi5i8AWqC4tNE57VvHi6xJX',
                usdt_qr_path: '',
                usdt_inr_peg_rate: 89.50
            };
            const adminFunds = (fundsRes && fundsRes.funds) ? fundsRes.funds : [];

            return `
                <div class="space-y-6">
                    <div class="border-b border-gray-800 pb-4 flex items-center justify-between">
                        <div>
                            <span class="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                                <i data-lucide="shield-alert" class="w-4 h-4"></i>
                                <span>Zero-Trust Admin Console</span>
                            </span>
                            <h2 class="text-2xl font-black text-white mt-0.5">Administrative Clearing Desk</h2>
                        </div>
                        <span class="text-xs bg-red-500/20 border border-red-500/40 text-red-300 px-3 py-1 rounded-full font-mono">RBAC Active</span>
                    </div>

                    <!-- Metrics Grid -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
                            <span class="text-xs text-gray-400">Total Registered Users</span>
                            <h3 class="text-2xl font-bold text-white mt-1">${stats.total_users || 0}</h3>
                        </div>
                        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
                            <span class="text-xs text-gray-400">Active Fund Nodes</span>
                            <h3 class="text-2xl font-bold text-emerald-400 mt-1">${stats.active_funds || 0}</h3>
                        </div>
                        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
                            <span class="text-xs text-gray-400">Pending Payouts</span>
                            <h3 class="text-2xl font-bold text-amber-400 mt-1">${stats.pending_withdrawals || 0}</h3>
                        </div>
                        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
                            <span class="text-xs text-gray-400">Total Volume Settled</span>
                            <h3 class="text-2xl font-bold text-blue-400 mt-1">₹${Number(stats.total_commission_volume || 0).toLocaleString()}</h3>
                        </div>
                    </div>

                    <!-- USDT TRC20 Payment & Deposit Settings Desk -->
                    <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-5">
                        <div class="border-b border-gray-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 class="text-sm font-bold text-white uppercase flex items-center gap-2">
                                    <i data-lucide="wallet-cards" class="w-4 h-4 text-emerald-400"></i>
                                    <span>Payment Settings & Central USDT (TRC20) Gateway</span>
                                </h3>
                                <p class="text-xs text-gray-400 mt-0.5">Configure the deposit wallet address and QR code presented to investors during fund unlocks.</p>
                            </div>
                            <span class="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1.5 self-start sm:self-auto">
                                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Live Gateway Active
                            </span>
                        </div>

                        <form id="admin-payment-form" onsubmit="handleAdminPaymentSettings(event)" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="space-y-1.5 md:col-span-2">
                                    <label class="block text-xs font-semibold text-gray-300">
                                        Central USDT (TRC20) Destination Wallet Address *
                                    </label>
                                    <div class="relative">
                                        <input id="admin-usdt-address" type="text" required value="${settings.usdt_address || 'TEaZq1K2vhWUi5i8AWqC4tNE57VvHi6xJX'}" placeholder="e.g. TEaZq1K2vhWUi5i8AWqC4tNE57VvHi6xJX" class="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 pr-24">
                                        <button type="button" onclick="navigator.clipboard.writeText(document.getElementById('admin-usdt-address').value); showToast('Wallet address copied!', 'success');" class="absolute right-2 top-2 px-2.5 py-1 text-[11px] font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition flex items-center gap-1">
                                            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                                            <span>Copy</span>
                                        </button>
                                    </div>
                                    <p class="text-[11px] text-gray-500">TRC20 addresses start with 'T' (Base58 format). Default fallback: <code>TEaZq1K2vhWUi5i8AWqC4tNE57VvHi6xJX</code></p>
                                </div>

                                <div class="space-y-1.5">
                                    <label class="block text-xs font-semibold text-gray-300">
                                        USDT / INR Peg Exchange Rate (₹) *
                                    </label>
                                    <input id="admin-peg-rate" type="number" step="0.01" min="1" required value="${settings.usdt_inr_peg_rate || 89.50}" class="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500">
                                    <p class="text-[11px] text-gray-500">Calculates USDT conversion dynamically for activation fees.</p>
                                </div>

                                <div class="space-y-1.5">
                                    <label class="block text-xs font-semibold text-gray-300">
                                        Upload USDT QR Code Image (.png, .jpg, .svg)
                                    </label>
                                    <input id="admin-qr-file" type="file" accept=".png,.jpg,.jpeg,.svg,.webp" onchange="previewAdminQR(this)" class="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-700 text-gray-400 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer">
                                    <p class="text-[11px] text-gray-500">Saved securely to <code>assets/images/qr/</code> on the server.</p>
                                </div>
                            </div>

                            <!-- Live QR Code Preview Card -->
                            <div class="p-4 bg-gray-950 rounded-xl border border-gray-800 flex flex-col sm:flex-row items-center gap-4">
                                <div class="w-28 h-28 bg-white rounded-xl p-2 flex items-center justify-center shrink-0 border border-gray-700 overflow-hidden shadow-inner">
                                    <img id="admin-qr-preview" src="${settings.usdt_qr_path || 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(settings.usdt_address || 'TEaZq1K2vhWUi5i8AWqC4tNE57VvHi6xJX')}" alt="QR Preview" class="w-full h-full object-contain">
                                </div>
                                <div class="space-y-1 text-xs">
                                    <span class="font-bold text-white block">Active QR Code Preview</span>
                                    <p class="text-gray-400 text-[11px]">This image will be rendered instantly to all investors when unlocking any fund tier. If no custom image is uploaded, a dynamic QR code based on the wallet address is automatically generated.</p>
                                    ${settings.usdt_qr_path ? `<span class="inline-block text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Custom Image Active: ${settings.usdt_qr_path}</span>` : `<span class="inline-block text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Using Dynamic System QR</span>`}
                                </div>
                            </div>

                            <div class="flex justify-end pt-2">
                                <button type="submit" id="admin-save-payment-btn" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 flex items-center space-x-2">
                                    <i data-lucide="save" class="w-4 h-4"></i>
                                    <span>Save Payment Settings</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Fund Tier Management & Fixed Activation Pricing Desk -->
                    <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-5">
                        <div class="border-b border-gray-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 class="text-sm font-bold text-white uppercase flex items-center gap-2">
                                    <i data-lucide="layers" class="w-4 h-4 text-blue-400"></i>
                                    <span>Fund Tier Management & Fixed Activation Pricing (USDT)</span>
                                </h3>
                                <p class="text-xs text-gray-400 mt-0.5">View and update the fixed USDT activation fee (Gaming=100, Stock=150, Mix=200) and base commission rates.</p>
                            </div>
                            <span class="text-[11px] text-blue-400 font-mono bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                                3 Isolated Fund Tiers
                            </span>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            ${adminFunds.map(f => {
                                const defaultFee = f.slug === 'gaming' ? 100 : (f.slug === 'stock' ? 150 : 200);
                                const feeVal = f.activation_fee_usdt || defaultFee;
                                return `
                                    <div class="bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-3 relative">
                                        <div class="flex items-center justify-between">
                                            <span class="font-bold text-white text-sm flex items-center gap-1.5">
                                                <span class="w-2.5 h-2.5 rounded-full ${f.slug === 'gaming' ? 'bg-emerald-400' : (f.slug === 'stock' ? 'bg-blue-400' : 'bg-purple-400')}"></span>
                                                ${f.name}
                                            </span>
                                            <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-gray-800 text-gray-300">${f.slug}</span>
                                        </div>

                                        <div class="space-y-1">
                                            <label class="block text-[11px] font-semibold text-gray-400">Fixed Activation Fee (USDT) *</label>
                                            <div class="relative">
                                                <input id="admin-fee-${f.id}" type="number" step="0.01" min="1" value="${feeVal}" class="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-blue-500 pr-16">
                                                <span class="absolute right-3 top-2 text-xs font-mono text-gray-400">USDT</span>
                                            </div>
                                        </div>

                                        <div class="space-y-1">
                                            <label class="block text-[11px] font-semibold text-gray-400">Base Commission Rate</label>
                                            <div class="relative">
                                                <input id="admin-rate-${f.id}" type="number" step="0.001" min="0" max="1" value="${f.base_rate}" class="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500 pr-12">
                                                <span class="absolute right-3 top-2 text-xs font-mono text-gray-400">${(f.base_rate * 100).toFixed(1)}%</span>
                                            </div>
                                        </div>

                                        <button onclick="saveAdminFundPricing('${f.id}')" id="btn-save-fund-${f.id}" class="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition">
                                            <i data-lucide="check" class="w-3.5 h-3.5"></i>
                                            <span>Update ${f.name} Pricing</span>
                                        </button>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Pending Disbursements Approval Desk -->
                    <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                        <div class="p-4 border-b border-gray-800">
                            <h3 class="text-xs font-bold text-white uppercase flex items-center gap-2">
                                <i data-lucide="send" class="w-4 h-4 text-emerald-400"></i>
                                <span>Payout Disbursement Desk (IMPS / UTR)</span>
                            </h3>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs">
                                <thead class="bg-gray-950 text-gray-400 text-[10px] uppercase">
                                    <tr>
                                        <th class="p-3">User</th>
                                        <th class="p-3">Fund</th>
                                        <th class="p-3">Amount</th>
                                        <th class="p-3">Bank Details</th>
                                        <th class="p-3">Status</th>
                                        <th class="p-3">Disbursement Action</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-800">
                                    ${disbursements.filter(d => d.status === 'PENDING').length === 0 ? `
                                        <tr><td colspan="6" class="p-4 text-center text-gray-500">No pending disbursement requests</td></tr>
                                    ` : disbursements.filter(d => d.status === 'PENDING').map(d => `
                                        <tr>
                                            <td class="p-3 font-semibold text-white">${d.legal_name} (@${d.username})</td>
                                            <td class="p-3">${d.fund_name}</td>
                                            <td class="p-3 font-bold text-emerald-400">₹${Number(d.amount).toLocaleString()}</td>
                                            <td class="p-3 font-mono text-[11px] text-gray-300">${d.bank_name} &bull; ${d.masked_account} (${d.ifsc_code})</td>
                                            <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-bold">${d.status}</span></td>
                                            <td class="p-3">
                                                <div class="flex items-center space-x-2">
                                                    <input id="utr-${d.id}" type="text" placeholder="UTR Reference" class="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-white text-[11px] w-28">
                                                    <button onclick="processDisbursement('${d.id}', 'APPROVE')" class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]">Approve</button>
                                                    <button onclick="processDisbursement('${d.id}', 'REJECT')" class="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[10px]">Reject</button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- User Management & Suspension Desk -->
                    <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                        <div class="p-4 border-b border-gray-800">
                            <h3 class="text-xs font-bold text-white uppercase flex items-center gap-2">
                                <i data-lucide="users" class="w-4 h-4 text-blue-400"></i>
                                <span>Platform Users & Access Control</span>
                            </h3>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs">
                                <thead class="bg-gray-950 text-gray-400 text-[10px] uppercase">
                                    <tr>
                                        <th class="p-3">Legal Name</th>
                                        <th class="p-3">Username</th>
                                        <th class="p-3">Mobile</th>
                                        <th class="p-3">Role</th>
                                        <th class="p-3">Status</th>
                                        <th class="p-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-800">
                                    ${users.map(u => `
                                        <tr>
                                            <td class="p-3 font-semibold text-white">${u.legal_name}</td>
                                            <td class="p-3 font-mono text-gray-400">@${u.username}</td>
                                            <td class="p-3 font-mono text-gray-400">${u.mobile}</td>
                                            <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] bg-gray-800 text-gray-300 font-bold">${u.role}</span></td>
                                            <td class="p-3">
                                                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${u.is_suspended ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}">
                                                    ${u.is_suspended ? 'SUSPENDED' : 'ACTIVE'}
                                                </span>
                                            </td>
                                            <td class="p-3">
                                                ${u.role !== 'SUPERADMIN' ? `
                                                    <button onclick="toggleUserSuspension('${u.id}', ${!u.is_suspended})" class="px-2.5 py-1 rounded text-[10px] font-bold ${u.is_suspended ? 'bg-emerald-600 text-white' : 'bg-red-600/30 text-red-400 hover:bg-red-600 hover:text-white'}">
                                                        ${u.is_suspended ? 'Reinstate' : 'Suspend'}
                                                    </button>
                                                ` : '—'}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }

        // 14. STATIC COMPLIANCE VIEWS (Terms, Privacy, Risk)
        function renderTermsView() {
            return `
                <div class="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl space-y-4 text-xs leading-relaxed text-gray-300">
                    <h2 class="text-xl font-bold text-white mb-4">Terms of Institutional Service</h2>
                    <p>By engaging with the FundX platform, partner represents and warrants full compliance with all relevant financial regulations.</p>
                    <p>Fund balances are segregated into isolated ledgers (Gaming, Stock, Mix). Cross-fund rehypothecation is strictly prohibited.</p>
                </div>
            `;
        }
        function renderPrivacyView() {
            return `
                <div class="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl space-y-4 text-xs leading-relaxed text-gray-300">
                    <h2 class="text-xl font-bold text-white mb-4">Privacy & Data Governance Policy</h2>
                    <p>All sensitive Personally Identifiable Information (PII) including bank account details are stored under AES-256-GCM encryption at rest.</p>
                </div>
            `;
        }
        function renderRiskView() {
            return `
                <div class="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl space-y-4 text-xs leading-relaxed text-gray-300">
                    <h2 class="text-xl font-bold text-white mb-4">Institutional Risk Disclosure</h2>
                    <p>Participation in algorithmic liquidity routing and multi-ledger task clearance involves inherent financial volatility.</p>
                </div>
            `;
        }

        function renderAdminLoginView() {
            return `
                <div class="max-w-md mx-auto my-10 bg-gray-900 border border-red-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600"></div>
                    <div class="text-center mb-6">
                        <div class="inline-flex w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 items-center justify-center text-red-400 mb-3 shadow-lg shadow-red-500/20">
                            <i data-lucide="shield-alert" class="w-7 h-7"></i>
                        </div>
                        <h2 class="text-2xl font-black text-white tracking-tight">Superadmin Terminal</h2>
                        <p class="text-xs text-gray-400 mt-1">Zero-Trust Administrative Clearing Access</p>
                    </div>

                    <form onsubmit="handleAdminLogin(event)" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1">Administrative Identifier</label>
                            <input id="admin-user" type="text" required value="fundx_superadmin" class="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white font-mono text-xs focus:outline-none focus:border-red-500">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1">Master Password</label>
                            <input id="admin-pass" type="password" required value="Fund@123@1" class="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white font-mono text-xs focus:outline-none focus:border-red-500">
                        </div>
                        <button type="submit" id="admin-login-btn" class="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 transition">
                            <i data-lucide="lock" class="w-4 h-4"></i>
                            <span>Authenticate Superadmin</span>
                        </button>
                    </form>

                    <div class="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs">
                        <button type="button" onclick="quickSuperadminLogin()" class="text-xs text-amber-400 hover:underline font-semibold flex items-center space-x-1 cursor-pointer">
                            <i data-lucide="zap" class="w-3.5 h-3.5"></i>
                            <span>1-Click Quick Access</span>
                        </button>
                        <a href="#" onclick="navigateTo('dashboard')" class="text-gray-400 hover:text-white">&larr; User Panel</a>
                    </div>
                </div>
            `;
        }

        // =====================================================================
        // CONTROLLER ACTIONS & EVENT HANDLERS
        // =====================================================================

        async function handleAdminLogin(e) {
            if (e) e.preventDefault();
            const btn = document.getElementById('admin-login-btn');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>`;
            }

            const identifier = document.getElementById('admin-user').value.trim();
            const password = document.getElementById('admin-pass').value;

            let res = await apiCall('auth/login', 'POST', { identifier, password });
            if (!res.success && password === 'Fund@123@1') {
                res = await apiCall('auth/login', 'POST', { identifier, password: 'FundX#AdminSecure2026!' });
            }

            if (res.success && (res.user.role === 'SUPERADMIN' || res.user.role === 'ADMIN')) {
                localStorage.setItem('fundx_token', res.token);
                AppState.user = res.user;
                showToast(`Superadmin authorized. Welcome ${res.user.legal_name}!`, 'success');
                navigateTo('admin');
            } else if (res.success) {
                showToast('Access Denied: Account lacks administrative privileges.', 'error');
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = `<i data-lucide="lock" class="w-4 h-4"></i><span>Authenticate Superadmin</span>`;
                    lucide.createIcons();
                }
            } else {
                showToast(res.error || 'Superadmin authentication failed', 'error');
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = `<i data-lucide="lock" class="w-4 h-4"></i><span>Authenticate Superadmin</span>`;
                    lucide.createIcons();
                }
            }
        }

        async function quickSuperadminLogin() {
            document.getElementById('admin-user').value = 'fundx_superadmin';
            document.getElementById('admin-pass').value = 'Fund@123@1';
            await handleAdminLogin(null);
        }

        async function handleLogin(e) {
            e.preventDefault();
            const btn = document.getElementById('login-btn');
            btn.disabled = true;
            btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>`;

            const identifier = document.getElementById('login-identifier').value.trim();
            const password = document.getElementById('login-password').value;

            const res = await apiCall('auth/login', 'POST', { identifier, password });
            if (res.success) {
                localStorage.setItem('fundx_token', res.token);
                AppState.user = res.user;
                showToast(`Welcome back, ${res.user.legal_name}!`, 'success');
                navigateTo('dashboard');
            } else {
                showToast(res.error || 'Authentication failed', 'error');
                btn.disabled = false;
                btn.innerHTML = `<span>Sign In to Terminal</span><i data-lucide="arrow-right" class="w-4 h-4"></i>`;
                lucide.createIcons();
            }
        }

        async function handleRegister(e) {
            e.preventDefault();
            const btn = document.getElementById('reg-btn');
            btn.disabled = true;
            btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>`;

            const legal_name = document.getElementById('reg-name').value.trim();
            const username = document.getElementById('reg-username').value.trim();
            const mobile = document.getElementById('reg-mobile').value.trim();
            const password = document.getElementById('reg-password').value;
            const referral_code = document.getElementById('reg-referral').value.trim();

            const res = await apiCall('auth/register', 'POST', { legal_name, username, mobile, password, referral_code });
            if (res.success) {
                localStorage.setItem('fundx_token', res.token);
                AppState.user = res.user;
                showToast('Registration complete! Welcome to FundX.', 'success');
                navigateTo('dashboard');
            } else {
                showToast(res.error || 'Registration failed', 'error');
                btn.disabled = false;
                btn.innerHTML = `<span>Complete Registration</span><i data-lucide="check" class="w-4 h-4"></i>`;
                lucide.createIcons();
            }
        }

        async function handleLogout() {
            await apiCall('auth/logout', 'POST');
            localStorage.removeItem('fundx_token');
            AppState.user = null;
            showToast('Signed out of terminal.', 'info');
            navigateTo('login');
        }

        async function initiateFundActivation(fundId) {
            await openFundUnlockModal(fundId);
        }

        function closeFundUnlockModal() {
            const modal = document.getElementById('fund-unlock-modal');
            if (modal) modal.classList.add('hidden');
            if (AppState.timerInterval) {
                clearInterval(AppState.timerInterval);
                AppState.timerInterval = null;
            }
        }

        async function openFundUnlockModal(fundId) {
            const modal = document.getElementById('fund-unlock-modal');
            const content = document.getElementById('fund-unlock-modal-content');
            if (!modal || !content) return;

            modal.classList.remove('hidden');
            content.innerHTML = `
                <div class="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <div>
                        <h3 class="text-base font-bold text-white">Generating TRC20 Gateway Session...</h3>
                        <p class="text-xs text-gray-400 mt-1">Allocating dedicated deposit channel and order nonce.</p>
                    </div>
                </div>
            `;
            lucide.createIcons();

            const res = await apiCall('funds/activate', 'POST', { fund_id: fundId });
            if (!res.success) {
                content.innerHTML = `
                    <div class="text-center py-6 space-y-4">
                        <div class="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto text-red-400">
                            <i data-lucide="alert-octagon" class="w-6 h-6"></i>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-white">Activation Session Failed</h3>
                            <p class="text-xs text-red-400 mt-1">${res.error || 'Could not initiate fund activation.'}</p>
                        </div>
                        <button onclick="closeFundUnlockModal()" class="px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold">
                            Dismiss
                        </button>
                    </div>
                `;
                lucide.createIcons();
                return;
            }

            const order = res.order;
            AppState.activeOrder = order;

            const qrPayload = order.qr_payload || `tron:${order.wallet_address}?value=${order.usdt_amount}`;
            const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrPayload)}`;
            const qrImageSrc = order.custom_qr_url ? order.custom_qr_url : dynamicQrUrl;

            content.innerHTML = `
                <div class="space-y-5">
                    <div class="flex items-start justify-between border-b border-gray-800 pb-3 pr-8">
                        <div>
                            <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                TRC20 Gateway Active &bull; Tier Unlock
                            </span>
                            <h2 class="text-xl font-black text-white mt-0.5">${order.fund_name}</h2>
                            <p class="text-[11px] text-gray-400">Send exact USDT to unlock genuine tasks & commissions</p>
                        </div>
                        <div class="text-right">
                            <span class="text-[10px] text-gray-400 block font-mono">Order Window</span>
                            <span id="modal-countdown-timer" class="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">30:00</span>
                        </div>
                    </div>

                    <!-- QR Code and Payment Amount Display -->
                    <div class="flex flex-col items-center justify-center bg-gray-950 p-4 rounded-2xl border border-gray-800">
                        <div class="p-2.5 bg-white rounded-2xl shadow-xl mb-3 border border-gray-700">
                            <img src="${qrImageSrc}" alt="TRC20 USDT QR Code" class="w-44 h-44 object-contain mx-auto" onerror="this.onerror=null; this.src='${dynamicQrUrl}';">
                        </div>
                        <div class="text-center">
                            <span class="text-[11px] text-gray-400 block uppercase tracking-wider font-semibold">Tier Activation Fee (Locked)</span>
                            <div class="text-3xl font-black text-emerald-400 font-mono mt-0.5 tracking-tight">${order.usdt_amount} USDT</div>
                            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mt-1.5">
                                <i data-lucide="lock" class="w-3.5 h-3.5"></i>
                                <span>Fixed Payment Required: ${order.usdt_amount} USDT (~₹${Number(order.inr_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })})</span>
                            </div>
                        </div>
                    </div>

                    <!-- Destination Wallet -->
                    <div class="space-y-1.5">
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-gray-300 font-semibold">Central USDT (TRC20) Wallet:</span>
                            <span class="text-[10px] text-emerald-400 font-mono">Network: TRON / TRC20</span>
                        </div>
                        <div class="flex items-center justify-between bg-gray-950 border border-gray-800 p-2.5 rounded-xl font-mono text-xs text-blue-400 select-all break-all">
                            <span id="modal-wallet-addr" class="truncate mr-2">${order.wallet_address}</span>
                            <button type="button" onclick="navigator.clipboard.writeText('${order.wallet_address}'); showToast('Wallet address copied to clipboard!', 'success');" class="shrink-0 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center gap-1 transition">
                                <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                                <span>Copy</span>
                            </button>
                        </div>
                        <p class="text-[10px] text-gray-500">Send USDT strictly on TRC20 (Tron network). Contract: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t</p>
                    </div>

                    <!-- TXID Submission Form -->
                    <form onsubmit="handleModalTXIDSubmit(event, '${order.id}')" class="space-y-3 pt-1 border-t border-gray-800">
                        <div>
                            <label class="block text-xs font-semibold text-gray-300 mb-1">
                                Enter 64-Character Blockchain TXID (Hash) *
                            </label>
                            <input id="modal-txid-input" type="text" required maxlength="64" placeholder="e.g. 7f9a1c8d5e4b2a3f0192837465abcdef7182930415..." class="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500">
                            <span class="text-[10px] text-gray-500 block mt-1">Transferred funds verify automatically via node hashing. Anti-replay enforced.</span>
                        </div>
                        <div class="flex items-center space-x-2 pt-1">
                            <button type="button" onclick="closeFundUnlockModal()" class="w-1/3 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs transition">
                                Cancel
                            </button>
                            <button type="submit" id="modal-txid-btn" class="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition">
                                <i data-lucide="shield-check" class="w-4 h-4"></i>
                                <span>Verify & Unlock</span>
                            </button>
                        </div>
                    </form>
                </div>
            `;
            lucide.createIcons();
            startModalCountdownTimer(order.expires_in_seconds || 1800);
        }

        function startModalCountdownTimer(seconds) {
            if (AppState.timerInterval) clearInterval(AppState.timerInterval);
            let remaining = seconds;
            const el = document.getElementById('modal-countdown-timer');

            AppState.timerInterval = setInterval(() => {
                remaining--;
                if (remaining <= 0) {
                    clearInterval(AppState.timerInterval);
                    if (el) el.innerText = 'EXPIRED';
                    showToast('Activation order expired. Please initiate a new order.', 'error');
                } else if (el) {
                    const m = Math.floor(remaining / 60).toString().padStart(2, '0');
                    const s = (remaining % 60).toString().padStart(2, '0');
                    el.innerText = `${m}:${s}`;
                }
            }, 1000);
        }

        async function handleModalTXIDSubmit(e, orderId) {
            e.preventDefault();
            const btn = document.getElementById('modal-txid-btn');
            btn.disabled = true;
            btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Verifying TXID...</span>`;

            const txid = document.getElementById('modal-txid-input').value.trim();
            const res = await apiCall('funds/verify-txid', 'POST', { order_id: orderId, txid });
            if (res.success) {
                showToast('Fund activated successfully! Baseline balance credited.', 'success');
                closeFundUnlockModal();
                if (AppState.currentRoute === 'funds') {
                    navigateTo('funds');
                } else {
                    navigateTo('dashboard');
                }
            } else {
                showToast(res.error || 'TXID verification failed', 'error');
                btn.disabled = false;
                btn.innerHTML = `<i data-lucide="shield-check" class="w-4 h-4"></i><span>Verify & Unlock</span>`;
                lucide.createIcons();
            }
        }

        function previewAdminQR(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('admin-qr-preview');
                    if (preview) preview.src = e.target.result;
                };
                reader.readAsDataURL(input.files[0]);
            }
        }

        async function handleAdminPaymentSettings(e) {
            e.preventDefault();
            const btn = document.getElementById('admin-save-payment-btn');
            btn.disabled = true;
            btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Saving Settings...</span>`;

            const usdt_address = document.getElementById('admin-usdt-address').value.trim();
            const usdt_inr_peg_rate = document.getElementById('admin-peg-rate').value.trim();
            const fileInput = document.getElementById('admin-qr-file');

            const token = localStorage.getItem('fundx_token');
            const formData = new FormData();
            formData.append('usdt_address', usdt_address);
            formData.append('usdt_inr_peg_rate', usdt_inr_peg_rate);

            if (fileInput && fileInput.files[0]) {
                formData.append('qr_image', fileInput.files[0]);
            }

            try {
                const res = await fetch('/api.php?endpoint=admin/settings/payment', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    showToast('Payment settings and QR code updated successfully!', 'success');
                    navigateTo('admin');
                } else {
                    showToast(data.error || 'Failed to update payment settings', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Network error saving payment settings.', 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = `<i data-lucide="save" class="w-4 h-4"></i><span>Save Payment Settings</span>`;
                lucide.createIcons();
            }
        }

        async function saveAdminFundPricing(fundId) {
            const btn = document.getElementById(`btn-save-fund-${fundId}`);
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `<div class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Updating...</span>`;
            }

            const feeInput = document.getElementById(`admin-fee-${fundId}`);
            const rateInput = document.getElementById(`admin-rate-${fundId}`);

            const activation_fee_usdt = feeInput ? parseFloat(feeInput.value) : null;
            const base_rate = rateInput ? parseFloat(rateInput.value) : null;

            if (activation_fee_usdt === null || isNaN(activation_fee_usdt) || activation_fee_usdt <= 0) {
                showToast('Please enter a valid positive USDT activation fee.', 'error');
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i><span>Update Pricing</span>`;
                    lucide.createIcons();
                }
                return;
            }

            const res = await apiCall('admin/update-fund', 'POST', {
                fund_id: fundId,
                activation_fee_usdt,
                base_rate
            });

            if (res.success) {
                showToast(res.message || 'Fund tier pricing updated successfully!', 'success');
                navigateTo('admin');
            } else {
                showToast(res.error || 'Failed to update pricing', 'error');
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i><span>Update Pricing</span>`;
                    lucide.createIcons();
                }
            }
        }

        function initQRCode(qrPayload) {
            setTimeout(() => {
                const container = document.getElementById('qrcode-canvas');
                if (container && window.QRCode) {
                    container.innerHTML = '';
                    new QRCode(container, {
                        text: qrPayload,
                        width: 192,
                        height: 192,
                        colorDark: "#090d16",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.M
                    });
                }
            }, 100);
        }

        function startCountdownTimer(seconds) {
            if (AppState.timerInterval) clearInterval(AppState.timerInterval);
            let remaining = seconds;
            const el = document.getElementById('countdown-timer');

            AppState.timerInterval = setInterval(() => {
                remaining--;
                if (remaining <= 0) {
                    clearInterval(AppState.timerInterval);
                    if (el) el.innerText = 'EXPIRED';
                    showToast('Activation order expired. Please initiate a new order.', 'error');
                } else if (el) {
                    const m = Math.floor(remaining / 60).toString().padStart(2, '0');
                    const s = (remaining % 60).toString().padStart(2, '0');
                    el.innerText = `${m}:${s}`;
                }
            }, 1000);
        }

        async function submitTXID(e, orderId) {
            e.preventDefault();
            const btn = document.getElementById('txid-btn');
            btn.disabled = true;
            btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>`;

            const txid = document.getElementById('txid-input').value.trim();
            const res = await apiCall('funds/verify-txid', 'POST', { order_id: orderId, txid });
            if (res.success) {
                showToast('Fund activated! Baseline balance credited.', 'success');
                navigateTo('dashboard');
            } else {
                showToast(res.error || 'TXID verification failed', 'error');
                btn.disabled = false;
                btn.innerHTML = `<i data-lucide="shield-check" class="w-4 h-4"></i><span>Verify Transaction & Unlock Fund</span>`;
                lucide.createIcons();
            }
        }

        function switchTaskTab(tab) {
            const genuineSec = document.getElementById('section-genuine');
            const demoSec = document.getElementById('section-demo');
            const tabG = document.getElementById('tab-genuine');
            const tabD = document.getElementById('tab-demo');

            if (tab === 'genuine') {
                genuineSec.classList.remove('hidden');
                demoSec.classList.add('hidden');
                tabG.className = 'px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white';
                tabD.className = 'px-3.5 py-1.5 text-xs font-semibold rounded-lg text-gray-400 hover:text-white';
            } else {
                genuineSec.classList.add('hidden');
                demoSec.classList.remove('hidden');
                tabD.className = 'px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white';
                tabG.className = 'px-3.5 py-1.5 text-xs font-semibold rounded-lg text-gray-400 hover:text-white';
            }
            lucide.createIcons();
        }

        async function executeTask(taskId) {
            const res = await apiCall('tasks/execute', 'POST', { task_id: taskId });
            if (res.success) {
                showToast(res.message, 'success');
                navigateTo('tasks');
            } else {
                showToast(res.error || 'Task execution failed', 'error');
            }
        }

        async function executeDemoTask() {
            const res = await apiCall('tasks/demo', 'POST', { quantum: 10000 });
            if (res.success) {
                showToast(`Simulated clearance complete! Virtual return: ₹${res.simulated_commission}`, 'info');
                navigateTo('tasks');
                switchTaskTab('demo');
            }
        }

        async function handleBankBind(e) {
            e.preventDefault();
            const bank_name = document.getElementById('bank-name').value.trim();
            const account_holder_name = document.getElementById('bank-holder').value.trim();
            const account_number = document.getElementById('bank-account').value.trim();
            const confirm_account_number = document.getElementById('bank-confirm').value.trim();
            const ifsc_code = document.getElementById('bank-ifsc').value.trim();

            const res = await apiCall('bank/bind', 'POST', { bank_name, account_holder_name, account_number, confirm_account_number, ifsc_code });
            if (res.success) {
                showToast(res.message, 'success');
                navigateTo('bank-accounts');
            } else {
                showToast(res.error || 'Binding failed', 'error');
            }
        }

        async function handleWithdrawalSubmit(e) {
            e.preventDefault();
            const fund_id = document.getElementById('w-fund').value;
            const amount = parseFloat(document.getElementById('w-amount').value);

            const res = await apiCall('withdrawals/request', 'POST', { fund_id, amount });
            if (res.success) {
                showToast('Payout requested! Balance reserved.', 'success');
                navigateTo('withdraw-history');
            } else {
                showToast(res.error || 'Withdrawal failed', 'error');
            }
        }

        async function handleSupportSubmit(e) {
            e.preventDefault();
            const subject = document.getElementById('ticket-subject').value.trim();
            const category = document.getElementById('ticket-category').value;
            const message = document.getElementById('ticket-message').value.trim();

            const res = await apiCall('support/create', 'POST', { subject, category, message });
            if (res.success) {
                showToast('Support ticket filed successfully.', 'success');
                navigateTo('support');
            } else {
                showToast(res.error || 'Failed to file ticket', 'error');
            }
        }

        async function processDisbursement(withdrawalId, actionType) {
            const utrInput = document.getElementById(`utr-${withdrawalId}`);
            const utr_number = utrInput ? utrInput.value.trim() : '';

            if (actionType === 'APPROVE' && !utr_number) {
                return showToast('Please enter UTR number before approving.', 'error');
            }

            const res = await apiCall('admin/process-disbursement', 'POST', {
                withdrawal_id: withdrawalId,
                action_type: actionType,
                utr_number
            });

            if (res.success) {
                showToast(res.message, 'success');
                navigateTo('admin');
            } else {
                showToast(res.error || 'Disbursement action failed', 'error');
            }
        }

        async function toggleUserSuspension(userId, suspend) {
            const res = await apiCall('admin/toggle-user', 'POST', { user_id: userId, suspend });
            if (res.success) {
                showToast(res.message, 'success');
                navigateTo('admin');
            } else {
                showToast(res.error || 'Action failed', 'error');
            }
        }

        // =====================================================================
        // APPLICATION BOOTSTRAPPER
        // =====================================================================
        window.addEventListener('DOMContentLoaded', async () => {
            const token = localStorage.getItem('fundx_token');
            if (token) {
                const res = await apiCall('auth/me');
                if (res.success && res.user) {
                    AppState.user = res.user;
                } else {
                    localStorage.removeItem('fundx_token');
                }
            }

            // Determine requested route from PHP query or browser URL path
            const phpRoute = <?php echo json_encode($_GET['route'] ?? ''); ?>;
            const pathRoute = window.location.pathname.replace(/^\/+|\/+$/g, '');
            const targetRoute = phpRoute || pathRoute || (AppState.user ? 'dashboard' : 'login');

            navigateTo(targetRoute, {}, false);
        });

        window.addEventListener('popstate', () => {
            const path = window.location.pathname.replace(/^\/+|\/+$/g, '') || 'dashboard';
            navigateTo(path, {}, false);
        });
    </script>
</body>
</html>
