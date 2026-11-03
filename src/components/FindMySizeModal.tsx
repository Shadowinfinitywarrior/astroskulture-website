import React, { useState } from 'react';
import { X, Ruler, Sparkles, Check } from 'lucide-react';

interface FindMySizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (size: string) => void;
  availableSizes?: string[];
}

export function FindMySizeModal({ isOpen, onClose, onSelectSize, availableSizes = ['S', 'M', 'L', 'XL', 'XXL'] }: FindMySizeModalProps) {
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [preference, setPreference] = useState<'oversized' | 'relaxed'>('oversized');

  if (!isOpen) return null;

  // Calculate recommended size
  const calculateSize = (): string => {
    let base = 'M';
    if (weightKg < 60 && heightCm < 170) base = 'S';
    else if (weightKg < 72 && heightCm < 178) base = 'M';
    else if (weightKg < 84 && heightCm < 185) base = 'L';
    else if (weightKg < 95 || heightCm < 192) base = 'XL';
    else base = 'XXL';

    if (preference === 'oversized') {
      if (base === 'S') return 'M';
      if (base === 'M') return 'L';
      if (base === 'L') return 'XL';
      if (base === 'XL') return 'XXL';
      return 'XXL';
    }
    return base;
  };

  const recommendedSize = calculateSize();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-base sm:text-lg text-gray-900 font-heading">
              Find My 240 GSM Size
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-gray-400 hover:text-gray-700 rounded-full"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-4">
          <p className="text-xs sm:text-sm text-gray-600">
            Our 240 GSM tees feature an authentic drop-shoulder boxy cut. Tell us your dimensions for an accurate recommendation.
          </p>

          {/* Height Slider */}
          <div>
            <div className="flex justify-between text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
              <span>Your Height</span>
              <span className="text-red-600">{heightCm} cm ({Math.floor(heightCm / 30.48)}'{Math.round((heightCm % 30.48) / 2.54)}")</span>
            </div>
            <input
              type="range"
              min={150}
              max={205}
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full accent-red-600"
            />
          </div>

          {/* Weight Slider */}
          <div>
            <div className="flex justify-between text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
              <span>Your Weight</span>
              <span className="text-red-600">{weightKg} kg</span>
            </div>
            <input
              type="range"
              min={45}
              max={120}
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full accent-red-600"
            />
          </div>

          {/* Fit Preference */}
          <div>
            <span className="block text-xs sm:text-sm font-semibold text-gray-800 mb-2">
              Preferred Fit Profile
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPreference('oversized')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  preference === 'oversized'
                    ? 'border-red-600 bg-red-50 text-red-700 ring-1 ring-red-600'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                Signature Oversized (Drape)
              </button>
              <button
                type="button"
                onClick={() => setPreference('relaxed')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  preference === 'relaxed'
                    ? 'border-red-600 bg-red-50 text-red-700 ring-1 ring-red-600'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                Standard Boxy (Closer fit)
              </button>
            </div>
          </div>

          {/* Recommendation Result Card */}
          <div className="p-4 rounded-xl bg-gray-950 text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-red-400 block">
                Recommended Size
              </span>
              <span className="text-2xl font-black tracking-tight">
                Size {recommendedSize}
              </span>
              <p className="text-[11px] text-gray-300 mt-0.5">
                Ideal for 240 GSM boxy streetwear posture.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectSize(recommendedSize);
                onClose();
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Select Size {recommendedSize}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
