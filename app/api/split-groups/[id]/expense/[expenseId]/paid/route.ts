import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken, phonesMatch } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function PATCH(
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

    const body = await request.json();
    const paid = body.paid !== false;
    const memberPhone = body.memberPhone;

    if (memberPhone) {
      const splitIndex = expense.split?.findIndex((s: any) => phonesMatch(s.phone, memberPhone));
      if (splitIndex === undefined || splitIndex === -1) {
        return NextResponse.json(
          { message: 'Member not found in this expense' },
          { status: 404 }
        );
      }

      await db.collection('expenses').updateOne(
        { _id: new ObjectId(expenseId) },
        {
          $set: {
            [`split.${splitIndex}.paidAt`]: paid ? new Date() : null,
            [`split.${splitIndex}.paidBy`]: paid ? (member.phone || member.phoneNumber) : null,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        message: paid ? 'Member marked as paid' : 'Member marked as unpaid',
        paid,
        memberPhone,
      });
    }

    // Legacy: mark entire expense (backward compat)
    const userPhone = member.phone || member.phoneNumber;
    const isMentioned = expense.split?.some((s: any) => phonesMatch(s.phone, userPhone));

    if (!isMentioned) {
      return NextResponse.json(
        { message: 'Only parties mentioned in this expense can mark it as paid' },
        { status: 403 }
      );
    }

    await db.collection('expenses').updateOne(
      { _id: new ObjectId(expenseId) },
      {
        $set: {
          paidAt: paid ? new Date() : null,
          paidBy: paid ? userPhone : null,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      message: paid ? 'Expense marked as paid' : 'Expense marked as unpaid',
      paid,
    });
  } catch (error) {
    console.error('Error marking expense as paid:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
