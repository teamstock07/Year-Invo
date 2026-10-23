import React from 'react';
import { Banknote, CreditCard, Tag, QrCode, Wallet, Landmark, Check } from 'lucide-react';

// ==========================================
// 1. YearInvo Official Brand Logo & Header
// ==========================================
export const YearInvoLogo: React.FC<{
  className?: string;
  size?: number;
  rounded?: boolean;
}> = ({
  className = 'w-9 h-9',
  size,
  rounded = true,
}) => (
  <svg
    className={`shrink-0 overflow-hidden shadow-xs ${rounded ? 'rounded-xl' : ''} ${className}`}
    style={size ? { width: size, height: size } : undefined}
    viewBox="0 0 1000 1000"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Solid Black Canvas Background */}
    <rect width="1000" height="1000" fill="#000000" />

    {/* 1. Left White Big Chevron / Y-Arm */}
    <path
      d="M 52 60 H 345 L 633 440 L 285 940 H 98 L 406 488 L 52 60 Z"
      fill="#FFFFFF"
    />

    {/* 2. Top-Right Blue Arm of 'Y' */}
    <path
      d="M 685 60 H 948 L 526 448 L 420 310 Z"
      fill="#0066FF"
    />

    {/* 3. Bottom-Right Blue Document Body with fold cutout */}
    <path
      d="M 640 490 L 872 236 V 744 L 698 940 H 640 V 490 Z"
      fill="#0066FF"
    />

    {/* 4. White Folded Corner Flap at bottom-left of document */}
    <path
      d="M 640 744 C 640 744, 698 744, 698 744 C 698 775, 675 850, 640 940 Z"
      fill="#FFFFFF"
    />

    {/* 5. Three crisp rounded White Invoice Lines inside the document */}
    <rect x="684" y="512" width="148" height="26" rx="13" fill="#FFFFFF" />
    <rect x="684" y="584" width="148" height="26" rx="13" fill="#FFFFFF" />
    <rect x="684" y="656" width="148" height="26" rx="13" fill="#FFFFFF" />
  </svg>
);

