import { useState, useEffect } from 'react';
import { getConsent, updateConsent } from '../lib/analytics';

export function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = getConsent();
    if (consent === 'unset') {
      setIsVisible(true);
    } else if (consent === 'granted') {
      updateConsent(true);
    }
  }, []);

  const handleAccept = () => {
    updateConsent(true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    updateConsent(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900 border-t border-gray-800 text-white shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-300 text-center sm:text-left">
          <p>
            We use cookies to enhance your browsing experience, serve personalized ads, and analyze our traffic. By clicking &ldquo;Accept All&rdquo;, you consent to our use of cookies per our{' '}
            <a href="/privacy-policy" className="text-red-400 underline hover:text-red-300">
              Privacy Policy
            </a>.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-300 hover:text-white border border-gray-700 rounded-md hover:bg-gray-800 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
