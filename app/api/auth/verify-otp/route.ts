import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const resetRequest = await db.collection('passwordResets').findOne({
      email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      otp,
    });

    if (!resetRequest) {
      return NextResponse.json(
        { message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    if (new Date() > new Date(resetRequest.expiresAt)) {
      return NextResponse.json(
        { message: 'Verification code has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Verification successful',
      valid: true,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { message: 'Verification failed' },
      { status: 500 }
    );
  }
}
