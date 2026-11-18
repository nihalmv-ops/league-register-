import React from 'react';

export const StatCardSkeleton: React.FC = () => (
  <div className="rounded-2xl bg-pitch-card p-5 border border-pitch-border animate-pulse">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-slate-800 rounded" />
        <div className="h-8 w-16 bg-slate-700 rounded" />
      </div>
      <div className="h-10 w-10 bg-slate-800 rounded-xl" />
    </div>
    <div className="mt-4 pt-3 border-t border-pitch-border flex justify-between">
      <div className="h-3 w-28 bg-slate-800 rounded" />
      <div className="h-3 w-12 bg-slate-800 rounded" />
    </div>
  </div>
);

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr className="border-b border-pitch-border animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <div className="h-4 bg-slate-800 rounded w-full max-w-[120px]" />
      </td>
    ))}
  </tr>
);

export const ChartSkeleton: React.FC = () => (
  <div className="rounded-2xl bg-pitch-card p-6 border border-pitch-border animate-pulse space-y-4">
    <div className="flex justify-between items-center">
      <div className="h-4 w-36 bg-slate-800 rounded" />
      <div className="h-3 w-20 bg-slate-800 rounded" />
    </div>
    <div className="h-48 w-full bg-slate-800/60 rounded-xl" />
  </div>
);
