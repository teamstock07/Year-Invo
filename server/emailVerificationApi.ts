import { Request, Response } from 'express';
import crypto from 'crypto';
import { Resend } from 'resend';
import {
  serverDb,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from './firebaseServer';

// In-memory rate limiting map: email -> lastSentTimestamp
const otpSendRateLimits = new Map<string, number>();
// In-memory attempt tracking fallback
const otpAttemptTracker = new Map<string, { count: number; lockedUntil: number }>();

// Lazy initialization of Resend client
let resendClient: Resend | null = null;
function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error(
      'RESEND_API_KEY environment variable is not configured on the server. Please configure your Resend API key in Secrets.'
    );
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey.trim());
  }
  return resendClient;
}

// Compute secure SHA-256 hash of email + code
export function hashOtp(email: string, code: string): string {
  const salt = 'yearinvo_otp_salt_secure_2026';
  return crypto
    .createHash('sha256')
    .update(`${email.trim().toLowerCase()}:${code.trim()}:${salt}`)
    .digest('hex');
}

// Generate cryptographically secure 6-digit numeric OTP
export function generateNumericOtp(): string {
  const num = crypto.randomInt(100000, 1000000); // Generates between 100000 and 999999
  return num.toString();
}

// Safe doc ID from email
function getDocIdForEmail(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
}

