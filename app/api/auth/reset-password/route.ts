import { connectToDatabase } from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, password } = body;

    if (!email || !otp || !password) {
      return NextResponse.json(
        { message: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
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

    const hashedPassword = await hashPassword(password);

    await db.collection(resetRequest.collection || 'members').updateOne(
      { _id: resetRequest.userId },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    await db.collection('passwordResets').deleteMany({ email: resetRequest.email });

    return NextResponse.json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
