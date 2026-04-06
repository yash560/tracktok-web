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
        const months = parseInt(searchParams.get('months') || '12');

        const { db } = await connectToDatabase();

        const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
        if (!member || !member.collection) {
            return NextResponse.json({ data: [] });
        }

        const collectionKey = member.collection;

        // Generate data for last N months
        const monthlyData = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

            const pipeline = [
                {
                    $match: {
                        collection: collectionKey,
                        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
                    }
                },
                {
                    $group: {
                        _id: '$type',
                        total: { $sum: '$amount' }
                    }
                }
            ];

            const results = await db.collection('expenses').aggregate(pipeline).toArray();

            const income = results.find((r: any) => r._id === 'credit')?.total || 0;
            const expense = results.find((r: any) => r._id === 'debit')?.total || 0;

            monthlyData.push({
                month: startOfMonth.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                income,
                expense
            });
        }

        return NextResponse.json({ data: monthlyData }, { status: 200 });
    } catch (error) {
        console.error('Get monthly analytics error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
