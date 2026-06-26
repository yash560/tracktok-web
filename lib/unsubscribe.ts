import { createHmac } from 'crypto';
import { Db, ObjectId } from 'mongodb';

const UNSUB_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tracktok.app';

export function generateUnsubscribeToken(userId: string): string {
  const hmac = createHmac('sha256', UNSUB_SECRET).update(userId).digest('hex').slice(0, 16);
  return Buffer.from(`${userId}:${hmac}`).toString('base64url');
}

export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const [userId, hmac] = decoded.split(':');
    if (!userId || !hmac) return null;
    const expected = createHmac('sha256', UNSUB_SECRET).update(userId).digest('hex').slice(0, 16);
    if (hmac !== expected) return null;
    return userId;
  } catch {
    return null;
  }
}

export function getUnsubscribeUrl(userId: string): string {
  const token = generateUnsubscribeToken(userId);
  return `${APP_URL}/unsubscribe?token=${token}`;
}

export async function isUserUnsubscribed(db: Db, userId: string): Promise<boolean> {
  const member = await db.collection('members').findOne(
    { _id: new ObjectId(userId) },
    { projection: { emailPreferences: 1 } },
  );
  return !!member?.emailPreferences?.unsubscribedAll;
}

export async function setUnsubscribeStatus(db: Db, userId: string, unsubscribe: boolean): Promise<void> {
  await db.collection('members').updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        'emailPreferences.unsubscribedAll': unsubscribe,
        'emailPreferences.updatedAt': new Date(),
      },
    },
  );
}
