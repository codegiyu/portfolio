// const nodemailer = require('nodemailer');
// require('dotenv').config();

// export default function (req, res) {
//   const transporter = nodemailer.createTransport({
//     port: 465,
//     host: 'smtp.zoho.com',
//     auth: {
//       user: 'codegiyu@zohomail.com',
//       pass: process.env.password,
//     },
//     secure: true,
//   });
//   const mailData = {
//     from: 'codegiyu@zohomail.com',
//     to: 'codegiyu@gmail.com',
//     subject: `Message From ${req.body.name}`,
//     text: req.body.message + ' | Sent from: ' + req.body.email + ' | Phone: ' + req.body.phone,
//     html: `<div>${req.body.message}</div><p>Sent from:
//     ${req.body.email}</p><p>Phone: ${req.body.phone}`,
//   };
//   transporter.sendMail(mailData, function (err, info) {
//     if (err) {
//       console.log(err);
//       res.status(200).json(err);
//     } else {
//       console.log(info);
//       res.status(200).json(info);
//     }
//   });
// }

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export async function POST(req: Request) {
  try {
    const body = await req.json();

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
      subject: `Message From ${body.name}`,
      text: `${body.message} | Sent from: ${body.email} | Phone: ${body.phone}`,
      html: `<div>${body.message}</div><p>Sent from: ${body.email}</p><p>Phone: ${body.phone}</p>`,
    };

    const info = await transporter.sendMail(mailData);
    console.log(info);

    return NextResponse.json({ success: true, info }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}
