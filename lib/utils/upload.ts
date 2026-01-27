/**
 * Client-side utility for uploading files to MongoDB GridFS via the API route
 */

export interface UploadFileResponse {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Upload a file to MongoDB GridFS
 */
export async function uploadFile(
  file: File,
  options?: {
    folder?: string;
    brandId?: string;
    category?: string;
  }
): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options?.folder) {
    formData.append('folder', options.folder);
  }
  if (options?.brandId) {
    formData.append('brandId', options.brandId);
  }
  if (options?.category) {
    formData.append('category', options.category);
  }

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
    };
  }
}

/**
 * Upload multiple files to MongoDB GridFS
 */
export async function uploadFiles(
  files: File[],
  options?: {
    folder?: string;
    brandId?: string;
    category?: string;
  }
): Promise<UploadFileResponse[]> {
  const uploadPromises = files.map(file => uploadFile(file, options));
  return Promise.all(uploadPromises);
}

/**
 * Delete a file from MongoDB GridFS
 */
export async function deleteFile(key: string): Promise<UploadFileResponse> {
  try {
    const response = await fetch(`/api/upload?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete file',
    };
  }
}

/**
 * Convert a data URL (base64) to a File object
 */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}
