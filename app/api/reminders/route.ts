import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';
import { registerCronJob, updateCronJob, deleteCronJob, frequencyToCron } from '@/lib/cron-client';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

const VALID_FREQUENCIES = ['once', 'weekly', 'monthly', 'yearly'];

export async function GET(request: NextRequest) {
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

    const reminders = await db
      .collection('reminders')
      .find({ userId: decoded.userId })
      .sort({ dueDate: 1 })
      .toArray();

    return NextResponse.json({ reminders }, { status: 200 });
  } catch (error) {
    console.error('Get reminders error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { title, amount, category, dueDate, frequency, enabled, sourceTransactionId } = body;

    if (!title || !amount || !category || !dueDate || !frequency) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (!VALID_FREQUENCIES.includes(frequency)) {
      return NextResponse.json({ message: 'Invalid frequency' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const reminderDoc: Record<string, unknown> = {
      userId: decoded.userId,
      title,
      amount,
      category,
      dueDate,
      frequency,
      enabled: enabled !== false,
      lastNotified: null,
      sourceTransactionId: sourceTransactionId || null,
      cronJobId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('reminders').insertOne(reminderDoc);
    const reminderId = result.insertedId.toString();

    if (frequency !== 'once' && enabled !== false) {
      const cronExpr = frequencyToCron(frequency, dueDate);
      if (cronExpr) {
        try {
          const cronJob = await registerCronJob({
            name: `Reminder: ${title}`,
            description: `Auto-scheduled reminder for ${title} (₹${amount})`,
            body: { action: 'send-reminder', reminderId },
            cronExpression: cronExpr,
            sourceReferenceId: reminderId,
          });
          await db.collection('reminders').updateOne(
            { _id: result.insertedId },
            { $set: { cronJobId: cronJob._id } },
          );
        } catch (cronErr: any) {
          console.error('Failed to register cron job:', cronErr.message);
        }
      }
    }

    logAudit(db, decoded.userId, 'create', 'reminder', reminderId, { title, amount, category, frequency }, request);

    return NextResponse.json(
      { message: 'Reminder created', id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create reminder error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { id, title, amount, category, dueDate, frequency, enabled } = body;

    if (!id) {
      return NextResponse.json({ message: 'Missing ID' }, { status: 400 });
    }

    if (frequency && !VALID_FREQUENCIES.includes(frequency)) {
      return NextResponse.json({ message: 'Invalid frequency' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const before = await db.collection('reminders').findOne({ _id: new ObjectId(id), userId: decoded.userId });

    const updateDoc: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updateDoc.title = title;
    if (amount !== undefined) updateDoc.amount = amount;
    if (category !== undefined) updateDoc.category = category;
    if (dueDate !== undefined) updateDoc.dueDate = dueDate;
    if (frequency !== undefined) updateDoc.frequency = frequency;
    if (enabled !== undefined) updateDoc.enabled = enabled;

    const result = await db.collection('reminders').updateOne(
      { _id: new ObjectId(id), userId: decoded.userId },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Reminder not found' }, { status: 404 });
    }

    const updatedReminder = await db.collection('reminders').findOne({ _id: new ObjectId(id) });
    const newFreq = updatedReminder?.frequency || before?.frequency;
    const newDueDate = updatedReminder?.dueDate || before?.dueDate;
    const newTitle = updatedReminder?.title || before?.title;
    const newAmount = updatedReminder?.amount || before?.amount;
    const isEnabled = updatedReminder?.enabled !== false;
    const hasCronJob = !!before?.cronJobId;
    const needsCron = newFreq !== 'once' && isEnabled;

    try {
      if (!needsCron && hasCronJob) {
        await deleteCronJob(before.cronJobId);
        await db.collection('reminders').updateOne(
          { _id: new ObjectId(id) },
          { $set: { cronJobId: null } },
        );
      } else if (needsCron) {
        const cronExpr = frequencyToCron(newFreq, newDueDate);
        if (cronExpr && hasCronJob) {
          await updateCronJob(before.cronJobId, {
            name: `Reminder: ${newTitle}`,
            description: `Auto-scheduled reminder (₹${newAmount})`,
            cronExpression: cronExpr,
          });
        } else if (cronExpr && !hasCronJob) {
          const cronJob = await registerCronJob({
            name: `Reminder: ${newTitle}`,
            description: `Auto-scheduled reminder (₹${newAmount})`,
            body: { action: 'send-reminder', reminderId: id },
            cronExpression: cronExpr,
            sourceReferenceId: id,
          });
          await db.collection('reminders').updateOne(
            { _id: new ObjectId(id) },
            { $set: { cronJobId: cronJob._id } },
          );
        }
      }
    } catch (cronErr: any) {
      console.error('Failed to update cron job:', cronErr.message);
    }

    logAudit(db, decoded.userId, 'update', 'reminder', id, { before: { title: before?.title, amount: before?.amount }, after: updateDoc }, request);

    return NextResponse.json({ message: 'Reminder updated' });
  } catch (error) {
    console.error('Update reminder error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Missing ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const toDelete = await db.collection('reminders').findOne({ _id: new ObjectId(id), userId: decoded.userId });

    if (toDelete?.cronJobId) {
      try {
        await deleteCronJob(toDelete.cronJobId);
      } catch (cronErr: any) {
        console.error('Failed to delete cron job:', cronErr.message);
      }
    }

    const result = await db.collection('reminders').deleteOne({
      _id: new ObjectId(id),
      userId: decoded.userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Reminder not found' }, { status: 404 });
    }

    logAudit(db, decoded.userId, 'delete', 'reminder', id, { title: toDelete?.title, amount: toDelete?.amount }, request);

    return NextResponse.json({ message: 'Reminder deleted' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
