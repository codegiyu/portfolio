import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    const transporter = nodemailer.createTransport({
      port: 465,
      host: 'smtp.zoho.com',
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
      secure: true,
    });

    await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `Message from ${String(name).trim()}`,
      html: `<div>${message}</div><p>Sent from: ${email}</p>`,
    });

    return NextResponse.json({ success: true, message: 'Mail sent successfully' }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Error sending mail' }, { status: 500 });
  }
}
