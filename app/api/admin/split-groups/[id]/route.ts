import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;
  const { db } = auth;
  const { id } = await params;

  const group = await db.collection('split_groups').findOne({ _id: new ObjectId(id) });
  if (!group) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  const expenseIds = (group.expenses || []).map((eid: string) => new ObjectId(eid));
  const expenses = expenseIds.length > 0
    ? await db.collection('expenses').find({ _id: { $in: expenseIds } }).toArray()
    : [];

  const payments = await db.collection('split_group_payments')
    .find({ splitGroupId: id })
    .sort({ date: -1 })
    .toArray();

  return NextResponse.json({ group, expenses, payments });
}
