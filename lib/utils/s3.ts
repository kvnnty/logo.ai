import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

export interface UploadFileOptions {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
  metadata?: Record<string, string>;
}

/**
 * Upload a file to S3
 */
export async function uploadToS3(options: UploadFileOptions): Promise<string> {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }

  const { key, body, contentType, metadata } = options;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType || 'application/octet-stream',
    Metadata: metadata,
  });

  await s3Client.send(command);

  // Return the public URL or key
  // If your bucket is public, use: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  // Otherwise, you'll need to generate presigned URLs for access
  return key;
}

/**
 * Get a presigned URL for reading a file from S3
 * Useful for private buckets - generates a temporary URL that expires
 */
export async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}

/**
 * Get the public URL for a file (if bucket is public)
 */
export function getPublicUrl(key: string): string {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }

  const region = process.env.AWS_REGION || 'us-east-1';
  return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Delete a file from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Generate a unique key for a file based on user ID and filename
 */
export function generateS3Key(userId: string, filename: string, folder: string = 'uploads'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = filename.split('.').pop() || 'bin';
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return `${folder}/${userId}/${timestamp}-${random}-${sanitizedFilename}`;
}

/**
 * Generate a key for logo assets
 */
export function generateLogoKey(userId: string, brandId: string, filename: string): string {
  return generateS3Key(userId, filename, `logos/${brandId}`);
}

/**
 * Generate a key for brand assets
 */
export function generateBrandAssetKey(userId: string, brandId: string, category: string, filename: string): string {
  return generateS3Key(userId, filename, `brands/${brandId}/${category}`);
}
