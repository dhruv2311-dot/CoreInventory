import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, '');
const smtpFromEmail = process.env.SMTP_FROM_EMAIL || smtpUser;
const smtpFromName = process.env.SMTP_FROM_NAME || 'CoreInventory';

let transporter;

const getTransporter = () => {
  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP credentials are missing. Set SMTP_USER and SMTP_PASS in server .env');
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  return transporter;
};

export const sendPasswordResetOtpEmail = async ({ email, otp, expiryMinutes }) => {
  const mailer = getTransporter();
  await mailer.sendMail({
    from: `\"${smtpFromName}\" <${smtpFromEmail}>`,
    to: email,
    subject: 'Your Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin-bottom: 12px;">Password Reset OTP</h2>
        <p>Use the following OTP to reset your password:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 16px 0;">${otp}</p>
        <p>This code will expire in ${expiryMinutes} minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
    text: `Your password reset OTP is ${otp}. It expires in ${expiryMinutes} minutes.`,
  });
};
