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
import { getAuthoritativeSubscription } from './subscriptionServer';

// In-memory rate limiting cache
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const inviteRateLimits = new Map<string, RateLimitEntry>();
const resendRateLimits = new Map<string, number>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = inviteRateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    inviteRateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) {
    return false;
  }
  entry.count += 1;
  return true;
}

// Lazy initialization of Resend client
let resendClient: Resend | null = null;
function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('RESEND_API_KEY environment variable is not configured on the server. Please add your Resend API key in Secrets / environment variables.');
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey.trim());
  }
  return resendClient;
}

// Compute SHA-256 hash for secure storage of tokens
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Generate a cryptographically secure random token (64 hex characters)
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Build email template
function createInvitationEmailHtml(params: {
  storeName: string;
  inviteeName: string;
  role: string;
  invitationUrl: string;
  expiresAtFormatted: string;
  ownerName: string;
}): string {
  const { storeName, inviteeName, role, invitationUrl, expiresAtFormatted, ownerName } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to join ${storeName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; min-height: 100vh; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 580px; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border: 1px solid #334155; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5); overflow: hidden;">
          
          <!-- Top Accent Bar -->
          <tr>
            <td style="background: linear-gradient(90deg, #ff5c01 0%, #f59e0b 100%); height: 6px; line-height: 6px; font-size: 6px;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: left;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <div style="display: inline-block; padding: 6px 14px; background: rgba(255, 92, 1, 0.15); border: 1px solid rgba(255, 92, 1, 0.3); border-radius: 9999px; color: #ff5c01; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
                      Team Invitation
                    </div>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.3;">
                      Join ${storeName}
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 0 36px 28px 36px; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
              <p style="margin: 0 0 16px 0;">
                Hello <strong style="color: #ffffff;">${inviteeName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0;">
                <strong style="color: #ffffff;">${ownerName || 'The store owner'}</strong> has invited you to join the team at <strong style="color: #ffffff;">${storeName}</strong> as a <strong style="color: #ff5c01; text-transform: capitalize;">${role}</strong>.
              </p>

              <!-- Role & Access Badge Card -->
              <table role="presentation" width="100%" style="background-color: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 12px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px;">
                    <table role="presentation" width="100%">
                      <tr>
                        <td style="font-size: 12px; color: #94a3b8; padding-bottom: 4px;">Assigned Position</td>
                      </tr>
                      <tr>
                        <td style="font-size: 17px; font-weight: 700; color: #ffffff;">${role}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #94a3b8; padding-top: 10px;">Expires</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; font-weight: 600; color: #f59e0b;">${expiresAtFormatted}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Call To Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${invitationUrl}" target="_blank" rel="noopener noreferrer" style="display: block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #ff5c01 0%, #ea580c 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 24px; border-radius: 12px; text-align: center; box-shadow: 0 10px 15px -3px rgba(255, 92, 1, 0.3);">
                      Accept Team Invitation &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Alternative Link -->
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 12px; word-break: break-all; color: #38bdf8;">
                <a href="${invitationUrl}" style="color: #38bdf8; text-decoration: underline;">${invitationUrl}</a>
              </p>

              <!-- Security Notice -->
              <div style="padding: 14px; background: rgba(30, 41, 59, 0.5); border-left: 3px solid #64748b; border-radius: 6px; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                <strong>Security Notice:</strong> This invitation is uniquely generated for your email address. If you were not expecting this invitation, you can safely ignore this email.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px 30px 36px; border-top: 1px solid #1e293b; text-align: center; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #94a3b8;">
                ${storeName} Management Portal
              </p>
              <p style="margin: 0;">
                Powered by TeamStock POS &amp; Inventory Suite
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
 * 1. Create and send a new team member invitation
 * POST /api/team/invite
 */
export async function handleCreateInvitation(req: Request, res: Response): Promise<void> {
  try {
    const {
      storeId,
      storeName,
      name,
      email,
      phone,
      role,
      customPermissions,
      invitedBy,
      invitedByName,
    } = req.body;

    // Validate required fields
    if (!storeId || !name || !email || !role) {
      res.status(400).json({ error: 'Missing required invitation fields (storeId, name, email, role).' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }

    // Rate limit check: max 10 invites per 5 minutes per store, max 2 per minute to same email
    const storeRateKey = `store_invite_${storeId}`;
    if (!checkRateLimit(storeRateKey, 15, 5 * 60 * 1000)) {
      res.status(429).json({ error: 'Too many invitation requests. Please wait a few minutes before trying again.' });
      return;
    }

    // Backend Subscription Enforcement: Team Management is exclusively allowed on Premium or Lifetime plans
    const storeOwnerId = invitedBy || storeId;
    if (storeOwnerId) {
      try {
        const sub = await getAuthoritativeSubscription(storeOwnerId);
        if (!sub.limits.isTeamManagementAllowed) {
          res.status(403).json({
            error: 'Team Member Management is a Premium feature. Please upgrade your subscription to Premium to invite team members and assign roles.',
            code: 'TEAM_MANAGEMENT_LOCKED',
            requiredPlan: 'Premium',
          });
          return;
        }
      } catch (subErr) {
        console.warn('[Invitation API] Notice verifying owner subscription:', subErr);
      }
    }

    const emailRateKey = `email_invite_${storeId}_${cleanEmail}`;
    if (!checkRateLimit(emailRateKey, 3, 2 * 60 * 1000)) {
      res.status(429).json({ error: 'An invitation was recently created for this email. Please use the Resend action or wait a moment.' });
      return;
    }

    // Check for existing pending invitation in Firestore
    const pendingQuery = query(
      collection(serverDb, 'teamInvitations'),
      where('storeId', '==', storeId),
      where('invitedEmail', '==', cleanEmail),
      where('status', '==', 'pending')
    );
    const existingSnap = await getDocs(pendingQuery);
    if (!existingSnap.empty) {
      // If a pending invitation already exists, we will reuse or advise resending
      const existingDoc = existingSnap.docs[0];
      const existingData = existingDoc.data();
      const now = Date.now();
      const expiresAtMs = new Date(existingData.expiresAt).getTime();
      
      // If it hasn't expired yet
      if (expiresAtMs > now) {
        res.status(400).json({
          error: `A pending invitation for ${cleanEmail} already exists. You can use the "Resend" button to email them again.`,
          existingInvitationId: existingDoc.id,
        });
        return;
      }
    }

    // Generate cryptographic token and hash
    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);

    // Expiration: 7 days from now
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const invitationId = `inv_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Determine base URL for invitation link
    const hostHeader = req.get('host');
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : `${protocol}://${hostHeader}`;
    const invitationUrl = `${baseUrl}/accept-invitation?token=${rawToken}`;

    const formattedExpiresAt = new Date(expiresAt).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const emailHtml = createInvitationEmailHtml({
      storeName: storeName || 'Your Store',
      inviteeName: cleanName,
      role: role || 'Cashier',
      invitationUrl,
      expiresAtFormatted: formattedExpiresAt,
      ownerName: invitedByName || 'Store Administrator',
    });

    // Sender configuration from environment variable or fallback
    const senderEmail = process.env.EMAIL_FROM || 'Team Invitation <onboarding@resend.dev>';

    // Send email via Resend
    let resendResult;
    try {
      const resend = getResend();
      resendResult = await resend.emails.send({
        from: senderEmail,
        to: [cleanEmail],
        subject: `You're invited to join ${storeName || 'the team'} as a ${role}`,
        html: emailHtml,
      });

      if (resendResult.error) {
        console.error('[Resend Error]:', resendResult.error);
        res.status(500).json({
          error: `Failed to deliver invitation email: ${resendResult.error.message || 'Email delivery provider returned an error.'}`,
        });
        return;
      }
    } catch (emailErr: any) {
      console.error('[Resend Exception]:', emailErr);
      res.status(500).json({
        error: emailErr.message || 'Failed to connect to email delivery service. Please check RESEND_API_KEY.',
      });
      return;
    }

    // Only create record in Firestore after email has been successfully sent!
    const invitationDoc = {
      id: invitationId,
      storeId,
      storeName: storeName || '',
      invitedEmail: cleanEmail,
      name: cleanName,
      phone: phone || '',
      role,
      customPermissions: customPermissions || {},
      invitedBy: invitedBy || '',
      invitedByName: invitedByName || '',
      tokenHash,
      status: 'pending',
      createdAt: now.toISOString(),
      expiresAt,
      resendCount: 0,
      resendEmailId: resendResult.data?.id || null,
    };

    await setDoc(doc(serverDb, 'teamInvitations', invitationId), invitationDoc);

    // Also sync team member entry to store's businessData/team collection as 'Invited'
    try {
      const teamDocRef = doc(serverDb, 'users', storeId, 'businessData', 'team');
      const teamSnap = await getDoc(teamDocRef);
      let currentItems: any[] = [];
      if (teamSnap.exists()) {
        const d = teamSnap.data();
        if (Array.isArray(d.items)) currentItems = d.items;
        else if (Array.isArray(d.team)) currentItems = d.team;
      }

      // Check if item already exists by email
      const existingIdx = currentItems.findIndex(
        (m: any) => (m.email || '').toLowerCase() === cleanEmail
      );

      const memberEntry = {
        id: existingIdx >= 0 ? currentItems[existingIdx].id : `team-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        phone: phone || '',
        role,
        status: 'Invited',
        joinedDate: now.toISOString().split('T')[0],
        lastActive: 'Invited',
        invitedBy: invitedByName || 'Owner',
        invitationId,
        customPermissions: customPermissions || {},
      };

      if (existingIdx >= 0) {
        currentItems[existingIdx] = { ...currentItems[existingIdx], ...memberEntry };
      } else {
        currentItems.push(memberEntry);
      }

      await setDoc(teamDocRef, { items: currentItems }, { merge: true });
    } catch (teamSyncErr) {
      console.warn('[Team Sync Warning]:', teamSyncErr);
    }

    res.json({
      success: true,
      message: `Invitation email sent successfully to ${cleanEmail}`,
      invitation: {
        id: invitationId,
        storeId,
        storeName,
        name: cleanName,
        invitedEmail: cleanEmail,
        role,
        status: 'pending',
        createdAt: now.toISOString(),
        expiresAt,
      },
    });
  } catch (error: any) {
    console.error('[Create Invitation Error]:', error);
    res.status(500).json({ error: error.message || 'An unexpected error occurred while creating the invitation.' });
  }
}

/**
 * 2. Resend an invitation with a refreshed token
 * POST /api/team/resend-invite
 */
export async function handleResendInvitation(req: Request, res: Response): Promise<void> {
  try {
    const { invitationId, storeId } = req.body;

    if (!invitationId || !storeId) {
      res.status(400).json({ error: 'Missing invitationId or storeId.' });
      return;
    }

    // Rate limit resend to 1 per 45 seconds per invitation
    const nowMs = Date.now();
    const lastResent = resendRateLimits.get(invitationId) || 0;
    if (nowMs - lastResent < 45 * 1000) {
      res.status(429).json({ error: 'Please wait at least 45 seconds before requesting another email resend.' });
      return;
    }

    const invDocRef = doc(serverDb, 'teamInvitations', invitationId);
    const invSnap = await getDoc(invDocRef);

    if (!invSnap.exists()) {
      res.status(404).json({ error: 'Invitation record not found.' });
      return;
    }

    const invData = invSnap.data();

    if (invData.storeId !== storeId) {
      res.status(403).json({ error: 'Unauthorized to modify this invitation.' });
      return;
    }

    if (invData.status === 'accepted') {
      res.status(400).json({ error: 'This invitation has already been accepted.' });
      return;
    }

    if (invData.status === 'revoked') {
      res.status(400).json({ error: 'This invitation was revoked. Please create a new invitation.' });
      return;
    }

    // Generate fresh token, invalidate old token
    const newRawToken = generateSecureToken();
    const newTokenHash = hashToken(newRawToken);

    // Refresh expiration to 7 days from now
    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const hostHeader = req.get('host');
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : `${protocol}://${hostHeader}`;
    const invitationUrl = `${baseUrl}/accept-invitation?token=${newRawToken}`;

    const formattedExpiresAt = new Date(newExpiresAt).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const emailHtml = createInvitationEmailHtml({
      storeName: invData.storeName || 'Your Store',
      inviteeName: invData.name,
      role: invData.role || 'Cashier',
      invitationUrl,
      expiresAtFormatted: formattedExpiresAt,
      ownerName: invData.invitedByName || 'Store Administrator',
    });

    const senderEmail = process.env.EMAIL_FROM || 'Team Invitation <onboarding@resend.dev>';

    // Send email
    const resend = getResend();
    const resendResult = await resend.emails.send({
      from: senderEmail,
      to: [invData.invitedEmail],
      subject: `[Reminder] You're invited to join ${invData.storeName || 'the team'} as a ${invData.role}`,
      html: emailHtml,
    });

    if (resendResult.error) {
      res.status(500).json({
        error: `Failed to deliver email: ${resendResult.error.message || 'Resend provider error.'}`,
      });
      return;
    }

    // Update record
    resendRateLimits.set(invitationId, nowMs);
    await updateDoc(invDocRef, {
      tokenHash: newTokenHash,
      status: 'pending',
      expiresAt: newExpiresAt,
      lastResentAt: now.toISOString(),
      resendCount: (invData.resendCount || 0) + 1,
    });

    res.json({
      success: true,
      message: `Invitation email resent successfully to ${invData.invitedEmail}`,
      expiresAt: newExpiresAt,
    });
  } catch (error: any) {
    console.error('[Resend Invitation Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to resend invitation email.' });
  }
}

/**
 * 3. Revoke an invitation
 * POST /api/team/revoke-invite
 */
export async function handleRevokeInvitation(req: Request, res: Response): Promise<void> {
  try {
    const { invitationId, storeId } = req.body;

    if (!invitationId || !storeId) {
      res.status(400).json({ error: 'Missing invitationId or storeId.' });
      return;
    }

    const invDocRef = doc(serverDb, 'teamInvitations', invitationId);
    const invSnap = await getDoc(invDocRef);

    if (!invSnap.exists()) {
      res.status(404).json({ error: 'Invitation not found.' });
      return;
    }

    const invData = invSnap.data();
    if (invData.storeId !== storeId) {
      res.status(403).json({ error: 'Unauthorized to revoke this invitation.' });
      return;
    }

    // Mark as revoked and delete/scramble tokenHash so it can never be used
    await updateDoc(invDocRef, {
      status: 'revoked',
      revokedAt: new Date().toISOString(),
      tokenHash: `revoked_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
    });

    // Update store's businessData/team list to remove or disable the invited member
    try {
      const teamDocRef = doc(serverDb, 'users', storeId, 'businessData', 'team');
      const teamSnap = await getDoc(teamDocRef);
      if (teamSnap.exists()) {
        const d = teamSnap.data();
        const items = Array.isArray(d.items) ? d.items : [];
        const filtered = items.filter((m: any) => m.invitationId !== invitationId && m.email !== invData.invitedEmail);
        await setDoc(teamDocRef, { items: filtered }, { merge: true });
      }
    } catch (e) {
      console.warn('[Revoke Team Member Sync Warning]:', e);
    }

    res.json({ success: true, message: 'Invitation has been revoked.' });
  } catch (error: any) {
    console.error('[Revoke Invitation Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to revoke invitation.' });
  }
}

/**
 * 4. Get public invitation details by token
 * GET /api/team/invitation-details?token=...
 */
export async function handleGetInvitationDetails(req: Request, res: Response): Promise<void> {
  try {
    const rawToken = req.query.token as string;
    if (!rawToken || typeof rawToken !== 'string') {
      res.status(400).json({ valid: false, error: 'Invitation token is missing.' });
      return;
    }

    const tokenHash = hashToken(rawToken);

    // Query Firestore for this tokenHash
    const q = query(
      collection(serverDb, 'teamInvitations'),
      where('tokenHash', '==', tokenHash)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      res.status(404).json({
        valid: false,
        status: 'not_found',
        error: 'This invitation is invalid or does not exist.',
      });
      return;
    }

    const invDoc = snap.docs[0];
    const data = invDoc.data();

    // Check expiration
    const isExpired = new Date(data.expiresAt).getTime() < Date.now();
    let currentStatus = data.status;
    if (currentStatus === 'pending' && isExpired) {
      currentStatus = 'expired';
      // Mark as expired in DB
      try {
        await updateDoc(doc(serverDb, 'teamInvitations', invDoc.id), { status: 'expired' });
      } catch (e) {}
    }

    res.json({
      valid: currentStatus === 'pending',
      id: invDoc.id,
      status: currentStatus,
      storeName: data.storeName,
      invitedEmail: data.invitedEmail,
      name: data.name,
      role: data.role,
      invitedByName: data.invitedByName,
      expiresAt: data.expiresAt,
    });
  } catch (error: any) {
    console.error('[Get Invitation Details Error]:', error);
    res.status(500).json({ valid: false, error: error.message || 'Failed to check invitation details.' });
  }
}

/**
 * 5. Accept an invitation server-side
 * POST /api/team/accept-invite
 */
export async function handleAcceptInvitation(req: Request, res: Response): Promise<void> {
  try {
    const { token, userId, userEmail, userName } = req.body;

    if (!token || !userId || !userEmail) {
      res.status(400).json({ error: 'Missing required parameters (token, userId, userEmail).' });
      return;
    }

    const cleanUserEmail = userEmail.trim().toLowerCase();
    const tokenHash = hashToken(token);

    // Find invitation by tokenHash
    const q = query(
      collection(serverDb, 'teamInvitations'),
      where('tokenHash', '==', tokenHash)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      res.status(404).json({ error: 'This invitation token is invalid or has already been used.' });
      return;
    }

    const invDoc = snap.docs[0];
    const invData = invDoc.data();

    if (invData.status === 'accepted') {
      res.status(400).json({ error: 'This invitation has already been accepted.' });
      return;
    }

    if (invData.status === 'revoked') {
      res.status(400).json({ error: 'This invitation is no longer valid (revoked by store owner).' });
      return;
    }

    if (new Date(invData.expiresAt).getTime() < Date.now()) {
      res.status(400).json({ error: 'Invitation expired. Please ask the store owner to send a new invitation.' });
      return;
    }

    // Check email match: invited email MUST match the logged-in Firebase user email
    if (invData.invitedEmail.toLowerCase() !== cleanUserEmail) {
      res.status(403).json({
        error: `Email mismatch. This invitation was sent to ${invData.invitedEmail}, but you are signed in as ${cleanUserEmail}. Please sign in with the invited email address.`,
      });
      return;
    }

    const now = new Date().toISOString();

    // 1. Mark invitation as accepted and invalidate token
    await updateDoc(doc(serverDb, 'teamInvitations', invDoc.id), {
      status: 'accepted',
      acceptedAt: now,
      acceptedByUid: userId,
      tokenHash: `used_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
    });

    // 2. Add or update active team member in store's businessData/team
    const storeId = invData.storeId;
    const teamDocRef = doc(serverDb, 'users', storeId, 'businessData', 'team');
    const teamSnap = await getDoc(teamDocRef);

    let currentItems: any[] = [];
    if (teamSnap.exists()) {
      const d = teamSnap.data();
      if (Array.isArray(d.items)) currentItems = d.items;
      else if (Array.isArray(d.team)) currentItems = d.team;
    }

    const memberIdx = currentItems.findIndex(
      (m: any) => (m.email || '').toLowerCase() === cleanUserEmail || m.invitationId === invDoc.id
    );

    const activeMember = {
      id: memberIdx >= 0 ? currentItems[memberIdx].id : `team-${Date.now()}`,
      userId,
      name: userName || invData.name,
      email: cleanUserEmail,
      phone: invData.phone || '',
      role: invData.role,
      status: 'Active',
      joinedDate: now.split('T')[0],
      lastActive: now.split('T')[0],
      invitationId: invDoc.id,
      storeId,
      customPermissions: invData.customPermissions || {},
    };

    if (memberIdx >= 0) {
      currentItems[memberIdx] = activeMember;
    } else {
      currentItems.push(activeMember);
    }

    await setDoc(teamDocRef, { items: currentItems }, { merge: true });

    // 3. Update the accepted user's profile doc in Firestore to assign store and role
    try {
      const userDocRef = doc(serverDb, 'users', userId);
      await updateDoc(userDocRef, {
        storeId,
        storeName: invData.storeName,
        role: (invData.role || 'cashier').toLowerCase(),
        roleName: invData.role,
        customPermissions: invData.customPermissions || {},
        updatedAt: now,
      });
    } catch (uErr) {
      console.warn('[User Profile Update Warning]:', uErr);
    }

    res.json({
      success: true,
      message: `Successfully joined ${invData.storeName || 'the store team'} as ${invData.role}!`,
      storeId,
      storeName: invData.storeName,
      role: invData.role,
    });
  } catch (error: any) {
    console.error('[Accept Invitation Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to accept invitation.' });
  }
}

/**
 * 6. List invitations for a store owner
 * GET /api/team/invitations?storeId=...
 */
export async function handleListInvitations(req: Request, res: Response): Promise<void> {
  try {
    const storeId = req.query.storeId as string;
    if (!storeId) {
      res.status(400).json({ error: 'Missing storeId parameter.' });
      return;
    }

    const q = query(
      collection(serverDb, 'teamInvitations'),
      where('storeId', '==', storeId)
    );
    const snap = await getDocs(q);

    const now = Date.now();
    const invitations = snap.docs.map((d) => {
      const data = d.data();
      let status = data.status;
      if (status === 'pending' && new Date(data.expiresAt).getTime() < now) {
        status = 'expired';
      }
      return {
        id: d.id,
        storeId: data.storeId,
        storeName: data.storeName,
        invitedEmail: data.invitedEmail,
        name: data.name,
        phone: data.phone,
        role: data.role,
        customPermissions: data.customPermissions,
        invitedBy: data.invitedBy,
        invitedByName: data.invitedByName,
        status,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        acceptedAt: data.acceptedAt,
        revokedAt: data.revokedAt,
        resendCount: data.resendCount || 0,
        lastResentAt: data.lastResentAt,
      };
    });

    // Sort newest first
    invitations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ invitations });
  } catch (error: any) {
    console.error('[List Invitations Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch team invitations.' });
  }
}
