import React from 'react';
import { X, Check } from 'lucide-react';
import type { Product } from '../lib/types';

interface QuickSizePickerProps {
  product: Product;
  onSelectSize: (size: string) => void;
  onClose: () => void;
}

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export function QuickSizePicker({ product, onSelectSize, onClose }: QuickSizePickerProps) {
  // Extract stock map from product.sizes
  const stockMap: Record<string, number> = {};
  if (Array.isArray(product.sizes)) {
    product.sizes.forEach((s: any) => {
      stockMap[s.size] = Number(s.stock) || 0;
    });
  }

  return (
    <div 
      className="absolute inset-x-0 bottom-0 z-20 bg-white/95 backdrop-blur-md p-3 rounded-b-lg border-t border-gray-200 shadow-xl animate-fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
          Select Size (240 GSM Boxy)
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-700 rounded-full"
          title="Close size selector"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {STANDARD_SIZES.map((size) => {
          // If product.sizes array exists, check stock; otherwise assume available
          const stock = stockMap[size] !== undefined ? stockMap[size] : 10;
          const isOutOfStock = stock <= 0;

          return (
            <button
              key={size}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelectSize(size)}
              className={`py-1.5 px-1 rounded-md text-xs font-bold transition-all text-center flex flex-col items-center justify-center border ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed line-through'
                  : 'bg-white hover:bg-black hover:text-white border-gray-300 text-gray-900 active:scale-95 shadow-2xs'
              }`}
            >
              <span>{size}</span>
              {stock > 0 && stock <= 3 && (
                <span className="text-[9px] text-amber-600 font-semibold leading-none mt-0.5">
                  {stock} left
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
