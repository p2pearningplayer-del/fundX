# FundX Panel — Institutional Fund-Orchestration & Commission Engine

[![CI/CD Pipeline](https://github.com/p2pearningplayer-del/fundX/actions/workflows/deploy.yml/badge.svg)](https://github.com/p2pearningplayer-del/fundX/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRD Version](https://img.shields.io/badge/PRD%20Baseline-v1.0%20(Stable)-emerald.svg)]()
[![Ledger](https://img.shields.io/badge/Ledger-ACID%20Double--Entry-purple.svg)]()

> **Antigravity Product Specification PRD v1.0 (Stable Baseline)**  
> Target Deployment: Enterprise Monorepo  
> Primary Currencies: INR (Fiat) & USDT (TRC20 — Contract: `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`)

---

## 1. Project Overview & Ecosystem Scope

**FundX Panel** is an institutional fund-orchestration engine enabling segmented fund activation, transaction-task generation, and auditable multi-tier commission disbursement. Built for enterprise high-availability, the system features:
- **Responsive Web Application & TWA Viewport**: Next.js 14, React 18, Tailwind CSS, Lucide icons.
- **Microservice / REST API Backend**: Next.js App Router API microservices with double-entry ledgering and crypto-fiat segregation.
- **PostgreSQL ACID Ledger**: Multi-engine persistence with ACID compliance, constraints, foreign keys, triggers, and partitioning (`schema.sql` and `database.sql`).
- **Android Web APK / TWA Wrapper**: Complete Android Studio project (`android/`) leveraging Trusted Web Activity (TWA) protocols with `assetlinks.json` Digital Asset Links.
- **USDT TRC20 Verification Engine**: Dynamic 30-minute QR orders, TronGrid RPC scanning, contract verification, and unique TXID enforcement to prevent replay vectors.
- **Zero-Trust Administrative Console**: Granular RBAC console for live fund configuration, TXID approval desk, payout processing, user suspension, and immutable audit logging.

---

## 2. 3-Tier Isolated Fund Architecture

| Fund Category | Activation Fee | Configured Rate | Task Amount Range | Default Status |
| :--- | :--- | :--- | :--- | :--- |
| **Gaming Fund** | 9.0% | **9.0% Base Rate** | ₹1,000 – ₹30,000 | Independent / Locked |
| **Stock Fund** | 18.0% | **18.0% Base Rate** | ₹1,000 – ₹30,000 | Independent / Locked |
| **Mix Fund** | 24.0% | **24.0% Base Rate** | ₹1,000 – ₹30,000 | Independent / Locked |

> **Configuration Rule**: The activation fee percentages operate against an administrator-defined baseline valuation per tier. Percentages do not auto-evaluate until the base calculation quantum is committed via the Admin Console. Each fund strictly maintains isolated states, ledger balances, and withdrawal pipelines.

---

## 3. End-to-End System Activation Lifecycle

```
[1. User Selection] ────► [2. USDT TRC20 Order] ────► [3. Blockchain RPC Scan]
Chooses Fund Tier          Dynamic QR + 30-Min Expiry    TXID hash verified via RPC
(Gaming, Stock, Mix)       Order ID Generated            Contract & Uniqueness Check
                                                                   │
                                                                   ▼
[5. Task & Commission Payout] ◄──── [4. Fund Gate Lifted & Bank Bound]
Tasks disburse commission           Feature unlocks; domestic bank accounts
to double-entry ledger              bound under AES-256 PII protection
```

---

## 4. Default Seed Data & Initial Credentials

Upon initialization, the database automatically boots with the following baseline credentials and default records:

### Initial Superadmin Account
- **Legal Name**: `System Superadministrator`
- **Username**: `fundx_superadmin`
- **Mobile Number**: `9876543210`
- **Email**: `superadmin@fundx.internal`
- **Password**: `FundX#AdminSecure2026!`
- **Role**: `SUPERADMIN` (Full RBAC privilege for live toggles, user freezes, and audit desk)
- **Hash Cost**: Bcrypt cost factor 12

### Pre-Configured Investor User Account
- **Legal Name**: `Rajesh Kumar Verma`
- **Username**: `rajesh_fundx`
- **Mobile Number**: `9812345678`
- **Password**: `FundX#AdminSecure2026!`
- **Role**: `USER`
- **Associated Fund**: `Gaming Fund` (Pre-activated with verified bank account `XXXX-XXXX-4819` for instant testing)

---

## 5. Information Architecture & Complete Screen Inventory (23 Screens + Admin)

| # | Screen Name | Route | PRD Description |
|---|---|---|---|
| **1** | Landing Page | `/` | Institutional hero, live rate tickers, security badges, trust metrics |
| **2** | Registration Page | `/register` | Frictionless acquisition without upfront OTP barrier, Bcrypt cost 12 |
| **3** | Login Portal | `/login` | Dual token issuance, suspicious login shield, IP anomaly detection |
| **4** | Forgot Password | `/forgot-password` | Security ledger credential recovery and reset flow |
| **5** | User Dashboard | `/dashboard` | Multi-ledger balances overview, isolated fund cards, quick actions |
| **6** | Fund Selection Screen | `/funds` | 3-Tier isolated fund specifications & deterministic yield calculator |
| **7** | Activation Overview | `/activation` | Tier prerequisites, deposit guidelines, 3-state activation lifecycle |
| **8** | USDT TRC20 Gateway | `/activation/gateway` | Dynamic QR code, 30-min countdown timer, TXID submission box |
| **9** | Activation History | `/activation/history` | Log of TRC20 orders, TXID hashes, and blockchain audit states |
| **10** | Account Management | `/bank-accounts` | Bank Account Binding with active gate, double-entry validation, AES-256 |
| **11** | Task Dashboard | `/tasks` | Dual task engine: Genuine tasks vs Partitioned DEMO simulation |
| **12** | Task Ledger History | `/tasks/ledger` | Double-entry ledger audit, calculation basis, and status codes |
| **13** | Commission Wallet | `/wallet` | Multi-tier isolated balances, reservations, and lifetime earnings |
| **14** | Commission Records | `/wallet/records` | Log of task commission credit entries committed to ledger |
| **15** | Withdrawal Gateway | `/withdraw` | Real-time balance reservation pipeline preventing double-spending |
| **16** | Withdrawal Log | `/withdraw/history` | Reservation records, UTR hashes, and compensating rollback notes |
| **17** | In-App Notifications | `/notifications` | Real-time alerts on activations, commissions, and settlements |
| **18** | User Profile Center | `/profile` | Global UUID, KYC profile details, and referral affiliate tracking |
| **19** | Security Settings | `/security` | Dual token sessions, active devices, and IP audit ledger |
| **20** | Terms of Service | `/terms` | Institutional governance, fund activation policies, task rules |
| **21** | Privacy Policy | `/privacy` | AES-256 PII Vault architecture & zero plaintext exposure guarantee |
| **22** | Risk Disclosure | `/risk-disclosure` | Financial disclosures on crypto finality and settlement windows |
| **23** | 24/7 Support Desk | `/support` | Ticket submission, operations desk live chat, SLA priority escalation |
| **Admin** | Administrative Console | `/admin` | Live fund configs, TXID review, UTR disbursement desk, user freeze |

---

## 6. Execution Commands & Quick Start

### Prerequisites
- Node.js 18+ or 20+
- npm 9+
- Optional: PostgreSQL 14+ (fallback atomic engine active for instant zero-dependency testing)

### Installation
```bash
# Clone the repository
git clone https://github.com/p2pearningplayer-del/fundX.git
cd fundX

# Install dependencies
npm install

# Run automated unit and security test suite
npm test

# Run local development server
npm run dev
```

Visit `http://localhost:3000` to launch the platform.

### Production Build & Launch
```bash
# Verify production build
npm run build

# Start production server
npm start
```

### Docker Container Deployment
```bash
# Launch PostgreSQL and FundX App together via docker-compose
docker-compose up --build -d
```

---

## 7. Cryptographic & Security Specifications

1. **USDT TRC20 Token Contract**: `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` (Tether on TRON).
2. **Replay Attack Prevention**: Unique database index constraint on `txid_hash` ensures no transaction hash can ever be redeemed twice.
3. **AES-256-GCM PII Vault**: Domestic bank account numbers and account holder legal names are encrypted at rest with authenticated tags. Zero plaintext exposure in logs, client APIs, or presentation viewports.
4. **RBI IFSC Format Regex**: Validated against `^[A-Z]{4}0[A-Z0-9]{6}$`.
5. **Deterministic Commission Formula**:
   $$\text{Commission} = \text{Eligible\_Task\_Quantum} \times \text{Configured\_Fund\_Rate}$$
   - Gaming (9.0%): ₹1,000 task $\rightarrow$ ₹90.00
   - Stock (18.0%): ₹1,000 task $\rightarrow$ ₹180.00
   - Mix (24.0%): ₹1,000 task $\rightarrow$ ₹240.00
6. **Balance Reservation Pipeline**: Initiating a payout creates an immediate reservation against the fund-specific ledger (`RESERVED`), decrementing available balance in real-time. Marking a payout PAID requires a cryptographically validated UTR hash; rejected or failed payouts trigger an automated compensating rollback transaction.

---

## 8. Android Web APK (PWA / TWA Wrapper)

The `android/` directory contains an Android Studio project utilizing Google's Android Browser Helper (`androidbrowserhelper:2.5.0`):
- **Digital Asset Links**: Configured in `public/.well-known/assetlinks.json`.
- **TWA Launcher Activity**: Declared in `android/app/src/main/AndroidManifest.xml`.
- **Offline Safeguard**: Service worker caching configured in `public/sw.js` and `public/offline.html`.

---

## 9. Monorepo Structure

```
fundX/
├── .github/workflows/deploy.yml   # Automated GitHub Actions CI/CD pipeline
├── android/                       # Native Android TWA wrapper project
│   ├── app/
│   │   ├── src/main/AndroidManifest.xml
│   │   └── build.gradle
│   ├── build.gradle
│   └── settings.gradle
├── data/                          # Atomic persistence file store
├── public/
│   ├── .well-known/assetlinks.json# Android Digital Asset Links
│   ├── manifest.json              # PWA Web App Manifest
│   ├── sw.js                      # Service Worker
│   └── offline.html               # Offline presentation fallback
├── src/
│   ├── app/                       # Next.js App Router (23 screens + Admin)
│   │   ├── api/                   # Microservice REST API routes
│   │   ├── activation/            # Screens 7, 8, 9
│   │   ├── bank-accounts/         # Screen 10
│   │   ├── tasks/                 # Screens 11, 12
│   │   ├── wallet/                # Screens 13, 14
│   │   ├── withdraw/              # Screens 15, 16
│   │   ├── admin/                 # Zero-Trust Admin Console
│   │   ├── layout.tsx
│   │   └── page.tsx               # Screen 1 (Landing)
│   ├── components/                # Modular UI components
│   └── lib/                       # Core backend services (db, crypto, auth, ledger, trc20, tasks)
├── test/
│   └── suite.js                   # Automated unit & cryptographic test suite
├── .env.example                   # Environment configuration template
├── database.sql                   # Portable ANSI SQL DDL & seeds
├── schema.sql                     # PostgreSQL ACID schema migrations
├── Dockerfile                     # Multi-stage production container build
├── docker-compose.yml             # App & PostgreSQL container orchestration
├── package.json
└── README.md
```

---
*FundX Panel is engineered in compliance with Antigravity Product Specification PRD v1.0.*
