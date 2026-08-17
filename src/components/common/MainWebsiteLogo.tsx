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
      {/* Official YearInvo Geometric Logo */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 rounded-xl drop-shadow-md"
      >
        {/* Dark Frame Canvas */}
        <rect width="512" height="512" rx="110" fill="#0A0A0E" />

        {/* Left White Chevron Arm of 'Y' */}
        <path
          d="M 144 116 H 210 L 288 238 L 224 312 H 182 L 232 246 L 144 116 Z"
          fill="#FFFFFF"
        />

        {/* Top Right Purple Arm of 'Y' (#792AEE) */}
        <path
          d="M 314 116 H 380 L 294 214 L 265 174 Z"
          fill="#792AEE"
        />

        {/* Document / Invoice Body (White) */}
        <path
          d="M 295 166 L 352 166 V 278 L 312 312 H 295 V 166 Z"
          fill="#FFFFFF"
        />

        {/* Document Folded Flap (Purple #792AEE) */}
        <path
          d="M 312 312 L 352 278 H 312 V 312 Z"
          fill="#792AEE"
        />

        {/* Document 3 Invoice Lines (Purple #792AEE) */}
        <rect x="306" y="228" width="36" height="6.5" rx="3.25" fill="#792AEE" />
        <rect x="306" y="244" width="36" height="6.5" rx="3.25" fill="#792AEE" />
        <rect x="306" y="260" width="36" height="6.5" rx="3.25" fill="#792AEE" />
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
