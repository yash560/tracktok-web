import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;
  const { db } = auth;
  const { id } = await params;

  const user = await db.collection('members').findOne(
    { _id: new ObjectId(id) },
    { projection: { password: 0 } },
  );
  if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  const userCollection = user.collection || `expense_${user.code?.padStart(6, '0')}`;

  const [txCount, totalSpent, totalReceived, splitGroups, reminders] = await Promise.all([
    db.collection('expenses').countDocuments({ collection: userCollection }),
    db.collection('expenses').aggregate([
      { $match: { collection: userCollection, type: 'debit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]).toArray(),
    db.collection('expenses').aggregate([
      { $match: { collection: userCollection, type: 'credit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]).toArray(),
    db.collection('split_groups').countDocuments({
      $or: [
        { owner: userCollection },
        { 'contacts.phone': { $in: [user.phoneNumber, user.phone].filter(Boolean) } },
      ],
    }),
    db.collection('reminders').countDocuments({ userId: id }),
  ]);

  const recentTransactions = await db.collection('expenses')
    .find({ collection: userCollection })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();

  return NextResponse.json({
    user,
    stats: {
      transactionCount: txCount,
      totalSpent: totalSpent[0]?.total || 0,
      totalReceived: totalReceived[0]?.total || 0,
      splitGroups,
      reminders,
    },
    recentTransactions,
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;
  const { db } = auth;
  const { id } = await params;

  const body = await request.json();
  const allowedFields = ['displayName', 'firstName', 'lastName', 'nickname', 'email', 'phoneNumber', 'phone', 'gender', 'dateOfBirth', 'upiId', 'roles'];
  const updateDoc: Record<string, any> = { updatedAt: new Date() };

  for (const field of allowedFields) {
    if (body[field] !== undefined) updateDoc[field] = body[field];
  }

  const result = await db.collection('members').updateOne(
    { _id: new ObjectId(id) },
    { $set: updateDoc },
  );

  if (result.matchedCount === 0) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  return NextResponse.json({ message: 'User updated' });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;
  const { db } = auth;
  const { id } = await params;

  const result = await db.collection('members').updateOne(
    { _id: new ObjectId(id) },
    { $set: { deactivatedAt: new Date(), updatedAt: new Date() } },
  );

  if (result.matchedCount === 0) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  return NextResponse.json({ message: 'User deactivated' });
}
