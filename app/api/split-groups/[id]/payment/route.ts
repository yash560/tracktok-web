import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { receiverPhone, amount, payerPhone, user_code } = await request.json();
    if (!receiverPhone || !amount || !payerPhone || !user_code) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { message: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const { id } = await params;
    const { ObjectId } = await import('mongodb');

    // Fetch the split group to validate the payment amount
    const splitGroup = await db.collection('split_groups').findOne({ _id: new ObjectId(id) });
    if (!splitGroup) {
      return NextResponse.json(
        { message: 'Split group not found' },
        { status: 404 }
      );
    }

    // Fetch all expenses and calculate total owed by payer to receiver
    const expenseIds = splitGroup.expenses?.map((expId: string) => new ObjectId(expId)) || [];
    const expenses = expenseIds.length > 0
      ? await db
        .collection('expenses')
        .find({ _id: { $in: expenseIds } })
        .toArray()
      : [];

    // Calculate total owed from payerPhone to receiverPhone
    let totalOwed = 0;
    expenses.forEach((expense: any) => {
      if (!expense.split || !Array.isArray(expense.split)) return;

      const ownerEntry = expense.split.find((s: any) => s.owner === true);
      const payerEntry = expense.split.find((s: any) => s.phone === payerPhone);

      // If receiverPhone is owner AND payerPhone is in split, payerPhone owes receiverPhone
      if (ownerEntry?.phone === receiverPhone && payerEntry) {
        totalOwed += payerEntry.amount || 0;
      }
    });

    // Calculate net owed (account for reverse payments)
    let totalPaidBack = 0;
    expenses.forEach((expense: any) => {
      if (!expense.split || !Array.isArray(expense.split)) return;

      const ownerEntry = expense.split.find((s: any) => s.owner === true);
      const receiverEntry = expense.split.find((s: any) => s.phone === receiverPhone);

      // If payerPhone is owner AND receiverPhone is in split, receiverPhone owes payerPhone (reverse)
      if (ownerEntry?.phone === payerPhone && receiverEntry) {
        totalPaidBack += receiverEntry.amount || 0;
      }
    });

    const remainingOwed = Math.max(0, totalOwed - totalPaidBack);

    // Validate payment amount doesn't exceed remaining owed
    if (amount > remainingOwed) {
      return NextResponse.json(
        { message: `Cannot pay more than ₹${remainingOwed.toFixed(2)} owed` },
        { status: 400 }
      );
    }

    // Generate next payment code
    const lastPayment = await db
      .collection('expenses')
      .findOne(
        { source: 'Payment', customer_id: splitGroup.customer_id },
        { sort: { createdAt: -1 } }
      );

    let nextCode = '000001';
    if (lastPayment?.ref_number) {
      const lastCodeNum = Number.parseInt(lastPayment.ref_number, 10);
      nextCode = String(lastCodeNum + 1).padStart(6, '0');
    }

    // Create expense record for payment (receiver gets 100%)
    const paymentExpense = {
      amount,
      type: 'debit',
      account: 'tracktok',
      date: new Date().toISOString().split('T')[0],
      receiver: '', // Will get receiver name below
      ref_number: nextCode,
      source: 'Payment',
      category: 'transfer',
      description: `Payment sent by ${payerPhone} to ${receiverPhone} for split group ${splitGroup.name}`,
      personalizedCategory: 'split payment',
      valid: true,
      collection: `expense_${user_code}`,
      sms_id: `payment-${Date.now()}`,
      customer_id: splitGroup.customer_id,
      createdBy: {
        $type: 'lookup',
        $collection: 'members',
        $id: decoded.userId,
        $customer_id: splitGroup.customer_id,
        $label: 'System',
      },
      receivedAt: new Date(),
      updatedAt: new Date(),
      createdAt: new Date(),
      note: `Payment for split group ${splitGroup.name}`,
      split_group_id: id,
      split: [
        {
          contact: payerPhone,
          value: 0,
          split: 'percentage',
          amount: 0,
          name: '', // Will get payer name below
          phone: payerPhone,
          owner: true, // Payer is the owner (paying)
        },
        {
          contact: receiverPhone,
          value: 100,
          split: 'percentage',
          amount,
          name: '', // Will get receiver name below
          phone: receiverPhone,
        },
      ],
    };

    // Get names from contacts
    const receiverContact = splitGroup.contacts.find((c: any) => c.phone === receiverPhone);
    const payerContact = splitGroup.contacts.find((c: any) => c.phone === payerPhone);

    if (payerContact) {
      paymentExpense.split[0].name = payerContact.name;
    }
    if (receiverContact) {
      paymentExpense.receiver = receiverContact.name;
      paymentExpense.split[1].name = receiverContact.name;
    }

    const result = await db.collection('expenses').insertOne(paymentExpense as any);

    // Add expense to split group
    await db.collection('split_groups').updateOne(
      { _id: new ObjectId(id) },
      { $push: { expenses: result.insertedId } as any }
    );

    return NextResponse.json({
      message: 'Payment recorded successfully',
      status: 'completed',
      expenseId: result.insertedId,
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    return NextResponse.json(
      {
        message: 'Payment processing failed',
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
