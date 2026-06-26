const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tracktok.app';
const YEAR = new Date().getFullYear();

function emailWrapper(badge: string, badgeColor: string, badgeTextColor: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:32px 40px;border-radius:16px 16px 0 0;text-align:center;">
          <h1 style="margin:0 0 4px;font-size:28px;font-weight:700;color:#fff;letter-spacing:-0.5px;">TrackTok</h1>
          <p style="margin:0;font-size:13px;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;">Expense Tracking Made Simple</p>
        </td></tr>
        <tr><td style="background-color:#fff;padding:28px 40px 0;text-align:center;">
          <span style="display:inline-block;background-color:${badgeColor};color:${badgeTextColor};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;padding:6px 16px;border-radius:20px;">${badge}</span>
        </td></tr>
        ${content}
        <tr><td style="background-color:#fff;padding:0 40px;"><div style="border-top:1px solid #e2e8f0;"></div></td></tr>
        <tr><td style="background-color:#fff;padding:20px 40px;border-radius:0 0 16px 16px;">
          <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;text-align:center;">This is an automated email from TrackTok. You can manage your preferences in the app.</p>
        </td></tr>
        <tr><td style="padding:28px 40px;text-align:center;">
          <p style="margin:0 0 6px;"><a href="https://www.tracktok.com" style="color:#1a1a2e;text-decoration:none;font-size:16px;font-weight:700;">TrackTok</a></p>
          <p style="margin:0;font-size:12px;color:#94a3b8;">A product by <a href="https://www.thewebvale.com" style="color:#64748b;text-decoration:underline;">TheWebVale</a></p>
          <p style="margin:12px 0 0;font-size:11px;color:#cbd5e1;">&copy; ${YEAR} TrackTok. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function ctaButton(text: string, href: string, color: string = '#10b981', colorEnd: string = '#059669'): string {
  return `<tr><td style="background-color:#fff;padding:28px 40px;text-align:center;">
    <a href="${href}" style="display:inline-block;background:linear-gradient(135deg,${color} 0%,${colorEnd} 100%);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;box-shadow:0 4px 14px rgba(0,0,0,0.15);">${text}</a>
  </td></tr>`;
}

function bodyText(greeting: string, paragraphs: string[]): string {
  const ps = paragraphs.map(p => `<p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">${p}</p>`).join('');
  return `<tr><td style="background-color:#fff;padding:24px 40px 0;">
    <p style="margin:0 0 16px;font-size:16px;color:#1a1a2e;line-height:1.6;">Hi <strong>${greeting}</strong>,</p>
    ${ps}
  </td></tr>`;
}

function statCard(label: string, value: string, color: string = '#dc2626'): string {
  return `<tr><td style="background-color:#fff;padding:0 40px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:linear-gradient(135deg,#fef2f2 0%,#fff7ed 100%);border:1px solid #e2e8f0;border-radius:12px;padding:24px;text-align:center;">
        <p style="margin:0 0 4px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">${label}</p>
        <p style="margin:0;font-size:36px;font-weight:700;color:${color};letter-spacing:-1px;">${value}</p>
      </td></tr>
    </table>
  </td></tr>`;
}

function multiStatRow(stats: { label: string; value: string; color?: string }[]): string {
  const cols = stats.map(s => `
    <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;text-align:center;width:${Math.floor(100 / stats.length)}%;">
      <p style="margin:0 0 4px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">${s.label}</p>
      <p style="margin:0;font-size:24px;font-weight:700;color:${s.color || '#1a1a2e'};">${s.value}</p>
    </td>
  `).join('<td style="width:12px;"></td>');
  return `<tr><td style="background-color:#fff;padding:16px 40px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cols}</tr></table>
  </td></tr>`;
}

// ── 1. Win-Back Campaign ──

export function winBackEmail(userName: string, daysSince: number, estimatedMissed: string): string {
  let urgency = 'We noticed you\'ve been away';
  let emoji = '👋';
  if (daysSince >= 60) { urgency = 'It\'s been a while'; emoji = '💔'; }
  else if (daysSince >= 30) { urgency = 'We really miss you'; emoji = '😢'; }

  return emailWrapper(
    `${emoji} ${urgency}`, '#e0e7ff', '#3730a3',
    bodyText(userName, [
      `It's been <strong style="color:#1a1a2e;">${daysSince} days</strong> since you last tracked an expense.`,
      `During that time, you may have spent an estimated <strong style="color:#dc2626;">${estimatedMissed}</strong> without tracking it.`,
      'Getting back on track takes just 30 seconds — log one expense and you\'re back in control.',
    ]) +
    statCard('Estimated Untracked', estimatedMissed) +
    ctaButton('Log an Expense →', `${APP_URL}/dashboard`)
  );
}

// ── 2. Streak Nudge ──

export function streakNudgeEmail(userName: string, streakDays: number): string {
  return emailWrapper(
    `🔥 ${streakDays}-Day Streak!`, '#fef3c7', '#92400e',
    bodyText(userName, [
      `You're on a <strong style="color:#f59e0b;">${streakDays}-day tracking streak</strong>! That's impressive.`,
      'Don\'t let it break — log today\'s expenses to keep your momentum going.',
    ]) +
    statCard('Current Streak', `${streakDays} days`, '#f59e0b') +
    ctaButton('Keep the Streak →', `${APP_URL}/dashboard`, '#f59e0b', '#d97706')
  );
}

// ── 3. Weekly Spending Insights ──

export interface WeeklyInsightsData {
  userName: string;
  thisWeekTotal: string;
  lastWeekTotal: string;
  changePercent: number;
  topCategory: string;
  topCategoryAmount: string;
  transactionCount: number;
}

export function weeklyInsightsEmail(data: WeeklyInsightsData): string {
  const direction = data.changePercent >= 0 ? 'more' : 'less';
  const changeColor = data.changePercent >= 0 ? '#dc2626' : '#10b981';
  const absChange = Math.abs(data.changePercent);

  return emailWrapper(
    '📊 Weekly Insights', '#dbeafe', '#1e40af',
    bodyText(data.userName, [
      `Here's your spending summary for the past week.`,
      `You spent <strong style="color:${changeColor};">${absChange}% ${direction}</strong> than last week.`,
    ]) +
    multiStatRow([
      { label: 'This Week', value: data.thisWeekTotal, color: '#1a1a2e' },
      { label: 'Last Week', value: data.lastWeekTotal, color: '#64748b' },
      { label: 'Transactions', value: `${data.transactionCount}`, color: '#3b82f6' },
    ]) +
    `<tr><td style="background-color:#fff;padding:16px 40px;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;">
        <p style="margin:0 0 4px;font-size:12px;color:#64748b;text-transform:uppercase;font-weight:600;">Top Category</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#1a1a2e;">${data.topCategory} — ${data.topCategoryAmount}</p>
      </div>
    </td></tr>` +
    ctaButton('View Full Breakdown →', `${APP_URL}/dashboard`, '#3b82f6', '#2563eb')
  );
}

// ── 4. Onboarding Drip ──

export function onboardingDripEmail(userName: string, dayNumber: number): string {
  const drips: Record<number, { badge: string; subject: string; body: string[]; cta: string; ctaLink: string }> = {
    1: {
      badge: '🎉 Welcome to TrackTok',
      subject: 'Welcome!',
      body: [
        'Welcome aboard! TrackTok makes it easy to stay on top of your finances.',
        'Start by logging your first expense — it takes just a few seconds.',
      ],
      cta: 'Log Your First Expense →',
      ctaLink: `${APP_URL}/dashboard`,
    },
    3: {
      badge: '👥 Day 3 Tip',
      subject: 'Split with friends',
      body: [
        'Did you know you can split expenses with friends?',
        'Create a split group for your next trip, dinner, or shared expense — everyone gets notified automatically.',
      ],
      cta: 'Create a Split Group →',
      ctaLink: `${APP_URL}/dashboard/splits`,
    },
    7: {
      badge: '💰 Day 7 Tip',
      subject: 'Set a budget',
      body: [
        'You\'ve been tracking for a week! Time to level up.',
        'Set a budget to get alerts when you\'re approaching your spending limits.',
      ],
      cta: 'Set Your Budget →',
      ctaLink: `${APP_URL}/dashboard/budgets`,
    },
    14: {
      badge: '⏰ Day 14 Tip',
      subject: 'Never miss a bill',
      body: [
        'Two weeks in — you\'re building a great habit!',
        'Set up reminders for recurring bills so you never miss a payment.',
      ],
      cta: 'Set a Reminder →',
      ctaLink: `${APP_URL}/dashboard/reminders`,
    },
  };

  const drip = drips[dayNumber] || drips[1];
  return emailWrapper(
    drip.badge, '#dcfce7', '#166534',
    bodyText(userName, drip.body) +
    ctaButton(drip.cta, drip.ctaLink)
  );
}

export function onboardingDripSubject(dayNumber: number): string {
  const subjects: Record<number, string> = {
    1: 'Welcome to TrackTok! Start tracking in seconds',
    3: 'Split expenses with friends on TrackTok',
    7: 'Set your first budget on TrackTok',
    14: 'Never miss a bill — set up reminders',
  };
  return subjects[dayNumber] || subjects[1];
}

// ── 5. Achievement Emails ──

export function achievementEmail(userName: string, achievementType: string, achievementValue: string, detail: string): string {
  return emailWrapper(
    '🏆 Achievement Unlocked', '#fef3c7', '#92400e',
    bodyText(userName, [
      `Congratulations! You just hit a milestone:`,
    ]) +
    statCard(achievementType, achievementValue, '#f59e0b') +
    `<tr><td style="background-color:#fff;padding:8px 40px 0;">
      <p style="margin:0;font-size:15px;color:#475569;line-height:1.6;text-align:center;">${detail}</p>
    </td></tr>` +
    ctaButton('View Your Progress →', `${APP_URL}/dashboard`, '#f59e0b', '#d97706')
  );
}

// ── 6. Monthly Report ──

export interface MonthlyReportData {
  userName: string;
  monthName: string;
  totalSpent: string;
  totalIncome: string;
  transactionCount: number;
  topCategories: { name: string; amount: string; percent: number }[];
  vsLastMonth: number;
}

export function monthlyReportEmail(data: MonthlyReportData): string {
  const direction = data.vsLastMonth >= 0 ? 'more' : 'less';
  const changeColor = data.vsLastMonth >= 0 ? '#dc2626' : '#10b981';
  const absChange = Math.abs(data.vsLastMonth);

  const categoryRows = data.topCategories.slice(0, 5).map(c => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#1a1a2e;font-size:14px;">${c.name}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#1a1a2e;font-size:14px;text-align:right;font-weight:600;">${c.amount}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;text-align:right;">${c.percent}%</td>
    </tr>
  `).join('');

  return emailWrapper(
    `📋 ${data.monthName} Report`, '#e0e7ff', '#3730a3',
    bodyText(data.userName, [
      `Here's your financial summary for <strong style="color:#1a1a2e;">${data.monthName}</strong>.`,
      `You spent <strong style="color:${changeColor};">${absChange}% ${direction}</strong> compared to last month.`,
    ]) +
    multiStatRow([
      { label: 'Total Spent', value: data.totalSpent, color: '#dc2626' },
      { label: 'Income', value: data.totalIncome, color: '#10b981' },
      { label: 'Transactions', value: `${data.transactionCount}`, color: '#3b82f6' },
    ]) +
    `<tr><td style="background-color:#fff;padding:16px 40px;">
      <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#1a1a2e;text-transform:uppercase;letter-spacing:0.5px;">Top Categories</p>
      <div style="background:#f8fafc;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr style="background:#f1f5f9;">
            <td style="padding:8px 16px;font-size:12px;color:#64748b;font-weight:600;">Category</td>
            <td style="padding:8px 16px;font-size:12px;color:#64748b;font-weight:600;text-align:right;">Amount</td>
            <td style="padding:8px 16px;font-size:12px;color:#64748b;font-weight:600;text-align:right;">Share</td>
          </tr>
          ${categoryRows}
        </table>
      </div>
    </td></tr>` +
    ctaButton('View Full Report →', `${APP_URL}/dashboard`, '#6366f1', '#4f46e5')
  );
}

