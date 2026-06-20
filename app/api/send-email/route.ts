import { sendEmail, EmailPayload } from '@/lib/mailer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { to, subject, html, text, cc, bcc, replyTo, attachments } = body;

        // Validation
        if (!to || !subject) {
            return NextResponse.json(
                { message: 'Missing required fields: to and subject' },
                { status: 400 }
            );
        }

        if (!html && !text) {
            return NextResponse.json(
                { message: 'At least one of html or text content is required' },
                { status: 400 }
            );
        }

        const emailPayload: EmailPayload = {
            to,
            subject,
            html,
            text,
            cc,
            bcc,
            replyTo,
            attachments,
        };

        const result = await sendEmail(emailPayload);

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Email API error:', error);
        return NextResponse.json(
            {
                message: 'Failed to send email',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
