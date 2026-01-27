/**
 * MongoDB GridFS Storage Utility
 * Replaces S3 storage with MongoDB GridFS for file storage
 */

import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { ensureDbConnected } from '@/db';

let gridFSBucket: GridFSBucket | null = null;

/**
 * Initialize GridFS bucket
 */
function getGridFSBucket(): GridFSBucket {
  if (!gridFSBucket) {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database not connected');
    }
    gridFSBucket = new GridFSBucket(db, { bucketName: 'files' });
  }
  return gridFSBucket;
}

export interface UploadFileOptions {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
  metadata?: Record<string, string>;
}

/**
 * Upload a file to MongoDB GridFS
 */
export async function uploadToMongoDB(options: UploadFileOptions): Promise<string> {
  await ensureDbConnected();
  
  const { key, body, contentType, metadata } = options;
  const bucket = getGridFSBucket();
  
  // Convert body to buffer if needed
  const buffer = Buffer.isBuffer(body) 
    ? body 
    : typeof body === 'string' 
    ? Buffer.from(body, 'base64') 
    : Buffer.from(body);

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(key, {
      contentType: contentType || 'application/octet-stream',
      metadata: {
        ...metadata,
        uploadedAt: new Date().toISOString(),
      },
    });

    uploadStream.on('error', (error: Error) => {
      reject(error);
    });

    uploadStream.on('finish', () => {
      // Return the file ID as the key for reference
      resolve(uploadStream.id.toString());
    });

    uploadStream.end(buffer);
  });
}

/**
 * Get a file from MongoDB GridFS
 */
export async function getFileFromMongoDB(fileId: string): Promise<{
  buffer: Buffer;
  contentType: string;
  metadata?: Record<string, string>;
}> {
  await ensureDbConnected();
  const bucket = getGridFSBucket();

  return new Promise((resolve, reject) => {
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    const chunks: Buffer[] = [];

    downloadStream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    downloadStream.on('error', (error: Error) => {
      reject(error);
    });

    downloadStream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const contentType = downloadStream.options?.contentType || 'application/octet-stream';
      const metadata = downloadStream.options?.metadata || {};
      resolve({ buffer, contentType, metadata });
    });
  });
}

/**
 * Get a file by filename/key from MongoDB GridFS
 */
export async function getFileByKey(key: string): Promise<{
  buffer: Buffer;
  contentType: string;
  metadata?: Record<string, string>;
  fileId: string;
}> {
  await ensureDbConnected();
  const bucket = getGridFSBucket();

  return new Promise((resolve, reject) => {
    // Find the file by filename
    const files = bucket.find({ filename: key }).toArray();
    
    files.then((fileArray: any[]) => {
      if (fileArray.length === 0) {
        reject(new Error(`File not found: ${key}`));
        return;
      }

      const file = fileArray[0];
      const downloadStream = bucket.openDownloadStream(file._id);
      const chunks: Buffer[] = [];

      downloadStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      downloadStream.on('error', (error: Error) => {
        reject(error);
      });

      downloadStream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const contentType = file.contentType || 'application/octet-stream';
        const metadata = file.metadata || {};
        resolve({ buffer, contentType, metadata, fileId: file._id.toString() });
      });
    }).catch(reject);
  });
}

/**
 * Get the public URL for a file (returns API route URL)
 */
export function getPublicUrl(fileId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/api/files/${fileId}`;
}

/**
 * Delete a file from MongoDB GridFS
 */
export async function deleteFromMongoDB(fileId: string): Promise<void> {
  await ensureDbConnected();
  const bucket = getGridFSBucket();

  return new Promise((resolve, reject) => {
    bucket.delete(new mongoose.Types.ObjectId(fileId), (error: Error | null) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Delete a file by filename/key from MongoDB GridFS
 */
export async function deleteByKey(key: string): Promise<void> {
  await ensureDbConnected();
  const bucket = getGridFSBucket();

  return new Promise((resolve, reject) => {
    bucket.find({ filename: key }).toArray().then((files) => {
      if (files.length === 0) {
        resolve(); // File doesn't exist, consider it deleted
        return;
      }

      const deletePromises = files.map((file: any) => 
        new Promise<void>((res, rej) => {
          bucket.delete(file._id, (error: Error | null) => {
            if (error) rej(error);
            else res();
          });
        })
      );

      Promise.all(deletePromises)
        .then(() => resolve())
        .catch(reject);
    }).catch(reject);
  });
}

/**
 * Generate a unique key for a file based on user ID and filename
 */
export function generateFileKey(userId: string, filename: string, folder: string = 'uploads'): string {
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
  return generateFileKey(userId, filename, `logos/${brandId}`);
}

/**
 * Generate a key for brand assets
 */
export function generateBrandAssetKey(userId: string, brandId: string, category: string, filename: string): string {
  return generateFileKey(userId, filename, `brands/${brandId}/${category}`);
}
