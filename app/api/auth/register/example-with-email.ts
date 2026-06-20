/**
 * Example: Integration of Email Sending with Registration API
 * 
 * This file demonstrates how to modify your existing register route
 * to send a welcome email after successful user registration.
 * 
 * Copy this implementation to app/api/auth/register/route.ts
 */

import { connectToDatabase } from '@/lib/mongodb';
import { hashPassword, generateToken } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/mailer';
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

    // ===== NEW: Send welcome email =====
    try {
      await sendWelcomeEmail(email, name);
      console.log(`Welcome email sent to ${email}`);
    } catch (emailError) {
      console.error(`Failed to send welcome email to ${email}:`, emailError);
      // Continue even if email fails - user registration was successful
    }
    // ===== END: Send welcome email =====

    return NextResponse.json(
      {
        message: 'User registered successfully',
        userId: result.insertedId,
        token,
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
