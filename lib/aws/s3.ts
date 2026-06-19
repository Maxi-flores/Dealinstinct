import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { awsConfig, s3Config } from './config';

// Initialize S3 Client
const s3Client = new S3Client({
  ...awsConfig,
  region: s3Config.region,
});

// Generate unique file key
export function generateFileKey(folder: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${folder}/${timestamp}-${sanitizedFilename}`;
}

// Upload file to S3
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: s3Config.bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: 'public-read',
  });

  await s3Client.send(command);
  return getPublicUrl(key);
}

// Upload image with optimization
export async function uploadImage(
  folder: string,
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<{ url: string; key: string }> {
  const key = generateFileKey(folder, filename);
  const url = await uploadFile(key, buffer, contentType);
  return { url, key };
}

// Delete file from S3
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: s3Config.bucketName,
    Key: key,
  });
  await s3Client.send(command);
}

// Get file from S3
export async function getFile(key: string): Promise<Buffer | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: s3Config.bucketName,
      Key: key,
    });
    const response = await s3Client.send(command);
    const stream = response.Body as NodeJS.ReadableStream;
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  } catch {
    return null;
  }
}

// Generate presigned upload URL
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: s3Config.bucketName,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

// Generate presigned download URL
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: s3Config.bucketName,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

// Get public URL for file
export function getPublicUrl(key: string): string {
  return `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;
}

// List files in folder
export async function listFiles(prefix: string): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: s3Config.bucketName,
    Prefix: prefix,
  });

  const response = await s3Client.send(command);
  return response.Contents?.map((obj) => obj.Key || '') || [];
}

export { s3Client, s3Config };
