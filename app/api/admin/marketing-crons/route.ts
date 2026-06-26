import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { registerCronJob, deleteCronJob, updateCronJob } from '@/lib/cron-client';
import { MARKETING_CRONS, getMarketingCron, getDefaultSettings, systemSettingsKey } from '@/lib/marketing-crons';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;
  const { db } = auth;

  const results = [];

  for (const def of MARKETING_CRONS) {
    const doc = await db.collection('system_settings').findOne({ key: systemSettingsKey(def.id) });
    results.push({
      ...def,
      enabled: !!doc?.value?.cronJobId,
      cronJobId: doc?.value?.cronJobId || null,
      cronExpression: doc?.value?.cronExpression || def.defaultCronExpression,
      settings: doc?.value?.settings || getDefaultSettings(def),
      lastUpdated: doc?.value?.updatedAt || null,
    });
  }

  return NextResponse.json({ crons: results });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;
  const { db } = auth;

  const body = await request.json();
  const { cronId, cronExpression, settings } = body;

  const def = getMarketingCron(cronId);
  if (!def) {
    return NextResponse.json({ message: `Unknown marketing cron: ${cronId}` }, { status: 400 });
  }

  const existing = await db.collection('system_settings').findOne({ key: systemSettingsKey(cronId) });
  if (existing?.value?.cronJobId) {
    try { await deleteCronJob(existing.value.cronJobId); } catch (e) { /* ignore */ }
  }

  const expr = cronExpression || def.defaultCronExpression;
  const mergedSettings = { ...getDefaultSettings(def), ...settings };

  const cronJob = await registerCronJob({
    name: def.name,
    description: def.description,
    body: { action: cronId },
    cronExpression: expr,
    sourceReferenceId: `marketing_${cronId}`,
  });

  await db.collection('system_settings').updateOne(
    { key: systemSettingsKey(cronId) },
    {
      $set: {
        key: systemSettingsKey(cronId),
        value: {
          cronJobId: cronJob._id,
          cronExpression: expr,
          settings: mergedSettings,
          updatedAt: new Date(),
        },
      },
    },
    { upsert: true },
  );

  return NextResponse.json({
    message: `${def.name} activated`,
    cronJobId: cronJob._id,
  }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;
  const { db } = auth;

  const body = await request.json();
  const { cronId, cronExpression, settings } = body;

  const def = getMarketingCron(cronId);
  if (!def) {
    return NextResponse.json({ message: `Unknown marketing cron: ${cronId}` }, { status: 400 });
  }

  const existing = await db.collection('system_settings').findOne({ key: systemSettingsKey(cronId) });
  if (!existing?.value?.cronJobId) {
    return NextResponse.json({ message: 'Cron not active. Enable it first.' }, { status: 400 });
  }

  const currentSettings = existing.value.settings || getDefaultSettings(def);
  const mergedSettings = { ...currentSettings, ...settings };
  const expr = cronExpression || existing.value.cronExpression;

  if (cronExpression && cronExpression !== existing.value.cronExpression) {
    await updateCronJob(existing.value.cronJobId, { cronExpression });
  }

  await db.collection('system_settings').updateOne(
    { key: systemSettingsKey(cronId) },
    {
      $set: {
        'value.settings': mergedSettings,
        'value.cronExpression': expr,
        'value.updatedAt': new Date(),
      },
    },
  );

  return NextResponse.json({ message: `${def.name} settings updated` });
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;
  const { db } = auth;

  const { searchParams } = new URL(request.url);
  const cronId = searchParams.get('cronId');

  if (!cronId) {
    return NextResponse.json({ message: 'Missing cronId' }, { status: 400 });
  }

  const def = getMarketingCron(cronId);
  if (!def) {
    return NextResponse.json({ message: `Unknown marketing cron: ${cronId}` }, { status: 400 });
  }

  const existing = await db.collection('system_settings').findOne({ key: systemSettingsKey(cronId) });
  if (existing?.value?.cronJobId) {
    try { await deleteCronJob(existing.value.cronJobId); } catch (e) { /* ignore */ }
  }

  await db.collection('system_settings').updateOne(
    { key: systemSettingsKey(cronId) },
    {
      $set: {
        'value.cronJobId': null,
        'value.updatedAt': new Date(),
      },
    },
  );

  return NextResponse.json({ message: `${def.name} deactivated` });
}
