import { connectToDatabase } from '@/lib/mongodb';
import { sendEmail } from '@/lib/mailer';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
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
import { systemSettingsKey } from '@/lib/marketing-crons';

function formatINR(amount: number): string {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

async function getCronSettings(db: any, cronId: string) {
  const doc = await db.collection('system_settings').findOne({ key: systemSettingsKey(cronId) });
  return doc?.value?.settings || {};
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = request.headers.get('x-webhook-secret');
    if (!webhookSecret || webhookSecret !== process.env.CRON_WEBHOOK_SECRET) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, reminderId, splitGroupId, userId } = body;

    if (!action) {
      return NextResponse.json({ message: 'Missing action' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    switch (action) {
      case 'send-reminder': {
        if (!reminderId) {
          return NextResponse.json({ message: 'Missing reminderId' }, { status: 400 });
        }

        const reminder = await db.collection('reminders').findOne({
          _id: new ObjectId(reminderId),
        });

        if (!reminder) {
          return NextResponse.json({ message: 'Reminder not found' }, { status: 404 });
        }

        if (!reminder.enabled) {
          return NextResponse.json({ success: true, message: 'Reminder disabled, skipped' });
        }

        const member = await db.collection('members').findOne({ _id: new ObjectId(reminder.userId) });
        if (!member?.email) {
          return NextResponse.json({ success: false, message: 'User has no email' }, { status: 400 });
        }

        const userName = member.firstName || member.displayName || member.name || 'there';
        const amountStr = formatINR(reminder.amount);
        const dueStr = new Date(reminder.dueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tracktok.app';
        const freq = reminder.frequency.charAt(0).toUpperCase() + reminder.frequency.slice(1);

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reminder - TrackTok</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 32px 40px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="margin: 0 0 4px 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">TrackTok</h1>
              <p style="margin: 0; font-size: 13px; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase;">Expense Tracking Made Simple</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; padding: 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 28px 0 0 0; text-align: center;">
                    <span style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; padding: 6px 16px; border-radius: 20px;">🔔 Scheduled Reminder</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; padding: 24px 40px 0 40px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #1a1a2e; line-height: 1.6;">Hi <strong>${userName}</strong>,</p>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #475569; line-height: 1.6;">
                This is your <strong style="color: #1a1a2e;">${freq.toLowerCase()}</strong> reminder for <strong style="color: #1a1a2e;">"${reminder.title}"</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; padding: 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%); border: 1px solid #fecaca; border-radius: 12px; padding: 24px; text-align: center;">
                    <p style="margin: 0 0 4px 0; font-size: 13px; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Amount Due</p>
                    <p style="margin: 0; font-size: 36px; font-weight: 700; color: #dc2626; letter-spacing: -1px;">${amountStr}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; padding: 28px 40px 0 40px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #1a1a2e; text-transform: uppercase; letter-spacing: 0.5px;">Details</p>
              <div style="background-color: #f8fafc; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600; width: 120px;">Category</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #1a1a2e; font-size: 14px;">${reminder.category}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">Due Date</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #1a1a2e; font-size: 14px;">${dueStr}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 16px; color: #64748b; font-size: 13px; font-weight: 600;">Frequency</td>
                    <td style="padding: 12px 16px; color: #1a1a2e; font-size: 14px;">${freq}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; padding: 32px 40px; text-align: center;">
              <a href="${appUrl}/dashboard/reminders" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);">View Reminders →</a>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; padding: 0 40px;">
              <div style="border-top: 1px solid #e2e8f0;"></div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; padding: 20px 40px; border-radius: 0 0 16px 16px;">
              <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.6; text-align: center;">
                This is an automated reminder from TrackTok. If you've already paid this, please disregard.
              </p>
            </td>
          </tr>
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

        await sendEmail({
          to: member.email,
          subject: `Reminder: ${reminder.title} — ${amountStr}`,
          html,
        });

        await db.collection('reminders').updateOne(
          { _id: new ObjectId(reminderId) },
          { $set: { lastNotified: new Date() } },
        );

        return NextResponse.json({ success: true, message: `Reminder email sent to ${member.email}` });
      }

      case 'send-split-reminder': {
        if (!splitGroupId || !userId) {
          return NextResponse.json({ message: 'Missing splitGroupId or userId' }, { status: 400 });
        }

        const splitGroup = await db.collection('split_groups').findOne({ _id: new ObjectId(splitGroupId) });
        if (!splitGroup) return NextResponse.json({ message: 'Split group not found' }, { status: 404 });

        if (splitGroup.settledAt) {
          if (splitGroup.cronJobId) {
            const { deleteCronJob: delCron } = await import('@/lib/cron-client');
            try { await delCron(splitGroup.cronJobId); } catch (e) { /* ignore */ }
            await db.collection('split_groups').updateOne(
              { _id: new ObjectId(splitGroupId) },
              { $set: { reminderSchedule: null, cronJobId: null } },
            );
          }
          return NextResponse.json({ success: true, message: 'Group settled, schedule removed' });
        }

        const user = await db.collection('members').findOne({ _id: new ObjectId(userId) });
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        const internalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/split-groups/${splitGroupId}/send-reminders`;
        const token = (await import('@/lib/auth')).generateToken(userId);

        const res = await fetch(internalUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });

        const result = await res.json();

        return NextResponse.json({
          success: res.ok,
          message: result.message || (res.ok ? 'Split reminders sent' : 'Failed'),
          sent: result.sent,
          total: result.total,
        });
      }

      case 'inactive-user-nudge': {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const allMembers = await db.collection('members').find({ email: { $exists: true, $ne: '' } }).toArray();
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tracktok.app';
        let sent = 0;
        let skipped = 0;

        for (const m of allMembers) {
          const latestTx = await db.collection('expenses')
            .findOne({ userId: m._id.toString() }, { sort: { createdAt: -1 }, projection: { createdAt: 1 } });

          if (latestTx && new Date(latestTx.createdAt) > sevenDaysAgo) {
            skipped++;
            continue;
          }

          const userName = m.displayName || m.firstName || m.nickname || 'there';
          const daysSince = latestTx ? Math.floor((Date.now() - new Date(latestTx.createdAt).getTime()) / 86400000) : null;

          const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:32px 40px;border-radius:16px 16px 0 0;text-align:center;">
          <h1 style="margin:0 0 4px;font-size:28px;font-weight:700;color:#fff;letter-spacing:-0.5px;">TrackTok</h1>
          <p style="margin:0;font-size:13px;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;">Expense Tracking Made Simple</p>
        </td></tr>
        <tr><td style="background-color:#fff;padding:28px 40px 0;text-align:center;">
          <span style="display:inline-block;background-color:#e0e7ff;color:#3730a3;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;padding:6px 16px;border-radius:20px;">👋 We Miss You</span>
        </td></tr>
        <tr><td style="background-color:#fff;padding:24px 40px 0;">
          <p style="margin:0 0 16px;font-size:16px;color:#1a1a2e;line-height:1.6;">Hi <strong>${userName}</strong>,</p>
          <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
            ${daysSince ? `It's been <strong style="color:#1a1a2e;">${daysSince} days</strong> since your last expense entry.` : `We noticed you haven't logged any expenses yet.`}
            Keeping track of your spending helps you stay on top of your finances!
          </p>
        </td></tr>
        <tr><td style="background-color:#fff;padding:0 40px 32px;text-align:center;">
          <a href="${appUrl}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;box-shadow:0 4px 14px rgba(16,185,129,0.35);">Log an Expense →</a>
        </td></tr>
        <tr><td style="background-color:#fff;padding:0 40px;"><div style="border-top:1px solid #e2e8f0;"></div></td></tr>
        <tr><td style="background-color:#fff;padding:20px 40px;border-radius:0 0 16px 16px;">
          <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;text-align:center;">This is an automated reminder from TrackTok to help you stay on track.</p>
        </td></tr>
        <tr><td style="padding:28px 40px;text-align:center;">
          <p style="margin:0 0 6px;"><a href="https://www.tracktok.com" style="color:#1a1a2e;text-decoration:none;font-size:16px;font-weight:700;">TrackTok</a></p>
          <p style="margin:0;font-size:12px;color:#94a3b8;">A product by <a href="https://www.thewebvale.com" style="color:#64748b;text-decoration:underline;">TheWebVale</a></p>
          <p style="margin:12px 0 0;font-size:11px;color:#cbd5e1;">© ${new Date().getFullYear()} TrackTok. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

          try {
            await sendEmail({
              to: m.email,
              subject: `We miss you, ${userName}! 👋 — TrackTok`,
              html,
            });
            sent++;
          } catch (e) {
            console.error(`Nudge email failed for ${m.email}:`, e);
          }
        }

        return NextResponse.json({ success: true, message: `Nudge emails sent: ${sent}, skipped (active): ${skipped}`, sent, skipped });
      }

      // ── Marketing Crons ──

      case 'win-back': {
        const settings = await getCronSettings(db, 'win-back');
        const inactiveDays: number[] = settings.inactiveDays || [14, 30, 60];
        const allMembers = await db.collection('members').find({ email: { $exists: true, $ne: '' } }).toArray();
        let sent = 0;

        for (const m of allMembers) {
          const latestTx = await db.collection('expenses')
            .findOne({ userId: m._id.toString() }, { sort: { createdAt: -1 }, projection: { createdAt: 1 } });

          if (!latestTx) continue;
          const daysSince = Math.floor((Date.now() - new Date(latestTx.createdAt).getTime()) / 86400000);

          const matchedThreshold = inactiveDays.find(d => daysSince >= d && daysSince < d + 1);
          if (!matchedThreshold) continue;

          const avgExpense = await db.collection('expenses').aggregate([
            { $match: { userId: m._id.toString(), type: 'expense' } },
            { $group: { _id: null, avg: { $avg: '$amount' }, count: { $sum: 1 } } },
          ]).toArray();

          const dailyAvg = avgExpense[0] ? (avgExpense[0].avg * avgExpense[0].count) / 30 : 0;
          const estimatedMissed = formatINR(Math.round(dailyAvg * daysSince));
          const userName = m.displayName || m.firstName || m.nickname || 'there';

          try {
            await sendEmail({
              to: m.email,
              subject: `We miss you, ${userName}! Come back to TrackTok`,
              html: winBackEmail(userName, daysSince, estimatedMissed),
            });
            sent++;
          } catch (e) {
            console.error(`Win-back failed for ${m.email}:`, e);
          }
        }

        return NextResponse.json({ success: true, sent });
      }

      case 'streak-nudge': {
        const settings = await getCronSettings(db, 'streak-nudge');
        const minStreak = settings.minStreakDays || 3;
        const allMembers = await db.collection('members').find({ email: { $exists: true, $ne: '' } }).toArray();
        let sent = 0;

        for (const m of allMembers) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          let streakDays = 0;

          for (let i = 1; i <= 90; i++) {
            const dayStart = new Date(today);
            dayStart.setDate(dayStart.getDate() - i);
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);

            const hasExpense = await db.collection('expenses').findOne({
              userId: m._id.toString(),
              createdAt: { $gte: dayStart, $lt: dayEnd },
            });

            if (hasExpense) streakDays++;
            else break;
          }

          if (streakDays < minStreak) continue;

          const todayExpense = await db.collection('expenses').findOne({
            userId: m._id.toString(),
            createdAt: { $gte: today },
          });

          if (todayExpense) continue;

          const userName = m.displayName || m.firstName || m.nickname || 'there';
          try {
            await sendEmail({
              to: m.email,
              subject: `🔥 Your ${streakDays}-day streak is at risk!`,
              html: streakNudgeEmail(userName, streakDays),
            });
            sent++;
          } catch (e) {
            console.error(`Streak nudge failed for ${m.email}:`, e);
          }
        }

        return NextResponse.json({ success: true, sent });
      }

      case 'weekly-insights': {
        const allMembers = await db.collection('members').find({ email: { $exists: true, $ne: '' } }).toArray();
        let sent = 0;

        const now = new Date();
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(now.getDate() - 7);
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        for (const m of allMembers) {
          const uid = m._id.toString();

          const thisWeekExpenses = await db.collection('expenses').aggregate([
            { $match: { userId: uid, type: 'expense', createdAt: { $gte: thisWeekStart } } },
            { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { total: -1 } },
          ]).toArray();

          if (thisWeekExpenses.length === 0) continue;

          const thisWeekTotal = thisWeekExpenses.reduce((s, c) => s + c.total, 0);
          const transactionCount = thisWeekExpenses.reduce((s, c) => s + c.count, 0);

          const lastWeekAgg = await db.collection('expenses').aggregate([
            { $match: { userId: uid, type: 'expense', createdAt: { $gte: lastWeekStart, $lt: thisWeekStart } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]).toArray();
          const lastWeekTotal = lastWeekAgg[0]?.total || 0;

          const changePercent = lastWeekTotal > 0 ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100) : 0;
          const userName = m.displayName || m.firstName || m.nickname || 'there';

          try {
            await sendEmail({
              to: m.email,
              subject: `📊 Your weekly spending: ${formatINR(thisWeekTotal)}`,
              html: weeklyInsightsEmail({
                userName,
                thisWeekTotal: formatINR(thisWeekTotal),
                lastWeekTotal: formatINR(lastWeekTotal),
                changePercent,
                topCategory: thisWeekExpenses[0]?._id || 'Other',
                topCategoryAmount: formatINR(thisWeekExpenses[0]?.total || 0),
                transactionCount,
              }),
            });
            sent++;
          } catch (e) {
            console.error(`Weekly insights failed for ${m.email}:`, e);
          }
        }

        return NextResponse.json({ success: true, sent });
      }

      case 'onboarding-drip': {
        const settings = await getCronSettings(db, 'onboarding-drip');
        const dripDays: number[] = settings.dripDays || [1, 3, 7, 14];
        let sent = 0;

        for (const dayNum of dripDays) {
          const targetDate = new Date();
          targetDate.setDate(targetDate.getDate() - dayNum);
          const dayStart = new Date(targetDate);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(dayStart);
          dayEnd.setDate(dayEnd.getDate() + 1);

          const newUsers = await db.collection('members').find({
            email: { $exists: true, $ne: '' },
            createdAt: { $gte: dayStart, $lt: dayEnd },
          }).toArray();

          for (const m of newUsers) {
            const userName = m.displayName || m.firstName || m.nickname || 'there';
            try {
              await sendEmail({
                to: m.email,
                subject: onboardingDripSubject(dayNum),
                html: onboardingDripEmail(userName, dayNum),
              });
              sent++;
            } catch (e) {
              console.error(`Onboarding drip (day ${dayNum}) failed for ${m.email}:`, e);
            }
          }
        }

        return NextResponse.json({ success: true, sent });
      }

      case 'achievement-emails': {
        const settings = await getCronSettings(db, 'achievement-emails');
        const milestones: number[] = settings.expenseMilestones || [10, 50, 100, 500, 1000];
        const savingsThreshold: number = settings.savingsThreshold || 20;
        const allMembers = await db.collection('members').find({ email: { $exists: true, $ne: '' } }).toArray();
        let sent = 0;

        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        for (const m of allMembers) {
          const uid = m._id.toString();
          const userName = m.displayName || m.firstName || m.nickname || 'there';

          const totalExpenses = await db.collection('expenses').countDocuments({ userId: uid });
          const hitMilestone = milestones.find(ms => totalExpenses === ms);

          if (hitMilestone) {
            try {
              await sendEmail({
                to: m.email,
                subject: `🏆 ${hitMilestone} expenses tracked! — TrackTok`,
                html: achievementEmail(userName, 'Expenses Tracked', `${hitMilestone}`, `You've logged ${hitMilestone} expenses on TrackTok. Keep going!`),
              });
              sent++;
            } catch (e) {
              console.error(`Achievement failed for ${m.email}:`, e);
            }
            continue;
          }

          const thisMonthAgg = await db.collection('expenses').aggregate([
            { $match: { userId: uid, type: 'expense', createdAt: { $gte: thisMonthStart } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]).toArray();
          const lastMonthAgg = await db.collection('expenses').aggregate([
            { $match: { userId: uid, type: 'expense', createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]).toArray();

          const thisMonth = thisMonthAgg[0]?.total || 0;
          const lastMonth = lastMonthAgg[0]?.total || 0;

          if (lastMonth > 0 && thisMonth < lastMonth) {
            const savedPercent = Math.round(((lastMonth - thisMonth) / lastMonth) * 100);
            if (savedPercent >= savingsThreshold) {
              try {
                await sendEmail({
                  to: m.email,
                  subject: `🏆 You saved ${savedPercent}% this month! — TrackTok`,
                  html: achievementEmail(userName, 'Savings This Month', `${savedPercent}%`, `You spent ${savedPercent}% less than last month. That's ${formatINR(lastMonth - thisMonth)} saved!`),
                });
                sent++;
              } catch (e) {
                console.error(`Achievement (savings) failed for ${m.email}:`, e);
              }
            }
          }

          const createdAt = new Date(m.createdAt);
          const monthsOnPlatform = (now.getFullYear() - createdAt.getFullYear()) * 12 + (now.getMonth() - createdAt.getMonth());
          if (monthsOnPlatform > 0 && monthsOnPlatform % 6 === 0) {
            try {
              await sendEmail({
                to: m.email,
                subject: `🏆 ${monthsOnPlatform} months on TrackTok!`,
                html: achievementEmail(userName, 'Months on TrackTok', `${monthsOnPlatform}`, `You've been tracking your finances for ${monthsOnPlatform} months. Amazing commitment!`),
              });
              sent++;
            } catch (e) {
              console.error(`Achievement (anniversary) failed for ${m.email}:`, e);
            }
          }
        }

        return NextResponse.json({ success: true, sent });
      }

      case 'monthly-report': {
        const allMembers = await db.collection('members').find({ email: { $exists: true, $ne: '' } }).toArray();
        let sent = 0;

        const now = new Date();
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        const monthName = lastMonthStart.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

        for (const m of allMembers) {
          const uid = m._id.toString();

          const categoryAgg = await db.collection('expenses').aggregate([
            { $match: { userId: uid, type: 'expense', createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd } } },
            { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { total: -1 } },
          ]).toArray();

          if (categoryAgg.length === 0) continue;

          const totalSpent = categoryAgg.reduce((s, c) => s + c.total, 0);
          const transactionCount = categoryAgg.reduce((s, c) => s + c.count, 0);

          const incomeAgg = await db.collection('expenses').aggregate([
            { $match: { userId: uid, type: 'income', createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]).toArray();
          const totalIncome = incomeAgg[0]?.total || 0;

          const prevAgg = await db.collection('expenses').aggregate([
            { $match: { userId: uid, type: 'expense', createdAt: { $gte: prevMonthStart, $lt: lastMonthStart } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]).toArray();
          const prevTotal = prevAgg[0]?.total || 0;
          const vsLastMonth = prevTotal > 0 ? Math.round(((totalSpent - prevTotal) / prevTotal) * 100) : 0;

          const topCategories = categoryAgg.slice(0, 5).map(c => ({
            name: c._id || 'Other',
            amount: formatINR(c.total),
            percent: Math.round((c.total / totalSpent) * 100),
          }));

          const userName = m.displayName || m.firstName || m.nickname || 'there';

          try {
            await sendEmail({
              to: m.email,
              subject: `📋 Your ${monthName} Report — TrackTok`,
              html: monthlyReportEmail({
                userName,
                monthName,
                totalSpent: formatINR(totalSpent),
                totalIncome: formatINR(totalIncome),
                transactionCount,
                topCategories,
                vsLastMonth,
              }),
            });
            sent++;
          } catch (e) {
            console.error(`Monthly report failed for ${m.email}:`, e);
          }
        }

        return NextResponse.json({ success: true, sent });
      }

      case 'split-group-digest': {
        const settings = await getCronSettings(db, 'split-group-digest');
        const includeSettled = settings.includeSettled === 'yes';
        const allMembers = await db.collection('members').find({ email: { $exists: true, $ne: '' } }).toArray();
        let sent = 0;

        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        for (const m of allMembers) {
          const uid = m._id.toString();
          const filter: any = {
            $or: [
              { owner: uid },
              { 'members.userId': uid },
              { customer_id: m.customer_id },
            ],
          };
          if (!includeSettled) filter.settledAt = { $exists: false };

          const groups = await db.collection('split_groups').find(filter).toArray();
          if (groups.length === 0) continue;

          const groupData = [];
          let totalOwed = 0;

          for (const g of groups) {
            const newExpenses = (g.expenses || []).filter((e: any) =>
              new Date(e.createdAt || e.date) > weekAgo
            ).length;

            const memberBalance = (g.members || []).find((mem: any) =>
              mem.userId === uid || mem.contactId === m.customer_id
            );
            const balance = memberBalance?.balance || 0;
            totalOwed += balance;

            groupData.push({
              name: g.name,
              newExpenses,
              balance: formatINR(Math.abs(balance)),
            });
          }

          if (groupData.every(g => g.newExpenses === 0)) continue;

          const userName = m.displayName || m.firstName || m.nickname || 'there';
          try {
            await sendEmail({
              to: m.email,
              subject: `👥 Split Group Update — ${groupData.length} groups active`,
              html: splitGroupDigestEmail({
                userName,
                groups: groupData,
                totalOwed: formatINR(Math.abs(totalOwed)),
              }),
            });
            sent++;
          } catch (e) {
            console.error(`Split digest failed for ${m.email}:`, e);
          }
        }

        return NextResponse.json({ success: true, sent });
      }

      case 'referral-reminder': {
        const settings = await getCronSettings(db, 'referral-reminder');
        const minGroups = settings.minSplitGroups || 2;
        const allMembers = await db.collection('members').find({ email: { $exists: true, $ne: '' } }).toArray();
        let sent = 0;

        for (const m of allMembers) {
          const uid = m._id.toString();
          const groupCount = await db.collection('split_groups').countDocuments({
            $or: [{ owner: uid }, { 'members.userId': uid }],
            settledAt: { $exists: false },
          });

          if (groupCount < minGroups) continue;

          const userName = m.displayName || m.firstName || m.nickname || 'there';
          try {
            await sendEmail({
              to: m.email,
              subject: `🎁 Invite friends to TrackTok — split easier!`,
              html: referralReminderEmail(userName, groupCount),
            });
            sent++;
          } catch (e) {
            console.error(`Referral reminder failed for ${m.email}:`, e);
          }
        }

        return NextResponse.json({ success: true, sent });
      }

      case 'bill-prediction': {
        const settings = await getCronSettings(db, 'bill-prediction');
        const daysBeforeDue = settings.daysBeforeDue || 3;
        const minOccurrences = settings.minOccurrences || 3;
        const allMembers = await db.collection('members').find({ email: { $exists: true, $ne: '' } }).toArray();
        let sent = 0;

        for (const m of allMembers) {
          const uid = m._id.toString();

          const recurring = await db.collection('expenses').aggregate([
            { $match: { userId: uid, type: 'expense' } },
            { $group: {
              _id: { description: { $toLower: '$description' }, category: '$category' },
              count: { $sum: 1 },
              avgAmount: { $avg: '$amount' },
              dates: { $push: '$createdAt' },
            }},
            { $match: { count: { $gte: minOccurrences } } },
          ]).toArray();

          const predictions = [];
          const today = new Date();

          for (const r of recurring) {
            const sortedDates = r.dates.map((d: any) => new Date(d)).sort((a: Date, b: Date) => a.getTime() - b.getTime());
            if (sortedDates.length < 2) continue;

            const intervals = [];
            for (let i = 1; i < sortedDates.length; i++) {
              intervals.push(sortedDates[i].getTime() - sortedDates[i - 1].getTime());
            }
            const avgInterval = intervals.reduce((a: number, b: number) => a + b, 0) / intervals.length;
            const lastDate = sortedDates[sortedDates.length - 1];
            const predictedDate = new Date(lastDate.getTime() + avgInterval);

            const daysUntil = Math.floor((predictedDate.getTime() - today.getTime()) / 86400000);
            if (daysUntil >= 0 && daysUntil <= daysBeforeDue) {
              predictions.push({
                description: r._id.description,
                predictedAmount: formatINR(Math.round(r.avgAmount)),
                predictedDate: predictedDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
                category: r._id.category || 'Other',
              });
            }
          }

          if (predictions.length === 0) continue;

          const userName = m.displayName || m.firstName || m.nickname || 'there';
          try {
            await sendEmail({
              to: m.email,
              subject: `🔮 ${predictions.length} bill(s) coming up — TrackTok`,
              html: billPredictionEmail({ userName, bills: predictions }),
            });
            sent++;
          } catch (e) {
            console.error(`Bill prediction failed for ${m.email}:`, e);
          }
        }

        return NextResponse.json({ success: true, sent });
      }

      case 'spending-anomaly': {
        const settings = await getCronSettings(db, 'spending-anomaly');
        const multiplierThreshold = settings.multiplierThreshold || 2;
        const lookbackWeeks = settings.lookbackWeeks || 4;
        const allMembers = await db.collection('members').find({ email: { $exists: true, $ne: '' } }).toArray();
        let sent = 0;

        const now = new Date();
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(now.getDate() - 7);
        const lookbackStart = new Date(now);
        lookbackStart.setDate(now.getDate() - (lookbackWeeks * 7));

        for (const m of allMembers) {
          const uid = m._id.toString();

          const thisWeekByCategory = await db.collection('expenses').aggregate([
            { $match: { userId: uid, type: 'expense', createdAt: { $gte: thisWeekStart } } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
          ]).toArray();

          if (thisWeekByCategory.length === 0) continue;

          const avgByCategory = await db.collection('expenses').aggregate([
            { $match: { userId: uid, type: 'expense', createdAt: { $gte: lookbackStart, $lt: thisWeekStart } } },
            { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
          ]).toArray();

          const avgMap = new Map(avgByCategory.map(c => [c._id, c.total / lookbackWeeks]));

          for (const cat of thisWeekByCategory) {
            const weeklyAvg = avgMap.get(cat._id);
            if (!weeklyAvg || weeklyAvg === 0) continue;

            const multiplier = cat.total / weeklyAvg;
            if (multiplier < multiplierThreshold) continue;

            const userName = m.displayName || m.firstName || m.nickname || 'there';
            try {
              await sendEmail({
                to: m.email,
                subject: `📈 Unusual spending in ${cat._id} — TrackTok`,
                html: spendingAnomalyEmail({
                  userName,
                  category: cat._id || 'Other',
                  currentAmount: formatINR(cat.total),
                  averageAmount: formatINR(Math.round(weeklyAvg)),
                  multiplier,
                }),
              });
              sent++;
              break;
            } catch (e) {
              console.error(`Anomaly alert failed for ${m.email}:`, e);
            }
          }
        }

        return NextResponse.json({ success: true, sent });
      }

      default:
        return NextResponse.json({ message: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Cron execute error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
