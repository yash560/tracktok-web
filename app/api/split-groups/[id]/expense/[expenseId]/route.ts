import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken, phonesMatch } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
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

    const { id, expenseId } = await params;
    const { db } = await connectToDatabase();

    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const splitGroup = await db.collection('split_groups').findOne({
      _id: new ObjectId(id),
      customer_id: member.customer_id,
    });
    if (!splitGroup) {
      return NextResponse.json({ message: 'Split group not found' }, { status: 404 });
    }

    const expense = await db.collection('expenses').findOne({ _id: new ObjectId(expenseId) });
    if (!expense) {
      return NextResponse.json({ message: 'Expense not found' }, { status: 404 });
    }

    const userPhone = member.phone || member.phoneNumber;
    const isExpenseOwner = expense.split?.some(
      (s: any) => s.owner === true && phonesMatch(s.phone, userPhone)
    );
    const isGroupOwner =
      splitGroup.owner === member._id.toString() || splitGroup.owner === member.collection;

    if (!isExpenseOwner && !isGroupOwner) {
      return NextResponse.json(
        { message: 'Only the expense creator or group owner can delete this expense' },
        { status: 403 }
      );
    }

    await db.collection('expenses').deleteOne({ _id: new ObjectId(expenseId) });

    await db.collection('split_groups').updateOne(
      { _id: new ObjectId(id) },
      { $pull: { expenses: new ObjectId(expenseId) } as any }
    );

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
