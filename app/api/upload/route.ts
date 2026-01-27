import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { uploadToS3, generateS3Key, getPublicUrl } from '@/lib/utils/s3';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string | null;
    const brandId = formData.get('brandId') as string | null;
    const category = formData.get('category') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate S3 key
    let key: string;
    if (brandId && category) {
      // For brand assets
      const { generateBrandAssetKey } = await import('@/lib/utils/s3');
      key = generateBrandAssetKey(user.id, brandId, category, file.name);
    } else if (brandId) {
      // For logos
      const { generateLogoKey } = await import('@/lib/utils/s3');
      key = generateLogoKey(user.id, brandId, file.name);
    } else {
      key = generateS3Key(user.id, file.name, folder || 'uploads');
    }

    // Upload to S3
    await uploadToS3({
      key,
      body: buffer,
      contentType: file.type || 'application/octet-stream',
      metadata: {
        originalName: file.name,
        uploadedBy: user.id,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Return the URL
    // If your bucket is public, use getPublicUrl
    // If private, you'll need to generate presigned URLs when serving
    const url = getPublicUrl(key);

    return NextResponse.json({
      success: true,
      url,
      key,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Optional: Handle file deletion
export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'No key provided' },
        { status: 400 }
      );
    }

    // Verify the key belongs to the user (security check)
    if (!key.includes(user.id)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { deleteFromS3 } = await import('@/lib/utils/s3');
    await deleteFromS3(key);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete file' },
      { status: 500 }
    );
  }
}
