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
    sm: { containerWidth: 140, containerHeight: 140, logoSize: 40, svgSize: 120 },
    md: { containerWidth: 220, containerHeight: 220, logoSize: 65, svgSize: 180 },
    lg: { containerWidth: 300, containerHeight: 300, logoSize: 90, svgSize: 240 }
  };

  const config = sizeConfig[size];
  const radius = config.svgSize / 2 - 8;

  return (
    <div className={containerClass} style={{ background: bgStyle }}>
      <div className="relative flex flex-col items-center justify-center" style={{ width: config.containerWidth, height: config.containerHeight }}>
        
        {/* SVG Circular Loader */}
        <svg
          className="loader-svg"
          width={config.svgSize}
          height={config.svgSize}
          viewBox={`0 0 ${config.svgSize} ${config.svgSize}`}
          style={{ position: 'absolute' }}
        >
          <circle
            cx={config.svgSize / 2}
            cy={config.svgSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(239, 68, 68, 0.1)"
            strokeWidth="3"
          />
          <circle
            cx={config.svgSize / 2}
            cy={config.svgSize / 2}
            r={radius}
            fill="none"
            stroke="#FF3D00"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(radius * Math.PI * 0.5)} ${(radius * Math.PI * 2)}`}
            className="loader-circle"
          />
        </svg>

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
        .loader-svg {
          animation: spin 1.5s linear infinite;
          filter: drop-shadow(0 0 2px rgba(255, 61, 0, 0.1));
        }

        .loader-circle {
          stroke-dasharray: ${radius * Math.PI * 1.5};
          stroke-dashoffset: 0;
        }

        @keyframes spin {
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
