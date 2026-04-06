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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

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

    // Parse date range or default to current month
    let dateStart, dateEnd;
    if (startDate && endDate) {
      dateStart = new Date(startDate);
      dateEnd = new Date(endDate);
      dateEnd.setHours(23, 59, 59, 999);
    } else {
      const now = new Date();
      dateStart = new Date(now.getFullYear(), now.getMonth(), 1);
      dateEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const pipeline = [
      {
        $match: {
          collection: collectionKey,
          createdAt: { $gte: dateStart, $lte: dateEnd }
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
          transactionCount: [
            {
              $group: {
                _id: "$type",
                count: { $sum: 1 }
              }
            }
          ],
          largestTransaction: [
            {
              $match: { type: 'debit' }
            },
            {
              $sort: { amount: -1 }
            },
            {
              $limit: 1
            },
            {
              $project: {
                _id: 1,
                amount: 1,
                receiver: 1,
                category: 1
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
                amount: { $sum: "$amount" },
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } }
          ],
          topMerchants: [
            { $match: { type: 'debit' } },
            {
              $group: {
                _id: "$receiver",
                amount: { $sum: "$amount" },
                count: { $sum: 1 }
              }
            },
            { $sort: { amount: -1 } },
            { $limit: 5 }
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
    const aggregationResult = results[0] || { totals: [], categories: [], sources: [], geography: [], transactionCount: [], largestTransaction: [], topMerchants: [] };

    // Map aggregation results back to the expected response format
    const totals = aggregationResult.totals || [];
    const totalIncome = totals.find((t: any) => t._id === 'credit')?.total || 0;
    const totalExpense = totals.find((t: any) => t._id === 'debit')?.total || 0;

    // Transaction counts
    const transactionCounts = aggregationResult.transactionCount || [];
    const expenseCount = transactionCounts.find((t: any) => t._id === 'debit')?.count || 0;
    const incomeCount = transactionCounts.find((t: any) => t._id === 'credit')?.count || 0;

    // Largest transaction
    const largestTransaction = aggregationResult.largestTransaction?.[0] || null;

    // Average transaction
    const avgTransactionAmount = expenseCount > 0 ? totalExpense / expenseCount : 0;

    // Top payment source (most frequent)
    const topPaymentSource = aggregationResult.sources?.[0]?.source || 'Cash';

    const topMerchants = (aggregationResult.topMerchants || []).map((m: any) => ({
      name: m._id || 'Unknown',
      amount: m.amount,
      count: m.count
    }));

    // Calculate additional insights
    const totalTransactions = expenseCount + incomeCount;
    const savingsRateValue = totalIncome > 0 ? Number.parseFloat(((totalIncome / (totalIncome + totalExpense)) * 100).toFixed(1)) : 0;
    const topCategory = aggregationResult.categories?.[0];
    const topCategoryPercentageValue = topCategory && totalExpense > 0 ? Number.parseFloat(((topCategory.amount / totalExpense) * 100).toFixed(1)) : 0;

    // Category diversity (high = diverse spending)
    const categoryCount = (aggregationResult.categories || []).length;
    const categoryDiversityValue = Number.parseFloat((Math.min((categoryCount / 10) * 100, 100)).toFixed(1));

    const categoryBreakdown = (aggregationResult.categories || []).map((c: any) => ({
      category: c._id || 'Uncategorized',
      amount: c.amount,
      percentage: totalExpense > 0 ? ((c.amount / totalExpense) * 100).toFixed(1) : "0",
      transactions: c.count
    }));

    const sourceAnalysis = (aggregationResult.sources || []).map((s: any) => ({
      source: s._id || 'Cash',
      amount: s.amount,
      percentage: totalExpense > 0 ? ((s.amount / totalExpense) * 100).toFixed(1) : "0",
      count: s.count
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
        transactionStats: {
          totalExpenses: expenseCount,
          totalIncome: incomeCount,
          totalTransactions,
          averageTransaction: Number.parseFloat(avgTransactionAmount.toFixed(2)),
          largestTransaction: largestTransaction?.amount || 0,
          largestTransactionCategory: largestTransaction?.category || 'N/A',
          topPaymentSource,
          topMerchants,
          savingsRate: savingsRateValue,
          topCategory: topCategory?._id || 'N/A',
          topCategoryAmount: topCategory?.amount || 0,
          topCategoryPercentage: topCategoryPercentageValue,
          categoryDiversity: categoryDiversityValue,
        },
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
