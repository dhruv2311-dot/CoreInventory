import crypto from 'crypto';

const otpStore = new Map();

const OTP_EXPIRY_MINUTES = Number(process.env.PASSWORD_RESET_OTP_EXPIRY_MINUTES || 10);
const OTP_COOLDOWN_SECONDS = Number(process.env.PASSWORD_RESET_OTP_COOLDOWN_SECONDS || 60);
const OTP_MAX_ATTEMPTS = Number(process.env.PASSWORD_RESET_OTP_MAX_ATTEMPTS || 5);

const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

const getNow = () => Date.now();

export const getOtpCooldownSeconds = () => OTP_COOLDOWN_SECONDS;
export const getOtpExpiryMinutes = () => OTP_EXPIRY_MINUTES;

export const canSendPasswordResetOtp = (email) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const entry = otpStore.get(normalizedEmail);

  if (!entry) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const remainingMs = entry.cooldownUntil - getNow();
  if (remainingMs > 0) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(remainingMs / 1000),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
};

export const createPasswordResetOtp = (email) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const otp = String(crypto.randomInt(100000, 1000000));
  const now = getNow();

  otpStore.set(normalizedEmail, {
    otpHash: hashOtp(otp),
    expiresAt: now + OTP_EXPIRY_MINUTES * 60 * 1000,
    cooldownUntil: now + OTP_COOLDOWN_SECONDS * 1000,
    attemptsRemaining: OTP_MAX_ATTEMPTS,
  });

  return otp;
};

export const verifyPasswordResetOtp = (email, otp) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const entry = otpStore.get(normalizedEmail);

  if (!entry) {
    return { valid: false, message: 'OTP not found. Please request a new code.' };
  }

  if (entry.expiresAt < getNow()) {
    otpStore.delete(normalizedEmail);
    return { valid: false, message: 'OTP expired. Please request a new code.' };
  }

  if (entry.attemptsRemaining <= 0) {
    otpStore.delete(normalizedEmail);
    return { valid: false, message: 'Too many invalid attempts. Please request a new code.' };
  }

  if (entry.otpHash !== hashOtp(otp)) {
    entry.attemptsRemaining -= 1;
    if (entry.attemptsRemaining <= 0) {
      otpStore.delete(normalizedEmail);
      return { valid: false, message: 'Too many invalid attempts. Please request a new code.' };
    }

    otpStore.set(normalizedEmail, entry);
    return { valid: false, message: 'Invalid OTP' };
  }

  otpStore.delete(normalizedEmail);
  return { valid: true };
};
