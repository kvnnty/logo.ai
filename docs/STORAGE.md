# File Storage: MongoDB GridFS

This app uses **MongoDB GridFS** for file storage. **No S3 or AWS is required.**

## How it works

- **Upload**: `POST /api/upload` accepts a file (multipart), stores it in GridFS (bucket `files`), and returns a URL: `{NEXT_PUBLIC_APP_URL}/api/files/{fileId}`.
- **Serve**: `GET /api/files/[fileId]` streams the file from GridFS with the correct `Content-Type`.
- **Delete**: `DELETE /api/upload?key={fileId}` removes the file from GridFS.

## Environment

- **MONGODB_URI** – Must be set. GridFS uses the same MongoDB connection.
- **NEXT_PUBLIC_APP_URL** – Used to build file URLs returned after upload (e.g. `http://localhost:3000` in dev).

## Where it’s used

- Logo upload (create brand from uploading already existing logo)
- Link-in-bio image blocks (profile / block images)
- Any flow that calls `uploadFile()` from `@/lib/utils/upload` (client) or `uploadToMongoDB()` from `@/lib/utils/mongodb-storage` (server)


- All upload/serve flows go through GridFS and `/api/upload` / `/api/files`.
