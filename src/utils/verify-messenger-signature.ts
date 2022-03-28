import { createHmac } from 'crypto';

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

  const hmac = createHmac('sha1', appSecret);
  const signed = hmac.update(rawBody).digest('hex');

  if (signed !== rawSign) {
    throw new Error('x-hub-signature mismatch');
  }

  return true;
}
