import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { verifyToken, isAdmin } from './auth';
import { connectToDatabase } from './mongodb';

export async function verifyAdminRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) };
  }

  const token = authHeader.replace('Bearer ', '');
  const decoded = verifyToken(token);
  if (!decoded) {
    return { error: NextResponse.json({ message: 'Invalid token' }, { status: 401 }) };
  }

  const { db } = await connectToDatabase();
  const user = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });

  if (!user || !isAdmin(user)) {
    return { error: NextResponse.json({ message: 'Forbidden: admin access required' }, { status: 403 }) };
  }

  return { userId: decoded.userId, user, db };
}
