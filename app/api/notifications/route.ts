import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

const VALID_TYPES = ['payment', 'reminder', 'budget_alert', 'achievement', 'system'];

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
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const { db } = await connectToDatabase();

    const query: any = { userId: decoded.userId };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await db
      .collection('notifications')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error('Get notifications error:', error);
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
    const { userId, type, title, message, metadata } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { message: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const result = await db.collection('notifications').insertOne({
      userId,
      type,
      title,
      message,
      metadata: metadata || null,
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Notification created', id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const { id, all } = body;

    if (!id && !all) {
      return NextResponse.json(
        { message: 'Provide id or all: true' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    if (all) {
      const result = await db.collection('notifications').updateMany(
        { userId: decoded.userId, read: false },
        { $set: { read: true } }
      );

      return NextResponse.json({
        message: 'All notifications marked as read',
        modifiedCount: result.modifiedCount,
      });
    }

    const result = await db.collection('notifications').updateOne(
      { _id: new ObjectId(id), userId: decoded.userId },
      { $set: { read: true } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
