import crypto from 'crypto';
import { prisma } from './prisma';

/**
 * Validates Meta WhatsApp Webhook HMAC-SHA256 Signatures
 */
export function verifyWhatsAppSignature(rawBody: string, signatureHeader: string | null): boolean {
  // Allow local in-app simulator requests
  if (!signatureHeader && process.env.NODE_ENV !== 'production') {
    return true;
  }

  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret || !signatureHeader) {
    // Fail secure in production if secret or signature is missing
    return process.env.NODE_ENV !== 'production';
  }

  try {
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

/**
 * Writes an immutable audit trail entry to the database
 */
export async function logSecurityAudit(actorName: string, action: string, details: object) {
  try {
    await prisma.auditLog.create({
      data: {
        actorName,
        action,
        details: JSON.stringify(details),
      },
    });
  } catch (e) {
    console.error('Audit Log Exception:', e);
  }
}
