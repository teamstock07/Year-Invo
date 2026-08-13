import React from 'react';

// 1. bKash Logo (bKash Pink #E2136E + Origami Bird)
export const BkashLogo: React.FC<{ className?: string; showText?: boolean }> = ({
  className = 'h-7',
  showText = true,
}) => (
  <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#E2136E] text-white font-extrabold shadow-sm ${className}`}>
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 75L12 35L48 20L40 50L88 15L75 55L40 50L30 85L20 75Z"
        fill="white"
      />
      <path
        d="M40 50L88 15L65 72L40 50Z"
        fill="white"
        fillOpacity="0.85"
      />
    </svg>
    {showText && (
      <div className="flex flex-col leading-none">
        <span className="text-[12px] font-black tracking-tight">bKash</span>
        <span className="text-[8px] font-bold opacity-90">বিকাশ</span>
      </div>
    )}
  </div>
);

// 2. Nagad Logo (Nagad Orange/Red #ED1C24 / #F7931E + Swirl Runner)
export const NagadLogo: React.FC<{ className?: string; showText?: boolean }> = ({
  className = 'h-7',
  showText = true,
}) => (
  <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#ED1C24] to-[#F7931E] text-white font-extrabold shadow-sm ${className}`}>
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="42" stroke="white" strokeWidth="8" fill="none" />
      <path
        d="M32 50C32 40 40 32 50 32C60 32 68 40 68 50C68 60 60 68 50 68"
        stroke="white"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <circle cx="50" cy="50" r="9" fill="white" />
    </svg>
    {showText && (
      <div className="flex flex-col leading-none">
        <span className="text-[12px] font-black tracking-tight">Nagad</span>
        <span className="text-[8px] font-bold opacity-90">নগদ</span>
      </div>
    )}
  </div>
);

// 3. Rocket DBBL Logo (Rocket Purple #8C3494 + Paper Airplane)
export const RocketLogo: React.FC<{ className?: string; showText?: boolean }> = ({
  className = 'h-7',
  showText = true,
}) => (
  <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#8C3494] text-white font-extrabold shadow-sm ${className}`}>
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15 80L88 15L55 85L42 58L15 80Z"
        fill="white"
      />
      <path
        d="M88 15L42 58L50 32L88 15Z"
        fill="white"
        fillOpacity="0.75"
      />
    </svg>
    {showText && (
      <div className="flex flex-col leading-none">
        <span className="text-[12px] font-black tracking-tight">Rocket</span>
        <span className="text-[8px] font-bold opacity-90">রকেট DBBL</span>
      </div>
    )}
  </div>
);

// 4. Bank Transfer Logo (Bank Blue #1E40AF + Bank Facade & Arrows)
export const BankTransferLogo: React.FC<{ className?: string; showText?: boolean }> = ({
  className = 'h-7',
  showText = true,
}) => (
  <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#1E40AF] text-white font-extrabold shadow-sm ${className}`}>
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M3 10h18" />
      <path d="M5 6l7-3 7 3" />
      <path d="M4 10v11" />
      <path d="M20 10v11" />
      <path d="M8 14v3" />
      <path d="M12 14v3" />
      <path d="M16 14v3" />
    </svg>
    {showText && (
      <div className="flex flex-col leading-none">
        <span className="text-[12px] font-black tracking-tight">Bank Wire</span>
        <span className="text-[8px] font-bold opacity-90">ব্যাংক ট্রান্সফার</span>
      </div>
    )}
  </div>
);

