import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
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

  return `${getR2Config().publicUrl.replace(/\/$/, '')}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  await client.send(new DeleteObjectCommand({ Bucket: getBucketName(), Key: key }));
}

export function r2KeyFromUrl(url: string): string | null {
  const publicUrl = process.env.R2_PUBLIC_URL?.trim().replace(/\/$/, '');
  if (!publicUrl || !url.startsWith(`${publicUrl}/`)) return null;
  const key = url.slice(publicUrl.length + 1);
  if (!key || !key.startsWith('assets/') || key.includes('..') || key.startsWith('/')) return null;
  return key;
}

export async function deleteR2Urls(urls: string[]): Promise<void> {
  const keys = Array.from(new Set(urls.map(r2KeyFromUrl).filter((key): key is string => !!key)));
  await Promise.all(keys.map(key => deleteFromR2(key)));
}

export async function listR2Keys(prefix = 'assets/'): Promise<string[]> {
  const client = getR2Client();
  const bucket = getBucketName();
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );
    keys.push(...(page.Contents ?? []).flatMap(object => (object.Key ? [object.Key] : [])));
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}