// ── 7. Split Group Digest ──

export interface SplitGroupDigestData {
  userName: string;
  groups: { name: string; newExpenses: number; balance: string }[];
  totalOwed: string;
}

export function splitGroupDigestEmail(data: SplitGroupDigestData): string {
  const groupRows = data.groups.slice(0, 5).map(g => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#1a1a2e;font-size:14px;font-weight:500;">${g.name}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#3b82f6;font-size:14px;text-align:center;">${g.newExpenses} new</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#dc2626;font-size:14px;text-align:right;font-weight:600;">${g.balance}</td>
    </tr>
  `).join('');

  return emailWrapper(
    '👥 Split Group Update', '#dbeafe', '#1e40af',
    bodyText(data.userName, [
      `Here's what happened in your split groups this week.`,
    ]) +
    statCard('Total Balance', data.totalOwed, '#dc2626') +
    `<tr><td style="background-color:#fff;padding:16px 40px;">
      <div style="background:#f8fafc;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr style="background:#f1f5f9;">
            <td style="padding:8px 16px;font-size:12px;color:#64748b;font-weight:600;">Group</td>
            <td style="padding:8px 16px;font-size:12px;color:#64748b;font-weight:600;text-align:center;">Activity</td>
            <td style="padding:8px 16px;font-size:12px;color:#64748b;font-weight:600;text-align:right;">Balance</td>
          </tr>
          ${groupRows}
        </table>
      </div>
    </td></tr>` +
    ctaButton('View Split Groups →', `${APP_URL}/dashboard/splits`, '#3b82f6', '#2563eb')
  );
}