// International PayPal & Cards
export const PayPalLogoComponent: React.FC = () => (
  <svg className="h-5 w-auto" viewBox="0 0 124 33" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M46.211 6.749h-6.839a.95.95 0 00-.939.803l-4.225 26.732a.571.571 0 00.564.66h3.407c.471 0 .873-.346.947-.811l1.196-7.58a.95.95 0 01.939-.803h2.383c4.78 0 7.502-2.316 8.232-6.953.33-2.091-.122-3.693-1.303-4.764-1.233-1.121-3.176-1.684-5.562-1.684zm.824 6.726c-.41 2.684-2.476 2.684-4.482 2.684h-1.258l1.002-6.347h1.28c1.328 0 2.531 0 3.125.69.412.48.514 1.256.333 2.973z" fill="#003087"/>
    <path d="M68.512 13.977h-3.41c-.413 0-.77.291-.845.698l-.364 2.052h-.132c-.588-1.229-2.28-2.001-4.271-2.001-4.047 0-7.391 3.064-8.064 7.327-.376 2.384.148 4.618 1.438 6.136 1.206 1.419 2.923 2.062 4.836 2.062 3.447 0 5.344-2.186 5.344-2.186l-.37 2.278a.571.571 0 00.564.66h3.197a.95.95 0 00.939-.803l2.253-14.288a.57.57 0 00-.565-.635zm-5.787 7.078c-.347 2.115-2.039 3.529-4.144 3.529-1.077 0-1.921-.366-2.438-1.058-.512-.686-.68-1.637-.472-2.956.326-2.072 2.023-3.529 4.101-3.529 1.054 0 1.908.371 2.434 1.07.525.698.694 1.666.519 2.944z" fill="#003087"/>
    <path d="M89.262 13.977h-3.441a.95.95 0 00-.939.803l-1.396 8.835-2.39-8.995a.952.952 0 00-.918-.643h-3.493a.57.57 0 00-.547.733l4.673 13.882-3.593 5.064a.571.571 0 00.465.901h3.415a.95.95 0 00.772-.397l11.458-18.991a.571.571 0 00-.566-.192z" fill="#003087"/>
    <path d="M12.871 1.052H4.636a1.593 1.593 0 00-1.575 1.348L.022 21.689a.956.956 0 00.945 1.107h4.31a1.593 1.593 0 001.575-1.348l.945-5.981a1.593 1.593 0 011.575-1.348h2.646c5.234 0 9.256-2.126 10.05-7.181.36-2.285-.09-4.156-1.339-5.385C19.349 2.21 16.637 1.052 12.871 1.052zm.824 6.726c-.41 2.684-2.476 2.684-4.482 2.684H7.955l1.002-6.347h1.28c1.328 0 2.531 0 3.125.69.412.48.514 1.256.333 2.973z" fill="#003087"/>
    <path d="M22.894 8.233c-.36 2.285-.09 4.156-1.339 5.385-1.38 1.343-4.092 2.501-7.858 2.501H11.05a1.593 1.593 0 00-1.575 1.348l-1.93 12.215a.956.956 0 00.945 1.107h3.834a1.593 1.593 0 001.575-1.348l1.09-6.904a1.593 1.593 0 011.575-1.348h1.646c5.234 0 9.256-2.126 10.05-7.181.411-2.612-.036-4.631-1.466-5.775z" fill="#0079C1"/>
    <path d="M21.57 7.781a10.872 10.872 0 00-2.222-1.838c-1.38-1.343-4.092-2.501-7.858-2.501H6.027a1.593 1.593 0 00-1.575 1.348L1.413 23.989a.956.956 0 00.945 1.107h4.31a1.593 1.593 0 001.575-1.348l.945-5.981a1.593 1.593 0 011.575-1.348h2.646c5.234 0 9.256-2.126 10.05-7.181.36-2.285-.09-4.156-1.339-5.385z" fill="#00457C"/>
  </svg>
);

export const CardLogosComponent: React.FC = () => (
  <div className="flex items-center gap-1.5">
    <span className="px-1.5 py-0.5 bg-[#1A1F71] text-white font-extrabold italic text-[10px] rounded tracking-wider shadow-xs">
      VISA
    </span>
    <div className="flex items-center -space-x-1">
      <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B]" />
      <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-90" />
    </div>
  </div>
);

// All 4 Bangladesh Payment Methods Banner Bar
export const BangladeshPaymentMethodsBar: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 ${compact ? 'p-2' : 'p-3 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl'}`}>
    <BkashLogo />
    <NagadLogo />
    <RocketLogo />
    <BankTransferLogo />
  </div>
);
