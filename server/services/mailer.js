import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const smtpHost = String(process.env.SMTP_HOST || 'smtp.gmail.com').trim();
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = String(process.env.SMTP_USER || '').trim();
const smtpPass = String(process.env.SMTP_PASS || '').replace(/\s+/g, '');
const smtpFromEmail = String(process.env.SMTP_FROM_EMAIL || smtpUser || '').trim();
const smtpFromName = String(process.env.SMTP_FROM_NAME || 'CoreInventory').trim();

let transporter;

const validateSmtpConfig = () => {
  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP credentials are missing. Set SMTP_USER and SMTP_PASS in server .env or Render environment variables.');
  }

  if (!smtpHost) {
    throw new Error('SMTP_HOST is missing. Set SMTP_HOST in server .env or Render environment variables.');
  }

  if (!smtpFromEmail) {
    throw new Error('SMTP_FROM_EMAIL is missing. Set SMTP_FROM_EMAIL in server .env or Render environment variables.');
  }
};

const getTransporter = async () => {
  validateSmtpConfig();

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

export const verifySmtpConfiguration = async () => {
  const mailer = await getTransporter();
  await mailer.verify();
};

export const sendPasswordResetOtpEmail = async ({ email, otp, expiryMinutes }) => {
  const mailer = await getTransporter();

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
