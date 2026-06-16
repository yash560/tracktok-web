import { connectToDatabase } from '@/lib/mongodb';
import { hashPassword, generateToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, countryCode } = body;

    // Validation
    if (!email || !password || !name || !phone || !countryCode) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      return NextResponse.json(
        { message: 'Phone number must be exactly 10 digits' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Check if user already exists
    const existingUser = await db.collection('members').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = await db.collection('members').insertOne({
      name,
      email,
      countryCode,
      phone,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate token
    const token = generateToken(result.insertedId.toString());

    return NextResponse.json(
      {
        message: 'User registered successfully',
        token,
        user: {
          id: result.insertedId,
          name,
          email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
