import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;
  const { db } = auth;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search');
  const settled = searchParams.get('settled');

  const query: any = {};
  if (search) query.name = { $regex: search, $options: 'i' };
  if (settled === 'true') query.settledAt = { $ne: null };
  if (settled === 'false') query.settledAt = null;

  const [groups, total] = await Promise.all([
    db.collection('split_groups')
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    db.collection('split_groups').countDocuments(query),
  ]);

  return NextResponse.json({ groups, total, page, limit, pages: Math.ceil(total / limit) });
}
