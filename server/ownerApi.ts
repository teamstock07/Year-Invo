import { Request, Response } from 'express';
import {
  serverDb,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
} from './firebaseServer';
import { isPlatformAdmin } from './subscriptionServer';

/**
 * Server-side helper to verify if the requesting user is an authorized Platform Admin
 */
async function verifyPlatformAdmin(adminUid?: string, adminEmail?: string): Promise<{ authorized: boolean; reason?: string }> {
  const cleanEmail = (adminEmail || '').trim().toLowerCase();
  
  if (cleanEmail === 'teamstock07@gmail.com') {
    return { authorized: true };
  }

  if (!adminUid) {
    return { authorized: false, reason: 'Authentication required. No user ID provided.' };
  }

  try {
    const userRef = doc(serverDb, 'users', adminUid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { authorized: false, reason: 'User account not found.' };
    }

    const userData = userSnap.data();
    const docEmail = (userData?.email || '').trim().toLowerCase();
    const docRole = (userData?.role || '').trim().toLowerCase();

    if (docEmail === 'teamstock07@gmail.com' || docRole === 'platformowner' || docRole === 'superadmin') {
      return { authorized: true };
    }

    return { authorized: false, reason: 'Access Denied: You do not have Platform Owner privileges.' };
  } catch (error) {
    console.error('[OwnerApi] Error verifying platform admin:', error);
    return { authorized: false, reason: 'Database error during authorization check.' };
  }
}

/**
 * List all users - strictly platform admin only
 */
export async function handleOwnerListUsers(req: Request, res: Response) {
  try {
    const { adminUid, adminEmail } = req.body;
    const authCheck = await verifyPlatformAdmin(adminUid, adminEmail);
    if (!authCheck.authorized) {
      return res.status(403).json({ error: authCheck.reason || 'Forbidden' });
    }

    const usersCol = collection(serverDb, 'users');
    const snapshot = await getDocs(usersCol);
    const users: any[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      users.push({
        id: docSnap.id,
        ...data,
      });
    });

    return res.json({ success: true, users });
  } catch (error: any) {
    console.error('[OwnerApi] List users failed:', error);
    return res.status(500).json({ error: error.message || 'Failed to list users' });
  }
}

/**
 * Update a user's subscription plan - strictly platform admin only
 */
export async function handleOwnerUpdateUserPlan(req: Request, res: Response) {
  try {
    const { adminUid, adminEmail, targetUserId, newPlan, billingPeriod } = req.body;
    const authCheck = await verifyPlatformAdmin(adminUid, adminEmail);
    if (!authCheck.authorized) {
      return res.status(403).json({ error: authCheck.reason || 'Forbidden' });
    }

    if (!targetUserId || !newPlan) {
      return res.status(400).json({ error: 'targetUserId and newPlan are required.' });
    }

    const startDate = new Date().toISOString();
    let expiryDate: string | null = null;
    if (newPlan !== 'Lifetime' && newPlan !== 'Free') {
      const d = new Date();
      if (billingPeriod === 'yearly') d.setFullYear(d.getFullYear() + 1);
      else if (billingPeriod === 'six_months') d.setMonth(d.getMonth() + 6);
      else if (billingPeriod === 'five_year') d.setFullYear(d.getFullYear() + 5);
      else d.setMonth(d.getMonth() + 1);
      expiryDate = d.toISOString();
    }

    const userRef = doc(serverDb, 'users', targetUserId);
    const updatePayload: Record<string, any> = {
      subscriptionPlan: newPlan,
      subscription: newPlan.toLowerCase(),
      subscriptionStatus: 'active',
      startDate,
      billingPeriod: billingPeriod || 'monthly',
      updatedAt: new Date().toISOString(),
    };
    if (expiryDate) {
      updatePayload.expiryDate = expiryDate;
    }

    await setDoc(userRef, updatePayload, { merge: true });

    return res.json({
      success: true,
      message: `User ${targetUserId} plan successfully updated to ${newPlan}.`,
      data: updatePayload,
    });
  } catch (error: any) {
    console.error('[OwnerApi] Update user plan failed:', error);
    return res.status(500).json({ error: error.message || 'Failed to update user plan' });
  }
}

/**
 * Approve subscription request - strictly platform admin only
 */
