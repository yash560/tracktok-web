import { connectToDatabase } from '@/lib/mongodb';
import { generateToken, normalizePhone } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credential, phone } = body;

    if (!credential || !phone) {
      return NextResponse.json(
        { message: 'Missing credential or phone' },
        { status: 400 }
      );
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json(
        { message: 'Invalid Google token' },
        { status: 401 }
      );
    }

    const newEmail = payload.email;
    const { db } = await connectToDatabase();

    const digits = normalizePhone(phone);
    if (!digits || digits.length < 10) {
      return NextResponse.json(
        { message: 'Invalid phone number' },
        { status: 400 }
      );
    }

    const phoneVariants = [digits, `91${digits}`, `+91${digits}`, phone].filter(
      (v, i, a) => a.indexOf(v) === i
    );

    const user = await db.collection('members').findOne({
      $or: [
        { phone: { $in: phoneVariants } },
        { phoneNumber: { $in: phoneVariants } },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { message: 'No account found with this phone number' },
        { status: 404 }
      );
    }

    const emailTaken = await db.collection('members').findOne({
      email: { $regex: new RegExp(`^${newEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      _id: { $ne: user._id },
    });

    if (emailTaken) {
      return NextResponse.json(
        { message: 'This email is already linked to a different account' },
        { status: 409 }
      );
    }

    await db.collection('members').updateOne(
      { _id: user._id },
      {
        $set: {
          email: newEmail,
          updatedAt: new Date(),
        },
      }
    );

    const token = generateToken(user._id.toString());

    return NextResponse.json({
      message: 'Account linked successfully',
      token,
      user: {
        id: user._id,
        name: user.displayName || user.name || payload.name,
        email: newEmail,
      },
    });
  } catch (error) {
    console.error('Link Google account error:', error);
    return NextResponse.json(
      { message: 'Failed to link account' },
      { status: 500 }
    );
  }
}
