import { createHmac } from 'crypto';

export function createSignature(body: string | Buffer, secret: string) {
  const hmac = createHmac('sha1', secret);

  let content: Buffer;
  if (Buffer.isBuffer(body)) {
    content = body;
  } else {
    content = Buffer.from(body, 'utf8');
  }
  const signed = hmac.update(content).digest('hex');
  return signed;
}

export function verifyMessengerSignature(
  rawBody: Buffer,
  signature: string | undefined,
  appSecret: string | undefined = ''
) {
  if (!signature) {
    throw new Error('x-hub-signature missing');
  }
  let rawSign = signature;
  if (signature.length === 45 && signature.substring(0, 5) === 'sha1=') {
    rawSign = signature.substring(5);
  }

  const signed = createSignature(rawBody, appSecret);

  if (signed !== rawSign) {
    throw new Error('x-hub-signature mismatch');
  }

  return true;
}