// Professional HTML Email Template
function createVerificationEmailHtml(params: {
  name: string;
  code: string;
  expiresInMinutes: number;
  appName?: string;
}): string {
  const { name, code, expiresInMinutes, appName = 'YearInvo' } = params;

  // Split code digits for individual stylized boxes in email
  const digits = code.split('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code - ${appName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; min-height: 100vh; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 540px; background: linear-gradient(180deg, #131b2e 0%, #0b0f19 100%); border: 1px solid #1e293b; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); overflow: hidden;">
          
          <!-- Top Accent Bar -->
          <tr>
            <td style="background: linear-gradient(90deg, #ff5c01 0%, #f59e0b 100%); height: 6px; line-height: 6px; font-size: 6px;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: center;">
              <div style="display: inline-block; width: 54px; height: 54px; border-radius: 16px; background: rgba(255, 92, 1, 0.15); border: 1px solid rgba(255, 92, 1, 0.3); text-align: center; line-height: 54px; font-size: 26px; font-weight: 900; color: #ff5c01; margin-bottom: 16px;">
                Y
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                Verify Your Email Address
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #94a3b8;">
                Welcome to <strong style="color: #cbd5e1;">${appName}</strong> by Year Media
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 0 36px 32px 36px; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
              <p style="margin: 0 0 16px 0;">
                Hello <strong style="color: #ffffff;">${name || 'Store Owner'}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; color: #94a3b8; font-size: 14px;">
                Thank you for creating your account. Please enter the 6-digit verification code below in your application to complete email verification:
              </p>

              <!-- 6-Digit Code Container -->
              <table role="presentation" width="100%" style="background: rgba(15, 23, 42, 0.8); border: 1px solid #334155; border-radius: 16px; margin: 0 0 24px 0; text-align: center;">
                <tr>
                  <td style="padding: 24px 16px;">
                    <div style="font-size: 12px; font-weight: 700; color: #ff8038; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">
                      Your One-Time Verification Code
                    </div>
                    <!-- Digit Badges -->
                    <table role="presentation" align="center" cellspacing="0" cellpadding="0">
                      <tr>
                        ${digits
                          .map(
                            (digit) => `
                          <td style="padding: 0 4px;">
                            <div style="width: 44px; height: 52px; line-height: 52px; background: #1e293b; border: 2px solid #ff5c01; border-radius: 10px; font-size: 28px; font-weight: 900; color: #ffffff; text-align: center; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
                              ${digit}
                            </div>
                          </td>
                        `
                          )
                          .join('')}
                      </tr>
                    </table>
                    <div style="font-size: 12px; color: #f59e0b; font-weight: 600; margin-top: 14px;">
                      ⏱ This code will expire in ${expiresInMinutes} minutes
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <div style="padding: 14px 16px; background: rgba(30, 41, 59, 0.5); border-left: 3px solid #ff5c01; border-radius: 8px; font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 20px;">
                <strong>Security Reminder:</strong> Never share this code with anyone. ${appName} staff will never ask for your verification code or password.
              </div>

              <p style="margin: 0; font-size: 12px; color: #64748b;">
                If you did not register for an account on ${appName}, please safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px 30px 36px; border-top: 1px solid #1e293b; text-align: center; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #94a3b8;">
                ${appName} • Cloud POS &amp; Inventory Management
              </p>
              <p style="margin: 0;">
                © ${new Date().getFullYear()} Year Media. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * 1. Send / Resend Email Verification OTP
 * POST /api/auth/send-verification-otp
 * Body: { email: string, uid?: string, name?: string }
 */
export async function handleSendVerificationOtp(req: Request, res: Response): Promise<void> {
  try {
    const { email, uid, name } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email address is required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      res.status(400).json({ error: 'Invalid email address format.' });
      return;
    }

    // Rate Limiting: 1 OTP send per 60 seconds per email
    const now = Date.now();
    const lastSent = otpSendRateLimits.get(cleanEmail) || 0;
    const cooldownRemaining = Math.ceil((60 * 1000 - (now - lastSent)) / 1000);

    if (cooldownRemaining > 0) {
      res.status(429).json({
        error: `Please wait ${cooldownRemaining}s before requesting a new verification code.`,
        cooldownRemaining,
      });
      return;
    }

    // Generate 6-digit numeric OTP and compute secure hash
    const rawCode = generateNumericOtp();
    const codeHash = hashOtp(cleanEmail, rawCode);

    // 10 minutes expiry
    const expiresInMinutes = 10;
    const expiresAt = new Date(now + expiresInMinutes * 60 * 1000).toISOString();
    const docId = getDocIdForEmail(cleanEmail);

    const displayName = (name || 'Store Owner').trim();
    const emailHtml = createVerificationEmailHtml({
      name: displayName,
      code: rawCode,
      expiresInMinutes,
      appName: 'YearInvo',
    });

    const senderEmail = process.env.EMAIL_FROM || 'YearInvo Verification <onboarding@resend.dev>';

    // Send email via Resend
    let resendResult;
    try {
      const resend = getResend();
      resendResult = await resend.emails.send({
        from: senderEmail,
        to: [cleanEmail],
        subject: `${rawCode} is your verification code for YearInvo`,
        html: emailHtml,
      });

      if (resendResult.error) {
        console.error('[Resend OTP Error]:', resendResult.error);
        res.status(500).json({
          error: `Failed to deliver verification email: ${resendResult.error.message || 'Email delivery failed.'}`,
        });
        return;
      }
    } catch (emailErr: any) {
      console.error('[Resend OTP Exception]:', emailErr);
      res.status(500).json({
        error: emailErr.message || 'Failed to connect to email delivery service. Please verify RESEND_API_KEY.',
      });
      return;
    }

    // Persist OTP Hash & metadata to Firestore only after email was successfully dispatched
    const verificationRecord = {
      id: docId,
      email: cleanEmail,
      uid: uid || '',
      name: displayName,
      codeHash,
      createdAt: new Date(now).toISOString(),
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      verified: false,
      resendEmailId: resendResult.data?.id || null,
      lastSentAt: new Date(now).toISOString(),
    };

    await setDoc(doc(serverDb, 'emailVerifications', docId), verificationRecord);

    // Record rate limit timestamp
    otpSendRateLimits.set(cleanEmail, now);

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. It will expire in 10 minutes.`,
      cooldown: 60,
      expiresAt,
    });
  } catch (error: any) {
    console.error('[Send Verification OTP Error]:', error);
    res.status(500).json({
      error: error.message || 'An unexpected error occurred while sending the verification code.',
    });
  }
}

/**
 * 2. Verify 6-digit OTP Code
 * POST /api/auth/verify-otp
 * Body: { email: string, code: string, uid?: string }
 */
export async function handleVerifyOtp(req: Request, res: Response): Promise<void> {
  try {
    const { email, code, uid } = req.body;

    if (!email || !code) {
      res.status(400).json({ error: 'Email and 6-digit verification code are required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      res.status(400).json({ error: 'Please enter a valid 6-digit numeric verification code.' });
      return;
    }

    const docId = getDocIdForEmail(cleanEmail);
    const docRef = doc(serverDb, 'emailVerifications', docId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      res.status(400).json({
        error: 'No active verification code found for this email. Please click "Resend Code" to generate a new one.',
      });
      return;
    }

    const data = snap.data();
    const now = Date.now();
    const expiresAtMs = new Date(data.expiresAt).getTime();

    // Check if already verified
    if (data.verified) {
      res.json({
        success: true,
        alreadyVerified: true,
        message: 'Your email is already verified. You can now access your dashboard.',
      });
      return;
    }

    // Check Expiration (10 minutes)
    if (now > expiresAtMs) {
      res.status(400).json({
        error: 'This verification code has expired (valid for 10 minutes). Please request a new code.',
        isExpired: true,
      });
      return;
    }

    // Check Maximum Attempt Limit (Brute Force Protection)
    const attempts = Number(data.attempts || 0);
    const maxAttempts = Number(data.maxAttempts || 5);

    if (attempts >= maxAttempts) {
      res.status(429).json({
        error: 'Too many incorrect attempts for this code. For your security, please request a new verification code.',
        isLocked: true,
      });
      return;
    }

    // Verify Hash Match
    const enteredHash = hashOtp(cleanEmail, cleanCode);

    if (enteredHash !== data.codeHash) {
      const nextAttempts = attempts + 1;
      await updateDoc(docRef, { attempts: nextAttempts });

      const remaining = maxAttempts - nextAttempts;
      res.status(400).json({
        error: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Please request a new code.'}`,
        remainingAttempts: Math.max(0, remaining),
      });
      return;
    }

    // Code is valid! Mark as verified and invalidate token so it is strictly single-use
    const verifiedTimestamp = new Date().toISOString();
    await updateDoc(docRef, {
      verified: true,
      verifiedAt: verifiedTimestamp,
      codeHash: `used_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
      verifiedByUid: uid || data.uid || '',
    });

    // Sync verification status to user's Firestore profile
    try {
      const targetUid = uid || data.uid;
      if (targetUid) {
        const userDocRef = doc(serverDb, 'users', targetUid);
        await setDoc(
          userDocRef,
          {
            verifiedEmail: true,
            emailVerified: true,
            emailVerifiedAt: verifiedTimestamp,
          },
          { merge: true }
        );
      } else {
        // Find user by email query
        const uQuery = query(collection(serverDb, 'users'), where('email', '==', cleanEmail));
        const uSnap = await getDocs(uQuery);
        if (!uSnap.empty) {
          await setDoc(
            doc(serverDb, 'users', uSnap.docs[0].id),
            {
              verifiedEmail: true,
              emailVerified: true,
              emailVerifiedAt: verifiedTimestamp,
            },
            { merge: true }
          );
        }
      }
    } catch (userSyncErr) {
      console.warn('[User Verification Sync Warning]:', userSyncErr);
    }

    res.json({
      success: true,
      message: 'Email successfully verified! Unlocking your dashboard...',
      verified: true,
    });
  } catch (error: any) {
    console.error('[Verify OTP Error]:', error);
    res.status(500).json({
      error: error.message || 'An unexpected error occurred while verifying the code.',
    });
  }
}

/**
 * 3. Check Verification Status
 * POST /api/auth/check-verification-status
 * Body: { email: string, uid?: string }
 */
export async function handleCheckVerificationStatus(req: Request, res: Response): Promise<void> {
  try {
    const { email, uid } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email parameter is required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check emailVerifications doc
    const docId = getDocIdForEmail(cleanEmail);
    const docRef = doc(serverDb, 'emailVerifications', docId);
    const snap = await getDoc(docRef);

    let isVerified = false;
    if (snap.exists() && snap.data().verified) {
      isVerified = true;
    }

    // Also check user profile doc if uid provided
    if (!isVerified && uid) {
      const userRef = doc(serverDb, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const uData = userSnap.data();
        if (uData.verifiedEmail || uData.emailVerified) {
          isVerified = true;
        }
      }
    }

    res.json({
      isVerified,
      email: cleanEmail,
    });
  } catch (error: any) {
    console.error('[Check Verification Status Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to check verification status.' });
  }
}
