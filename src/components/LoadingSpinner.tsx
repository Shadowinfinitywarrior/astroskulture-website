import { useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ fullScreen = false, size = 'md' }: LoadingSpinnerProps) {
  const containerClass = fullScreen 
    ? 'fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-white'
    : 'flex items-center justify-center p-8 bg-transparent';
  
  const bgStyle = fullScreen 
    ? '#ffffff'
    : 'transparent';

  const sizeConfig = {
    sm: { width: 120, height: 120, logoSize: 40, orbitSize: 90 },
    md: { width: 180, height: 180, logoSize: 65, orbitSize: 140 },
    lg: { width: 240, height: 240, logoSize: 90, orbitSize: 190 }
  };

  const config = sizeConfig[size];

  return (
    <div className={containerClass} style={{ background: bgStyle }}>
      {/* Main Container */}
      <div className="relative flex flex-col items-center justify-center" style={{ width: config.width, height: config.height }}>
        
        {/* Circular Loader - Rotating Ring */}
        <svg
          className="absolute"
          width={config.orbitSize}
          height={config.orbitSize}
          viewBox={`0 0 ${config.orbitSize} ${config.orbitSize}`}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'spin-orbit 3s infinite linear'
          }}
        >
          {/* Background circle */}
          <circle
            cx={config.orbitSize / 2}
            cy={config.orbitSize / 2}
            r={config.orbitSize / 2 - 5}
            fill="none"
            stroke="rgba(239, 68, 68, 0.1)"
            strokeWidth="3"
          />
          
          {/* Animated gradient ring */}
          <circle
            cx={config.orbitSize / 2}
            cy={config.orbitSize / 2}
            r={config.orbitSize / 2 - 5}
            fill="none"
            stroke="url(#loaderGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(config.orbitSize / 2 - 5) * Math.PI * 0.5} ${(config.orbitSize / 2 - 5) * Math.PI * 1.5}`}
            pathLength="100"
          />
          
          <defs>
            <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#f97316', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0.5 }} />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Logo Container - Modern Glassmorphism */}
        <div
          className="absolute flex items-center justify-center rounded-full"
          style={{
            width: config.logoSize,
            height: config.logoSize,
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(239, 68, 68, 0.4)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(239, 68, 68, 0.08)',
            animation: 'pulse-glow 3s ease-in-out infinite'
          }}
        >
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              width: '75%',
              height: '75%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 8px rgba(239, 68, 68, 0.2))',
              opacity: 0.9
            }}
          />
        </div>

        {/* Loading indicator dots - below the animation */}
        <div className="absolute" style={{ bottom: '-55px' }}>
          <div className="flex gap-1.5 justify-center">
            <div
              style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                animation: 'bounce-dot 1.2s infinite',
                animationDelay: '0s',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
              }}
            />
            <div
              style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                animation: 'bounce-dot 1.2s infinite',
                animationDelay: '0.2s',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
              }}
            />
            <div
              style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                animation: 'bounce-dot 1.2s infinite',
                animationDelay: '0.4s',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-orbit {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes bounce-dot {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.8;
            boxShadow: 0 0 8px rgba(239, 68, 68, 0.6);
          }
          50% {
            transform: translateY(-10px) scale(1.1);
            opacity: 1;
            boxShadow: 0 0 12px rgba(239, 68, 68, 0.9);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            boxShadow: 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(239, 68, 68, 0.08);
          }
          50% {
            boxShadow: 0 8px 40px rgba(239, 68, 68, 0.15), inset 0 0 25px rgba(239, 68, 68, 0.15);
          }
        }
      `}</style>
    </div>
  );
}
