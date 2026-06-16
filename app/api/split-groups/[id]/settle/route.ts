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

    const { db } = await connectToDatabase();
    const { id } = await params;

    // Update split group to mark as settled
    const result = await db.collection('split_groups').updateOne(
      { _id: new ObjectId(id) },
      { $set: { settledAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Split group not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Split group settled successfully' });
  } catch (error) {
    console.error('Error settling split group:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