// ── 8. Referral Reminder ──

export function referralReminderEmail(userName: string, splitGroupCount: number): string {
  return emailWrapper(
    '🎁 Invite Friends', '#dcfce7', '#166534',
    bodyText(userName, [
      `You're in <strong style="color:#1a1a2e;">${splitGroupCount} split groups</strong> — splitting expenses is better when everyone is on TrackTok!`,
      'Invite your friends so they can track their share, get reminders, and settle up instantly.',
    ]) +
    statCard('Your Split Groups', `${splitGroupCount}`, '#10b981') +
    ctaButton('Invite Friends →', `${APP_URL}/dashboard/splits`, '#10b981', '#059669')
  );
}

// ── 9. Bill Prediction Alert ──

export interface BillPredictionData {
  userName: string;
  bills: { description: string; predictedAmount: string; predictedDate: string; category: string }[];
}

export function billPredictionEmail(data: BillPredictionData): string {
  const billRows = data.bills.slice(0, 5).map(b => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#1a1a2e;font-size:14px;">${b.description}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">${b.category}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#dc2626;font-size:14px;text-align:right;font-weight:600;">${b.predictedAmount}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;text-align:right;">${b.predictedDate}</td>
    </tr>
  `).join('');

  return emailWrapper(
    '🔮 Bill Prediction', '#fae8ff', '#86198f',
    bodyText(data.userName, [
      'Based on your spending patterns, these bills are coming up soon:',
    ]) +
    `<tr><td style="background-color:#fff;padding:16px 40px;">
      <div style="background:#f8fafc;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr style="background:#f1f5f9;">
            <td style="padding:8px 16px;font-size:12px;color:#64748b;font-weight:600;">Bill</td>
            <td style="padding:8px 16px;font-size:12px;color:#64748b;font-weight:600;">Category</td>
            <td style="padding:8px 16px;font-size:12px;color:#64748b;font-weight:600;text-align:right;">Amount</td>
            <td style="padding:8px 16px;font-size:12px;color:#64748b;font-weight:600;text-align:right;">Due</td>
          </tr>
          ${billRows}
        </table>
      </div>
    </td></tr>` +
    ctaButton('Set Reminders →', `${APP_URL}/dashboard/reminders`, '#a855f7', '#9333ea')
  );
}

// ── 10. Spending Anomaly Alert ──

export interface SpendingAnomalyData {
  userName: string;
  category: string;
  currentAmount: string;
  averageAmount: string;
  multiplier: number;
}

export function spendingAnomalyEmail(data: SpendingAnomalyData): string {
  return emailWrapper(
    '📈 Spending Alert', '#fef2f2', '#991b1b',
    bodyText(data.userName, [
      `Heads up! Your spending in <strong style="color:#1a1a2e;">${data.category}</strong> this week is <strong style="color:#dc2626;">${data.multiplier.toFixed(1)}x</strong> higher than usual.`,
      'This isn\'t necessarily a problem — just making sure you\'re aware!',
    ]) +
    multiStatRow([
      { label: 'This Week', value: data.currentAmount, color: '#dc2626' },
      { label: 'Your Average', value: data.averageAmount, color: '#64748b' },
    ]) +
    ctaButton('Review Spending →', `${APP_URL}/dashboard`, '#dc2626', '#b91c1c')
  );
}
