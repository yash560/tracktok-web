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

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const entities = searchParams.get('entities')?.split(',').filter(Boolean) || ['expenses', 'split_groups', 'contacts', 'budgets'];

    if (!q || q.length < 1) {
      return NextResponse.json({ expenses: [], splitGroups: [], contacts: [], budgets: [] });
    }

    const { db } = await connectToDatabase();

    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member) {
      return NextResponse.json({ expenses: [], splitGroups: [], contacts: [], budgets: [] });
    }

    const collectionKey = member.collection;
    const userPhone = member.phone || member.phoneNumber;
    const digits = normalizePhone(userPhone);
    const phoneVariants = digits ? [digits, `91${digits}`, `+91${digits}`, userPhone].filter(Boolean) : [];
    const regex = { $regex: q, $options: 'i' };
    const limit = 5;

    const queries: Promise<any>[] = [];
    const resultKeys: string[] = [];

    // Expenses
    if (entities.includes('expenses') && collectionKey) {
      resultKeys.push('expenses');
      queries.push(
        db.collection('expenses')
          .find({
            $or: [
              { collection: collectionKey },
              ...(phoneVariants.length > 0 ? [{ 'split.phone': { $in: phoneVariants } }] : []),
            ],
            $and: [
              { $or: [
                { description: regex },
                { category: regex },
                { receiver: regex },
                { source: regex },
              ]}
            ],
          })
          .sort({ createdAt: -1 })
          .limit(limit)
          .project({ description: 1, amount: 1, category: 1, type: 1, date: 1, createdAt: 1, code: 1 })
          .toArray()
          .then(docs => docs.map(d => ({
            ...d,
            type: d.type === 'debit' ? 'expense' : 'income',
            path: d.code ? `/invoice/${d.code}` : '/dashboard/transactions',
          })))
      );
    }

    // Split Groups
    if (entities.includes('split_groups')) {
      resultKeys.push('splitGroups');
      queries.push(
        db.collection('split_groups')
          .find({
            $or: [
              { owner: member.owner },
              ...(phoneVariants.length > 0 ? [{ 'contacts.phone': { $in: phoneVariants } }] : []),
            ],
            name: regex,
          })
          .sort({ createdAt: -1 })
          .limit(limit)
          .project({ name: 1, contacts: 1, settledAt: 1, createdAt: 1 })
          .toArray()
          .then(docs => docs.map(d => ({
            ...d,
            path: `/split-groups/${d._id}`,
          })))
      );
    }

    // Contacts
    if (entities.includes('contacts') && member.customer_id) {
      resultKeys.push('contacts');
      queries.push(
        db.collection('user_contacts')
          .find({
            customer_id: member.customer_id,
            $or: [
              { name: regex },
              { phone: regex },
              { email: regex },
            ],
          })
          .limit(limit)
          .project({ name: 1, phone: 1, email: 1 })
          .toArray()
          .then(docs => docs.map(d => ({
            ...d,
            path: '/dashboard/settings',
          })))
      );
    }

    // Budgets
    if (entities.includes('budgets')) {
      resultKeys.push('budgets');
      queries.push(
        db.collection('budgets')
          .find({
            userId: decoded.userId,
            category: regex,
          })
          .sort({ createdAt: -1 })
          .limit(limit)
          .project({ category: 1, amount: 1, month: 1 })
          .toArray()
          .then(docs => docs.map(d => ({
            ...d,
            path: '/dashboard/budgets',
          })))
      );
    }

    const results = await Promise.all(queries);

    const response: Record<string, any[]> = {
      expenses: [],
      splitGroups: [],
      contacts: [],
      budgets: [],
    };

    resultKeys.forEach((key, i) => {
      response[key] = results[i];
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
