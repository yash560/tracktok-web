import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    const { db } = await connectToDatabase();

    // Fetch user specific collection name
    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member || !member.collection) {
      return NextResponse.json({ transactions: [], pagination: { total: 0, pages: 0, page, limit } });
    }

    const collectionKey = member.collection;

    const query: any = { collection: collectionKey };
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    const totalCount = await db.collection('expenses').countDocuments(query);
    const rawExpenses = await db
      .collection('expenses')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Map debit/credit to info compatible with UI
    const transactions = rawExpenses.map(exp => ({
      ...exp,
      type: exp.type === 'debit' ? 'expense' : 'income',
      amount: exp.amount
    }));

    return NextResponse.json(
      {
        transactions,
        pagination: {
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
          page,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
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
    const { amount, description, category, type, date, notes, source, city } = body;

    if (!amount || !description || !category || !type) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Fetch user specific collection name
    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member || !member.collection) {
      return NextResponse.json({ message: 'User configuration incomplete' }, { status: 400 });
    }

    const collectionKey = member.collection;

    const result = await db.collection('expenses').insertOne({
      collection: collectionKey,
      amount,
      description,
      category,
      type: type === 'expense' ? 'debit' : 'credit',
      date: date.includes('T') ? date.split('T')[0] : date,
      notes: notes || null,
      source: source || 'Cash',
      city: city || 'Unknown',
      customer_id: member.customer_id || 'webverse',
      valid: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Transaction created', id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Missing ID' }, { status: 400 });
    }

    const body = await request.json();
    const { amount, description, category, type, date, notes, source, city } = body;

    const { db } = await connectToDatabase();

    // Fetch user specific collection name
    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member || !member.collection) {
      return NextResponse.json({ message: 'User configuration incomplete' }, { status: 400 });
    }

    const collectionKey = member.collection;

    const updateDoc: any = {
      ...(amount && { amount }),
      ...(description && { description }),
      ...(category && { category }),
      ...(type && { type: type === 'expense' ? 'debit' : 'credit' }),
      ...(date && { date: date.includes('T') ? date.split('T')[0] : date }),
      ...(notes !== undefined && { notes }),
      ...(source && { source }),
      ...(city && { city }),
      updatedAt: new Date(),
    };

    const result = await db.collection('expenses').updateOne(
      { _id: new ObjectId(id), collection: collectionKey },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Transaction updated' });
  } catch (error) {
    console.error('Update transaction error:', error);
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

    // Fetch user specific collection name
    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member || !member.collection) {
      return NextResponse.json({ message: 'User configuration incomplete' }, { status: 400 });
    }

    const collectionKey = member.collection;

    const result = await db.collection('expenses').deleteOne({
      _id: new ObjectId(id),
      collection: collectionKey,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
