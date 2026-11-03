import React, { useEffect } from 'react';
import { ArrowLeft, Compass, ShoppingBag, Sparkles, Home } from 'lucide-react';
import { updatePageSeo } from '../utils/seoUtils';

interface NotFoundPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  useEffect(() => {
    updatePageSeo({
      title: '404 - Page Not Found | Astros Kulture 240 GSM Streetwear',
      description: 'The cosmic coordinate you are looking for does not exist. Explore our 240 GSM heavyweight oversized streetwear collection.',
    });
  }, []);

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-[#FBFBFA] px-4 py-16">
      <div className="max-w-xl w-full text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold tracking-wider uppercase mb-6">
          <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          Lost in Orbit · 404 Error
        </div>

        {/* Big Code */}
        <h1 className="text-7xl sm:text-9xl font-black tracking-tight text-gray-900 font-heading mb-4">
          4<span className="text-red-600">0</span>4
        </h1>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
          This Coordinate Doesn't Exist
        </h2>

        <p className="text-sm sm:text-base text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          The page or product you're looking for might have been moved, renamed, or never existed in this universe.
        </p>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <button
            onClick={() => onNavigate('shop')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-950 hover:bg-black text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-red-500" />
            Explore 240 GSM Shop
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 font-semibold rounded-xl text-sm transition-all active:scale-95"
          >
            <Home className="w-4 h-4 text-gray-500" />
            Back to Home
          </button>
        </div>

        {/* Popular Categories */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
            Popular Destinations
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: 'Anime Collection', cat: 'Anime' },
              { label: 'Oversized 240 GSM', cat: 'Oversized' },
              { label: 'Space & Cosmic', cat: 'Space' },
              { label: 'Custom Design Studio', page: 'custom-design' },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (item.page) onNavigate(item.page);
                  else onNavigate('shop', { category: item.cat });
                }}
                className="px-3.5 py-1.5 bg-white hover:bg-red-50 hover:text-red-600 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
