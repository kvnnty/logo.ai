/**
 * API Route to serve files from MongoDB GridFS
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFileFromMongoDB } from '@/lib/utils/mongodb-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;

    if (!fileId) {
      return new NextResponse('File ID required', { status: 400 });
    }

    const { buffer, contentType } = await getFileFromMongoDB(fileId);

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'File not found',
      { status: 404 }
    );
  }
}
