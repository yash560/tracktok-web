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
    const expenseId = searchParams.get('expenseId');
    if (!expenseId) {
      return NextResponse.json({ message: 'expenseId is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const comments = await db
      .collection('comments')
      .find({ expenseId })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
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

    const { expenseId, text, authorName, authorPhone } = await request.json();
    if (!expenseId || !text) {
      return NextResponse.json({ message: 'expenseId and text are required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const comment = {
      expenseId,
      userId: decoded.userId,
      authorName: authorName || '',
      authorPhone: authorPhone || '',
      text,
      createdAt: new Date(),
    };

    const result = await db.collection('comments').insertOne(comment);

    return NextResponse.json({ comment: { ...comment, _id: result.insertedId } }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
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
      return NextResponse.json({ message: 'id is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const comment = await db.collection('comments').findOne({ _id: new ObjectId(id) });
    if (!comment) {
      return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
    }

    if (comment.userId !== decoded.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await db.collection('comments').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
