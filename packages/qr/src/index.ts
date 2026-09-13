import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

export interface QrTokenPayload {
  qrCodeId: string;
  branchId: string;
  tableId?: string;
  version: number;
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function signPayload(payload: QrTokenPayload, secret: string): string {
  const data = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
  const encoded = Buffer.from(data).toString('base64url');
  return `${encoded}.${signature}`;
}

export function verifySignature(signed: string, secret: string): QrTokenPayload | null {
  const parts = signed.split('.');
  if (parts.length !== 2) return null;

  const [encoded, signature] = parts;
  const data = Buffer.from(encoded, 'base64url').toString('utf8');
  const expectedSig = crypto.createHmac('sha256', secret).update(data).digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return null;
  }

  try {
    return JSON.parse(data) as QrTokenPayload;
  } catch {
    return null;
  }
}

export function buildQrUrl(baseUrl: string, token: string, sig: string): string {
  return `${baseUrl}/qr/${token}?sig=${sig}`;
}

export async function generateQrPng(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    type: 'png',
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });
}

export async function generateQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, { width: 300, margin: 2 });
}
