import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { countStartingChar } from '@/lib/utils';

dotenv.config();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message, isCVDownload } = body;

    const transporter = nodemailer.createTransport({
      port: 465,
      host: 'smtp.zoho.com',
      auth: {
        user: 'codegiyu@zohomail.com',
        pass: process.env.password,
      },
      secure: true,
    });

    const mailData = {
      from: 'codegiyu@zohomail.com',
      to: 'codegiyu@gmail.com',
      subject: isCVDownload ? 'New CV Download' : `Message From ${name.trim()}`,
      // text: `${message} | Sent from: ${email}`,
      html: isCVDownload
        ? `
          <div>
            ${message
              .split('\n')
              .map((text: string) => {
                const paddingLeft = countStartingChar(text, ' ') * 8; // number of spaces at the start of the line * 8px

                return `
                <p style="padding: 0 0 0 ${paddingLeft}px; word-break: break-all;">
                  ${text}
                </p>
              `;
              })
              .join('')}
          </div>
        `
        : `<div>${message}</div><p>Sent from: ${email}</p>`,
    };

    const data = await transporter.sendMail(mailData);
    console.log(data);

    return NextResponse.json(
      { success: true, data, message: 'Mail sent successfully' },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err, message: 'Error sending mail' },
      { status: 500 }
    );
  }
}
