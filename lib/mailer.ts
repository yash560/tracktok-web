import nodemailer from 'nodemailer';

// Email configuration using GoDaddy SMTP
const transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net', // GoDaddy SMTP server
    port: 465, // Secure port
    secure: true, // Use SSL
    auth: {
        user: process.env.BASE_SYSTEM_NODEMAILER_EMAIL_ADDRESS,
        pass: process.env.BASE_SYSTEM_NODEMAILER_EMAIL_PASSWORD,
    },
});

export interface EmailPayload {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    cc?: string | string[];
    bcc?: string | string[];
    replyTo?: string;
    attachments?: Array<{
        filename: string;
        content?: string | Buffer;
        path?: string;
    }>;
}

/**
 * Send email using Nodemailer with GoDaddy SMTP
 * @param payload Email configuration
 * @returns Email sending result
 */
export async function sendEmail(payload: EmailPayload) {
    try {
        // Verify transporter connection
        await transporter.verify();

        const mailOptions = {
            from: process.env.BASE_SYSTEM_NODEMAILER_EMAIL_ADDRESS,
            to: payload.to,
            subject: payload.subject,
            html: payload.html || payload.text,
            text: payload.text,
            cc: payload.cc,
            bcc: payload.bcc,
            replyTo: payload.replyTo || process.env.BASE_SYSTEM_NODEMAILER_EMAIL_ADDRESS,
            attachments: payload.attachments,
        };

        const info = await transporter.sendMail(mailOptions);
        return {
            success: true,
            messageId: info.messageId,
            message: 'Email sent successfully',
        };
    } catch (error) {
        console.error('Email sending error:', error);
        throw error;
    }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(email: string, name: string) {
    const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Welcome to TrackTok! 👋</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for signing up. We're excited to have you on board!</p>
        <p>TrackTok helps you track and manage your expenses efficiently.</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Get Started
          </a>
        </p>
        <p>If you have any questions, feel free to reach out to us.</p>
        <p>Best regards,<br>The TrackTok Team</p>
      </body>
    </html>
  `;

    return sendEmail({
        to: email,
        subject: 'Welcome to TrackTok! 🎉',
        html,
    });
}

/**
 * Send payment notification email
 */
export async function sendPaymentNotification(
    email: string,
    amount: number,
    description: string,
    recipientName: string
) {
    const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Payment Notification</h2>
        <p>Hi <strong>${recipientName}</strong>,</p>
        <p>You have received a payment notification:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
          <p><strong>Description:</strong> ${description}</p>
        </div>
        <p>Login to your TrackTok account to view more details.</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Details
          </a>
        </p>
        <p>Best regards,<br>The TrackTok Team</p>
      </body>
    </html>
  `;

    return sendEmail({
        to: email,
        subject: 'Payment Notification - TrackTok',
        html,
    });
}

/**
 * Send transaction confirmation email
 */
export async function sendTransactionConfirmation(
    email: string,
    transactionId: string,
    amount: number,
    date: string,
    category: string
) {
    const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Transaction Confirmation</h2>
        <p>Your transaction has been recorded:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Date:</strong> ${date}</p>
        </div>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View All Transactions
          </a>
        </p>
        <p>Best regards,<br>The TrackTok Team</p>
      </body>
    </html>
  `;

    return sendEmail({
        to: email,
        subject: `Transaction Confirmation - ${transactionId}`,
        html,
    });
}
