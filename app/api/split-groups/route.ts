import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken, normalizePhone } from '@/lib/auth';
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

    // Fetch user
    const member = await db.collection('members').findOne({ _id: new ObjectId(decoded.userId) });
    if (!member) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const userPhone = member.phone || member.phoneNumber;
    const digits = normalizePhone(userPhone);
    const phoneVariants = digits ? [digits, `91${digits}`, `+91${digits}`, userPhone].filter(Boolean) : [];

    // Find split groups where user is a member or owner
    const splitGroups = await db
      .collection('split_groups')
      .find({
        $or: [
          { owner: member.owner },
          ...(phoneVariants.length > 0 ? [{ 'contacts.phone': { $in: phoneVariants } }] : []),
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ splitGroups }, { status: 200 });
  } catch (error) {
    console.error('Error fetching split groups:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
