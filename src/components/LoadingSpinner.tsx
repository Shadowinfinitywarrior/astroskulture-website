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
    sm: { width: 80, height: 80, loaderSize: 48 },
    md: { width: 120, height: 120, loaderSize: 48 },
    lg: { width: 160, height: 160, loaderSize: 48 }
  };

  const config = sizeConfig[size];

  return (
    <div className={containerClass} style={{ background: bgStyle }}>
      <div className="relative flex flex-col items-center justify-center" style={{ width: config.width, height: config.height }}>
        <div className="relative flex items-center justify-center" style={{ width: config.loaderSize, height: config.loaderSize }}>
          <div className="loader"></div>
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              position: 'absolute',
              width: '60%',
              height: '60%',
              objectFit: 'contain',
              zIndex: 10
            }}
          />
        </div>
      </div>

      <style>{`
        .loader {
          width: 48px;
          height: 48px;
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
          width: 24px;
          height: 24px;
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
