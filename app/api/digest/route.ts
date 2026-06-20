import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { sendEmail } from '@/lib/mailer';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

interface DigestData {
    month: string;
    totalIncome: number;
    totalExpense: number;
    topCategories: { category: string; amount: number }[];
    totalTransactions: number;
    savingsRate: number;
    previousMonth: {
        totalIncome: number;
        totalExpense: number;
        incomeChange: number;
        expenseChange: number;
    };
}

function parseMonth(monthParam: string | null): { start: Date; end: Date; label: string; prevStart: Date; prevEnd: Date } {
    const now = new Date();
    let year: number, month: number;

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
        const [y, m] = monthParam.split('-').map(Number);
        year = y;
        month = m - 1;
    } else {
        year = now.getFullYear();
        month = now.getMonth();
    }

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    const prevStart = new Date(year, month - 1, 1);
    const prevEnd = new Date(year, month, 0, 23, 59, 59, 999);
    const label = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return { start, end, label, prevStart, prevEnd };
}

function pctChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 10000) / 100;
}

async function generateDigest(request: NextRequest): Promise<{ digest: DigestData; status: number; error?: string }> {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        return { digest: null as any, status: 401, error: 'Unauthorized' };
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) {
        return { digest: null as any, status: 401, error: 'Invalid token' };
    }

    const { db } = await connectToDatabase();

    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member || !member.collection) {
        return { digest: null as any, status: 404, error: 'User not found' };
    }

    const collectionKey = member.collection;
    const { searchParams } = new URL(request.url);
    const { start, end, label, prevStart, prevEnd } = parseMonth(searchParams.get('month'));

    // Current month totals
    const totals = await db.collection('expenses').aggregate([
        { $match: { collection: collectionKey, createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]).toArray();

    const totalIncome = totals.find((r: any) => r._id === 'credit')?.total || 0;
    const totalExpense = totals.find((r: any) => r._id === 'debit')?.total || 0;

    // Top 5 categories by expense
    const topCategories = await db.collection('expenses').aggregate([
        { $match: { collection: collectionKey, createdAt: { $gte: start, $lte: end }, type: 'debit' } },
        { $group: { _id: '$category', amount: { $sum: '$amount' } } },
        { $sort: { amount: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, category: '$_id', amount: 1 } }
    ]).toArray();

    // Total transactions count
    const totalTransactions = await db.collection('expenses').countDocuments({
        collection: collectionKey,
        createdAt: { $gte: start, $lte: end }
    });

    // Previous month totals
    const prevTotals = await db.collection('expenses').aggregate([
        { $match: { collection: collectionKey, createdAt: { $gte: prevStart, $lte: prevEnd } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]).toArray();

    const prevIncome = prevTotals.find((r: any) => r._id === 'credit')?.total || 0;
    const prevExpense = prevTotals.find((r: any) => r._id === 'debit')?.total || 0;

    const savingsRate = totalIncome > 0
        ? Math.round(((totalIncome - totalExpense) / totalIncome) * 10000) / 100
        : 0;

    const digest: DigestData = {
        month: label,
        totalIncome,
        totalExpense,
        topCategories: topCategories as { category: string; amount: number }[],
        totalTransactions,
        savingsRate,
        previousMonth: {
            totalIncome: prevIncome,
            totalExpense: prevExpense,
            incomeChange: pctChange(totalIncome, prevIncome),
            expenseChange: pctChange(totalExpense, prevExpense),
        },
    };

    return { digest, status: 200 };
}

function buildDigestHtml(digest: DigestData): string {
    const fmt = (n: number) => n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
    const arrow = (v: number) => v > 0 ? `&#9650; ${v}%` : v < 0 ? `&#9660; ${Math.abs(v)}%` : '0%';
    const arrowColor = (v: number, invert = false) => {
        const positive = invert ? v < 0 : v > 0;
        return positive ? '#16a34a' : v === 0 ? '#6b7280' : '#dc2626';
    };

    const categoryRows = digest.topCategories.map(c =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${c.category || 'Uncategorized'}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${fmt(c.amount)}</td></tr>`
    ).join('');

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;">
  <tr><td style="background:#1e293b;padding:24px 32px;text-align:center;">
    <h1 style="color:#ffffff;margin:0;font-size:24px;">TrackTok Monthly Digest</h1>
    <p style="color:#94a3b8;margin:4px 0 0;">${digest.month}</p>
  </td></tr>
  <tr><td style="padding:24px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:16px;background:#f0fdf4;border-radius:8px;text-align:center;width:50%;">
          <p style="margin:0;color:#6b7280;font-size:12px;">INCOME</p>
          <p style="margin:4px 0;font-size:20px;font-weight:bold;color:#16a34a;">${fmt(digest.totalIncome)}</p>
          <p style="margin:0;font-size:12px;color:${arrowColor(digest.previousMonth.incomeChange)};">${arrow(digest.previousMonth.incomeChange)} vs last month</p>
        </td>
        <td style="width:12px;"></td>
        <td style="padding:16px;background:#fef2f2;border-radius:8px;text-align:center;width:50%;">
          <p style="margin:0;color:#6b7280;font-size:12px;">EXPENSES</p>
          <p style="margin:4px 0;font-size:20px;font-weight:bold;color:#dc2626;">${fmt(digest.totalExpense)}</p>
          <p style="margin:0;font-size:12px;color:${arrowColor(digest.previousMonth.expenseChange, true)};">${arrow(digest.previousMonth.expenseChange)} vs last month</p>
        </td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="padding:0 32px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:16px;background:#eff6ff;border-radius:8px;text-align:center;width:50%;">
          <p style="margin:0;color:#6b7280;font-size:12px;">SAVINGS RATE</p>
          <p style="margin:4px 0;font-size:20px;font-weight:bold;color:#2563eb;">${digest.savingsRate}%</p>
        </td>
        <td style="width:12px;"></td>
        <td style="padding:16px;background:#f5f3ff;border-radius:8px;text-align:center;width:50%;">
          <p style="margin:0;color:#6b7280;font-size:12px;">TRANSACTIONS</p>
          <p style="margin:4px 0;font-size:20px;font-weight:bold;color:#7c3aed;">${digest.totalTransactions}</p>
        </td>
      </tr>
    </table>
  </td></tr>
  ${digest.topCategories.length > 0 ? `
  <tr><td style="padding:0 32px 24px;">
    <h3 style="margin:0 0 12px;color:#1e293b;">Top Spending Categories</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <tr style="background:#f9fafb;">
        <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;">CATEGORY</th>
        <th style="padding:8px 12px;text-align:right;font-size:12px;color:#6b7280;">AMOUNT</th>
      </tr>
      ${categoryRows}
    </table>
  </td></tr>` : ''}
  <tr><td style="padding:16px 32px;background:#f9fafb;text-align:center;">
    <p style="margin:0;color:#9ca3af;font-size:12px;">Generated by TrackTok</p>
  </td></tr>
</table>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
    try {
        const { digest, status, error } = await generateDigest(request);
        if (error) {
            return NextResponse.json({ message: error }, { status });
        }
        return NextResponse.json({ data: digest }, { status: 200 });
    } catch (error) {
        console.error('Digest GET error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        const { digest, status, error } = await generateDigest(request);
        if (error) {
            return NextResponse.json({ message: error }, { status });
        }

        const html = buildDigestHtml(digest);
        const emailResult = await sendEmail({
            to: email,
            subject: `TrackTok Monthly Digest - ${digest.month}`,
            html,
        });

        return NextResponse.json({ data: digest, email: emailResult }, { status: 200 });
    } catch (error) {
        console.error('Digest POST error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
