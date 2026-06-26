import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;
  const { db } = auth;
  const { id } = await params;

  const transaction = await db.collection('expenses').findOne({ _id: new ObjectId(id) });
  if (!transaction) return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });

  return NextResponse.json(transaction);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;
  const { db } = auth;
  const { id } = await params;

  const body = await request.json();
  const allowedFields = ['amount', 'description', 'category', 'type', 'date', 'receiver', 'personalizedCategory', 'valid'];
  const updateDoc: Record<string, any> = { updatedAt: new Date() };

  for (const field of allowedFields) {
    if (body[field] !== undefined) updateDoc[field] = body[field];
  }

  const result = await db.collection('expenses').updateOne(
    { _id: new ObjectId(id) },
    { $set: updateDoc },
  );

  if (result.matchedCount === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ message: 'Transaction updated' });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;
  const { db } = auth;
  const { id } = await params;

  const result = await db.collection('expenses').deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ message: 'Transaction deleted' });
}
