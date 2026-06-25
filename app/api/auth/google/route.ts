import { connectToDatabase } from '@/lib/mongodb';
import { generateToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credential } = body;

    if (!credential) {
      return NextResponse.json(
        { message: 'Missing Google credential' },
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

    const { email, name, picture } = payload;

    const { db } = await connectToDatabase();

    const user = await db.collection('members').findOne(
      { email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
    );

    if (!user) {
      return NextResponse.json(
        {
          message: 'No account found with this email. Please register first.',
          exists: false,
          googleProfile: { email, name, picture },
        },
        { status: 404 }
      );
    }

    const token = generateToken(user._id.toString());

    return NextResponse.json({
      message: 'Login successful',
      exists: true,
      token,
      user: {
        id: user._id,
        name: user.displayName || user.name || name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { message: 'Google authentication failed' },
      { status: 500 }
    );
  }
}
