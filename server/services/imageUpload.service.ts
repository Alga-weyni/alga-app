import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET, R2_PUBLIC_BASE_URL, isR2Configured } from '../lib/r2.js';
import { randomBytes } from 'crypto';

export interface SignedUploadUrlResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export interface GenerateSignedUrlParams {
  folder: 'properties' | 'id-documents' | 'profiles' | 'services';
  contentType: string;
  userId: string;
}

const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
];

const SIGNED_URL_EXPIRY_SECONDS = 300; // 5 minutes

export async function generateSignedUploadUrl(
  params: GenerateSignedUrlParams
): Promise<SignedUploadUrlResult> {
  if (!isR2Configured || !r2Client) {
    throw new Error('R2 storage is not configured. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY environment variables.');
  }

  const { folder, contentType, userId } = params;

  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    throw new Error(`Invalid content type: ${contentType}. Allowed: ${ALLOWED_CONTENT_TYPES.join(', ')}`);
  }

  const extension = contentType.split('/')[1] === 'jpeg' ? 'jpg' : contentType.split('/')[1];
  const uniqueId = randomBytes(16).toString('hex');
  const timestamp = Date.now();
  const key = `${folder}/${userId}/${timestamp}-${uniqueId}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: SIGNED_URL_EXPIRY_SECONDS,
  });

  const publicUrl = `${R2_PUBLIC_BASE_URL}/${key}`;

  return {
    uploadUrl,
    publicUrl,
    key,
  };
}

export async function generateMultipleSignedUrls(
  folder: 'properties' | 'id-documents' | 'profiles' | 'services',
  files: Array<{ contentType: string }>,
  userId: string
): Promise<SignedUploadUrlResult[]> {
  const results: SignedUploadUrlResult[] = [];

  for (const file of files) {
    const result = await generateSignedUploadUrl({
      folder,
      contentType: file.contentType,
      userId,
    });
    results.push(result);
  }

  return results;
}
