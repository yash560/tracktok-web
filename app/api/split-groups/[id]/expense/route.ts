import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

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
    const { amount, description, category, type, date, notes, source, city, split } = body;

    if (!amount || !description || !category || !type) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const splitGroup = await db.collection('split_groups').findOne({ _id: new ObjectId(id) });
    if (!splitGroup) {
      return NextResponse.json({ message: 'Split group not found' }, { status: 404 });
    }

    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    let splitArray: any[] = [];
    if (split && Array.isArray(split) && split.length > 0) {
      splitArray = split.map((s: any) => ({
        name: s.name,
        phone: s.phone,
        contact: s.contact,
        value: s.value,
        amount: s.amount,
        split: s.split,
        owner: s.owner || false,
        ...(s.$type && {
          $type: s.$type,
          $collection: s.$collection,
          $id: s.$id,
          $customer_id: s.$customer_id,
          $label: s.$label,
        }),
      }));
    }

    const expense = {
      collection: member.collection,
      amount,
      description,
      category,
      type: type === 'expense' ? 'debit' : 'credit',
      date: date?.includes('T') ? date.split('T')[0] : date || new Date().toISOString().split('T')[0],
      notes: notes || null,
      source: source || 'Cash',
      city: city || 'Unknown',
      customer_id: member.customer_id || 'webverse',
      valid: true,
      split: splitArray.length > 0 ? splitArray : undefined,
      split_group_id: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('expenses').insertOne(expense);

    await db.collection('split_groups').updateOne(
      { _id: new ObjectId(id) },
      { $push: { expenses: result.insertedId } as any }
    );

    return NextResponse.json(
      { message: 'Expense added to split group', id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating split group expense:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
