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
    sm: { width: 120, height: 120, logoSize: 40, loaderSize: 80 },
    md: { width: 180, height: 180, logoSize: 65, loaderSize: 120 },
    lg: { width: 240, height: 240, logoSize: 90, loaderSize: 160 }
  };

  const config = sizeConfig[size];

  return (
    <div className={containerClass} style={{ background: bgStyle }}>
      <div className="relative flex flex-col items-center justify-center" style={{ width: config.width, height: config.height }}>
        
        {/* Circular Loader - CSS Animation */}
        <div 
          className="absolute loader" 
          style={{
            width: config.loaderSize,
            height: config.loaderSize
          }}
        ></div>

        {/* Center Logo Container */}
        <div
          className="absolute flex items-center justify-center rounded-full"
          style={{
            width: config.logoSize,
            height: config.logoSize,
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(239, 68, 68, 0.4)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(239, 68, 68, 0.08)',
            zIndex: 20
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
      </div>

      <style>{`
        .loader {
          border: 3px dotted #FFF;
          border-style: solid solid dotted dotted;
          border-radius: 50%;
          display: inline-block;
          position: relative;
          box-sizing: border-box;
          animation: rotation 2s linear infinite;
        }

        .loader::after {
          content: '';
          box-sizing: border-box;
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          margin: auto;
          border: 3px dotted #FF3D00;
          border-style: solid solid dotted;
          width: 50%;
          height: 50%;
          border-radius: 50%;
          animation: rotationBack 1s linear infinite;
          transform-origin: center center;
        }

        @keyframes rotation {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes rotationBack {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(-360deg);
          }
        }
      `}</style>
    </div>
  );
}
