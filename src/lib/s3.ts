import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { join } from 'path';
import { writeFile, readFile, unlink } from 'fs/promises';
import { getFfmpegPath } from '@/lib/ffmpeg-path';
import ffmpeg from 'fluent-ffmpeg';
import os from 'os';

async function applyFaststartToBuffer(fileBuffer: Buffer, fileName: string): Promise<Buffer> {
  const tempDir = os.tmpdir();
  const id = Date.now() + '-' + Math.random().toString(36).substring(2, 9);

  // Ensure we have a valid video extension so FFmpeg knows the container type
  const originalExt = fileName.split('.').pop() || 'mp4';
  const inputPath = join(tempDir, `input-${id}.${originalExt}`);
  const outputPath = join(tempDir, `output-${id}.fs.${originalExt}`);

  try {
    await writeFile(inputPath, fileBuffer);

    try {
      ffmpeg.setFfmpegPath(getFfmpegPath());
    } catch (e) {
      console.warn('Could not set ffmpeg path:', e);
    }

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions(['-c copy', '-movflags +faststart'])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });

    return await readFile(outputPath);
  } catch (err) {
    console.warn('Faststart buffer processing failed, returning original buffer:', err);
    return fileBuffer;
  } finally {
    unlink(inputPath).catch(() => { });
    unlink(outputPath).catch(() => { });
  }
}

/**
 * S3 Upload Utility
 * Handles file uploads to AWS S3 with fallback to local storage
 */

interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
}

interface UploadResult {
  success: boolean;
  url: string;
  storageType: 's3' | 'local';
  message?: string;
}

/**
 * Check if S3 credentials are available
 */
export function hasS3Credentials(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.AWS_S3_BUCKET
  );
}

/**
 * Get S3 client instance
 */
function getS3Client(): S3Client | null {
  if (!hasS3Credentials()) {
    return null;
  }

  return new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

/**
 * Upload file to S3
 */
export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'products'
): Promise<UploadResult> {
  if (!hasS3Credentials()) {
    return {
      success: false,
      url: '',
      storageType: 'local',
      message: 'S3 credentials not configured',
    };
  }

  try {
    const s3Client = getS3Client();
    if (!s3Client) {
      throw new Error('Failed to initialize S3 client');
    }

    const key = `${folder}/${Date.now()}_${fileName}`;
    const bucket = process.env.AWS_S3_BUCKET!;

    // Use Upload for better handling of large files
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
        ACL: 'public-read', // Make files publicly accessible
      },
    });

    await upload.done();

    // Generate public URL
    const url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
      success: true,
      url,
      storageType: 's3',
      message: 'File uploaded to S3 successfully',
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      url: '',
      storageType: 'local',
      message: error instanceof Error ? error.message : 'S3 upload failed',
    };
  }
}

/**
 * Upload file with automatic fallback
 * Tries S3 first, falls back to local storage if S3 is not available
 */
export async function uploadFileWithFallback(
  file: Buffer,
  fileName: string,
  contentType: string,
  localPath: string,
  folder: string = 'products'
): Promise<UploadResult> {
  // If it's a video, automatically apply faststart before saving (works for both S3 and local)
  if (contentType.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(fileName)) {
    console.log(`Applying faststart to video upload: ${fileName}`);
    file = await applyFaststartToBuffer(file, fileName);
  }

  // Try S3 first if credentials are available
  if (hasS3Credentials()) {
    const s3Result = await uploadToS3(file, fileName, contentType, folder);
    if (s3Result.success) {
      return s3Result;
    }
    // If S3 fails, fall back to local
    console.warn('S3 upload failed, falling back to local storage:', s3Result.message);
  }

  // Fallback to local storage
  const fs = require('fs/promises');
  const path = require('path');
  const { mkdir } = require('fs/promises');
  const { existsSync } = require('fs');

  try {
    // Ensure directory exists
    const dir = path.dirname(localPath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    // Write file to local storage
    await fs.writeFile(localPath, file);

    // Return local URL (remove /public from path since Next.js serves public folder at root)
    // Use path.relative for more robust relative path calculation
    let relativePath = path.relative(process.cwd(), localPath).replace(/\\/g, '/');

    // If it starts with 'public/', remove it because Next.js serves public at root
    if (relativePath.startsWith('public/')) {
      relativePath = relativePath.replace('public/', '');
    } else if (relativePath.startsWith('public')) {
      relativePath = relativePath.replace('public', '');
    }

    // Ensure it starts with a slash
    const url = relativePath.startsWith('/') ? relativePath : '/' + relativePath;

    return {
      success: true,
      url,
      storageType: 'local',
      message: 'File uploaded to local storage (S3 not configured)',
    };
  } catch (error) {
    console.error('Local upload error:', error);
    return {
      success: false,
      url: '',
      storageType: 'local',
      message: error instanceof Error ? error.message : 'Local upload failed',
    };
  }
}

/**
 * Get upload status message
 */
export function getUploadStatusMessage(storageType: 's3' | 'local'): string {
  if (storageType === 's3') {
    return '✅ File uploaded to S3 successfully';
  } else {
    return '📁 S3 not configured, file saved to local upload folder';
  }
}

