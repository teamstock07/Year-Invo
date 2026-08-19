import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, CheckCircle2, RefreshCw, LogOut, Send, AlertCircle, ShieldAlert, Sparkles, Inbox } from 'lucide-react';
import { LanguageSelector } from '../common/LanguageSelector';

export const EmailVerificationPrompt: React.FC = () => {
  const { user, isEmailVerified, resendEmailVerification, checkEmailVerification, logout, language, t } = useApp();
  const isBn = language === 'bn';

  const [resendLoading, setResendLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Periodic automatic check in the background every 5 seconds
  useEffect(() => {
    const autoCheckInterval = setInterval(async () => {
      try {
        await checkEmailVerification();
      } catch (err) {
        // silent auto check
      }
    }, 5000);

    return () => clearInterval(autoCheckInterval);
  }, [checkEmailVerification]);

  const handleResend = async () => {
    if (cooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setResendStatus(null);
    setCheckMessage(null);

    const res = await resendEmailVerification();
    setResendLoading(false);
    setResendStatus(res);

    if (res.success) {
      setCooldown(60); // 60 seconds cooldown
    } else if (res.cooldownRemaining) {
      setCooldown(res.cooldownRemaining);
    }
  };

  const handleCheckNow = async () => {
    if (checkLoading) return;
    setCheckLoading(true);
    setCheckMessage(null);
    setResendStatus(null);

    const isNowVerified = await checkEmailVerification();
    setCheckLoading(false);

    if (isNowVerified) {
      setCheckMessage(isBn ? 'ইমেইল সফলভাবে ভেরিফাই হয়েছে! সিস্টেমে প্রবেশ করা হচ্ছে...' : 'Email verified successfully! Entering dashboard...');
    } else {
      setCheckMessage(isBn ? 'ইমেইল এখনো ভেরিফাই হয়নি। দয়া করে আপনার ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।' : 'Email is not verified yet. Please check your inbox or spam folder and click the verification link.');
    }
  };

  const userEmail = user?.email || 'your email';

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans antialiased">
      {/* Subtle Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#ff5c01]/10 via-purple-600/5 to-transparent blur-3xl rounded-full" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[300px] bg-blue-600/5 blur-3xl rounded-full" />

      {/* Top Bar with Language Selector & Logout */}
      <div className="w-full max-w-lg flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff5c01] to-[#ff8038] flex items-center justify-center font-black text-white text-sm shadow-md shadow-[#ff5c01]/20">
            Y
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white">YearInvo</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector variant="dropdown" />
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-rose-400 transition-all cursor-pointer shadow-xs"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isBn ? 'লগআউট' : 'Sign Out'}</span>
          </button>
        </div>
      </div>

      {/* Main Verification Card */}
      <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative z-10 space-y-6">
        {/* Top Icon Badge */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-[#ff5c01]/20 to-purple-500/20 border border-[#ff5c01]/30 flex items-center justify-center mx-auto text-[#ff8038] shadow-inner relative">
            <Mail className="w-8 h-8 text-[#ff8038] animate-pulse" />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
              !
            </div>
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-extrabold uppercase tracking-wider inline-block">
              {isBn ? 'ইমেইল ভেরিফিকেশন প্রয়োজন' : 'Email Verification Required'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isBn ? 'আপনার ইমেইল ভেরিফাই করুন' : 'Verify Your Email Address'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            {isBn
              ? 'আমরা আপনার ইমেইল এড্রেসে একটি ভেরিফিকেশন লিংক পাঠিয়েছি। আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে লিংকে ক্লিক করে ভেরিফাই করুন।'
              : 'We have sent a verification email to your registered address. Please click the link inside the email to verify and unlock your full business dashboard.'}
          </p>
        </div>

        {/* Email Address Highlight Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[#ff8038]">
            <Inbox className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isBn ? 'রেজিস্টার্ড ইমেইল' : 'Registered Email Address'}
            </p>
            <p className="text-sm font-black text-white truncate font-mono">{userEmail}</p>
          </div>
        </div>

        {/* Status Alerts */}
        {resendStatus && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-medium flex items-start gap-2.5 animate-in fade-in ${
              resendStatus.success
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
            }`}
          >
            {resendStatus.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            )}
            <div className="flex-1 leading-relaxed">{resendStatus.message}</div>
          </div>
        )}

        {checkMessage && (
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
            <div className="flex-1 leading-relaxed">{checkMessage}</div>
          </div>
        )}

        {/* Quick Instructions */}
        <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-4 space-y-2 text-xs text-slate-400">
          <p className="font-bold text-slate-300 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>{isBn ? 'ইমেইল খুঁজে পাচ্ছেন না?' : "Can't find the verification email?"}</span>
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400 text-[11px] leading-relaxed">
            <li>{isBn ? 'আপনার স্প্যাম (Spam) বা জাঙ্ক (Junk) ফোল্ডারটি চেক করুন।' : 'Check your Spam or Junk folder.'}</li>
            <li>{isBn ? 'ফায়ারবেস থেকে পাঠানো ইমেইলে "Verify" বাটনে ক্লিক করুন।' : 'Click the verification link provided in the email from Firebase.'}</li>
            <li>{isBn ? 'ভেরিফাই সম্পন্ন হলে নিচের "যাচাই করুন" বাটনে ক্লিক করুন।' : 'Once verified, click "I\'ve Verified My Email — Check Again" below.'}</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Main Primary: Check Status Again */}
          <button
            type="button"
            onClick={handleCheckNow}
            disabled={checkLoading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#ff5c01] to-[#ff8038] hover:from-[#e05100] hover:to-[#e07030] text-white font-extrabold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#ff5c01]/25 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${checkLoading ? 'animate-spin' : ''}`} />
            <span>
              {checkLoading
                ? (isBn ? 'স্ট্যাটাস যাচাই করা হচ্ছে...' : 'Checking Verification Status...')
                : (isBn ? "আমি ইমেইল ভেরিফাই করেছি — যাচাই করুন" : "I've Verified My Email — Check Again")}
            </span>
          </button>

          {/* Secondary: Resend Verification Email */}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || cooldown > 0}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 border border-slate-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5 text-[#ff8038]" />
            <span>
              {resendLoading
                ? (isBn ? 'পাঠানো হচ্ছে...' : 'Sending Verification Email...')
                : cooldown > 0
                ? (isBn ? `পুনরায় পাঠাতে অপেক্ষা করুন (${cooldown}s)` : `Resend Available in ${cooldown}s`)
                : (isBn ? 'ভেরিফিকেশন ইমেইল পুনরায় পাঠান' : 'Resend Verification Email')}
            </span>
          </button>
        </div>

        {/* Bottom helper footer */}
        <div className="text-center pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>{isBn ? 'অটো-ডিটেকশন প্রতি ৫ সেকেন্ডে সক্রিয়' : 'Auto-detecting verification status...'}</span>
          <button
            onClick={() => logout()}
            className="text-[#ff8038] hover:underline font-bold cursor-pointer"
          >
            {isBn ? 'অন্য অ্যাকাউন্টে লগইন' : 'Use Different Account'}
          </button>
        </div>
      </div>
    </div>
  );
};
