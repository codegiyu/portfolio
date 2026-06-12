import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 environment variables (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY) are not configured');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getBucketName(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error('R2_BUCKET_NAME is not set');
  return bucket;
}

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const client = getR2Client();
  const bucket = getBucketName();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, '');
  return publicUrl ? `${publicUrl}/${key}` : `/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  await client.send(new DeleteObjectCommand({ Bucket: getBucketName(), Key: key }));
}

export function r2KeyFromUrl(url: string): string | null {
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, '');
  if (!publicUrl || !url.startsWith(publicUrl)) return null;
  return url.slice(publicUrl.length + 1);
}
