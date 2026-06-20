/**
 * Example: Send Settlement/Payment Email Notification
 * 
 * Create this file at: app/api/split-groups/[id]/send-settlement-email/route.ts
 * 
 * This example shows how to notify users about settlement payments
 * in split groups.
 */

import { connectToDatabase } from '@/lib/mongodb';
import { sendPaymentNotification } from '@/lib/mailer';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { payeeEmail, payeeName, amount, description, payerName } = body;

        // Validation
        if (!payeeEmail || !amount || !payeeName) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const { db } = await connectToDatabase();

        // Verify split group exists
        const splitGroup = await db
            .collection('split-groups')
            .findOne({ _id: new ObjectId(id) });

        if (!splitGroup) {
            return NextResponse.json(
                { message: 'Split group not found' },
                { status: 404 }
            );
        }

        // Send payment notification email
        try {
            await sendPaymentNotification(
                payeeEmail,
                amount,
                description || `Settlement from ${payerName} in ${splitGroup.name}`,
                payeeName
            );

            console.log(`Payment notification sent to ${payeeEmail}`);
        } catch (emailError) {
            console.error('Failed to send payment email:', emailError);
            // Continue - the settlement was still recorded
        }

        // Update settlement record to mark email as sent
        await db.collection('settlements').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    emailSentAt: new Date(),
                    emailStatus: 'sent',
                },
            }
        );

        return NextResponse.json(
            {
                message: 'Settlement notification sent',
                payee: payeeName,
                amount,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Settlement email error:', error);
        return NextResponse.json(
            {
                message: 'Failed to send settlement notification',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
