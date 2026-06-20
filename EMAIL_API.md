# Email Sending API Integration Guide

## Setup

Nodemailer is configured to use **GoDaddy SMTP** with your email credentials from `.env`:
- `BASE_SYSTEM_NODEMAILER_EMAIL_ADDRESS` - Your GoDaddy email address
- `BASE_SYSTEM_NODEMAILER_EMAIL_PASSWORD` - Your GoDaddy email password

## Available Functions

### 1. **sendEmail(payload)**
Generic email sending function for custom emails.

```typescript
import { sendEmail } from '@/lib/mailer';

await sendEmail({
  to: 'user@example.com',
  subject: 'Hello',
  html: '<h1>Welcome!</h1>',
  text: 'Welcome!',
  cc: 'cc@example.com',
  bcc: 'bcc@example.com',
  replyTo: 'reply@example.com',
  attachments: [
    {
      filename: 'document.pdf',
      path: '/path/to/file'
    }
  ]
});
```

### 2. **sendWelcomeEmail(email, name)**
Sends a welcome email to new registered users.

```typescript
import { sendWelcomeEmail } from '@/lib/mailer';

await sendWelcomeEmail('user@example.com', 'John Doe');
```

### 3. **sendPaymentNotification(email, amount, description, recipientName)**
Sends payment notification emails.

```typescript
import { sendPaymentNotification } from '@/lib/mailer';

await sendPaymentNotification(
  'user@example.com',
  100.50,
  'Monthly subscription',
  'John Doe'
);
```

### 4. **sendTransactionConfirmation(email, transactionId, amount, date, category)**
Sends transaction confirmation emails.

```typescript
import { sendTransactionConfirmation } from '@/lib/mailer';

await sendTransactionConfirmation(
  'user@example.com',
  'TXN-12345',
  50.00,
  '2026-06-20',
  'Food & Dining'
);
```

## Integration Examples

### Example 1: Sending Welcome Email After Registration

Modify `app/api/auth/register/route.ts`:

```typescript
import { sendWelcomeEmail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    // ... existing registration code ...

    const result = await db.collection('members').insertOne({
      name,
      email,
      countryCode,
      phone,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json({
      message: 'User registered successfully',
      userId: result.insertedId,
    });
  } catch (error) {
    // ... error handling ...
  }
}
```

### Example 2: Sending Transaction Confirmation Email

Create `app/api/transactions/confirm/route.ts`:

```typescript
import { sendTransactionConfirmation } from '@/lib/mailer';
import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, userId } = body;

    const { db } = await connectToDatabase();

    // Fetch transaction and user details
    const transaction = await db.collection('transactions').findOne({ _id: transactionId });
    const user = await db.collection('members').findOne({ _id: userId });

    if (!transaction || !user) {
      return NextResponse.json(
        { message: 'Transaction or user not found' },
        { status: 404 }
      );
    }

    // Send confirmation email
    try {
      await sendTransactionConfirmation(
        user.email,
        transactionId,
        transaction.amount,
        new Date(transaction.date).toLocaleDateString(),
        transaction.category
      );
    } catch (emailError) {
      console.error('Confirmation email failed:', emailError);
    }

    return NextResponse.json({
      message: 'Transaction confirmed',
      transactionId,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Failed to confirm transaction' },
      { status: 500 }
    );
  }
}
```

### Example 3: Sending Payment Notification

Create `app/api/payments/notify/route.ts`:

```typescript
import { sendPaymentNotification } from '@/lib/mailer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, amount, description, recipientName } = body;

    await sendPaymentNotification(email, amount, description, recipientName);

    return NextResponse.json({
      message: 'Payment notification sent',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
```

### Example 4: Using Generic Send Email API

**POST** `/api/send-email`

```json
{
  "to": "user@example.com",
  "subject": "Custom Email",
  "html": "<h1>Hello!</h1><p>This is a custom email.</p>",
  "cc": "cc@example.com",
  "bcc": "bcc@example.com"
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "messageId": "<message-id@example.com>",
  "message": "Email sent successfully"
}
```

### Error Response
```json
{
  "message": "Failed to send email",
  "error": "Error details here"
}
```

## Best Practices

1. **Wrap in try-catch**: Always wrap email sending in try-catch to prevent API failures if email fails
2. **Async operations**: Email sending is async; use `await` but don't block the main response
3. **Error handling**: Log email errors but continue API execution
4. **Templates**: Create reusable email templates for consistency
5. **Rate limiting**: Consider implementing rate limiting for email APIs to prevent abuse
6. **Testing**: Test with a real GoDaddy email during development

## Testing the Email API

```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1><p>This is a test email from TrackTok</p>"
  }'
```

## Environment Variables Required

Make sure these are set in your `.env` file:
```
BASE_SYSTEM_NODEMAILER_EMAIL_ADDRESS=your-email@yourdomain.com
BASE_SYSTEM_NODEMAILER_EMAIL_PASSWORD=your-app-password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Troubleshooting

### Email not sending?
1. Verify GoDaddy SMTP credentials are correct
2. Check firewall/network allows port 465
3. Ensure environment variables are loaded
4. Check console logs for specific errors

### "Invalid login" error?
- For GoDaddy, use your full email address as username
- Ensure you're using an App Password (not your main password)
- Verify your email account is active

### Gmail/other providers?
To use a different email provider, update `lib/mailer.ts`:

```typescript
// For Gmail:
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
  },
});

// For custom SMTP:
const transporter = nodemailer.createTransport({
  host: 'your-smtp-host.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```
