import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(authHeader.replace('Bearer ', ''));
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid token id' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const result = await db.collection('api_tokens').deleteOne({
      _id: new ObjectId(id),
      userId: decoded.userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Token not found' }, { status: 404 });
    }

    logAudit(db, decoded.userId, 'delete', 'api_token', id, {}, request);

    return NextResponse.json({ message: 'Token revoked' }, { status: 200 });
  } catch (error) {
    console.error('Revoke token error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
