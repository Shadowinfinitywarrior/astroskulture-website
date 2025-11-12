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
        
        {/* Orbital Path - Enhanced Dotted Circle */}
        <svg
          className="absolute"
          width={config.orbitSize}
          height={config.orbitSize}
          viewBox={`0 0 ${config.orbitSize} ${config.orbitSize}`}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.2))'
          }}
        >
          <circle
            cx={config.orbitSize / 2}
            cy={config.orbitSize / 2}
            r={config.orbitSize / 2 - 5}
            fill="none"
            stroke="url(#orbitGradient)"
            strokeWidth="2.5"
            strokeDasharray="10,8"
            opacity="0.9"
          />
          <defs>
            <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 0.6 }} />
              <stop offset="50%" style={{ stopColor: '#f97316', stopOpacity: 0.4 }} />
              <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0.6 }} />
            </linearGradient>
          </defs>
        </svg>

        {/* Orbit Container for Rocket */}
        <div
          className="absolute"
          style={{
            width: config.orbitSize,
            height: config.orbitSize,
            borderRadius: '50%',
            animation: 'spin-orbit 5s infinite linear'
          }}
        >
          {/* Rocket - Positioned on orbit path */}
          <div
            className="absolute"
            style={{
              right: '0',
              top: '50%',
              transform: 'translateY(-50%) rotate(0deg)',
              transformOrigin: 'center',
              filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.4))',
              animation: 'counter-rotate 5s infinite linear'
            }}
          >
            <svg width="32" height="52" viewBox="0 0 32 52" style={{ filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))' }}>
              <defs>
                <linearGradient id="rocketBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#991b1b', stopOpacity: 0.9 }} />
                </linearGradient>
                <linearGradient id="rocketFinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#d97706', stopOpacity: 0.8 }} />
                </linearGradient>
                <linearGradient id="rocketWindowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#1e40af', stopOpacity: 0.6 }} />
                  <stop offset="100%" style={{ stopColor: '#0c4a6e', stopOpacity: 0.7 }} />
                </linearGradient>
              </defs>
              
              {/* Rocket Tip - Cone */}
              <path d="M 16 0 L 22 12 L 10 12 Z" 
                    fill="url(#rocketBodyGradient)" />
              
              {/* Upper Body Section */}
              <rect x="10" y="12" width="12" height="6" rx="2" 
                    fill="url(#rocketBodyGradient)" />
              
              {/* Window/Porthole */}
              <circle cx="16" cy="15" r="2.5"
                      fill="url(#rocketWindowGradient)" opacity="0.9" />
              
              {/* Main Body */}
              <rect x="8" y="18" width="16" height="18" rx="2" 
                    fill="url(#rocketBodyGradient)" />
              
              {/* Body Accent */}
              <rect x="9" y="22" width="14" height="1.5" 
                    fill="rgba(255, 255, 255, 0.2)" />
              
              {/* Left Fin - Large */}
              <path d="M 8 28 Q 2 30 0 35 L 4 36 Q 8 32 8 30 Z" 
                    fill="url(#rocketFinGradient)" />
              
              {/* Right Fin - Large */}
              <path d="M 24 28 Q 30 30 32 35 L 28 36 Q 24 32 24 30 Z" 
                    fill="url(#rocketFinGradient)" />
              
              {/* Bottom Engine Section */}
              <rect x="10" y="36" width="12" height="8" rx="1" 
                    fill="url(#rocketBodyGradient)" opacity="0.95" />
              
              {/* Bottom Left Fin - Small */}
              <path d="M 11 44 L 8 50 L 10 44 Z" 
                    fill="url(#rocketFinGradient)" opacity="0.85" />
              
              {/* Bottom Right Fin - Small */}
              <path d="M 21 44 L 24 50 L 22 44 Z" 
                    fill="url(#rocketFinGradient)" opacity="0.85" />
            </svg>
            
            {/* Rocket Fire - Triple Layer for 3D effect */}
            <div
              style={{
                position: 'absolute',
                bottom: '0',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '14px',
                height: '32px',
                background: 'radial-gradient(ellipse at center, #fef3c7 0%, #fcd34d 15%, #fbbf24 30%, #f59e0b 50%, #d97706 75%, rgba(217, 119, 6, 0) 100%)',
                borderRadius: '50% 50% 30% 30%',
                animation: 'flame-flicker-enhanced 0.15s infinite alternate',
                zIndex: -1,
                opacity: 0.9,
                filter: 'drop-shadow(0 0 4px #f97316)'
              }}
            />

            {/* Inner Flame - Red */}
            <div
              style={{
                position: 'absolute',
                bottom: '2px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '10px',
                height: '24px',
                background: 'radial-gradient(ellipse at center, #ef4444 0%, #dc2626 50%, rgba(220, 38, 38, 0) 100%)',
                borderRadius: '50%',
                animation: 'flame-flicker-enhanced 0.18s infinite alternate',
                animationDelay: '0.05s',
                zIndex: -1,
                opacity: 0.7
              }}
            />

            {/* Rocket Gas/Smoke Trail */}
            {[0, 1, 2].map((i) => (
              <div
                key={`gas-${i}`}
                style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: i === 0 ? '40%' : i === 1 ? '60%' : '50%',
                  width: '4px',
                  height: '4px',
                  backgroundColor: `rgba(239, 68, 68, ${0.6 - i * 0.15})`,
                  borderRadius: '50%',
                  animation: `gas-rise 1.4s infinite ease-out`,
                  animationDelay: `${i * 0.25}s`,
                  zIndex: -2,
                  filter: 'blur(0.5px)'
                }}
              />
            ))}
          </div>
        </div>

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
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes counter-rotate {
          0% {
            transform: translateY(-50%) rotate(0deg);
          }
          100% {
            transform: translateY(-50%) rotate(-360deg);
          }
        }

        @keyframes flame-flicker-enhanced {
          0% {
            transform: translateX(-50%) scaleY(0.85) scaleX(0.9);
            opacity: 1;
          }
          40% {
            transform: translateX(-50%) scaleY(1.2) scaleX(1.05);
            opacity: 0.95;
          }
          70% {
            transform: translateX(-50%) scaleY(1.4) scaleX(1.15);
            opacity: 0.9;
          }
          100% {
            transform: translateX(-50%) scaleY(1.1) scaleX(0.95);
            opacity: 0.8;
          }
        }

        @keyframes gas-rise {
          0% {
            transform: translateY(0) scale(0.7);
            opacity: 0.8;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(36px) scale(1.5);
            opacity: 0;
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
