import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { ConfigError, getAuthConfig, getSmtpConfig, normalizeEmail } from '@/lib/server/env';
import { checkSendLinkRateLimit, getTrustedClientIp } from '@/lib/server/auth/rate-limit';
import { issueMagicLink } from '@/lib/server/auth/service';
import { isSameOrigin } from '@/lib/server/auth/http';

const requestSchema = z.object({ email: z.string().trim().email() });
const genericResponse = {
  message: 'If the address is authorized, a sign-in link will be sent.',
};

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    character =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ??
      character
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Valid email required' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const config = getAuthConfig();
    if (!isSameOrigin(request, config.appUrl)) {
      return NextResponse.json(
        { error: 'Request origin rejected' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    const smtp = getSmtpConfig();
    const email = normalizeEmail(parsed.data.email);
    const ip = getTrustedClientIp(request);
    let limit;
    try {
      limit = await checkSendLinkRateLimit(email, ip);
    } catch {
      return NextResponse.json(
        { error: 'Authentication is temporarily unavailable' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (!limit.allowed) {
      return NextResponse.json(genericResponse, {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds), 'Cache-Control': 'no-store' },
      });
    }

    const transporter = nodemailer.createTransport({
      port: 465,
      host: 'smtp.zoho.com',
      auth: { user: smtp.email, pass: smtp.password },
      secure: true,
    });

    await issueMagicLink(email, async ({ token, appUrl }) => {
      const magicLink = `${appUrl}/admin/verify#token=${token}`;
      const safeMagicLink = escapeHtml(magicLink);
      await transporter.sendMail({
        from: smtp.email,
        to: email,
        subject: 'Sign in to your portfolio admin',
        html: `
          <h2>Sign in to your admin panel</h2>
          <p>Click the link below to sign in. It expires in 15 minutes.</p>
          <a href="${safeMagicLink}" style="background: #C81313; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Sign In
          </a>
          <p>Or copy this link:</p>
          <p><code>${safeMagicLink}</code></p>
        `,
      });
    });

    return NextResponse.json(genericResponse, {
      status: 202,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error('Authentication configuration unavailable:', error.code);
      return NextResponse.json(
        { error: 'Authentication is temporarily unavailable' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    if (error instanceof Error && error.message === 'AUTH_EMAIL_DELIVERY_FAILED') {
      console.error('Authentication email delivery failed');
      return NextResponse.json(genericResponse, {
        status: 202,
        headers: { 'Cache-Control': 'no-store' },
      });
    }
    console.error('Authentication service unavailable');
    return NextResponse.json(
      { error: 'Authentication is temporarily unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
