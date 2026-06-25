import { connectToDatabase } from '@/lib/mongodb';
import { sendEmail } from '@/lib/mailer';
import { NextRequest, NextResponse } from 'next/server';
import { parsePhoneInput } from '@/lib/phone';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier } = body;

    if (!identifier || !identifier.trim()) {
      return NextResponse.json(
        { message: 'Email or phone is required' },
        { status: 400 }
      );
    }

    const trimmed = identifier.trim().toLowerCase();
    const isEmailInput = trimmed.includes('@');

    const { db } = await connectToDatabase();

    let user;
    if (isEmailInput) {
      user = await db.collection('members').findOne({
        email: { $regex: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });
    } else {
      const { countryCode, localNumber } = parsePhoneInput(trimmed);
      const codeDigits = countryCode.replace(/\D/g, '');
      const phoneVariants = [
        localNumber,
        `${codeDigits}${localNumber}`,
        `+${codeDigits}${localNumber}`,
        `${countryCode}${localNumber}`,
        trimmed,
      ].filter((v, i, a) => a.indexOf(v) === i);

      user = await db.collection('members').findOne({
        $or: [
          { phone: { $in: phoneVariants } },
          { phoneNumber: { $in: phoneVariants } },
        ],
      });
    }

    if (!user) {
      return NextResponse.json(
        { message: 'No account found with this email or phone' },
        { status: 404 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { message: 'No email associated with this account. Contact support.' },
        { status: 400 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.collection('passwordResets').deleteMany({ email: user.email });

    await db.collection('passwordResets').insertOne({
      userId: user._id,
      email: user.email,
      token,
      otp,
      expiresAt,
      collection: 'members',
      createdAt: new Date(),
    });

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333; max-width: 500px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px 0;">
            <h2 style="color: #2F2E51;">Reset Your Password</h2>
          </div>
          <p>Hi <strong>${user.displayName || user.firstName || user.name || 'User'}</strong>,</p>
          <p>We received a request to reset your password. Use the verification code below:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2F2E51;">${otp}</span>
          </div>
          <p style="color: #666; font-size: 14px;">This code expires in 60 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">TrackTok - AI Expense Tracker</p>
        </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: 'TrackTok - Password Reset Code',
      html,
    });

    const maskedEmail = user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

    return NextResponse.json({
      message: 'Verification code sent',
      email: user.email,
      maskedEmail,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Failed to send reset code' },
      { status: 500 }
    );
  }
}
