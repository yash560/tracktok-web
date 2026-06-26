import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken, normalizePhone } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const contact = searchParams.get('contact');
    const source = searchParams.get('source');
    const receiver = searchParams.get('receiver');
    const type = searchParams.get('type');

    const { db } = await connectToDatabase();

    // Fetch user specific collection name and phone
    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member || !member.collection) {
      return NextResponse.json({ transactions: [], pagination: { total: 0, pages: 0, page, limit } });
    }

    const collectionKey = member.collection;
    const userPhone = member.phone || member.phoneNumber;

    // Build filter conditions
    const filterConditions: any[] = [
      { collection: collectionKey }
    ];

    if (userPhone) {
      filterConditions.push({ 'split.phone': userPhone });
    }

    const query: any = { $or: filterConditions };

    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'all') {
      query.category = category;
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) {
        query.amount.$gte = Number.parseFloat(minAmount);
      }
      if (maxAmount) {
        query.amount.$lte = Number.parseFloat(maxAmount);
      }
    }

    // Contact filter (for split transactions)
    if (contact && contact !== 'all') {
      query['split.name'] = contact;
    }

    if (source && source !== 'all') {
      query.source = { $regex: source, $options: 'i' };
    }

    if (receiver && receiver !== 'all') {
      query.receiver = { $regex: receiver, $options: 'i' };
    }

    if (type && type !== 'all') {
      query.type = type === 'expense' ? 'debit' : 'credit';
    }

    const totalCount = await db.collection('expenses').countDocuments(query);
    const rawExpenses = await db
      .collection('expenses')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Collect all phones from splits, batch-lookup names from user_contacts
    const allSplitPhones = new Set<string>();
    for (const exp of rawExpenses) {
      if (!exp.split) continue;
      for (const s of exp.split) {
        if (s.phone) allSplitPhones.add(normalizePhone(s.phone));
      }
    }

    const phoneToName: Record<string, string> = {};
    if (allSplitPhones.size > 0) {
      const phoneArray = Array.from(allSplitPhones).filter(Boolean);
      const contacts = await db
        .collection('user_contacts')
        .find({
          user_code: collectionKey,
          phone: { $in: phoneArray.flatMap(p => [p, `91${p}`, `+91${p}`]) },
        })
        .project({ name: 1, phone: 1 })
        .toArray();

      for (const c of contacts) {
        const norm = normalizePhone(c.phone);
        if (norm && c.name) phoneToName[norm] = c.name;
      }
    }

    // Populate split names from user_contacts
    for (const exp of rawExpenses) {
      if (!exp.split) continue;
      for (const s of exp.split) {
        if (!s.name && s.phone) {
          const norm = normalizePhone(s.phone);
          if (phoneToName[norm]) s.name = phoneToName[norm];
        }
      }
    }

    // Map debit/credit to info compatible with UI
    const transactions = rawExpenses.map(exp => {
      const isOwnTransaction = exp.collection === collectionKey;
      const isSplitTransaction = !isOwnTransaction && userPhone && exp.split?.some((s: any) => s.phone === userPhone);

      const splitMember = isSplitTransaction ? exp.split?.find((s: any) => s.phone === userPhone) : null;

      return {
        ...exp,
        type: exp.type === 'debit' ? 'expense' : 'income',
        amount: exp.amount,
        isOwnTransaction,
        isSplitTransaction,
        splitAmount: splitMember?.amount || null,
        splitPercentage: splitMember?.value || null,
      };
    });

    return NextResponse.json(
      {
        transactions,
        pagination: {
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
          page,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get transactions error:', error);
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
    const { amount, description, category, type, date, notes, source, city, split } = body;

    if (!amount || !description || !category || !type) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Fetch user specific collection name
    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member || !member.collection) {
      return NextResponse.json({ message: 'User configuration incomplete' }, { status: 400 });
    }

    const collectionKey = member.collection;

    // Process split array if provided
    let splitArray: any[] = [];
    if (split && Array.isArray(split) && split.length > 0) {
      splitArray = split.map((s: any) => ({
        name: s.name,
        phone: s.phone,
        contact: s.contact,
        value: s.value,
        amount: s.amount,
        split: s.split,
        owner: s.owner || false,
      }));
    }

    const result = await db.collection('expenses').insertOne({
      collection: collectionKey,
      amount,
      description,
      category,
      type: type === 'expense' ? 'debit' : 'credit',
      date: date.includes('T') ? date.split('T')[0] : date,
      notes: notes || null,
      source: source || 'Cash',
      city: city || 'Unknown',
      customer_id: member.customer_id || 'webverse',
      valid: true,
      split: splitArray.length > 0 ? splitArray : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    logAudit(db, decoded.userId, 'create', 'expense', result.insertedId.toString(), { description, amount, category, type }, request);

    return NextResponse.json(
      { message: 'Transaction created', id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Missing ID' }, { status: 400 });
    }

    const body = await request.json();
    const { amount, description, category, type, date, notes, source, city, split } = body;

    const { db } = await connectToDatabase();

    // Fetch user specific collection name
    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member || !member.collection) {
      return NextResponse.json({ message: 'User configuration incomplete' }, { status: 400 });
    }

    const collectionKey = member.collection;

    const updateDoc: any = {
      ...(amount && { amount }),
      ...(description && { description }),
      ...(category && { category }),
      ...(type && { type: type === 'expense' ? 'debit' : 'credit' }),
      ...(date && { date: date.includes('T') ? date.split('T')[0] : date }),
      ...(notes !== undefined && { notes }),
      ...(source && { source }),
      ...(city && { city }),
      ...(split !== undefined && { split }),
      updatedAt: new Date(),
    };

    const before = await db.collection('expenses').findOne({ _id: new ObjectId(id), collection: collectionKey });

    const result = await db.collection('expenses').updateOne(
      { _id: new ObjectId(id), collection: collectionKey },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    logAudit(db, decoded.userId, 'update', 'expense', id, { before: { description: before?.description, amount: before?.amount, category: before?.category }, after: updateDoc }, request);

    return NextResponse.json({ message: 'Transaction updated' });
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Missing ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Fetch user specific collection name
    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member || !member.collection) {
      return NextResponse.json({ message: 'User configuration incomplete' }, { status: 400 });
    }

    const collectionKey = member.collection;

    const toDelete = await db.collection('expenses').findOne({ _id: new ObjectId(id), collection: collectionKey });

    const result = await db.collection('expenses').deleteOne({
      _id: new ObjectId(id),
      collection: collectionKey,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    logAudit(db, decoded.userId, 'delete', 'expense', id, { description: toDelete?.description, amount: toDelete?.amount, category: toDelete?.category }, request);

    return NextResponse.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
