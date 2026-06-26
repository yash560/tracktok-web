import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';
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
    const now = new Date();
    const month = searchParams.get('month') || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const { db } = await connectToDatabase();

    const budgets = await db
      .collection('budgets')
      .find({ userId: decoded.userId, month })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ budgets }, { status: 200 });
  } catch (error) {
    console.error('Get budgets error:', error);
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
    const { category, amount, month } = body;

    if (!category || !amount || !month) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const result = await db.collection('budgets').insertOne({
      userId: decoded.userId,
      category,
      amount,
      month,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    logAudit(db, decoded.userId, 'create', 'budget', result.insertedId.toString(), { category, amount, month }, request);

    return NextResponse.json(
      { message: 'Budget created', id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create budget error:', error);
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
    const { id, amount } = body;

    if (!id || !amount) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const before = await db.collection('budgets').findOne({ _id: new ObjectId(id), userId: decoded.userId });

    const result = await db.collection('budgets').updateOne(
      { _id: new ObjectId(id), userId: decoded.userId },
      { $set: { amount, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Budget not found' }, { status: 404 });
    }

    logAudit(db, decoded.userId, 'update', 'budget', id, { before: { amount: before?.amount }, after: { amount } }, request);

    return NextResponse.json({ message: 'Budget updated' });
  } catch (error) {
    console.error('Update budget error:', error);
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

    const toDelete = await db.collection('budgets').findOne({ _id: new ObjectId(id), userId: decoded.userId });

    const result = await db.collection('budgets').deleteOne({
      _id: new ObjectId(id),
      userId: decoded.userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Budget not found' }, { status: 404 });
    }

    logAudit(db, decoded.userId, 'delete', 'budget', id, { category: toDelete?.category, amount: toDelete?.amount }, request);

    return NextResponse.json({ message: 'Budget deleted' });
  } catch (error) {
    console.error('Delete budget error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
