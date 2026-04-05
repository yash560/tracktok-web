import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'tracktok');
    
    // Fetch expenses for the 'webverse' customer as seen in the mobile app constants
    const expenses = await db
      .collection('expenses')
      .find({ customer: 'webverse' })
      .sort({ date: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json(expenses);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
