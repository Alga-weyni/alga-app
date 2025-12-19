import { S3Client } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

export const isR2Configured = !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);

if (!isR2Configured) {
  console.warn('[R2] Missing R2 credentials - falling back to local storage');
}

export const r2Client = isR2Configured ? new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
}) : null;

export const R2_BUCKET = process.env.R2_BUCKET || 'alga-prod-assets';
export const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL || 'https://cdn.alga.et';
