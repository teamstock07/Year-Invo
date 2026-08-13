import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LandingPage } from '../landing/LandingPage';
import { LanguageSelector } from '../common/LanguageSelector';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Building2,
  MapPin,
  Phone,
  Tag,
  X,
  ShoppingCart,
  Package,
  CreditCard,
  QrCode,
  TrendingUp,
  BarChart3,
  Sparkles,
  Zap,
  Store,
  Layers,
  Check,
  Crown,
  Eye,
  EyeOff,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, signup, sendFirebasePasswordReset, settings, language, setLanguage, t } = useApp();

  const [mode, setMode] = useState<'landing' | 'login' | 'signup' | 'forgot'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Signup form state matching user's requested specification
  const [yourName, setYourName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [storeType, setStoreType] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [affiliateCode, setAffiliateCode] = useState('');

  const [error, setError] = useState('');

  const isBn = language === 'bn';

  const [authLoading, setAuthLoading] = useState(false);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotMsg('');

    if (!forgotEmail.trim()) {
      setForgotError(isBn ? 'অনুগ্রহ করে ইমেইল এড্রেস প্রদান করুন' : 'Please enter your registered email address');
      return;
    }

    setForgotLoading(true);
    const res = await sendFirebasePasswordReset(forgotEmail);
    setForgotLoading(false);

    if (res.success) {
      setForgotMsg(res.message || (isBn ? 'পাসওয়ার্ড রিসেট ইমেইল সফলভাবে পাঠানো হয়েছে।' : 'Password reset link sent to your email.'));
    } else {
      setForgotError(res.message || 'Failed to send password reset email.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError(isBn ? 'ইমেইল এবং পাসওয়ার্ড প্রদান করুন' : 'Please enter email and password');
      return;
    }
    setAuthLoading(true);
    const res = await login(email, password);
    setAuthLoading(false);
    if (!res.success) {
      setError(res.message || 'Failed to sign in.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!yourName || !storeName || !storeType || !email || !password || !storePhone || !storeAddress) {
      setError(isBn ? 'অনুগ্রহ করে সকল তারকাচিহ্নিত (*) ঘরগুলো পূরণ করুন' : 'Please fill in all required fields marked with *');
      return;
    }

    setAuthLoading(true);
    const res = await signup({
      ownerName: yourName,
      brandName: storeName,
      email,
      password,
      mobile: storePhone,
      businessType: storeType,
      storeAddress: storeAddress,
      affiliateCode: affiliateCode.trim() || undefined,
      affiliateProgram: affiliateCode.trim() ? 'Mazbi Affiliate Program' : undefined,
    });
    setAuthLoading(false);

    if (!res.success) {
      setError(res.message || 'Failed to create account.');
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Full Professional Landing Page Experience */}
      <LandingPage
        onOpenLogin={() => {
          setError('');
          setMode('login');
        }}
        onOpenSignup={() => {
          setError('');
          setMode('signup');
        }}
      />

      {/* ================= AUTH MODAL OVERLAY FOR SIGNUP / LOGIN ================= */}
      {mode !== 'landing' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-xl relative my-auto">
            {mode === 'login' ? (
              /* LOGIN MODE FORM */
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                <div className="absolute top-6 right-6 flex items-center gap-2">
                  <LanguageSelector variant="dropdown" />
                  <button
                    type="button"
                    onClick={() => setMode('landing')}
                    className="p-2 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer shadow-xs"
                    title="Close / Back to Dashboard Overview"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-center mb-6 pr-16 pt-2">
                  <h2 className="text-2xl font-black text-white">{t('landing.signIn') || t('login')}</h2>
                  <p className="text-xs text-slate-400 mt-1">{t('landing.heroSubtitle') || 'Enter your login credentials to manage your store'}</p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="store@example.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-300">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotError('');
                          setForgotMsg('');
                          setForgotEmail(email);
                          setMode('forgot');
                        }}
                        className="text-[11px] font-medium text-[#a78bfa] hover:underline cursor-pointer"
                      >
                        {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                        className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-200 focus:outline-none transition-colors cursor-pointer"
                        title={showLoginPassword ? 'Hide password' : 'Show password'}
                        aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-[#7C3AED] hover:bg-[#6d28d9] text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#7C3AED]/20 mt-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{authLoading ? (isBn ? 'লগইন হচ্ছে...' : 'Signing In...') : (isBn ? 'স্টোরে প্রবেশ করুন' : 'Sign In to Store')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setError('');
                      setMode('signup');
                    }}
                    className="text-xs font-bold text-[#a78bfa] hover:underline"
                  >
                    Need a new account? Sign Up Here
                  </button>
                </div>
              </div>
            ) : mode === 'forgot' ? (
              /* FORGOT PASSWORD MODE FORM */
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                <button
                  type="button"
                  onClick={() => setMode('landing')}
                  className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer shadow-xs"
                  title="Close / Back to Overview"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6 pr-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-[#a78bfa] flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6 text-[#a78bfa]" />
                  </div>
                  <h2 className="text-2xl font-black text-white">
                    {isBn ? 'পাসওয়ার্ড রিসেট করুন' : 'Reset Your Password'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {isBn
                      ? 'আপনার রেজিস্টার্ড ইমেইল এড্রেস লিখুন। আমরা ফায়ারবেস পাসওয়ার্ড রিসেট লিংক পাঠাবো।'
                      : 'Enter your registered email address to receive a password reset link via Firebase.'}
                  </p>
                </div>

                {forgotError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                    {forgotError}
                  </div>
                )}

                {forgotMsg && (
                  <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{forgotMsg}</span>
                  </div>
                )}

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {isBn ? 'ইমেইল এড্রেস *' : 'Registered Email Address *'}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 bg-[#7C3AED] hover:bg-[#6d28d9] text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#7C3AED]/20 mt-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{forgotLoading ? (isBn ? 'পাঠানো হচ্ছে...' : 'Sending...') : (isBn ? 'রিসেট লিংক পাঠান' : 'Send Password Reset Email')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setMode('login');
                    }}
                    className="text-xs font-bold text-[#a78bfa] hover:underline cursor-pointer"
                  >
                    {isBn ? '← লগইন পেজে ফিরে যান' : '← Back to Sign In'}
                  </button>
                </div>
              </div>
            ) : (
              /* SIGNUP MODE FORM - DIRECT ENTRY TO MAIN INTERFACE UPON SIGNUP */
              <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
                {/* Language Selector & Close Button */}
                <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
                  <LanguageSelector variant="dropdown" />
                  <button
                    type="button"
                    onClick={() => setMode('landing')}
                    className="p-2 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer shadow-xs"
                    title="Close signup / Back to Dashboard Overview"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Top Pill Badge */}
                <div>
                  <span className="px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800/80 text-[#a78bfa] text-[11px] font-extrabold uppercase tracking-wider inline-block">
                    FREE STARTER PLAN
                  </span>
                </div>

                {/* Header Title & Subtitle */}
                <div className="pr-8">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Create your store
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                    Set up POS, invoices, and inventory in minutes. Choose your store type — we'll tailor the tools for you.
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-400 text-xs font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  {/* 1. Your Name * */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={yourName}
                      onChange={(e) => setYourName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5c01] focus:ring-2 focus:ring-[#ff5c01]/20 transition-all font-medium"
                      required
                    />
                  </div>

                  {/* 2. Store Name * & 3. Store Type * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Store Name *
                      </label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="e.g. Downtown Mart"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5c01] focus:ring-2 focus:ring-[#ff5c01]/20 transition-all font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Select Your Store Type *
                      </label>
                      <select
                        value={storeType}
                        onChange={(e) => setStoreType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff5c01] focus:ring-2 focus:ring-[#ff5c01]/20 transition-all font-medium cursor-pointer"
                        required
                      >
                        <option value="" disabled>Select store type</option>
                        <option value="General Retail & Grocery">Retail Store & POS Counter</option>
                        <option value="Supermarket & Departmental">Supermarket & Grocery</option>
                        <option value="Pharmacy & Healthcare">Pharmacy & Healthcare Store</option>
                        <option value="Electronics & Mobile">Electronics & Mobile Shop</option>
                        <option value="Clothing & Fashion Boutique">Fashion & Clothing Boutique</option>
                        <option value="Restaurant & Cafe">Restaurant, Cafe & Food Court</option>
                        <option value="Hardware & Sanitary">Hardware & Construction Supplies</option>
                        <option value="Wholesale & Distribution">Wholesale & Distribution</option>
                        <option value="General Service Store">General Service & Other Business</option>
                      </select>
                    </div>
                  </div>

                  {/* 4. Email * & 5. Password * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5c01] focus:ring-2 focus:ring-[#ff5c01]/20 transition-all font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5c01] focus:ring-2 focus:ring-[#ff5c01]/20 transition-all font-medium"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword((prev) => !prev)}
                          className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-200 focus:outline-none transition-colors cursor-pointer"
                          title={showSignupPassword ? 'Hide password' : 'Show password'}
                          aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                        >
                          {showSignupPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 6. Store Phone Number * & 7. Store Address * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Store Phone Number *
                      </label>
                      <input
                        type="text"
                        value={storePhone}
                        onChange={(e) => setStorePhone(e.target.value)}
                        placeholder="+880 1XXX-XXXXXX"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5c01] focus:ring-2 focus:ring-[#ff5c01]/20 transition-all font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Store Address *
                      </label>
                      <input
                        type="text"
                        value={storeAddress}
                        onChange={(e) => setStoreAddress(e.target.value)}
                        placeholder="123 Commercial Ave, City"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5c01] focus:ring-2 focus:ring-[#ff5c01]/20 transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* 8. Affiliate Code (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Affiliate Code <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={affiliateCode}
                      onChange={(e) => setAffiliateCode(e.target.value)}
                      placeholder="e.g. MAZBI123"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5c01] focus:ring-2 focus:ring-[#ff5c01]/20 transition-all font-medium"
                    />
                    {affiliateCode.trim().length > 0 && (
                      <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Will automatically link your account to the Mazbi Affiliate Program</span>
                      </p>
                    )}
                  </div>

                  {/* Action Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3.5 bg-[#ff5c01] hover:bg-[#e05100] text-white font-black rounded-2xl text-sm transition-all text-center shadow-lg shadow-[#ff5c01]/25 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <span>{authLoading ? (isBn ? 'স্টোর তৈরি হচ্ছে...' : 'Creating Account in Firebase...') : (isBn ? 'নতুন দোকান তৈরি করুন' : 'Create Your Store & Access Dashboard')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setMode('login');
                      }}
                      className="text-xs font-bold text-[#ff5c01] hover:underline cursor-pointer"
                    >
                      Already registered? Log In to existing account
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 space-y-1 mt-auto">
        <p>YearInvo by Year Media • Modern POS &amp; Inventory Management System</p>
        <p>© {new Date().getFullYear()} All rights reserved. Secure Cloud Platform.</p>
      </footer>
    </div>
  );
};

