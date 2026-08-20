import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  Mail,
  User,
  ArrowRight,
  Store,
  Loader2,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface InvitationDetails {
  valid: boolean;
  id?: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked' | 'not_found';
  storeName?: string;
  invitedEmail?: string;
  name?: string;
  role?: string;
  invitedByName?: string;
  expiresAt?: string;
  error?: string;
}

interface AcceptInvitationViewProps {
  token: string;
  onSuccess?: () => void;
}

export const AcceptInvitationView: React.FC<AcceptInvitationViewProps> = ({ token, onSuccess }) => {
  const { user, logout, refreshUserData } = useApp();

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auth form state for unauthenticated users
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Accept action state
  const [accepting, setAccepting] = useState(false);
  const [acceptedSuccess, setAcceptedSuccess] = useState(false);

  // 1. Fetch invitation details on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchDetails() {
      try {
        setLoading(true);
        setErrorMsg(null);
        const res = await fetch(`/api/team/invitation-details?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (isMounted) {
          setInvitation(data);
          if (data.invitedEmail) {
            setAuthEmail(data.invitedEmail);
          }
          if (data.name) {
            setAuthName(data.name);
          }
          if (!data.valid) {
            if (data.status === 'expired') {
              setErrorMsg('Invitation expired. Please ask the store owner to send a new invitation.');
            } else if (data.status === 'accepted') {
              setErrorMsg('This invitation has already been used.');
            } else if (data.status === 'revoked') {
              setErrorMsg('This invitation is no longer valid.');
            } else {
              setErrorMsg(data.error || 'This invitation is invalid or does not exist.');
            }
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || 'Failed to connect to server. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (token) {
      fetchDetails();
    } else {
      setLoading(false);
      setErrorMsg('Invitation token is missing from the link.');
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  // 2. Handle direct acceptance when user is authenticated
  const handleAccept = async () => {
    if (!user || !user.email) return;

    if (invitation?.invitedEmail && user.email.trim().toLowerCase() !== invitation.invitedEmail.trim().toLowerCase()) {
      setAuthError(`Email mismatch. Please sign in with ${invitation.invitedEmail}`);
      return;
    }

    setAccepting(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/team/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          userId: user.id,
          userEmail: user.email,
          userName: user.name || invitation?.name || '',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to accept invitation.');
      }

      setAcceptedSuccess(true);
      if (refreshUserData) {
        await refreshUserData();
      }
      setTimeout(() => {
        // Clear token from URL and refresh into main app
        window.history.pushState({}, '', '/');
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = '/';
        }
      }, 2000);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to accept invitation.');
    } finally {
      setAccepting(false);
    }
  };

  // 3. Handle Firebase signup
  const handleSignupAndAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    if (authPassword !== authConfirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setAuthLoading(true);

    try {
      const cleanEmail = (invitation?.invitedEmail || authEmail).trim().toLowerCase();
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, authPassword);
      const firebaseUser = userCredential.user;

      const cleanName = (authName || invitation?.name || 'Team Member').trim();
      try {
        await updateProfile(firebaseUser, { displayName: cleanName });
      } catch (pErr) {}

      // Accept invitation immediately with the new user credentials
      const res = await fetch('/api/team/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          userId: firebaseUser.uid,
          userEmail: cleanEmail,
          userName: cleanName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Account created, but failed to link invitation.');
      }

      setAcceptedSuccess(true);
      setTimeout(() => {
        window.history.pushState({}, '', '/');
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      let msg = err.message || 'Signup failed.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please switch to the "Sign In" tab below.';
        setAuthMode('login');
      }
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // 4. Handle Firebase login
  const handleLoginAndAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const cleanEmail = (invitation?.invitedEmail || authEmail).trim().toLowerCase();
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, authPassword);
      const firebaseUser = userCredential.user;

      // Accept invitation immediately
      const res = await fetch('/api/team/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          userId: firebaseUser.uid,
          userEmail: cleanEmail,
          userName: firebaseUser.displayName || invitation?.name || '',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Signed in, but failed to link invitation.');
      }

      setAcceptedSuccess(true);
      setTimeout(() => {
        window.history.pushState({}, '', '/');
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      let msg = err.message || 'Login failed.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email. Please switch to "Create Account".';
        setAuthMode('signup');
      }
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-200">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <Loader2 className="w-10 h-10 text-[#ff5c01] animate-spin mx-auto" />
          <h2 className="text-lg font-bold text-white">Validating Team Invitation...</h2>
          <p className="text-xs text-slate-400">Please wait while we verify your invitation details securely.</p>
        </div>
      </div>
    );
  }

  // Accepted Success Screen
  if (acceptedSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-200">
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Welcome to the Team!
            </span>
            <h2 className="text-2xl font-black text-white mt-3">Invitation Accepted</h2>
            <p className="text-xs text-slate-400 mt-2">
              You are now an active team member at <strong className="text-white">{invitation?.storeName}</strong> as a <strong className="text-[#ff5c01]">{invitation?.role}</strong>.
            </p>
          </div>
          <div className="pt-2">
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-semibold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirecting you to your store dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invalid / Expired / Revoked Screen
  if (!invitation?.valid || errorMsg) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-200">
        <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
            <AlertCircle className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Invitation Notice</h2>
            <p className="text-xs text-rose-300/90 mt-2 leading-relaxed">
              {errorMsg || 'This invitation is not valid.'}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                window.history.pushState({}, '', '/');
                window.location.href = '/';
              }}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Return to Login / Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Logged-in user is different from invited email
  const isEmailMismatch = Boolean(
    user &&
    user.email &&
    invitation.invitedEmail &&
    user.email.trim().toLowerCase() !== invitation.invitedEmail.trim().toLowerCase()
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-200">
      <div className="max-w-xl w-full space-y-6">
        
        {/* Main Invitation Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          {/* Header Accent */}
          <div className="h-2 bg-gradient-to-r from-[#ff5c01] to-amber-500" />

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header info */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff5c01]/15 text-[#ff5c01] border border-[#ff5c01]/30 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Team Invitation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Join {invitation.storeName || 'Store Team'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                <strong className="text-slate-200">{invitation.invitedByName || 'The Store Owner'}</strong> has invited you to join the team as a <strong className="text-[#ff5c01] capitalize">{invitation.role}</strong>.
              </p>
            </div>

            {/* Invitation Details Summary Card */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-700/50 pb-2.5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-slate-400" />
                  <span>Business / Store</span>
                </span>
                <span className="font-bold text-white">{invitation.storeName}</span>
              </div>

              <div className="flex items-center justify-between text-xs border-b border-slate-700/50 pb-2.5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#ff5c01]" />
                  <span>Assigned Role</span>
                </span>
                <span className="font-bold text-[#ff5c01] bg-[#ff5c01]/10 px-2.5 py-0.5 rounded-lg border border-[#ff5c01]/20">
                  {invitation.role}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs border-b border-slate-700/50 pb-2.5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>Invited Email</span>
                </span>
                <span className="font-mono text-slate-200">{invitation.invitedEmail}</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Valid Until</span>
                </span>
                <span className="text-amber-400 font-semibold">
                  {new Date(invitation.expiresAt || '').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Error Message if any */}
            {authError && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* SECTION A: User is already logged in with matching email */}
            {user && !isEmailMismatch && (
              <div className="space-y-4 pt-2">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shrink-0 font-bold">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">Signed in as {user.name || user.email}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Verified Match
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-[#ff5c01] to-amber-500 hover:from-[#e05100] hover:to-amber-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-[#ff5c01]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {accepting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Joining Store Team...</span>
                    </>
                  ) : (
                    <>
                      <span>Accept Invitation &amp; Join Team</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* SECTION B: User is logged in with MISMATCHING email */}
            {user && isEmailMismatch && (
              <div className="space-y-4 pt-2">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Different Account Signed In</span>
                  </p>
                  <p className="text-xs text-slate-300">
                    You are currently signed in as <strong className="text-white">{user.email}</strong>. However, this invitation is specifically addressed to <strong className="text-amber-300">{invitation.invitedEmail}</strong>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                  }}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out &amp; Continue with {invitation.invitedEmail}</span>
                </button>
              </div>
            )}

            {/* SECTION C: User is not logged in -> Sign Up or Log In Form */}
            {!user && (
              <div className="space-y-4 pt-2">
                {/* Tabs */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-800/80 rounded-xl border border-slate-700/80">
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      authMode === 'signup'
                        ? 'bg-[#ff5c01] text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      authMode === 'login'
                        ? 'bg-[#ff5c01] text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Sign In
                  </button>
                </div>

                {authMode === 'signup' ? (
                  <form onSubmit={handleSignupAndAccept} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder="Your Full Name"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5c01]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="email"
                          disabled
                          value={invitation.invitedEmail || authEmail}
                          className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-300 cursor-not-allowed opacity-90"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Locked to invitation recipient email.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5c01]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={authConfirmPassword}
                            onChange={(e) => setAuthConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5c01]"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#ff5c01] to-amber-500 hover:from-[#e05100] hover:to-amber-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-[#ff5c01]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {authLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating Account &amp; Joining...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account &amp; Join Team</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleLoginAndAccept} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="email"
                          disabled
                          value={invitation.invitedEmail || authEmail}
                          className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-300 cursor-not-allowed opacity-90"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="password"
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Your account password"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5c01]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#ff5c01] to-amber-500 hover:from-[#e05100] hover:to-amber-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-[#ff5c01]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {authLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Signing In &amp; Joining...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In &amp; Join Team</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-500">
          Powered by TeamStock Cloud Management. Secure single-use invitation.
        </p>
      </div>
    </div>
  );
};
