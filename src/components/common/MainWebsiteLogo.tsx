import React from 'react';

interface MainWebsiteLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  customUrl?: string;
  siteName?: string;
  subName?: string;
}

export const MainWebsiteLogo: React.FC<MainWebsiteLogoProps> = ({
  className = '',
  size = 36,
  showText = false,
  customUrl = '',
  siteName = 'YearInvo',
  subName = 'by Year Media',
}) => {
  if (customUrl) {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <img
          src={customUrl}
          alt={siteName}
          style={{ width: size, height: size }}
          className="object-contain shrink-0 rounded-xl"
        />
        {showText && (
          <div className="flex flex-col">
            <span className="font-black tracking-tight leading-none text-slate-900 dark:text-white text-base">
              {siteName}
            </span>
            {subName && (
              <span className="text-[10px] font-extrabold text-[#ff5c01] tracking-wider uppercase mt-0.5">
                {subName}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Official YearInvo Geometric Logo from exact specification */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 rounded-2xl drop-shadow-md"
      >
        {/* Solid Black Canvas Background */}
        <rect width="1000" height="1000" rx="160" fill="#000000" />

        {/* 1. Left White Big Chevron / Y-Arm */}
        {/* Top left horizontal to diagonal down to middle vertex, down to bottom-left */}
        <path
          d="M 52 60 H 345 L 633 440 L 285 940 H 98 L 406 488 L 52 60 Z"
          fill="#FFFFFF"
        />

        {/* 2. Top-Right Blue Arm of 'Y' */}
        {/* Diagonal parallelogram */}
        <path
          d="M 685 60 H 948 L 526 448 L 420 310 Z"
          fill="#005BFF"
        />

        {/* 3. Bottom-Right Blue Document Body with fold cutout */}
        {/* Starts from diagonal top-left at x=640 y=490, right side vertical down, bottom fold */}
        <path
          d="M 640 490 L 872 236 V 744 L 698 940 H 640 V 490 Z"
          fill="#005BFF"
        />

        {/* 4. White Folded Corner Flap at bottom-left of document */}
        <path
          d="M 640 744 H 698 L 640 940 V 744 Z"
          fill="#FFFFFF"
        />
        {/* White flap curved rounded transition */}
        <path
          d="M 640 744 C 640 744, 698 744, 698 744 C 698 775, 675 850, 640 940 Z"
          fill="#FFFFFF"
        />

        {/* 5. Three crisp rounded White Invoice Lines inside the document */}
        <rect x="684" y="512" width="148" height="26" rx="13" fill="#FFFFFF" />
        <rect x="684" y="584" width="148" height="26" rx="13" fill="#FFFFFF" />
        <rect x="684" y="656" width="148" height="26" rx="13" fill="#FFFFFF" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="font-black tracking-tight leading-none text-slate-900 dark:text-white text-base">
            {siteName}
          </span>
          {subName && (
            <span className="text-[10px] font-extrabold text-[#ff5c01] tracking-wider uppercase mt-0.5">
              {subName}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
