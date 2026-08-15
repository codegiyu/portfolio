import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getR2Config } from '@/lib/server/env';

function getR2Client(): S3Client {
  const { accountId, accessKeyId, secretAccessKey } = getR2Config();

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getBucketName(): string {
  return getR2Config().bucketName;
}

export async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<string> {
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

  return `${getR2Config().publicUrl}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  await client.send(new DeleteObjectCommand({ Bucket: getBucketName(), Key: key }));
}

export function r2KeyFromUrl(url: string): string | null {
  const publicUrl = getR2Config().publicUrl;
  if (!url.startsWith(publicUrl)) return null;
  return url.slice(publicUrl.length + 1);
}
