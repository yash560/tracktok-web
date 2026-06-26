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
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const { db } = await connectToDatabase();

    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member || !member.collection) {
      return NextResponse.json({ data: [] });
    }

    const collectionKey = member.collection;
    const yearStart = new Date(`${year}-01-01T00:00:00.000Z`);
    const yearEnd = new Date(`${year}-12-31T23:59:59.999Z`);

    const pipeline = [
      {
        $match: {
          collection: collectionKey,
          type: 'debit',
          createdAt: { $gte: yearStart, $lte: yearEnd },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 as const } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          amount: 1,
          count: 1,
        },
      },
    ];

    const data = await db.collection('expenses').aggregate(pipeline).toArray();

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Heatmap error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