export async function handleOwnerApproveSubscription(req: Request, res: Response) {
  try {
    const { adminUid, adminEmail, requestId } = req.body;
    const authCheck = await verifyPlatformAdmin(adminUid, adminEmail);
    if (!authCheck.authorized) {
      return res.status(403).json({ error: authCheck.reason || 'Forbidden' });
    }

    if (!requestId) {
      return res.status(400).json({ error: 'requestId is required.' });
    }

    const reqRef = doc(serverDb, 'subscriptionRequests', requestId);
    const reqSnap = await getDoc(reqRef);
    if (!reqSnap.exists()) {
      return res.status(404).json({ error: 'Subscription request document not found.' });
    }

    const reqData = reqSnap.data();
    const targetUserId = reqData.userId || reqData.uid;
    const requestedPlan = reqData.requestedPlan || reqData.plan || 'Pro';
    const billingPeriod = reqData.billingCycle || reqData.billingPeriod || 'monthly';
    const startDate = new Date().toISOString();

    let expiryDate: string | null = null;
    if (requestedPlan !== 'Lifetime' && requestedPlan !== 'Free') {
      const d = new Date();
      if (billingPeriod === 'yearly') d.setFullYear(d.getFullYear() + 1);
      else if (billingPeriod === 'six_months') d.setMonth(d.getMonth() + 6);
      else if (billingPeriod === 'five_year') d.setFullYear(d.getFullYear() + 5);
      else d.setMonth(d.getMonth() + 1);
      expiryDate = d.toISOString();
    }

    // 1. Update subscription request status
    await updateDoc(reqRef, {
      status: 'approved',
      reviewedDate: startDate,
      approvedBy: adminEmail || 'Platform Admin',
      updatedAt: startDate,
    });

    // 2. Update target user document
    if (targetUserId) {
      const userRef = doc(serverDb, 'users', targetUserId);
      const userUpdate: Record<string, any> = {
        subscriptionPlan: requestedPlan,
        subscription: requestedPlan.toLowerCase(),
        subscriptionStatus: 'active',
        startDate,
        billingPeriod,
        updatedAt: startDate,
      };
      if (expiryDate) {
        userUpdate.expiryDate = expiryDate;
      }
      await setDoc(userRef, userUpdate, { merge: true });
    }

    return res.json({
      success: true,
      message: `Subscription request ${requestId} approved successfully.`,
      plan: requestedPlan,
    });
  } catch (error: any) {
    console.error('[OwnerApi] Approve subscription request failed:', error);
    return res.status(500).json({ error: error.message || 'Failed to approve subscription request' });
  }
}

/**
 * Reject subscription request - strictly platform admin only
 */
export async function handleOwnerRejectSubscription(req: Request, res: Response) {
  try {
    const { adminUid, adminEmail, requestId, reason } = req.body;
    const authCheck = await verifyPlatformAdmin(adminUid, adminEmail);
    if (!authCheck.authorized) {
      return res.status(403).json({ error: authCheck.reason || 'Forbidden' });
    }

    if (!requestId) {
      return res.status(400).json({ error: 'requestId is required.' });
    }

    const reqRef = doc(serverDb, 'subscriptionRequests', requestId);
    const reqSnap = await getDoc(reqRef);
    if (!reqSnap.exists()) {
      return res.status(404).json({ error: 'Subscription request document not found.' });
    }

    const reqData = reqSnap.data();
    const targetUserId = reqData.userId || reqData.uid;

    await updateDoc(reqRef, {
      status: 'rejected',
      reviewedDate: new Date().toISOString(),
      rejectedBy: adminEmail || 'Platform Admin',
      rejectionReason: reason || 'Payment details could not be verified.',
      updatedAt: new Date().toISOString(),
    });

    if (targetUserId) {
      const userRef = doc(serverDb, 'users', targetUserId);
      await setDoc(
        userRef,
        {
          subscriptionStatus: 'active',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    return res.json({
      success: true,
      message: `Subscription request ${requestId} rejected.`,
    });
  } catch (error: any) {
    console.error('[OwnerApi] Reject subscription request failed:', error);
    return res.status(500).json({ error: error.message || 'Failed to reject subscription request' });
  }
}

/**
 * Update user role - strictly platform admin only
 */
export async function handleOwnerUpdateUserRole(req: Request, res: Response) {
  try {
    const { adminUid, adminEmail, targetUserId, newRole } = req.body;
    const authCheck = await verifyPlatformAdmin(adminUid, adminEmail);
    if (!authCheck.authorized) {
      return res.status(403).json({ error: authCheck.reason || 'Forbidden' });
    }

    if (!targetUserId || !newRole) {
      return res.status(400).json({ error: 'targetUserId and newRole are required.' });
    }

    const userRef = doc(serverDb, 'users', targetUserId);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: new Date().toISOString(),
    });

    return res.json({
      success: true,
      message: `User ${targetUserId} role updated to ${newRole}.`,
    });
  } catch (error: any) {
    console.error('[OwnerApi] Update user role failed:', error);
    return res.status(500).json({ error: error.message || 'Failed to update user role' });
  }
}
