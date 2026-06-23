import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken, phonesMatch, normalizePhone } from '@/lib/auth';
import { sendEmail } from '@/lib/mailer';
import { NextRequest, NextResponse } from 'next/server';

interface Settlement {
  memberName: string;
  memberPhone: string;
  amount: number;
}

function calculateWhoOwesUser(expenses: any[], userPhone: string): Settlement[] {
  const netBalances: { [key: string]: { amount: number; debtorName: string; rawPhone: string } } = {};
  const normalizedUserPhone = normalizePhone(userPhone);

  expenses.forEach((expense) => {
    if (!expense.split || expense.split.length === 0) return;

    const owner = expense.split.find((s: any) => s.owner === true);
    if (!owner) return;

    const ownerPhone = normalizePhone(owner.phone);
    const ownerAmount = owner.amount || 0;
    const isPayment = ownerAmount === 0;

    expense.split.forEach((split: any) => {
      const splitPhone = normalizePhone(split.phone);
      if (splitPhone === ownerPhone) return;

      const otherAmount = split.amount || 0;
      if (otherAmount === 0) return;

      if (isPayment) {
        const reverseKey = `${ownerPhone}|${splitPhone}`;
        if (netBalances[reverseKey]) {
          netBalances[reverseKey].amount -= otherAmount;
          if (netBalances[reverseKey].amount <= 0) {
            delete netBalances[reverseKey];
          }
        }
      } else {
        const key = `${splitPhone}|${ownerPhone}`;
        if (!netBalances[key]) {
          netBalances[key] = { amount: 0, debtorName: split.name, rawPhone: split.phone };
        }
        netBalances[key].amount += otherAmount;
      }
    });
  });

  const settlements: Settlement[] = [];
  Object.entries(netBalances).forEach(([key, value]) => {
    const [, creditorPhone] = key.split('|');
    if (value.amount <= 0) return;

    if (creditorPhone === normalizedUserPhone) {
      settlements.push({
        memberName: value.debtorName,
        memberPhone: value.rawPhone,
        amount: value.amount,
      });
    }
  });

  return settlements;
}

