import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;
  const { db } = auth;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    newUsersThisMonth,
    totalTransactions,
    totalSplitGroups,
    activeSplitGroups,
    activeReminders,
    volumeAgg,
    activeUsersAgg,
    dailyTxAgg,
    categoryAgg,
    signupAgg,
    recentLogs,
  ] = await Promise.all([
    db.collection('members').countDocuments(),
    db.collection('members').countDocuments({ createdAt: { $gte: startOfMonth } }),
    db.collection('expenses').countDocuments(),
    db.collection('split_groups').countDocuments(),
    db.collection('split_groups').countDocuments({ settledAt: null }),
    db.collection('reminders').countDocuments({ enabled: true }),
    db.collection('expenses').aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]).toArray(),
    db.collection('expenses').aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$collection' } },
      { $count: 'count' },
    ]).toArray(),
    db.collection('expenses').aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, volume: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
    ]).toArray(),
    db.collection('expenses').aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]).toArray(),
    db.collection('members').aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]).toArray(),
    db.collection('audit_logs').find().sort({ createdAt: -1 }).limit(10).toArray(),
  ]);

  return NextResponse.json({
    kpis: {
      totalUsers,
      newUsersThisMonth,
      activeUsers: activeUsersAgg[0]?.count || 0,
      totalTransactions,
      totalVolume: volumeAgg[0]?.total || 0,
      totalSplitGroups,
      activeSplitGroups,
      activeReminders,
    },
    charts: {
      dailyTransactions: dailyTxAgg,
      categoryBreakdown: categoryAgg,
      userSignups: signupAgg,
    },
    recentActivity: recentLogs,
  });
}
