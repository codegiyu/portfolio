import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getContactConfig } from '@/lib/server/env';

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();
    const mailConfig = getContactConfig();

    const transporter = nodemailer.createTransport({
      port: 465,
      host: 'smtp.zoho.com',
      auth: {
        user: mailConfig.email,
        pass: mailConfig.password,
      },
      secure: true,
    });

    await transporter.sendMail({
      from: mailConfig.email,
      to: mailConfig.adminEmail,
      subject: `Message from ${String(name).trim()}`,
      html: `<div>${message}</div><p>Sent from: ${email}</p>`,
    });

    return NextResponse.json({ success: true, message: 'Mail sent successfully' }, { status: 200 });
  } catch {
    console.error('Contact mail delivery failed');
    return NextResponse.json({ success: false, message: 'Error sending mail' }, { status: 500 });
  }
}