function buildExpenseTable(expenses: any[], debtorPhone: string, creditorPhone: string): string {
  const relevantExpenses = expenses.filter((expense) => {
    if (!expense.split || expense.split.length === 0) return false;
    const owner = expense.split.find((s: any) => s.owner === true);
    if (!owner || !phonesMatch(owner.phone, creditorPhone)) return false;
    const debtorSplit = expense.split.find((s: any) => phonesMatch(s.phone, debtorPhone));
    return debtorSplit && debtorSplit.amount > 0;
  });

  if (relevantExpenses.length === 0) return '';

  let rows = '';
  relevantExpenses.forEach((expense) => {
    const debtorSplit = expense.split.find((s: any) => phonesMatch(s.phone, debtorPhone));
    rows += `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #1a1a2e; font-size: 14px;">${expense.description || 'Untitled'}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #64748b; font-size: 14px;">${expense.date || '-'}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #1a1a2e; font-size: 14px; font-weight: 500;">₹${expense.amount?.toFixed(2) || '0.00'}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #e53e3e; font-size: 14px; font-weight: 600;">₹${debtorSplit.amount?.toFixed(2) || '0.00'}</td>
      </tr>`;
  });

  return `
    <table style="width: 100%; border-collapse: collapse; margin: 0; border-radius: 8px; overflow: hidden;">
      <thead>
        <tr style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
          <th style="padding: 12px 16px; text-align: left; color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Expense</th>
          <th style="padding: 12px 16px; text-align: left; color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Date</th>
          <th style="padding: 12px 16px; text-align: right; color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total</th>
          <th style="padding: 12px 16px; text-align: right; color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your Share</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const { id } = await params;
    const { ObjectId } = await import('mongodb');

    const user = await db.collection('members').findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { password: 0, token: 0 } }
    );
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const userPhone = user.phoneNumber || user.phone;

    const splitGroup = await db.collection('split_groups').findOne({ _id: new ObjectId(id) });
    if (!splitGroup) {
      return NextResponse.json({ message: 'Split group not found' }, { status: 404 });
    }

    if (splitGroup.settledAt) {
      return NextResponse.json({ message: 'Group is already settled' }, { status: 400 });
    }

    const expenseIds = splitGroup.expenses?.map((expId: any) => new ObjectId(expId)) || [];
    const expenses = expenseIds.length > 0
      ? await db.collection('expenses').find({ _id: { $in: expenseIds } }).toArray()
      : [];

    const settlements = calculateWhoOwesUser(expenses, userPhone);

    if (settlements.length === 0) {
      return NextResponse.json({ message: 'No one owes you in this group', sent: 0 }, { status: 200 });
    }

    const memberPhones = settlements.map((s) => s.memberPhone);
    const allVariants = memberPhones.flatMap((p) => {
      const d = normalizePhone(p);
      return d ? [d, `91${d}`, `+91${d}`, p] : [p];
    }).filter(Boolean);
    const registeredMembers = await db
      .collection('members')
      .find(
        { $or: [{ phone: { $in: allVariants } }, { phoneNumber: { $in: allVariants } }] },
        { projection: { password: 0, token: 0 } }
      )
      .toArray();

    const phoneToEmail: { [phone: string]: string } = {};
    registeredMembers.forEach((m: any) => {
      const phone = normalizePhone(m.phoneNumber || m.phone);
      if (m.email && phone) {
        phoneToEmail[phone] = m.email;
      }
    });

    const senderName = user.displayName || user.firstName || 'A member';
    const groupPageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/split-groups/${id}`;
    const results: { memberName: string; status: string; error?: string }[] = [];

    for (const settlement of settlements) {
      const email = phoneToEmail[normalizePhone(settlement.memberPhone)];
      if (!email) {
        results.push({ memberName: settlement.memberName, status: 'skipped', error: 'No email found' });
        continue;
      }

      const expenseTable = buildExpenseTable(expenses, settlement.memberPhone, userPhone);

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Reminder - TrackTok</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 32px 40px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="margin: 0 0 4px 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">TrackTok</h1>
              <p style="margin: 0; font-size: 13px; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase;">Expense Tracking Made Simple</p>
            </td>
          </tr>

          <!-- Reminder Badge -->
          <tr>
            <td style="background-color: #ffffff; padding: 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 28px 0 0 0; text-align: center;">
                    <span style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; padding: 6px 16px; border-radius: 20px;">⏰ Payment Reminder</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px 40px 0 40px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #1a1a2e; line-height: 1.6;">Hi <strong>${settlement.memberName}</strong>,</p>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #475569; line-height: 1.6;">
                <strong style="color: #1a1a2e;">${senderName}</strong> is reminding you about a pending payment in the split group <strong style="color: #1a1a2e;">"${splitGroup.name}"</strong>.
              </p>
            </td>
          </tr>

          <!-- Amount Card -->
          <tr>
            <td style="background-color: #ffffff; padding: 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%); border: 1px solid #fecaca; border-radius: 12px; padding: 24px; text-align: center;">
                    <p style="margin: 0 0 4px 0; font-size: 13px; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Amount Due</p>
                    <p style="margin: 0; font-size: 36px; font-weight: 700; color: #dc2626; letter-spacing: -1px;">₹${settlement.amount.toFixed(2)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Expense Breakdown -->
          <tr>
            <td style="background-color: #ffffff; padding: 28px 40px 0 40px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #1a1a2e; text-transform: uppercase; letter-spacing: 0.5px;">Expense Breakdown</p>
              <div style="background-color: #f8fafc; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0;">
                ${expenseTable || '<p style="padding: 20px; text-align: center; color: #94a3b8; font-size: 14px; margin: 0;">No detailed breakdown available.</p>'}
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px 40px; text-align: center;">
              <a href="${groupPageUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);">View Group &amp; Settle Up →</a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="background-color: #ffffff; padding: 0 40px;">
              <div style="border-top: 1px solid #e2e8f0;"></div>
            </td>
          </tr>

          <!-- Disclaimer -->
          <tr>
            <td style="background-color: #ffffff; padding: 20px 40px; border-radius: 0 0 16px 16px;">
              <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.6; text-align: center;">
                This is an automated reminder from TrackTok. If you've already settled this, please disregard.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 28px 40px; text-align: center;">
              <p style="margin: 0 0 6px 0;">
                <a href="https://www.tracktok.com" style="color: #1a1a2e; text-decoration: none; font-size: 16px; font-weight: 700; letter-spacing: -0.3px;">TrackTok</a>
              </p>
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #94a3b8;">
                A product by <a href="https://www.thewebvale.com" style="color: #64748b; text-decoration: underline;">TheWebVale</a>
              </p>
              <div style="margin: 12px 0;">
                <a href="https://www.tracktok.com" style="display: inline-block; margin: 0 6px; color: #94a3b8; text-decoration: none; font-size: 12px;">Website</a>
                <span style="color: #cbd5e1;">•</span>
                <a href="https://www.thewebvale.com" style="display: inline-block; margin: 0 6px; color: #94a3b8; text-decoration: none; font-size: 12px;">TheWebVale</a>
              </div>
              <p style="margin: 12px 0 0 0; font-size: 11px; color: #cbd5e1;">
                © ${new Date().getFullYear()} TrackTok. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      try {
        await sendEmail({
          to: email,
          subject: `Payment Reminder: You owe ₹${settlement.amount.toFixed(2)} in "${splitGroup.name}" - TrackTok`,
          html,
        });
        results.push({ memberName: settlement.memberName, status: 'sent' });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        results.push({ memberName: settlement.memberName, status: 'failed', error: errorMsg });
      }
    }

    const sentCount = results.filter((r) => r.status === 'sent').length;
    return NextResponse.json({
      message: `Reminders sent to ${sentCount} of ${settlements.length} members`,
      results,
      sent: sentCount,
      total: settlements.length,
    });
  } catch (error) {
    console.error('Error sending reminders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        message: 'Failed to send reminders',
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
