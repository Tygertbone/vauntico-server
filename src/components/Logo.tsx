import React from 'react';

type LogoSize = "sm" | "md" | "lg" | "xl";

interface LogoProps {
  size?: LogoSize;
  className?: string;
}

interface LogoTextProps {
  size?: LogoSize;
  className?: string;
}

interface FullLogoProps {
  size?: LogoSize;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = "md", className = "" }) => {
  const sizeClasses: Record<LogoSize, string> = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-20 h-20"
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative group`}>
      {/* Outer glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
      
      {/* Main logo container */}
      <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 rounded-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-2xl">
        {/* V letter with modern design */}
        <div className="relative">
          {/* Main V shape */}
          <svg 
            width={32} 
            height={32} 
            viewBox="0 0 32 32" 
            className="text-white drop-shadow-lg"
            fill="currentColor"
          >
            <path d="M8 6 L16 22 L24 6 L24 26 L16 18 L8 26 L8 6 Z" />
            {/* Modern accent line */}
            <path d="M6 8 L26 8" stroke="white" strokeWidth={2} strokeLinecap="round" opacity={0.8} />
            <path d="M6 24 L26 24" stroke="white" strokeWidth={2} strokeLinecap="round" opacity={0.8} />
          </svg>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 animate-shimmer"></div>
        </div>
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-float opacity-70"></div>
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-indigo-400 rounded-full animate-float-delayed opacity-70"></div>
    </div>
  );
};

export const LogoText: React.FC<LogoTextProps> = ({ size = "md", className = "" }) => {
  const sizeClasses: Record<LogoSize, string> = {
    sm: "text-lg",
    md: "text-2xl", 
    lg: "text-3xl",
    xl: "text-4xl"
  };

  return (
    <div className={`font-bold ${sizeClasses[size]} ${className}`}>
      <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg">
        Vauntico
      </span>
      <span className="text-xs bg-gradient-to-r from-pink-500 to-indigo-600 bg-clip-text text-transparent ml-1">
        AI
      </span>
    </div>
  );
};

export const FullLogo: React.FC<FullLogoProps> = ({ size = "md", className = "" }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Logo size={size} />
      <LogoText size={size} />
    </div>
  );
};
