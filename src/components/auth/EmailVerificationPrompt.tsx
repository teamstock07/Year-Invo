import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  RefreshCw,
  LogOut,
  Send,
  AlertCircle,
  CheckCircle2,
  Inbox,
  Clock,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { LanguageSelector } from '../common/LanguageSelector';

export const EmailVerificationPrompt: React.FC = () => {
  const {
    user,
    verifyEmailOtp,
    sendVerificationOtp,
    checkEmailVerification,
    logout,
    language,
  } = useApp();

  const isBn = language === 'bn';
  const userEmail = (user?.email || '').trim().toLowerCase();

  // 6-digit OTP state array
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Action & loading states
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60); // Initial 60s cooldown since code was sent on signup/login

  // Focus the first input box on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle single digit input
  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric characters
    const numericChar = value.replace(/[^0-9]/g, '');

    const newDigits = [...digits];

    if (!numericChar) {
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // If user typed or pasted more than 1 character directly into a box
    if (numericChar.length > 1) {
      handlePasteString(numericChar, index);
      return;
    }

    newDigits[index] = numericChar;
    setDigits(newDigits);
    setErrorMessage(null);

    // Auto-advance to next box if not on the last box
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else {
      // If 6th digit entered, auto submit if all filled
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        submitVerification(fullCode);
      }
    }
  };

  // Handle keyboard navigation (Backspace & Arrows)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current box is empty, move back and clear previous
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle pasting full 6-digit code
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    handlePasteString(pastedData, 0);
  };

  const handlePasteString = (pastedText: string, startIndex: number = 0) => {
    const cleanNumbers = pastedText.replace(/[^0-9]/g, '');
    if (!cleanNumbers) return;

    const newDigits = [...digits];
    let writeIndex = startIndex;

    for (let i = 0; i < cleanNumbers.length && writeIndex < 6; i++) {
      newDigits[writeIndex] = cleanNumbers[i];
      writeIndex++;
    }

    setDigits(newDigits);
    setErrorMessage(null);

    // Focus last populated box or next available box
    const nextFocusIndex = Math.min(writeIndex, 5);
    inputRefs.current[nextFocusIndex]?.focus();

    // If all 6 digits populated, trigger verification
    const fullCode = newDigits.join('');
    if (fullCode.length === 6) {
      submitVerification(fullCode);
    }
  };

  // Submit 6-digit OTP verification
  const submitVerification = async (codeToVerify?: string) => {
    const fullCode = codeToVerify || digits.join('');
    if (fullCode.length !== 6) {
      setErrorMessage(
        isBn
          ? 'অনুগ্রহ করে সম্পূর্ণ ৬-ডিজিটের ভেরিফিকেশন কোডটি প্রবেশ করান।'
          : 'Please enter the complete 6-digit verification code.'
      );
      return;
    }

    setVerifyLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await verifyEmailOtp(fullCode, userEmail);
    setVerifyLoading(false);

    if (result.success) {
      setSuccessMessage(
        isBn
          ? 'ইমেইল সফলভাবে ভেরিফাই হয়েছে! সিস্টেমে প্রবেশ করা হচ্ছে...'
          : 'Email verified successfully! Unlocking your dashboard...'
      );
      // Double check status to trigger app navigation
      setTimeout(() => {
        checkEmailVerification();
      }, 800);
    } else {
      setErrorMessage(
        result.message ||
          (isBn
            ? 'ভেরিফিকেশন কোডটি ভুল অথবা মেয়াদোত্তীর্ণ। আবার চেষ্টা করুন।'
            : 'Invalid or expired verification code. Please check and try again.')
      );
    }
  };

  // Resend 6-digit verification code
  const handleResendCode = async () => {
    if (cooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await sendVerificationOtp(userEmail, user?.fullName || user?.ownerName);
    setResendLoading(false);

    if (res.success) {
      setSuccessMessage(
        isBn
          ? 'নতুন ভেরিফিকেশন কোড পাঠানো হয়েছে! আপনার ইনবক্স চেক করুন।'
          : 'A new 6-digit verification code has been sent to your email.'
      );
      setCooldown(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } else {
      setErrorMessage(
        res.message ||
          (isBn
            ? 'কোড পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।'
            : 'Failed to send verification code. Please try again.')
      );
      if (res.cooldownRemaining) {
        setCooldown(res.cooldownRemaining);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans antialiased">
      {/* Background Decorative Blur Gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-b from-[#ff5c01]/15 via-purple-600/5 to-transparent blur-3xl rounded-full" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[450px] h-[350px] bg-blue-600/10 blur-3xl rounded-full" />

      {/* Top Header Bar */}
      <div className="w-full max-w-lg flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff5c01] to-[#ff8038] flex items-center justify-center font-black text-white text-base shadow-lg shadow-[#ff5c01]/30">
            Y
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white block leading-none">
              YearInvo
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">
              Cloud POS &amp; Inventory
            </span>
          </div>
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

      {/* Main OTP Verification Card */}
      <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative z-10 space-y-6">
        {/* Top Badge & Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ff5c01]/20 via-amber-500/15 to-purple-500/20 border border-[#ff5c01]/30 flex items-center justify-center mx-auto text-[#ff8038] shadow-inner relative">
            <KeyRound className="w-8 h-8 text-[#ff8038] animate-pulse" />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-md">
              <ShieldCheck className="w-3 h-3 text-white" />
            </div>
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-[#ff5c01]/10 border border-[#ff5c01]/30 text-[#ff8038] text-[11px] font-extrabold uppercase tracking-wider inline-block">
              {isBn ? 'ইমেইল ওটিপি ভেরিফিকেশন' : 'Email OTP Verification'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isBn ? '৬-ডিজিট কোডটি প্রবেশ করান' : 'Enter 6-Digit Verification Code'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            {isBn
              ? 'আপনার ইমেইলে প্রেরিত ৬-ডিজিটের ভেরিফিকেশন কোডটি নিচে লিখে আপনার অ্যাকাউন্ট সক্রিয় করুন।'
              : 'We have sent a 6-digit verification code to your email address. Enter the code below to verify your account.'}
          </p>
        </div>

        {/* Registered Email Highlighting Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[#ff8038] shrink-0">
              <Inbox className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isBn ? 'কোড পাঠানো হয়েছে' : 'Code Sent To'}
              </p>
              <p className="text-sm font-black text-white truncate font-mono">{userEmail}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="text-[11px] font-bold text-[#ff8038] hover:underline shrink-0 cursor-pointer"
          >
            {isBn ? 'ইমেইল পরিবর্তন' : 'Change Email'}
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <div className="flex-1 leading-relaxed">{successMessage}</div>
          </div>
        )}

        {/* 6-Digit OTP Inputs */}
        <div className="space-y-3">
          <label className="block text-center text-xs font-bold text-slate-300 uppercase tracking-wider">
            {isBn ? '৬-ডিজিট সিকিউরিটি কোড' : '6-Digit Security Code'}
          </label>

          <div
            className="flex items-center justify-center gap-2 sm:gap-3"
            onPaste={handlePaste}
          >
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={verifyLoading}
                className={`w-11 h-14 sm:w-14 sm:h-16 text-center text-2xl sm:text-3xl font-black font-mono rounded-2xl bg-slate-950 border transition-all shadow-inner focus:outline-none ${
                  digit
                    ? 'border-[#ff5c01] text-white bg-slate-900/80 shadow-[#ff5c01]/10 ring-2 ring-[#ff5c01]/20'
                    : 'border-slate-800 text-slate-100 hover:border-slate-700 focus:border-[#ff5c01] focus:ring-2 focus:ring-[#ff5c01]/30'
                } disabled:opacity-50`}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-semibold pt-1">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {isBn ? 'কোডের মেয়াদ ১০ মিনিট' : 'Code expires in 10 minutes'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Primary: Verify Code */}
          <button
            type="button"
            onClick={() => submitVerification()}
            disabled={verifyLoading || digits.join('').length !== 6}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#ff5c01] to-[#ff8038] hover:from-[#e05100] hover:to-[#e07030] text-white font-extrabold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#ff5c01]/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShieldCheck className={`w-4 h-4 ${verifyLoading ? 'animate-spin' : ''}`} />
            <span>
              {verifyLoading
                ? (isBn ? 'কোড যাচাই করা হচ্ছে...' : 'Verifying Code...')
                : (isBn ? 'কোড যাচাই করে ড্যাশবোর্ডে প্রবেশ করুন' : 'Verify Code & Unlock Dashboard')}
            </span>
          </button>

          {/* Secondary: Resend Verification Code */}
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendLoading || cooldown > 0}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 border border-slate-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5 text-[#ff8038]" />
            <span>
              {resendLoading
                ? (isBn ? 'পাঠানো হচ্ছে...' : 'Sending Code...')
                : cooldown > 0
                ? (isBn ? `কোড পুনরায় পাঠাতে অপেক্ষা করুন (${cooldown}s)` : `Resend Code in ${cooldown}s`)
                : (isBn ? 'ভেরিফিকেশন কোড পুনরায় পাঠান' : 'Resend Verification Code')}
            </span>
          </button>
        </div>

        {/* Footer Notes */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#ff8038]" />
            {isBn ? 'স্প্যাম ফোল্ডার চেক করুন' : 'Check Spam folder if not in Inbox'}
          </span>
          <button
            onClick={() => logout()}
            className="text-slate-400 hover:text-rose-400 font-bold cursor-pointer transition-colors"
          >
            {isBn ? 'লগআউট' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
};
