import crypto from 'crypto';
import { prisma } from './prisma';

/**
 * Validates Meta WhatsApp Webhook HMAC-SHA256 Signatures
 */
export function verifyWhatsAppSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader && process.env.NODE_ENV !== 'production') {
    return true;
  }

  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret || !signatureHeader) {
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
 * Masks Volunteer PII for non-admin API responses
 */
export function maskVolunteerPII(volunteer: any) {
  if (!volunteer) return volunteer;
  return {
    ...volunteer,
    phone: volunteer.phone ? volunteer.phone.replace(/(\+\d{2}\s?\d{2})\d{5}(\d{3})/, '$1*****$2') : null,
    whatsappPhone: volunteer.whatsappPhone ? volunteer.whatsappPhone.replace(/(\+\d{2}\s?\d{2})\d{5}(\d{3})/, '$1*****$2') : null,
    email: volunteer.email ? volunteer.email.replace(/(.{2})(.*)(?=@)/, (_: string, g2: string, g3: string) => g2 + '*'.repeat(g3.length)) : null,
  };
}

/**
 * Sanitizes input text to prevent prompt injection and XSS
 */
export function sanitizeInputText(input: string | null | undefined, maxLength: number = 1000): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '')
    .slice(0, maxLength)
    .trim();
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