export const YearInvoBrandHeader: React.FC<{
  className?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({
  className = '',
  subtitle,
  size = 'md',
}) => {
  const logoSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
  const titleSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <YearInvoLogo size={logoSize} />
      <div className="flex flex-col leading-tight">
        <span className={`font-black tracking-tight text-white ${titleSize}`}>
          YearInvo
        </span>
        {subtitle && (
          <span className="text-[10px] font-bold text-slate-400">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 2. bKash Logo & Icon (Pink #E2136E + Origami Bird)
// ==========================================
export const BkashIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={`shrink-0 rounded-lg overflow-hidden shadow-xs ${className}`} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" rx="72" fill="#E2136E" />
    <g fill="#FFFFFF">
      <polygon points="145,145 238,185 197,305 130,205" fill="#FFFFFF" />
      <polygon points="238,185 410,185 375,270 197,305" fill="#FFFFFF" fillOpacity="0.96" />
      <polygon points="410,185 450,225 375,270" fill="#FFFFFF" />
      <polygon points="197,305 375,270 225,350" fill="#FFFFFF" fillOpacity="0.92" />
      <polygon points="197,305 225,350 148,440" fill="#FFFFFF" />
    </g>
  </svg>
);

export const BkashLogo: React.FC<{ className?: string; showText?: boolean }> = ({
  className = 'h-8',
  showText = true,
}) => (
  <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#E2136E] text-white font-extrabold shadow-sm ${className}`}>
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="145,145 238,185 197,305 130,205" fill="#FFFFFF" />
      <polygon points="238,185 410,185 375,270 197,305" fill="#FFFFFF" fillOpacity="0.96" />
      <polygon points="410,185 450,225 375,270" fill="#FFFFFF" />
      <polygon points="197,305 375,270 225,350" fill="#FFFFFF" fillOpacity="0.92" />
      <polygon points="197,305 225,350 148,440" fill="#FFFFFF" />
    </svg>
    {showText && (
      <div className="flex flex-col leading-tight">
        <span className="text-[12px] font-black tracking-tight">bKash</span>
        <span className="text-[8px] font-bold opacity-90">বিকাশ</span>
      </div>
    )}
  </div>
);

// ==========================================
// 3. Nagad Logo & Icon (Orange/Red Swirl + Runner)
// ==========================================
export const NagadIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={`shrink-0 rounded-lg overflow-hidden bg-white p-0.5 shadow-xs border border-slate-100 dark:border-slate-800 ${className}`} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g fill="none">
      <path d="M 270 180 C 310 160, 360 180, 425 155 C 445 147, 440 175, 430 205 C 400 295, 345 350, 270 375 C 330 320, 345 250, 270 180 Z" fill="#EE1C25"/>
      <path d="M 245 190 C 275 160, 330 150, 365 90 C 375 75, 395 105, 390 130 C 365 210, 305 290, 230 330 C 280 270, 285 220, 245 190 Z" fill="#F15A24"/>
      <path d="M 220 220 C 230 180, 260 140, 270 85 C 275 60, 295 90, 290 115 C 265 180, 220 240, 160 270 C 180 230, 205 225, 220 220 Z" fill="#F7941D"/>
      <path d="M 160 270 C 120 330, 150 420, 256 425 C 362 430, 415 365, 415 285 C 415 255, 405 235, 400 245 C 405 325, 340 380, 256 380 C 180 380, 155 315, 185 265 C 190 255, 170 255, 160 270 Z" fill="#EE1C25"/>
      <path d="M 256 425 C 150 425, 95 350, 95 270 C 95 180, 165 110, 270 85 C 240 120, 180 180, 180 270 C 180 330, 210 380, 256 380 Z" fill="#F7941D" opacity="0.95"/>
    </g>
    <g fill="#EE1C25">
      <circle cx="248" cy="245" r="14"/>
      <path d="M 238 260 C 238 260, 260 258, 265 272 L 278 288 C 278 288, 265 305, 255 305 L 245 295 L 235 320 L 225 318 L 238 280 Z"/>
      <path d="M 255 300 L 270 315 L 270 345 L 260 345 L 260 325 L 248 310 Z"/>
      <path d="M 235 305 L 210 325 L 185 325 L 185 315 L 205 315 L 225 298 Z"/>
      <rect x="180" y="270" width="130" height="5" rx="2" transform="rotate(-3 245 272)"/>
      <polygon points="180,268 168,272 180,277"/>
      <rect x="210" y="278" width="18" height="24" rx="3" fill="none" stroke="#EE1C25" strokeWidth="3"/>
      <line x1="219" y1="272" x2="219" y2="278" stroke="#EE1C25" strokeWidth="2"/>
      <circle cx="219" cy="290" r="3"/>
      <ellipse cx="270" cy="265" rx="14" ry="12" fill="#EE1C25"/>
    </g>
  </svg>
);

export const NagadLogo: React.FC<{ className?: string; showText?: boolean }> = ({
  className = 'h-8',
  showText = true,
}) => (
  <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ED1C24] via-[#F15A24] to-[#F7931E] text-white font-extrabold shadow-sm ${className}`}>
    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5 shrink-0 shadow-inner">
      <NagadIcon className="w-full h-full border-none shadow-none p-0" />
    </div>
    {showText && (
      <div className="flex flex-col leading-tight">
        <span className="text-[12px] font-black tracking-tight">Nagad</span>
        <span className="text-[8px] font-bold opacity-90">নগদ</span>
      </div>
    )}
  </div>
);

// ==========================================
// 4. Rocket DBBL Logo & Icon (Purple + Paper Airplane)
// ==========================================
export const RocketIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={`shrink-0 rounded-lg overflow-hidden bg-white p-0.5 shadow-xs border border-slate-100 dark:border-slate-800 ${className}`} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g fill="#8C3494">
      <polygon points="385,115 225,180 325,235 385,115" fill="#8C3494"/>
      <polygon points="225,180 345,260 325,235" fill="#75287D"/>
      <polygon points="345,260 295,210 325,235" fill="#621E6A"/>
      <text x="200" y="240" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="34" letterSpacing="4" fill="#8C3494">ROCKET</text>
      <circle cx="108" cy="342" r="20" fill="#8C3494"/>
      <path d="M 85 255 L 140 255 C 160 255, 175 270, 175 290 C 175 315, 155 330, 130 330 L 115 330 L 115 295 L 130 295 C 138 295, 142 292, 142 288 C 142 282, 136 280, 128 280 L 85 280 Z" fill="#8C3494"/>
      <path d="M 180 255 L 290 255 L 290 280 L 255 280 L 255 345 L 222 345 L 222 280 L 180 280 Z" fill="#8C3494"/>
      <path d="M 222 300 C 190 300, 180 325, 205 345 C 220 345, 222 335, 222 325 Z" fill="#8C3494"/>
      <path d="M 255 300 C 285 300, 295 325, 270 345 C 255 345, 255 335, 255 325 Z" fill="#8C3494"/>
      <path d="M 305 255 L 435 255 L 435 280 L 380 280 C 405 285, 435 305, 435 335 C 435 365, 395 375, 345 375 C 310 375, 295 360, 295 340 L 328 340 C 328 348, 335 352, 348 352 C 375 352, 400 348, 400 330 C 400 310, 375 305, 345 305 L 340 305 L 340 280 L 305 280 Z" fill="#8C3494"/>
      <text x="256" y="398" fontFamily="'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif" fontWeight="600" fontSize="19" textAnchor="middle" fill="#8C3494" letterSpacing="0.5">
        ডাচ-বাংলা ব্যাংক মোবাইল ব্যাংকিং
      </text>
    </g>
  </svg>
);

export const RocketLogo: React.FC<{ className?: string; showText?: boolean }> = ({
  className = 'h-8',
  showText = true,
}) => (
  <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#8C3494] text-white font-extrabold shadow-sm ${className}`}>
    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5 shrink-0 shadow-inner">
      <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="75,20 40,35 65,48 75,20" fill="#8C3494"/>
        <polygon points="40,35 68,54 65,48" fill="#75287D"/>
        <polygon points="68,54 58,43 65,48" fill="#621E6A"/>
        <circle cx="25" cy="70" r="4.5" fill="#8C3494"/>
        <text x="50" y="80" fontFamily="sans-serif" fontWeight="900" fontSize="18" textAnchor="middle" fill="#8C3494">রকেট</text>
      </svg>
    </div>
    {showText && (
      <div className="flex flex-col leading-tight">
        <span className="text-[12px] font-black tracking-tight">Rocket</span>
        <span className="text-[8px] font-bold opacity-90">রকেট DBBL</span>
      </div>
    )}
  </div>
);

// ==========================================
// 5. Bank Payment / Bank Transfer Logo & Icon
// ==========================================
export const BankPaymentIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={`shrink-0 rounded-lg overflow-hidden bg-white p-0.5 shadow-xs border border-slate-100 dark:border-slate-800 ${className}`} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#111827" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 118 210 L 256 118 L 394 210 Z" strokeWidth="20" fill="#FFFFFF"/>
      <text x="256" y="195" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="58" textAnchor="middle" fill="#111827" stroke="none">$</text>
      <rect x="118" y="210" width="276" height="24" rx="4" strokeWidth="20" fill="#FFFFFF"/>
      <path d="M 152 234 L 152 335 M 172 234 L 172 335" strokeWidth="14"/>
      <rect x="140" y="234" width="44" height="12" rx="3" strokeWidth="12" fill="#FFFFFF"/>
      <rect x="140" y="323" width="44" height="12" rx="3" strokeWidth="12" fill="#FFFFFF"/>
      <path d="M 246 234 L 246 335 M 266 234 L 266 335" strokeWidth="14"/>
      <rect x="234" y="234" width="44" height="12" rx="3" strokeWidth="12" fill="#FFFFFF"/>
      <rect x="234" y="323" width="44" height="12" rx="3" strokeWidth="12" fill="#FFFFFF"/>
      <path d="M 340 234 L 340 290" strokeWidth="14"/>
      <rect x="328" y="234" width="44" height="12" rx="3" strokeWidth="12" fill="#FFFFFF"/>
      <rect x="124" y="335" width="220" height="28" rx="4" strokeWidth="20" fill="#FFFFFF"/>
    </g>
    <g transform="translate(330, 330)">
      <circle cx="0" cy="0" r="76" fill="#FFFFFF"/>
      <circle cx="0" cy="0" r="72" fill="none" stroke="#2B388F" strokeWidth="16"/>
      <g fill="none" stroke="#2B388F" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 32 -18 L -32 -18"/>
        <path d="M -16 -34 L -32 -18 L -16 -2"/>
      </g>
      <g fill="none" stroke="#2B388F" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round">
        <path d="M -32 20 L 32 20"/>
        <path d="M 16 4 L 32 20 L 16 36"/>
      </g>
    </g>
  </svg>
);

export const BankTransferIcon = BankPaymentIcon;

export const BankPaymentLogo: React.FC<{ className?: string; showText?: boolean }> = ({
  className = 'h-8',
  showText = true,
}) => (
  <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#1E40AF] text-white font-extrabold shadow-sm ${className}`}>
    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5 shrink-0 shadow-inner">
      <BankPaymentIcon className="w-full h-full border-none shadow-none p-0" />
    </div>
    {showText && (
      <div className="flex flex-col leading-tight">
        <span className="text-[12px] font-black tracking-tight">Bank Payment</span>
        <span className="text-[8px] font-bold opacity-90">ব্যাংক ট্রান্সফার</span>
      </div>
    )}
  </div>
);

export const BankTransferLogo = BankPaymentLogo;

// ==========================================
// 6. International PayPal & Cards
// ==========================================
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

// ==========================================
// 7. Universal Payment Method Icon / Badge
// ==========================================
export const PaymentMethodIcon: React.FC<{
  method?: string;
  className?: string;
}> = ({ method = '', className = 'w-5 h-5' }) => {
  const norm = method.toLowerCase().trim();

  if (norm.includes('bkash') || norm.includes('বিকাশ')) {
    return <BkashIcon className={className} />;
  }
  if (norm.includes('nagad') || norm.includes('নগদ')) {
    return <NagadIcon className={className} />;
  }
  if (norm.includes('rocket') || norm.includes('রকেট')) {
    return <RocketIcon className={className} />;
  }
  if (norm.includes('bank') || norm.includes('ব্যাংক')) {
    return <BankPaymentIcon className={className} />;
  }
  if (norm.includes('card') || norm.includes('কার্ড')) {
    return <CreditCard className={`${className} text-blue-500`} />;
  }
  if (norm.includes('due') || norm.includes('বকেয়া') || norm.includes('বাকী') || norm.includes('credit')) {
    return <Tag className={`${className} text-amber-500`} />;
  }
  if (norm.includes('qr') || norm.includes('mobile')) {
    return (
      <div className={`flex items-center -space-x-1 ${className}`}>
        <BkashIcon className="w-3.5 h-3.5" />
        <NagadIcon className="w-3.5 h-3.5" />
      </div>
    );
  }

  // Default to Cash
  return <Banknote className={`${className} text-emerald-500`} />;
};

// ==========================================
// 8. Bangladesh Payment Methods Banner Bar
// ==========================================
export const BangladeshPaymentMethodsBar: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 ${compact ? 'p-2' : 'p-3 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl'}`}>
    <BkashLogo />
    <NagadLogo />
    <RocketLogo />
    <BankPaymentLogo />
  </div>
);

// ==========================================
// 9. Premium Payment/Checkout UI Section
// ==========================================
export interface PaymentMethodOption {
  id: string;
  name: string;
  subtitle?: string;
  icon: React.ReactNode;
}

export const PaymentCheckoutSection: React.FC<{
  selectedMethod?: string;
  onSelectMethod?: (methodId: string) => void;
  className?: string;
}> = ({
  selectedMethod = 'bkash',
  onSelectMethod,
  className = '',
}) => {
  const methods: PaymentMethodOption[] = [
    {
      id: 'bkash',
      name: 'bKash',
      subtitle: 'Instant Mobile Wallet',
      icon: <BkashIcon className="w-8 h-8" />,
    },
    {
      id: 'nagad',
      name: 'Nagad',
      subtitle: 'Postal Digital Service',
      icon: <NagadIcon className="w-8 h-8" />,
    },
    {
      id: 'rocket',
      name: 'Rocket',
      subtitle: 'DBBL Mobile Banking',
      icon: <RocketIcon className="w-8 h-8" />,
    },
    {
      id: 'bank',
      name: 'Bank Payment',
      subtitle: 'BEFTN / NPSB / Wire',
      icon: <BankPaymentIcon className="w-8 h-8" />,
    },
  ];

  return (
    <div className={`w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 ${className}`}>
      {/* Top: Uploaded YearInvo Brand Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 pb-5 gap-3">
        <div className="flex items-center gap-3.5">
          <YearInvoLogo size={42} />
          <div>
            <h3 className="font-black text-xl text-white tracking-tight leading-none">
              YearInvo
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Secure Checkout &amp; Payment Gateway
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Official Verified Payment</span>
        </div>
      </div>

      {/* Payment Methods Grid */}
      <div className="space-y-2.5">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
          Select Payment Method
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {methods.map((method) => {
            const isSelected = selectedMethod === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => onSelectMethod && onSelectMethod(method.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative flex items-center justify-between gap-3.5 ${
                  isSelected
                    ? 'bg-slate-900 border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="shrink-0 flex items-center justify-center">
                    {method.icon}
                  </div>
                  <div className="min-w-0">
                    <span className="font-extrabold text-sm text-white block truncate">
                      {method.name}
                    </span>
                    {method.subtitle && (
                      <span className="text-[11px] text-slate-400 block truncate">
                        {method.subtitle}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-700 bg-slate-800" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};


