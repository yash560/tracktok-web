import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stddev(arr: number[], avg: number): number {
  if (arr.length < 2) return 0;
  const variance = arr.reduce((sum, v) => sum + (v - avg) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

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

    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member || !member.collection) {
      return NextResponse.json({ anomalies: [] });
    }

    const collectionKey = member.collection;
    const now = new Date();

    // 6-month baseline window
    const baselineStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    // Detection window: current month by default, or custom
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let detectStart: Date, detectEnd: Date;
    if (startDate && endDate) {
      detectStart = new Date(startDate);
      detectEnd = new Date(endDate);
      detectEnd.setHours(23, 59, 59, 999);
    } else {
      detectStart = new Date(now.getFullYear(), now.getMonth(), 1);
      detectEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Fetch baseline expenses (6 months)
    const baselineExpenses = await db
      .collection('expenses')
      .find({
        collection: collectionKey,
        type: 'debit',
        createdAt: { $gte: baselineStart, $lt: detectStart },
      })
      .toArray();

    // Build per-category stats
    const categoryAmounts: Record<string, number[]> = {};
    const allAmounts: number[] = [];

    for (const exp of baselineExpenses) {
      const cat = exp.category || 'other';
      if (!categoryAmounts[cat]) categoryAmounts[cat] = [];
      categoryAmounts[cat].push(exp.amount);
      allAmounts.push(exp.amount);
    }

    const overallMedian = median(allAmounts);
    const knownCategories = new Set(Object.keys(categoryAmounts));

    // Fetch current period expenses
    const currentExpenses = await db
      .collection('expenses')
      .find({
        collection: collectionKey,
        type: 'debit',
        createdAt: { $gte: detectStart, $lte: detectEnd },
      })
      .sort({ amount: -1 })
      .toArray();

    const anomalies: any[] = [];

    for (const exp of currentExpenses) {
      const cat = exp.category || 'other';
      const reasons: string[] = [];
      let anomalyType = '';

      // Check 1: New category
      if (!knownCategories.has(cat)) {
        reasons.push(`New spending category "${cat}" — not seen in your last 6 months`);
        anomalyType = 'new_category';
      }

      // Check 2: Z-score within category (need >= 5 data points)
      const catData = categoryAmounts[cat];
      if (catData && catData.length >= 5) {
        const avg = mean(catData);
        const sd = stddev(catData, avg);
        if (sd > 0 && exp.amount > avg + 2 * sd) {
          const multiplier = (exp.amount / avg).toFixed(1);
          reasons.push(`${multiplier}x your average ${cat} expense (avg: ₹${avg.toFixed(0)})`);
          anomalyType = anomalyType || 'high_amount';
        }
      }

      // Check 3: Above 3x overall median
      if (overallMedian > 0 && exp.amount > 3 * overallMedian) {
        reasons.push(`${(exp.amount / overallMedian).toFixed(1)}x your median transaction (₹${overallMedian.toFixed(0)})`);
        anomalyType = anomalyType || 'above_median';
      }

      if (reasons.length > 0) {
        anomalies.push({
          _id: exp._id,
          description: exp.description,
          amount: exp.amount,
          category: cat,
          date: exp.date || exp.createdAt,
          source: exp.source,
          anomalyReason: reasons[0],
          anomalyReasons: reasons,
          anomalyType,
        });
      }
    }

    return NextResponse.json({ anomalies }, { status: 200 });
  } catch (error) {
    console.error('Anomaly detection error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
