import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { registerCronJob, updateCronJob, deleteCronJob } from '@/lib/cron-client';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

const FREQUENCY_CRON: Record<string, string> = {
  daily: '0 9 * * *',
  weekly: '0 9 * * 1',
  biweekly: '0 9 1,15 * *',
  monthly: '0 9 1 * *',
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(authHeader.replace('Bearer ', ''));
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    const { id } = await params;
    const { db } = await connectToDatabase();

    const group = await db.collection('split_groups').findOne({ _id: new ObjectId(id) });
    if (!group) return NextResponse.json({ message: 'Group not found' }, { status: 404 });

    return NextResponse.json({
      reminderSchedule: group.reminderSchedule || null,
      cronJobId: group.cronJobId || null,
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(authHeader.replace('Bearer ', ''));
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { frequency, customCron, time } = body;

    if (!frequency && !customCron) {
      return NextResponse.json({ message: 'frequency or customCron required' }, { status: 400 });
    }

    let cronExpression: string;
    if (customCron) {
      cronExpression = customCron;
    } else if (FREQUENCY_CRON[frequency]) {
      cronExpression = FREQUENCY_CRON[frequency];
      if (time) {
        const [h, m] = time.split(':').map(Number);
        const parts = cronExpression.split(' ');
        parts[0] = String(m);
        parts[1] = String(h);
        cronExpression = parts.join(' ');
      }
    } else {
      return NextResponse.json({ message: 'Invalid frequency. Use: daily, weekly, biweekly, monthly, or provide customCron' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const group = await db.collection('split_groups').findOne({ _id: new ObjectId(id) });
    if (!group) return NextResponse.json({ message: 'Group not found' }, { status: 404 });

    if (group.settledAt) {
      return NextResponse.json({ message: 'Cannot schedule reminders for a settled group' }, { status: 400 });
    }

    if (group.cronJobId) {
      try { await deleteCronJob(group.cronJobId); } catch (e) { /* old job may not exist */ }
    }

    const cronJob = await registerCronJob({
      name: `Split reminder: ${group.name}`,
      description: `Auto-send payment reminders for split group "${group.name}"`,
      body: {
        action: 'send-split-reminder',
        splitGroupId: id,
        userId: decoded.userId,
      },
      cronExpression,
      sourceReferenceId: `split_${id}`,
    });

    await db.collection('split_groups').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          reminderSchedule: { frequency: customCron ? 'custom' : frequency, cronExpression, time: time || '09:00' },
          cronJobId: cronJob._id,
          updatedAt: new Date(),
        },
      },
    );

    return NextResponse.json({
      message: 'Reminder schedule created',
      reminderSchedule: { frequency: customCron ? 'custom' : frequency, cronExpression, time: time || '09:00' },
      cronJobId: cronJob._id,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Schedule reminder error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(authHeader.replace('Bearer ', ''));
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    const { id } = await params;
    const { db } = await connectToDatabase();

    const group = await db.collection('split_groups').findOne({ _id: new ObjectId(id) });
    if (!group) return NextResponse.json({ message: 'Group not found' }, { status: 404 });

    if (group.cronJobId) {
      try { await deleteCronJob(group.cronJobId); } catch (e) { /* ignore */ }
    }

    await db.collection('split_groups').updateOne(
      { _id: new ObjectId(id) },
      { $set: { reminderSchedule: null, cronJobId: null, updatedAt: new Date() } },
    );

    return NextResponse.json({ message: 'Reminder schedule removed' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
