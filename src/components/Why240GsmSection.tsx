import React from 'react';
import { ShieldCheck, Sparkles, Wind, Layers, Award, Check } from 'lucide-react';

export function Why240GsmSection() {
  const comparisonRows = [
    {
      metric: 'Knit Structure',
      fastFashion: 'Single jersey, loosely spun yarn',
      standardHeavy: 'Standard jersey cotton',
      astros: '100% Super Combed Compact Cotton (24-singles)',
      highlight: true
    },
    {
      metric: 'Silhouette & Drape',
      fastFashion: 'Clings to body; droops after sweat',
      standardHeavy: 'Moderate structure; standard cut',
      astros: 'Structured drop-shoulder; boxy luxury streetwear silhouette',
      highlight: true
    },
    {
      metric: 'Opacity & Body',
      fastFashion: 'Semi-transparent in light (see-through)',
      standardHeavy: 'Mostly opaque',
      astros: '100% Solid Opacity; Zero see-through in any lighting',
      highlight: true
    },
    {
      metric: 'Wash Durability',
      fastFashion: 'Shrinks 5–8%; collar ribs bacon',
      standardHeavy: 'Slight shrinkage; rib warp',
      astros: 'Bio-washed, pre-shrunk; 2x2 lycra ribbed collar stays firm',
      highlight: true
    },
    {
      metric: 'Indian Climate Fit',
      fastFashion: 'Sweat-soaking, odor-trapping',
      standardHeavy: 'Reasonable breathability',
      astros: 'Breathable combed natural fibers; ideal for summer air & AC rooms',
      highlight: true
    }
  ];

  return (
    <section className="mt-12 md:mt-16 bg-[#FAFAF8] rounded-2xl border border-gray-200/90 p-5 sm:p-8 md:p-10 shadow-xs">
      <div className="max-w-3xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold tracking-wider uppercase mb-3">
          <Award className="w-3.5 h-3.5" />
          The Fabric Standard
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-950 font-heading tracking-tight">
          Why 240 GSM Combed Cotton?
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mt-2 leading-relaxed">
          Standard fast-fashion tees (160–180 GSM) are lightweight, thin, and cling unflatteringly in Indian humidity. 
          At <strong>240 GSM</strong>, our super combed compact cotton delivers the definitive boxy drop-shoulder posture, 
          dense zero see-through body, and all-day breathable comfort.
        </p>
      </div>

      {/* Comparison Matrix Table */}
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <table className="w-full text-left text-xs sm:text-sm border-collapse bg-white rounded-xl overflow-hidden shadow-xs border border-gray-200">
          <thead>
            <tr className="bg-gray-100/80 border-b border-gray-200 text-gray-700">
              <th className="py-3.5 px-3 sm:px-4 font-bold uppercase tracking-wider text-[11px] sm:text-xs">
                Fabric Metric
              </th>
              <th className="py-3.5 px-3 sm:px-4 text-gray-500 font-semibold text-[11px] sm:text-xs">
                160–180 GSM (Fast Fashion)
              </th>
              <th className="py-3.5 px-3 sm:px-4 text-gray-500 font-semibold text-[11px] sm:text-xs hidden md:table-cell">
                200–220 GSM (Standard)
              </th>
              <th className="py-3.5 px-3 sm:px-4 bg-gray-950 text-white font-bold text-[11px] sm:text-xs">
                240 GSM Astros Kulture
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {comparisonRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-3.5 px-3 sm:px-4 font-bold text-gray-900 whitespace-nowrap sm:whitespace-normal">
                  {row.metric}
                </td>
                <td className="py-3.5 px-3 sm:px-4 text-gray-500">
                  {row.fastFashion}
                </td>
                <td className="py-3.5 px-3 sm:px-4 text-gray-500 hidden md:table-cell">
                  {row.standardHeavy}
                </td>
                <td className="py-3.5 px-3 sm:px-4 bg-red-50/40 font-semibold text-gray-950 border-l border-red-100">
                  <div className="flex items-start gap-1.5">
                    <Check className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{row.astros}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Feature Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-red-100 text-red-600 flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-950">Zero See-Through</h4>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              100% opaque density in direct sunlight and camera flashes.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-red-100 text-red-600 flex-shrink-0">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-950">Indian Summer Tested</h4>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              Breathable natural fibers create a ventilated air pocket that resists sticking.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-red-100 text-red-600 flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-950">Pre-Shrunk & Bio-Washed</h4>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              Maintains exact drop-shoulder silhouette under 1.5% shrinkage over 100+ washes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
