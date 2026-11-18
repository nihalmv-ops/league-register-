import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-pitch-border bg-pitch-darkest/90 py-8 px-4 text-center text-xs text-slate-500">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span>⚽</span>
          <span className="font-bold text-slate-400">
            Premier Football League • Official Player Portal
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Season 2026/27</span>
          <span>•</span>
          <span>Verified FA Regulations</span>
          <span>•</span>
          <span className="text-emerald-400 font-mono">Phase 2 Release</span>
        </div>
      </div>
    </footer>
  );
};
