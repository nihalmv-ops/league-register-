import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 animate-in zoom-in-95 duration-200">
      <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center text-4xl mb-6 shadow-pitch-glow">
        ⚽
      </div>

      <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-3">
        Referee Whistle: Out of Bounds
      </span>

      <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
        404 - Page Off Pitch
      </h1>

      <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
        The requested tactical section or tournament match report cannot be found or is outside
        the active pitch boundaries.
      </p>

      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)} icon={ArrowLeft}>
          Go Back
        </Button>
        <Button variant="primary" onClick={() => navigate('/')} icon={Home}>
          Dashboard Overview
        </Button>
      </div>
    </div>
  );
};
