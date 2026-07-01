import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken, generateToken } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

const MIN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const MAX_EXPIRY_MS = 10 * 365 * 24 * 60 * 60 * 1000; // 10 years

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(authHeader.replace('Bearer ', ''));
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    const tokens = await db
      .collection('api_tokens')
      .find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ tokens }, { status: 200 });
  } catch (error) {
    console.error('List tokens error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(authHeader.replace('Bearer ', ''));
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { name, expiresInMs } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ message: 'Token name is required' }, { status: 400 });
    }

    const durationMs = Number(expiresInMs);
    if (!Number.isFinite(durationMs) || durationMs < MIN_EXPIRY_MS || durationMs > MAX_EXPIRY_MS) {
      return NextResponse.json(
        { message: 'Expiry must be between 1 hour and 10 years' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const expiresInSeconds = Math.round(durationMs / 1000);
    const jwtToken = generateToken(decoded.userId, expiresInSeconds);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMs);

    const result = await db.collection('api_tokens').insertOne({
      userId: decoded.userId,
      customer_id: member.customer_id,
      name: name.trim(),
      tokenSuffix: jwtToken.slice(-12),
      createdAt: now,
      expiresAt,
      lastUsedAt: null,
    });

    logAudit(db, decoded.userId, 'create', 'api_token', result.insertedId.toString(), { name: name.trim(), expiresAt }, request);

    return NextResponse.json(
      {
        token: jwtToken,
        id: result.insertedId,
        name: name.trim(),
        createdAt: now,
        expiresAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create token error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
