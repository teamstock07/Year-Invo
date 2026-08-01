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
          className="object-cover shrink-0 rounded-xl"
        />
        {showText && (
          <div className="flex flex-col">
            <span className="font-black tracking-tight leading-none text-slate-900 dark:text-white text-base">
              {siteName}
            </span>
            {subName && (
              <span className="text-[10px] font-extrabold text-[#7C3AED] dark:text-[#a78bfa] tracking-wider uppercase mt-0.5">
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
      {/* Sleek Geometric Y/YM Logo Vector */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 rounded-xl drop-shadow-md"
      >
        {/* Dark Frame Canvas */}
        <rect width="200" height="200" rx="40" fill="#0A0A0C" />

        {/* Left White Arm & Stem of 'Y' */}
        <path
          d="M 32 32 H 86 L 116 80 V 168 H 82 V 104 L 32 32 Z"
          fill="#FFFFFF"
        />

        {/* Top Right Purple Accent Polygon */}
        <path
          d="M 132 32 H 168 L 118 96 L 118 60 Z"
          fill="#7C3AED"
        />

        {/* Bottom Right White Chevron Structural Shape */}
        <path
          d="M 122 108 L 168 56 V 152 L 138 176 V 128 L 122 144 Z"
          fill="#FFFFFF"
        />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="font-black tracking-tight leading-none text-slate-900 dark:text-white text-base">
            {siteName}
          </span>
          {subName && (
            <span className="text-[10px] font-extrabold text-[#7C3AED] dark:text-[#a78bfa] tracking-wider uppercase mt-0.5">
              {subName}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
