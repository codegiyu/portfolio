import { NextRequest, NextResponse } from 'next/server';
import { isValidMagicLinkToken } from '@/lib/firebase';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || !isValidMagicLinkToken(token)) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Extract email from token
    const email = token.split('|')[0];

    // Verify email matches admin email
    if (email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Set secure cookie with token
    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return NextResponse.json(
      { message: 'Authentication successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
