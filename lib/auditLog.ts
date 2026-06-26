import { Db } from 'mongodb';
import { NextRequest } from 'next/server';

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'settings_change';
export type AuditEntity = 'expense' | 'budget' | 'reminder' | 'split_group' | 'profile';

export async function logAudit(
  db: Db,
  userId: string,
  action: AuditAction,
  entity: AuditEntity,
  entityId: string | null,
  details: Record<string, unknown>,
  request?: NextRequest
): Promise<void> {
  try {
    const ip = request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || null;
    const userAgent = request?.headers.get('user-agent') || null;

    await db.collection('audit_logs').insertOne({
      userId,
      action,
      entity,
      entityId,
      details,
      ip,
      userAgent,
      createdAt: new Date(),
    });
  } catch {
    // fire-and-forget — never block the caller
  }
}
