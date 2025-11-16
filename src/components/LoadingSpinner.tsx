import { useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ fullScreen = false, size = 'md' }: LoadingSpinnerProps) {
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = '/logo.png';
    img.onload = () => setLogoLoaded(true);
  }, []);

  const containerClass = fullScreen 
    ? 'fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-white'
    : 'flex items-center justify-center p-8 bg-transparent';
  
  const bgStyle = fullScreen 
    ? '#ffffff'
    : 'transparent';

  const sizeConfig = {
    sm: { containerWidth: 140, containerHeight: 140, logoSize: 40, loaderSize: 100 },
    md: { containerWidth: 220, containerHeight: 220, logoSize: 65, loaderSize: 160 },
    lg: { containerWidth: 300, containerHeight: 300, logoSize: 90, loaderSize: 220 }
  };

  const config = sizeConfig[size];

  return (
    <div className={containerClass} style={{ background: bgStyle }}>
      <div className="relative flex flex-col items-center justify-center" style={{ width: config.containerWidth, height: config.containerHeight }}>
        
        {/* Circular Loader - CSS Animation - Around Logo */}
        <div 
          className="loader-big"
          style={{
            width: config.loaderSize,
            height: config.loaderSize
          }}
        ></div>

        {/* Center Logo Container */}
        {logoLoaded && (
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
        )}
      </div>

      <style>{`
        .loader-big {
          border: 4px solid #FFF;
          border-radius: 50%;
          display: inline-block;
          position: relative;
          box-sizing: border-box;
          animation: rotation 1s linear infinite;
        }

        .loader-big::after {
          content: '';
          box-sizing: border-box;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          height: 90%;
          border-radius: 50%;
          border: 4px solid transparent;
          border-bottom-color: #FF3D00;
          animation: rotation 0.8s linear infinite;
        }

        @keyframes rotation {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
