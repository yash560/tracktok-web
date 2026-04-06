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

    const { db } = await connectToDatabase();

    // Fetch user specific collection name
    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member || !member.collection) {
      return NextResponse.json({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        categoryBreakdown: [],
        sourceAnalysis: [],
        geographicInsights: [],
        period: 'current_month',
      });
    }

    const collectionKey = member.collection;

    // DEBUG: Get a few sample docs to check schema
    const samples = await db.collection('expenses').find({ collection: collectionKey }).limit(3).toArray();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const pipeline = [
      {
        $match: {
          collection: collectionKey,
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: "$type",
                total: { $sum: "$amount" }
              }
            }
          ],
          categories: [
            { $match: { type: 'debit' } },
            {
              $group: {
                _id: "$category",
                amount: { $sum: "$amount" },
                count: { $sum: 1 }
              }
            },
            { $sort: { amount: -1 } }
          ],
          sources: [
            { $match: { type: 'debit' } },
            {
              $group: {
                _id: "$source",
                amount: { $sum: "$amount" }
              }
            },
            { $sort: { amount: -1 } }
          ],
          geography: [
            { $match: { type: 'debit' } },
            {
              $group: {
                _id: "$city",
                amount: { $sum: "$amount" }
              }
            },
            { $sort: { amount: -1 } }
          ]
        }
      }
    ];

    const results = await db.collection('expenses').aggregate(pipeline).toArray();
    const aggregationResult = results[0] || { totals: [], categories: [], sources: [], geography: [] };

    // Map aggregation results back to the expected response format
    const totals = aggregationResult.totals || [];
    const totalIncome = totals.find((t: any) => t._id === 'credit')?.total || 0;
    const totalExpense = totals.find((t: any) => t._id === 'debit')?.total || 0;

    const categoryBreakdown = (aggregationResult.categories || []).map((c: any) => ({
      category: c._id || 'Uncategorized',
      amount: c.amount,
      percentage: totalExpense > 0 ? ((c.amount / totalExpense) * 100).toFixed(1) : "0",
      transactions: c.count
    }));

    const sourceAnalysis = (aggregationResult.sources || []).map((s: any) => ({
      source: s._id || 'Cash',
      amount: s.amount,
      percentage: totalExpense > 0 ? ((s.amount / totalExpense) * 100).toFixed(1) : "0"
    }));

    const geographicInsights = (aggregationResult.geography || []).map((g: any) => ({
      city: g._id || 'Unknown',
      amount: g.amount,
      percentage: totalExpense > 0 ? ((g.amount / totalExpense) * 100).toFixed(1) : "0"
    }));

    return NextResponse.json(
      {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        categoryBreakdown,
        sourceAnalysis,
        geographicInsights,
        period: 'current_month',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
