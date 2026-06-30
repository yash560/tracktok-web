import { NextRequest, NextResponse } from 'next/server';
import { sendEnquiryEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
        return NextResponse.json({ error: 'name, email, and message are required' }, { status: 400 });
    }

    await sendEnquiryEmail(String(name).trim(), String(email).trim(), String(message).trim());

    return NextResponse.json({ success: true });
}
