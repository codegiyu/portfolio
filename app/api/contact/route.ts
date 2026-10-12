import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getContactConfig } from '@/lib/server/env';
import { checkContactRateLimit, getTrustedClientIp } from '@/lib/server/auth/rate-limit';
import { contactSchema, composeContactMail } from '@/lib/server/contact';
import { logServerError } from '@/lib/server/logging';

const invalidResponse = (message = 'Please check your message and try again.') =>
  NextResponse.json(
    { success: false, message, code: 'CONTACT_VALIDATION_FAILED' },
    { status: 400, headers: { 'Cache-Control': 'no-store' } }
  );

export async function POST(req: Request) {
  const contentLength = Number(req.headers.get('content-length') ?? 0);
  if (contentLength > 64 * 1024) return invalidResponse('Request is too large.');
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return invalidResponse('Invalid request body.');
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return invalidResponse();
  if (parsed.data.website) return invalidResponse();

  try {
    const mailConfig = getContactConfig();
    const limit = await checkContactRateLimit(parsed.data.email, getTrustedClientIp(req));
    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many messages. Please try again later.',
          code: 'RATE_LIMITED',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(limit.retryAfterSeconds),
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    const transporter = nodemailer.createTransport({
      port: mailConfig.port,
      host: mailConfig.host,
      auth: {
        user: mailConfig.email,
        pass: mailConfig.password,
      },
      secure: mailConfig.secure,
    });
    const mail = composeContactMail(parsed.data);

    await transporter.sendMail({
      from: mailConfig.email,
      to: mailConfig.adminEmail,
      subject: mail.subject,
      text: mail.text,
      replyTo: mail.replyTo,
    });

    return NextResponse.json(
      { success: true, message: 'Message sent successfully.', code: 'CONTACT_SENT' },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    logServerError('CONTACT_DELIVERY_FAILED');
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to send your message right now.',
        code: 'CONTACT_DELIVERY_FAILED',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
