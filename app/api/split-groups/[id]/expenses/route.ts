import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Fetch user
    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member || !member.collection) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { id } = await params;

    // Fetch split group to verify access
    const splitGroup = await db.collection('split_groups').findOne({
      _id: new ObjectId(id),
      customer_id: member.customer_id,
    });

    if (!splitGroup) {
      return NextResponse.json({ message: 'Split group not found' }, { status: 404 });
    }

    // Fetch all unlinked expenses for this user
    const unlinkedExpenses = await db
      .collection('expenses')
      .find({
        collection: member.collection,
        $or: [
          { split_group_id: { $exists: false } },
          { split_group_id: null },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ expenses: unlinkedExpenses }, { status: 200 });
  } catch (error) {
    console.error('Error fetching unlinked expenses:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const body = await request.json();
    const { expenseId } = body;

    if (!expenseId) {
      return NextResponse.json({ message: 'Missing expense ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Fetch user
    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member || !member.collection) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Verify split group access
    const splitGroup = await db.collection('split_groups').findOne({
      _id: new ObjectId(id),
      customer_id: member.customer_id,
    });

    if (!splitGroup) {
      return NextResponse.json({ message: 'Split group not found' }, { status: 404 });
    }

    // Verify expense ownership
    const expense = await db.collection('expenses').findOne({
      _id: new ObjectId(expenseId),
      collection: member.collection,
    });

    if (!expense) {
      return NextResponse.json({ message: 'Expense not found' }, { status: 404 });
    }

    // Link expense to split group
    const result = await db.collection('expenses').updateOne(
      { _id: new ObjectId(expenseId) },
      { $set: { split_group_id: id, updatedAt: new Date() } }
    );

    // Add expense ID to split group's expenses array
    await db.collection('split_groups').updateOne(
      { _id: new ObjectId(id) },
      { $addToSet: { expenses: expenseId }, $set: { updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Failed to link expense' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Expense linked successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error linking expense:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
