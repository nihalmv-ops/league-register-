import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Clock,
  ArrowRight,
  RotateCw,
  Shield,
  Compass,
  Crosshair,
  ShieldAlert,
} from 'lucide-react';
import { RegistrationSuccessData, PlayingPosition } from '../types';

interface SuccessViewProps {
  data: RegistrationSuccessData;
  onReset: () => void;
  onCheckStatus: (id: string) => void;
}

const positionIcons: Record<PlayingPosition, React.ReactNode> = {
  Goalkeeper: <ShieldAlert className="w-4 h-4 text-amber-400" />,
  Defender: <Shield className="w-4 h-4 text-blue-400" />,
  Midfielder: <Compass className="w-4 h-4 text-emerald-400" />,
  Forward: <Crosshair className="w-4 h-4 text-rose-400" />,
};

export const SuccessView: React.FC<SuccessViewProps> = ({
  data,
  onReset,
  onCheckStatus,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(data.registrationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
      {/* Success Hero Card */}
      <div className="bg-pitch-card border border-emerald-500/50 rounded-3xl p-6 sm:p-10 text-center shadow-pitch-glow-lg relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/20 blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-pitch-glow">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <span className="inline-block text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 mb-2">
          APPLICATION SUBMITTED SUCCESSFULLY
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Welcome to the Draft Pool, {data.fullName}!
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
          Your official player registration has been cataloged and is currently{' '}
          <strong className="text-amber-400">PENDING</strong> review by League Commissioners.
        </p>

        {/* Unique Registration ID Box */}
        <div className="my-6 p-4 sm:p-5 rounded-2xl bg-pitch-darker border border-pitch-border flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Official Registration ID (Save This)
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-wider">
              {data.registrationId}
            </span>
          </div>

          <button
            onClick={handleCopyId}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-pitch-card hover:bg-slate-800 border border-pitch-border text-xs text-white font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy ID</span>
              </>
            )}
          </button>
        </div>

        {/* Player Snapshot Card */}
        <div className="p-4 rounded-2xl bg-pitch-darker/60 border border-pitch-border/60 flex items-center gap-4 text-left">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500/30 shrink-0 bg-slate-900">
            <img
              src={data.photoUrl}
              alt={data.fullName}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback avatar icon if image fails to render
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-extrabold text-white truncate">
                {data.fullName}
              </h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock className="w-2.5 h-2.5" />
                PENDING
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-slate-200">
                {positionIcons[data.playingPosition]}
                {data.playingPosition}
              </span>
              <span>•</span>
              <span className="truncate">{data.email}</span>
            </div>
          </div>
        </div>

        {/* Next Steps Guide */}
        <div className="mt-8 pt-6 border-t border-pitch-border text-left space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            What Happens Next:
          </h4>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                ✓
              </span>
              <span>
                <strong>Verification:</strong> League scouts and administrators verify player eligibility and photo standards.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                ✓
              </span>
              <span>
                <strong>Auction Pool Entry:</strong> Only <strong>APPROVED</strong> players will be published on the live auction podium.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                ✓
              </span>
              <span>
                <strong>Track Live Status:</strong> Use your Registration ID ({data.registrationId}) to track commissioner review updates.
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-pitch-border flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onCheckStatus(data.registrationId)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-football-accent hover:bg-football-accentHover text-slate-950 font-black text-xs uppercase tracking-wider shadow-pitch-glow transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Track Application Status</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onReset}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-pitch-darker hover:bg-pitch-card border border-pitch-border text-xs text-slate-300 font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Register Another Player</span>
          </button>
        </div>
      </div>
    </div>
  );
};
