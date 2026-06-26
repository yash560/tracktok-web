import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { registerCronJob, deleteCronJob } from '@/lib/cron-client';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;

  const REACH_API_URL = process.env.REACH_API_URL;
  const REACH_API_KEY = process.env.REACH_API_KEY;

  if (!REACH_API_URL || !REACH_API_KEY) {
    return NextResponse.json({ jobs: [], message: 'Reach not configured' });
  }

  try {
    const res = await fetch(`${REACH_API_URL}/api/cron-jobs`, {
      headers: { 'X-API-Key': REACH_API_KEY },
    });
    const body = await res.json();
    const jobs = Array.isArray(body) ? body : Array.isArray(body.jobs) ? body.jobs : [];
    return NextResponse.json({ jobs });
  } catch (e: any) {
    return NextResponse.json({ jobs: [], error: e.message }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;
  const { db } = auth;

  const body = await request.json();
  const { feature } = body;

  if (feature === 'inactive-nudge') {
    const existing = await db.collection('system_settings').findOne({ key: 'inactive_nudge_cron_id' });
    if (existing?.value) {
      try { await deleteCronJob(existing.value); } catch (e) { /* ignore */ }
    }

    const cronJob = await registerCronJob({
      name: 'Inactive User Nudge',
      description: 'Weekly email to users who haven\'t logged expenses in 7+ days',
      body: { action: 'inactive-user-nudge' },
      cronExpression: body.cronExpression || '0 10 * * 1',
      sourceReferenceId: 'system_inactive_nudge',
    });

    await db.collection('system_settings').updateOne(
      { key: 'inactive_nudge_cron_id' },
      { $set: { key: 'inactive_nudge_cron_id', value: cronJob._id, updatedAt: new Date() } },
      { upsert: true },
    );

    return NextResponse.json({ message: 'Inactive nudge activated', cronJobId: cronJob._id }, { status: 201 });
  }

  return NextResponse.json({ message: 'Unknown feature' }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;
  const { db } = auth;

  const { searchParams } = new URL(request.url);
  const feature = searchParams.get('feature');

  if (feature === 'inactive-nudge') {
    const setting = await db.collection('system_settings').findOne({ key: 'inactive_nudge_cron_id' });
    if (setting?.value) {
      try { await deleteCronJob(setting.value); } catch (e) { /* ignore */ }
    }
    await db.collection('system_settings').deleteOne({ key: 'inactive_nudge_cron_id' });
    return NextResponse.json({ message: 'Inactive nudge deactivated' });
  }

  return NextResponse.json({ message: 'Unknown feature' }, { status: 400 });
}
