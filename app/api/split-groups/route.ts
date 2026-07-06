import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken, normalizePhone } from '@/lib/auth';
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

    // Fetch user
    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const userPhone = member.phone || member.phoneNumber;
    const digits = normalizePhone(userPhone);
    const phoneVariants = digits ? [digits, `91${digits}`, `+91${digits}`, userPhone].filter(Boolean) : [];

    // Find split groups where user is a member or owner
    const splitGroups = await db
      .collection('split_groups')
      .find({
        $or: [
          { owner: member.owner },
          ...(phoneVariants.length > 0 ? [{ 'contacts.phone': { $in: phoneVariants } }] : []),
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Enrich each group with total amount + expense count + last activity so
    // the listing page can filter/sort on those criteria without a per-group fetch.
    const allExpenseIds = splitGroups.flatMap((g: any) =>
      (g.expenses || []).map((expId: string) => {
        try {
          return new ObjectId(expId);
        } catch {
          return null;
        }
      }).filter(Boolean)
    );

    const expenseDocs = allExpenseIds.length > 0
      ? await db.collection('expenses').find(
        { _id: { $in: allExpenseIds } },
        { projection: { amount: 1, date: 1, createdAt: 1, source: 1 } }
      ).toArray()
      : [];

    const expenseById: Record<string, any> = {};
    expenseDocs.forEach((e: any) => {
      expenseById[e._id.toString()] = e;
    });

    const enrichedGroups = splitGroups.map((g: any) => {
      const groupExpenses = (g.expenses || [])
        .map((expId: string) => expenseById[expId])
        .filter(Boolean);

      const totalAmount = groupExpenses.reduce((sum: number, e: any) => (e.source === 'Payment' ? sum : sum + (e.amount || 0)), 0);
      const lastActivityDates = groupExpenses
        .map((e: any) => e.createdAt || e.date)
        .filter(Boolean)
        .map((d: any) => new Date(d).getTime());
      const lastActivity = lastActivityDates.length > 0 ? new Date(Math.max(...lastActivityDates)) : g.createdAt;

      return {
        ...g,
        totalAmount,
        expenseCount: groupExpenses.length,
        lastActivity,
      };
    });

    return NextResponse.json({ splitGroups: enrichedGroups }, { status: 200 });
  } catch (error) {
    console.error('Error fetching split groups:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
