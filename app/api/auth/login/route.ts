import { connectToDatabase } from '@/lib/mongodb';
import { comparePasswords, generateToken } from '@/lib/auth';
import { parsePhoneInput } from '@/lib/phone';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, password } = body;

    const identifier = email || phone;
    if (!identifier || !password) {
      return NextResponse.json(
        { message: 'Missing email/phone or password' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    let user;
    if (email) {
      user = await db.collection('members').findOne({ email });
    } else {
      const { countryCode, localNumber } = parsePhoneInput(phone);
      const codeDigits = countryCode.replace(/\D/g, '');
      const phoneVariants = [
        localNumber,
        `${codeDigits}${localNumber}`,
        `+${codeDigits}${localNumber}`,
        `${countryCode}${localNumber}`,
        phone,
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
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(user._id.toString());

    return NextResponse.json(
      {
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
