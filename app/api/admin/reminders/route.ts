import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;
  const { db } = auth;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const frequency = searchParams.get('frequency');
  const enabled = searchParams.get('enabled');

  const query: any = {};
  if (frequency) query.frequency = frequency;
  if (enabled === 'true') query.enabled = true;
  if (enabled === 'false') query.enabled = false;

  const [reminders, total] = await Promise.all([
    db.collection('reminders')
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    db.collection('reminders').countDocuments(query),
  ]);

  return NextResponse.json({ reminders, total, page, limit, pages: Math.ceil(total / limit) });
}
