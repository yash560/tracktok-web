import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

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

    const phone = request.nextUrl.searchParams.get('phone');
    if (!phone) {
      return NextResponse.json({ message: 'Phone number required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const member = await db.collection('members').findOne(
      {
        $or: [{ phone }, { phoneNumber: phone }],
      },
      {
        projection: {
          password: 0,
          token: 0,
        },
      }
    );

    if (!member) {
      return NextResponse.json({ registered: false }, { status: 200 });
    }

    return NextResponse.json({
      registered: true,
      member: {
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        displayName: member.displayName || '',
        nickname: member.nickname || '',
        email: member.email || '',
        phoneNumber: member.phoneNumber || member.phone || '',
        gender: member.gender || '',
        dateOfBirth: member.dateOfBirth || '',
        avatar: member.avatar || '',
        createdAt: member.createdAt,
      },
    });
  } catch (error) {
    console.error('Member lookup error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
