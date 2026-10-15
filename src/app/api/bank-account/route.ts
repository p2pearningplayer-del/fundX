import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { extractAuthToken, verifyAccessToken, getClientIP, getUserAgent } from '@/lib/auth';
import { db } from '@/lib/db';
import { encryptPII, maskAccountNumber, validateIFSC, fuzzyMatchNames } from '@/lib/crypto';
import { BankAccount } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const fundId = searchParams.get('fundId');

    const accounts = db.getBankAccountsByUser(payload.userId);
    const filtered = fundId ? accounts.filter((a) => a.fund_id === fundId) : accounts;

    // PRD Security Rule: Zero PII Exposure. Plaintext account numbers are NEVER returned in API responses.
    const safeAccounts = filtered.map((a) => {
      const fund = db.getFundById(a.fund_id);
      return {
        id: a.id,
        fundId: a.fund_id,
        fundName: fund?.name || 'Isolated Fund',
        bankName: a.bank_name,
        ifscCode: a.ifsc_code,
        accountNumberMasked: a.account_number_masked,
        accountType: a.account_type,
        isVerified: a.is_verified,
        isImmutable: a.is_immutable,
        createdAt: a.created_at,
      };
    });

    return NextResponse.json({ bankAccounts: safeAccounts });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to retrieve accounts';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractAuthToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const user = db.getUserById(payload.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { fundId, accountHolder, bankName, ifscCode, accountNumber, confirmAccountNumber, accountType } = body;

    // 1. Mandatory Field Checks
    if (!fundId || !accountHolder || !bankName || !ifscCode || !accountNumber || !confirmAccountNumber) {
      return NextResponse.json({ error: 'All banking fields are mandatory.' }, { status: 400 });
    }

    // 2. Fund Gate Rule: Bank binding permitted ONLY after parent fund is ACTIVE
    const userFund = db.getUserFund(user.id, fundId);
    if (!userFund || userFund.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Fund Activation Gate: You must activate this fund with USDT TRC20 before binding a bank account.' },
        { status: 403 }
      );
    }

    // 3. Immutability Check: Direct editing is forbidden once bound
    const existingBank = db.getBankAccount(user.id, fundId);
    if (existingBank) {
      return NextResponse.json(
        { error: 'Account Already Bound: Modifying bound bank accounts is forbidden for security. Contact Compliance Support.' },
        { status: 409 }
      );
    }

    // 4. Double-Entry Account Confirmation Match
    const cleanAccount = accountNumber.replace(/\s+/g, '');
    const cleanConfirm = confirmAccountNumber.replace(/\s+/g, '');
    if (cleanAccount !== cleanConfirm) {
      return NextResponse.json({ error: 'Account numbers do not match. Double-entry validation failed.' }, { status: 400 });
    }

    if (!/^\d{9,18}$/.test(cleanAccount)) {
      return NextResponse.json({ error: 'Bank account number must be between 9 and 18 numeric digits.' }, { status: 400 });
    }

    // 5. RBI IFSC Format Regex Validation: ^[A-Z]{4}0[A-Z0-9]{6}$
    const cleanIFSC = ifscCode.trim().toUpperCase();
    if (!validateIFSC(cleanIFSC)) {
      return NextResponse.json(
        { error: 'Invalid IFSC format. Must match RBI format (e.g. HDFC0001234 or SBIN0004567).' },
        { status: 400 }
      );
    }

    // 6. Fuzzy Match with Profile Name
    const isNameMatch = fuzzyMatchNames(user.legal_name, accountHolder);
    if (!isNameMatch) {
      return NextResponse.json(
        { error: `Account holder name mismatch. Bank account holder "${accountHolder}" must match registered KYC legal name "${user.legal_name}".` },
        { status: 400 }
      );
    }

    // 7. AES-256 Encryption at Rest & UI Masking
    const encryptedHolder = encryptPII(accountHolder.trim());
    const encryptedAccount = encryptPII(cleanAccount);
    const maskedAccount = maskAccountNumber(cleanAccount);

    const bankAccount: BankAccount = {
      id: crypto.randomUUID(),
      user_id: user.id,
      fund_id: fundId,
      account_holder_encrypted: encryptedHolder,
      bank_name: bankName.trim(),
      ifsc_code: cleanIFSC,
      account_number_encrypted: encryptedAccount,
      account_number_masked: maskedAccount,
      account_type: accountType === 'CURRENT' ? 'CURRENT' : 'SAVINGS',
      is_verified: true,
      is_immutable: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.createBankAccount(bankAccount);

    // Audit Log & Notification
    db.addSecurityLog({
      user_id: user.id,
      event_type: 'BANK_ACCOUNT_BOUND',
      ip_address: getClientIP(req),
      user_agent: getUserAgent(req),
      metadata: {
        fundId,
        bankName: bankAccount.bank_name,
        ifsc: cleanIFSC,
        masked: maskedAccount,
      },
    });

    db.createNotification({
      user_id: user.id,
      title: 'Bank Account Bound Successfully',
      message: `${bankAccount.bank_name} (${maskedAccount}) has been permanently bound for withdrawal settlements.`,
      category: 'SECURITY',
      is_read: false,
      action_url: '/bank-accounts',
    });

    return NextResponse.json({
      success: true,
      message: 'Bank account bound successfully with AES-256 encryption.',
      bankAccount: {
        id: bankAccount.id,
        fundId: bankAccount.fund_id,
        bankName: bankAccount.bank_name,
        ifscCode: bankAccount.ifsc_code,
        accountNumberMasked: bankAccount.account_number_masked,
        accountType: bankAccount.account_type,
        isVerified: bankAccount.is_verified,
        isImmutable: bankAccount.is_immutable,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Bank binding failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
