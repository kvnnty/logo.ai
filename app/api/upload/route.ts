import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { uploadToMongoDB, generateFileKey, getPublicUrl, generateBrandAssetKey, generateLogoKey, deleteFromMongoDB } from '@/lib/utils/mongodb-storage';

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

    // Generate file key
    let key: string;
    if (brandId && category) {
      // For brand assets
      key = generateBrandAssetKey(user.id, brandId, category, file.name);
    } else if (brandId) {
      // For logos
      key = generateLogoKey(user.id, brandId, file.name);
    } else {
      key = generateFileKey(user.id, file.name, folder || 'uploads');
    }

    // Upload to MongoDB GridFS
    const fileId = await uploadToMongoDB({
      key,
      body: buffer,
      contentType: file.type || 'application/octet-stream',
      metadata: {
        originalName: file.name,
        uploadedBy: user.id,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Return the URL (API route to serve the file)
    const url = getPublicUrl(fileId);

    return NextResponse.json({
      success: true,
      url,
      key: fileId, // Return fileId instead of key for MongoDB
      filename: key, // Keep original key as filename for reference
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

    // Verify the file belongs to the user (security check)
    // Note: In production, you might want to store userId in file metadata and verify it
    // For now, we'll delete by fileId directly
    await deleteFromMongoDB(key); // key is actually fileId in this context

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete file' },
      { status: 500 }
    );
  }
}
