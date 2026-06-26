import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { sendEmail } from '@/lib/mailer';
import { ObjectId } from 'mongodb';
import { getMarketingCron } from '@/lib/marketing-crons';
import {
  winBackEmail,
  streakNudgeEmail,
  weeklyInsightsEmail,
  onboardingDripEmail,
  onboardingDripSubject,
  achievementEmail,
  monthlyReportEmail,
  splitGroupDigestEmail,
  referralReminderEmail,
  billPredictionEmail,
  spendingAnomalyEmail,
} from '@/lib/marketing-emails';

function formatINR(amount: number): string {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;
  const { db } = auth;

  const { cronId, userIds } = await request.json();

  if (!cronId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ message: 'Missing cronId or userIds' }, { status: 400 });
  }

  const def = getMarketingCron(cronId);
  if (!def) {
    return NextResponse.json({ message: `Unknown marketing cron: ${cronId}` }, { status: 400 });
  }

  const members = await db.collection('members').find({
    _id: { $in: userIds.map((id: string) => new ObjectId(id)) },
    email: { $exists: true, $ne: '' },
  }).toArray();

  if (members.length === 0) {
    return NextResponse.json({ message: 'No valid users found' }, { status: 404 });
  }

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const member of members) {
    const userName = member.displayName || member.firstName || member.nickname || 'there';
    let html = '';
    let subject = '';

    switch (cronId) {
      case 'win-back':
        html = winBackEmail(userName, 30, '₹15,000');
        subject = `We miss you, ${userName}! Come back to TrackTok`;
        break;

      case 'streak-nudge':
        html = streakNudgeEmail(userName, 7);
        subject = `🔥 Your 7-day streak is at risk!`;
        break;

      case 'weekly-insights':
        html = weeklyInsightsEmail({
          userName,
          thisWeekTotal: '₹8,500',
          lastWeekTotal: '₹6,200',
          changePercent: 37,
          topCategory: 'Food & Dining',
          topCategoryAmount: '₹3,200',
          transactionCount: 24,
        });
        subject = `📊 Your weekly spending: ₹8,500`;
        break;

      case 'onboarding-drip':
        html = onboardingDripEmail(userName, 1);
        subject = onboardingDripSubject(1);
        break;

      case 'achievement-emails':
        html = achievementEmail(userName, 'Expenses Tracked', '100', 'You\'ve logged 100 expenses on TrackTok. Keep going!');
        subject = `🏆 100 expenses tracked! — TrackTok`;
        break;

      case 'monthly-report': {
        const monthName = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        html = monthlyReportEmail({
          userName,
          monthName,
          totalSpent: '₹45,000',
          totalIncome: '₹80,000',
          transactionCount: 67,
          topCategories: [
            { name: 'Food & Dining', amount: '₹12,000', percent: 27 },
            { name: 'Shopping', amount: '₹8,500', percent: 19 },
            { name: 'Bills & Utilities', amount: '₹7,200', percent: 16 },
            { name: 'Transportation', amount: '₹5,800', percent: 13 },
            { name: 'Entertainment', amount: '₹4,500', percent: 10 },
          ],
          vsLastMonth: -12,
        });
        subject = `📋 Your ${monthName} Report — TrackTok`;
        break;
      }

      case 'split-group-digest':
        html = splitGroupDigestEmail({
          userName,
          groups: [
            { name: 'Goa Trip', newExpenses: 5, balance: '₹2,400' },
            { name: 'Flat Expenses', newExpenses: 3, balance: '₹1,800' },
            { name: 'Office Lunch', newExpenses: 8, balance: '₹650' },
          ],
          totalOwed: '₹4,850',
        });
        subject = `👥 Split Group Update — 3 groups active`;
        break;

      case 'referral-reminder':
        html = referralReminderEmail(userName, 4);
        subject = `🎁 Invite friends to TrackTok — split easier!`;
        break;

      case 'bill-prediction':
        html = billPredictionEmail({
          userName,
          bills: [
            { description: 'Electricity Bill', predictedAmount: '₹2,500', predictedDate: 'Jul 5', category: 'Bills & Utilities' },
            { description: 'Netflix', predictedAmount: '₹649', predictedDate: 'Jul 3', category: 'Entertainment' },
            { description: 'Mobile Recharge', predictedAmount: '₹599', predictedDate: 'Jul 7', category: 'Bills & Utilities' },
          ],
        });
        subject = `🔮 3 bill(s) coming up — TrackTok`;
        break;

      case 'spending-anomaly':
        html = spendingAnomalyEmail({
          userName,
          category: 'Shopping',
          currentAmount: '₹12,000',
          averageAmount: '₹4,500',
          multiplier: 2.7,
        });
        subject = `📈 Unusual spending in Shopping — TrackTok`;
        break;

      default:
        continue;
    }

    try {
      await sendEmail({ to: member.email, subject, html });
      sent++;
    } catch (error: any) {
      failed++;
      errors.push(`${member.email}: ${error.message}`);
    }
  }

  return NextResponse.json({
    success: failed === 0,
    message: `Sent: ${sent}, Failed: ${failed}` + (failed > 0 ? ` — ${errors.slice(0, 3).join('; ')}` : ''),
    sent,
    failed,
    total: members.length,
  });
}
