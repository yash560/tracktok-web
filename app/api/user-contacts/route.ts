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

    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const contacts = await db
      .collection('user_contacts')
      .find({ customer_id: member.customer_id })
      .sort({ name: 1 })
      .toArray();

    const splitGroups = await db
      .collection('split_groups')
      .find({ customer_id: member.customer_id })
      .toArray();

    const allExpenseIds = splitGroups.flatMap((sg: any) => (sg.expenses || []).map((id: string) => new ObjectId(id)));
    const expenses = allExpenseIds.length > 0
      ? await db.collection('expenses').find({ _id: { $in: allExpenseIds } }).toArray()
      : [];

    const contactTransactions: Record<string, { count: number; totalAmount: number; splitGroups: string[] }> = {};

    for (const sg of splitGroups) {
      const sgExpenses = expenses.filter((e: any) => (sg.expenses || []).includes(e._id.toString()));

      for (const contact of (sg.contacts || [])) {
        const phone = contact.phone;
        if (!phone) continue;

        if (!contactTransactions[phone]) {
          contactTransactions[phone] = { count: 0, totalAmount: 0, splitGroups: [] };
        }

        if (!contactTransactions[phone].splitGroups.includes(sg.name)) {
          contactTransactions[phone].splitGroups.push(sg.name);
        }

        for (const expense of sgExpenses) {
          if (!expense.split) continue;
          const split = expense.split.find((s: any) => s.phone === phone);
          if (split) {
            contactTransactions[phone].count++;
            contactTransactions[phone].totalAmount += split.amount || 0;
          }
        }
      }
    }

    const contactsWithTransactions = contacts.map((contact: any) => ({
      ...contact,
      transactions: contactTransactions[contact.phone] || { count: 0, totalAmount: 0, splitGroups: [] },
    }));

    return NextResponse.json({ contacts: contactsWithTransactions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
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

    const { db } = await connectToDatabase();

    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, phone, email } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    if (phone) {
      const existing = await db.collection('user_contacts').findOne({
        customer_id: member.customer_id,
        phone: phone.trim(),
      });
      if (existing) {
        return NextResponse.json({ message: 'Contact with this phone already exists' }, { status: 409 });
      }
    }

    const contact = {
      customer_id: member.customer_id,
      name: name.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('user_contacts').insertOne(contact);

    return NextResponse.json(
      { contact: { ...contact, _id: result.insertedId } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
