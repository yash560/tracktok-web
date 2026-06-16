import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
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

    // Fetch user specific collection name
    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member || !member.collection) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const collectionKey = member.collection;
    const userPhone = member.phone || member.phoneNumber;
    const { code } = await params;

    // Build filter for own transaction or split transaction
    const filterConditions: any[] = [
      { code, collection: collectionKey }
    ];

    if (userPhone) {
      filterConditions.push({ code, 'split.phone': userPhone });
    }

    const query: any = { $or: filterConditions };

    // Fetch single transaction by code
    const transaction = await db.collection('expenses').findOne(query);

    if (!transaction) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    // Add split transaction flags
    const isOwnTransaction = transaction.collection === collectionKey;
    const isSplitTransaction = !isOwnTransaction && userPhone && transaction.split?.some((s: any) => s.phone === userPhone);
    const splitMember = isSplitTransaction ? transaction.split?.find((s: any) => s.phone === userPhone) : null;

    const enrichedTransaction = {
      ...transaction,
      type: transaction.type === 'debit' ? 'expense' : 'income',
      isOwnTransaction,
      isSplitTransaction,
      splitAmount: splitMember?.amount || null,
      splitPercentage: splitMember?.value || null,
    };

    // Fetch split group if transaction is part of a split
    let splitGroup = null;
    if (transaction.split_group_id) {
      splitGroup = await db.collection('split_groups').findOne({
        _id: new ObjectId(transaction.split_group_id),
        customer_id: member.customer_id,
      });
    }

    return NextResponse.json({ transaction: enrichedTransaction, splitGroup });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
