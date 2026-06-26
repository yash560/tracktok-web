import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyUnsubscribeToken, setUnsubscribeStatus } from '@/lib/unsubscribe';

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token');
  if (!token) {
    return NextResponse.json({ message: 'Missing token' }, { status: 400 });
  }

  const userId = verifyUnsubscribeToken(token);
  if (!userId) {
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
  }

  const { db } = await connectToDatabase();
  const member = await db.collection('members').findOne(
    { _id: new (await import('mongodb')).ObjectId(userId) },
    { projection: { email: 1, emailPreferences: 1, displayName: 1, firstName: 1 } },
  );

  if (!member) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    email: member.email,
    name: member.displayName || member.firstName || '',
    unsubscribed: !!member.emailPreferences?.unsubscribedAll,
  });
}

export async function POST(request: NextRequest) {
  const { token, action } = await request.json();

  if (!token) {
    return NextResponse.json({ message: 'Missing token' }, { status: 400 });
  }

  const userId = verifyUnsubscribeToken(token);
  if (!userId) {
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
  }

  const { db } = await connectToDatabase();
  const unsubscribe = action !== 'resubscribe';

  await setUnsubscribeStatus(db, userId, unsubscribe);

  return NextResponse.json({
    success: true,
    message: unsubscribe
      ? 'You have been unsubscribed from marketing emails.'
      : 'You have been re-subscribed to marketing emails.',
    unsubscribed: unsubscribe,
  });
}
