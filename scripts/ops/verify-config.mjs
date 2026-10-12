import 'dotenv/config';

const failures = [];

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) failures.push(`${name} is missing`);
  return value;
}

function email(name, value) {
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) failures.push(`${name} is invalid`);
}

function httpsUrl(name, value, allowHttpLocal = false) {
  if (!value) return;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    if (!allowHttpLocal && url.protocol !== 'https:') throw new Error();
    if (url.username || url.password || url.search || url.hash) throw new Error();
  } catch {
    failures.push(`${name} is invalid`);
  }
}

const adminEmail = required('ADMIN_EMAIL');
const appUrl = required('NEXT_PUBLIC_APP_URL');
const serviceAccount = required('FIREBASE_SERVICE_ACCOUNT_JSON');
const smtpEmail = required('NODEMAILER_EMAIL');
required('NODEMAILER_PASSWORD');
required('R2_ACCOUNT_ID');
required('R2_ACCESS_KEY_ID');
required('R2_SECRET_ACCESS_KEY');
required('R2_BUCKET_NAME');
const r2PublicUrl = required('R2_PUBLIC_URL');

email('ADMIN_EMAIL', adminEmail);
email('NODEMAILER_EMAIL', smtpEmail);
httpsUrl('NEXT_PUBLIC_APP_URL', appUrl, process.env.NODE_ENV !== 'production');
httpsUrl('R2_PUBLIC_URL', r2PublicUrl);

if (serviceAccount) {
  try {
    const parsed = JSON.parse(serviceAccount);
    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
      failures.push('FIREBASE_SERVICE_ACCOUNT_JSON is incomplete');
    }
  } catch {
    failures.push('FIREBASE_SERVICE_ACCOUNT_JSON is invalid JSON');
  }
}

const port = Number(process.env.NODEMAILER_PORT || 465);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  failures.push('NODEMAILER_PORT is invalid');

if (failures.length) {
  console.error('Configuration preflight failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Configuration preflight passed without printing secret values.');
