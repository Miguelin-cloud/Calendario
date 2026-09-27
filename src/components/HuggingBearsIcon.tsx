import React from 'react';

interface HuggingBearsIconProps {
  className?: string;
  size?: number | string;
  withBackground?: boolean;
}

export const HuggingBearsIcon: React.FC<HuggingBearsIconProps> = ({
  className = '',
  size = 40,
  withBackground = false,
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`inline-block select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradients */}
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF1F2" />
          <stop offset="100%" stopColor="#FFE4E6" />
        </radialGradient>
        <linearGradient id="brownBearGrad" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#A76D52" />
          <stop offset="100%" stopColor="#78442E" />
        </linearGradient>
        <linearGradient id="whiteBearGrad" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF4B6E" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.15" />
        </filter>
      </defs>

      {withBackground && (
        <circle cx="50" cy="50" r="48" fill="url(#bgGrad)" stroke="#FECDD3" strokeWidth="2" />
      )}

      {/* --- BROWN BEAR (LEFT) --- */}
      <g id="brown-bear">
        {/* Ears */}
        <circle cx="24" cy="27" r="10" fill="url(#brownBearGrad)" />
        <circle cx="24" cy="27" r="5.5" fill="#FBCFE8" />

        {/* Head */}
        <ellipse cx="36" cy="42" rx="19" ry="17" fill="url(#brownBearGrad)" />

        {/* Body */}
        <ellipse cx="34" cy="68" rx="17" ry="20" fill="url(#brownBearGrad)" />

        {/* Snout */}
        <ellipse cx="39" cy="46" rx="8" ry="6" fill="#FDE68A" />
        {/* Nose */}
        <ellipse cx="39" cy="44" rx="2.8" ry="2" fill="#3E1F13" />
        {/* Mouth */}
        <path d="M37 46.5 Q39 48.5 41 46.5" stroke="#3E1F13" strokeWidth="1.2" strokeLinecap="round" />

        {/* Eye */}
        <circle cx="31" cy="38" r="2.4" fill="#29140B" />
        <circle cx="30.2" cy="37.2" r="0.8" fill="#FFFFFF" />
        <circle cx="43" cy="38" r="2.4" fill="#29140B" />
        <circle cx="42.2" cy="37.2" r="0.8" fill="#FFFFFF" />

        {/* Rosy Cheek */}
        <ellipse cx="27" cy="44" rx="2.5" ry="1.5" fill="#F43F5E" opacity="0.4" />

        {/* Left Arm hugging */}
        <path
          d="M32 58 C38 61, 46 64, 48 57 C48 53, 40 52, 34 54"
          fill="url(#brownBearGrad)"
          stroke="#5C3322"
          strokeWidth="0.8"
        />
        {/* Little Paw pad */}
        <circle cx="46" cy="57" r="2.5" fill="#FDE68A" />
      </g>

      {/* --- WHITE BEAR (RIGHT) --- */}
      <g id="white-bear">
        {/* Ears */}
        <circle cx="76" cy="27" r="10" fill="url(#whiteBearGrad)" stroke="#CBD5E1" strokeWidth="0.5" />
        <circle cx="76" cy="27" r="5.5" fill="#FECDD3" />

        {/* Head */}
        <ellipse cx="64" cy="42" rx="19" ry="17" fill="url(#whiteBearGrad)" stroke="#E2E8F0" strokeWidth="0.5" />

        {/* Body */}
        <ellipse cx="66" cy="68" rx="17" ry="20" fill="url(#whiteBearGrad)" stroke="#CBD5E1" strokeWidth="0.5" />

        {/* Snout */}
        <ellipse cx="61" cy="46" rx="8" ry="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.5" />
        {/* Nose */}
        <ellipse cx="61" cy="44" rx="2.8" ry="2" fill="#334155" />
        {/* Mouth */}
        <path d="M59 46.5 Q61 48.5 63 46.5" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" />

        {/* Eye */}
        <circle cx="57" cy="38" r="2.4" fill="#0F172A" />
        <circle cx="56.2" cy="37.2" r="0.8" fill="#FFFFFF" />
        <circle cx="69" cy="38" r="2.4" fill="#0F172A" />
        <circle cx="68.2" cy="37.2" r="0.8" fill="#FFFFFF" />

        {/* Rosy Cheek */}
        <ellipse cx="73" cy="44" rx="2.5" ry="1.5" fill="#FB7185" opacity="0.4" />

        {/* Right Arm hugging */}
        <path
          d="M68 58 C62 61, 54 64, 52 57 C52 53, 60 52, 66 54"
          fill="url(#whiteBearGrad)"
          stroke="#94A3B8"
          strokeWidth="0.8"
        />
        {/* Little Paw pad */}
        <circle cx="54" cy="57" r="2.5" fill="#FECDD3" />
      </g>

      {/* --- GLOWING ROMANTIC HEART IN THE CENTER --- */}
      <g filter="url(#shadow)">
        <path
          d="M50 54 C50 49, 44 45, 39 49 C34 53, 38 60, 50 69 C62 60, 66 53, 61 49 C56 45, 50 49, 50 54 Z"
          fill="url(#heartGrad)"
        />
        {/* Heart Highlight / Sparkle */}
        <ellipse cx="45" cy="51" rx="2" ry="1.2" transform="rotate(-30 45 51)" fill="#FFFFFF" opacity="0.6" />
        <path
          d="M50 48 L51 45 L52 48 L55 49 L52 50 L51 53 L50 50 L47 49 Z"
          fill="#FFFBEB"
          opacity="0.9"
        />
      </g>
    </svg>
  );
};
