import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateMagicLinkToken } from '@/lib/firebase';

const transporter = nodemailer.createTransport({
  service: 'zoho',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      );
    }

    // Verify this is the admin email
    if (email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const token = generateMagicLinkToken(email);
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://portfolio-codegiyu.vercel.app';
    const magicLink = `${siteUrl}/admin/verify?token=${encodeURIComponent(token)}`;

    await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: 'Sign in to your portfolio admin',
      html: `
        <h2>Sign in to your admin panel</h2>
        <p>Click the link below to sign in (valid for 24 hours):</p>
        <a href="${magicLink}" style="background: #C81313; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Sign In
        </a>
        <p>Or copy this link:</p>
        <p><code>${magicLink}</code></p>
      `,
    });

    return NextResponse.json(
      { message: 'Magic link sent to your email' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending magic link:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
