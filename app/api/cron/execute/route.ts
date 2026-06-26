import { connectToDatabase } from '@/lib/mongodb';
import { sendEmail } from '@/lib/mailer';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

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
        const amountStr = `₹${Number(reminder.amount).toLocaleString('en-IN')}`;
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
                    <span style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; padding: 6px 16px; border-radius: 20px;">🔔 Scheduled Reminder</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px 40px 0 40px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #1a1a2e; line-height: 1.6;">Hi <strong>${userName}</strong>,</p>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #475569; line-height: 1.6;">
                This is your <strong style="color: #1a1a2e;">${freq.toLowerCase()}</strong> reminder for <strong style="color: #1a1a2e;">"${reminder.title}"</strong>.
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
                    <p style="margin: 0; font-size: 36px; font-weight: 700; color: #dc2626; letter-spacing: -1px;">${amountStr}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Details -->
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

          <!-- CTA Button -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px 40px; text-align: center;">
              <a href="${appUrl}/dashboard/reminders" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);">View Reminders →</a>
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
                This is an automated reminder from TrackTok. If you've already paid this, please disregard.
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

        await sendEmail({
          to: member.email,
          subject: `Reminder: ${reminder.title} — ₹${Number(reminder.amount).toLocaleString('en-IN')}`,
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
          const userCollection = m.collection || `expense_${m.code?.padStart(6, '0')}`;
          const latestTx = await db.collection('expenses')
            .findOne({ collection: userCollection }, { sort: { createdAt: -1 }, projection: { createdAt: 1 } });

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
