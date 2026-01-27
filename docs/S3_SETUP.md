# AWS S3 Storage Setup Guide

This guide will help you set up AWS S3 storage for your logo AI application.

## Prerequisites

- An AWS account
- AWS CLI installed (optional, but recommended)

## Step 1: Create an S3 Bucket

1. Log in to the [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **S3** service
3. Click **Create bucket**
4. Configure your bucket:
   - **Bucket name**: Choose a unique name (e.g., `logo-ai-storage`)
   - **Region**: Select your preferred region (e.g., `us-east-1`)
   - **Block Public Access**: 
     - If you want public URLs, uncheck "Block all public access" and acknowledge
     - If you want private storage, keep it blocked (you'll use presigned URLs)
   - **Bucket Versioning**: Optional, enable if you want version history
   - **Default encryption**: Recommended to enable (SSE-S3 or SSE-KMS)

5. Click **Create bucket**

## Step 2: Create an IAM User for S3 Access

1. Navigate to **IAM** service in AWS Console
2. Click **Users** → **Create user**
3. Enter a username (e.g., `logo-ai-s3-user`)
4. Click **Next**
5. Under **Set permissions**, select **Attach policies directly**
6. Click **Create policy** (opens in new tab)
7. Use the JSON editor and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR-BUCKET-NAME/*",
        "arn:aws:s3:::YOUR-BUCKET-NAME"
      ]
    }
  ]
}
```

Replace `YOUR-BUCKET-NAME` with your actual bucket name.

8. Name the policy (e.g., `LogoAIS3Access`) and click **Create policy**
9. Go back to the user creation tab, refresh, and select your new policy
10. Click **Next** → **Create user**

## Step 3: Generate Access Keys

1. Click on the user you just created
2. Go to the **Security credentials** tab
3. Scroll to **Access keys** section
4. Click **Create access key**
5. Select **Application running outside AWS**
6. Click **Next** → **Create access key**
7. **IMPORTANT**: Copy both the **Access key ID** and **Secret access key** immediately (you won't be able to see the secret key again)

## Step 4: Configure Environment Variables

Add the following to your `.env` file:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id-here
AWS_SECRET_ACCESS_KEY=your-secret-access-key-here
AWS_S3_BUCKET_NAME=your-bucket-name-here
```

Replace the placeholder values with your actual credentials.

## Step 5: Configure CORS (if needed)

If you're uploading files directly from the browser, you may need to configure CORS:

1. Go to your S3 bucket → **Permissions** tab
2. Scroll to **Cross-origin resource sharing (CORS)**
3. Click **Edit** and paste:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:4001", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

Replace `yourdomain.com` with your production domain.

## Step 6: Bucket Policy (for Public Access - Optional)

If you want public URLs (not presigned), add this bucket policy:

1. Go to your S3 bucket → **Permissions** tab
2. Click **Edit** under **Bucket policy**
3. Paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

Replace `YOUR-BUCKET-NAME` with your actual bucket name.

## Usage

### Uploading Files

```typescript
import { uploadFile } from '@/lib/utils/upload';

// Upload a file
const result = await uploadFile(file, {
  folder: 'logos',
  brandId: 'brand-id',
  category: 'logo'
});

if (result.success) {
  console.log('File URL:', result.url);
  console.log('S3 Key:', result.key);
}
```

### Server-Side Upload

```typescript
import { uploadToS3, generateLogoKey } from '@/lib/utils/s3';

const key = generateLogoKey(userId, brandId, filename);
const url = await uploadToS3({
  key,
  body: buffer,
  contentType: 'image/png',
});
```

### Getting Presigned URLs (for Private Buckets)

```typescript
import { getPresignedUrl } from '@/lib/utils/s3';

const url = await getPresignedUrl(s3Key, 3600); // Expires in 1 hour
```

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for all AWS credentials
3. **Rotate access keys** regularly
4. **Use IAM roles** instead of access keys when running on AWS (EC2, Lambda, etc.)
5. **Enable MFA** on your AWS root account
6. **Use least privilege** - only grant necessary S3 permissions
7. **Enable CloudTrail** to monitor S3 access
8. **Set up bucket versioning** for important files
9. **Configure lifecycle policies** to automatically delete old files if needed

## Troubleshooting

### Error: "Access Denied"
- Check that your IAM user has the correct permissions
- Verify your access key ID and secret key are correct
- Ensure the bucket name matches exactly

### Error: "Bucket does not exist"
- Verify the bucket name in your `.env` file
- Check that the bucket exists in the correct AWS region

### Files not accessible publicly
- If using public URLs, ensure bucket policy allows public read access
- If using presigned URLs, ensure the bucket policy allows GetObject for your IAM user

### CORS errors
- Verify CORS configuration includes your domain
- Check that allowed methods include the HTTP method you're using
