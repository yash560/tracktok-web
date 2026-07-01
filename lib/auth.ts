import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export { normalizePhone, phonesMatch } from './phone';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string, expiresInSeconds: number = 7 * 24 * 60 * 60): string {
  return jwt.sign(
    { userId, customer: 'webverse', collection: 'members' },
    JWT_SECRET,
    { expiresIn: expiresInSeconds }
  );
}

export function verifyToken(token: string): { userId: string; customer: string; collection: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; customer: string; collection: string };
  } catch {
    return null;
  }
}

export function getTokenFromCookie(cookieString: string): string | null {
  const cookies = cookieString.split(';');
  const tokenCookie = cookies.find((c) => c.trim().startsWith('auth_token='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
}

export function isAdmin(user: any): boolean {
  return user?.roles?.some((r: any) => r.permission?.some((p: any) => p.key === 'admin'));
}
