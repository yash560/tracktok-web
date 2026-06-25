import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { parsePhoneInput } from '@/lib/phone';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier } = body;

    if (!identifier || !identifier.trim()) {
      return NextResponse.json(
        { message: 'Phone number or email is required' },
        { status: 400 }
      );
    }

    const trimmed = identifier.trim().toLowerCase();
    const isEmail = trimmed.includes('@');

    const { db } = await connectToDatabase();

    let user = null;

    if (isEmail) {
      user = await db.collection('members').findOne(
        { email: { $regex: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
        { projection: { _id: 1, name: 1, email: 1 } }
      );
    } else {
      const { countryCode, localNumber } = parsePhoneInput(trimmed);
      if (!localNumber || localNumber.length < 7) {
        return NextResponse.json(
          { message: 'Invalid phone number' },
          { status: 400 }
        );
      }
      const codeDigits = countryCode.replace(/\D/g, '');
      const phoneVariants = [
        localNumber,
        `${codeDigits}${localNumber}`,
        `+${codeDigits}${localNumber}`,
        `${countryCode}${localNumber}`,
        trimmed,
      ].filter((v, i, a) => a.indexOf(v) === i);

      user = await db.collection('members').findOne(
        {
          $or: [
            { phone: { $in: phoneVariants } },
            { phoneNumber: { $in: phoneVariants } },
          ],
        },
        { projection: { _id: 1, name: 1, email: 1, phone: 1, phoneNumber: 1 } }
      );
    }

    return NextResponse.json({
      exists: !!user,
      type: isEmail ? 'email' : 'phone',
    });
  } catch (error) {
    console.error('Check account error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
