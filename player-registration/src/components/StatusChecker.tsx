import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RotateCw,
  Shield,
  Compass,
  Crosshair,
  ShieldAlert,
} from 'lucide-react';
import { PlayerStatusData, PlayingPosition } from '../types';

interface StatusCheckerProps {
  initialIdentifier?: string;
  onGoToRegister: () => void;
}

const positionIcons: Record<PlayingPosition, React.ReactNode> = {
  Goalkeeper: <ShieldAlert className="w-4 h-4 text-amber-400" />,
  Defender: <Shield className="w-4 h-4 text-blue-400" />,
  Midfielder: <Compass className="w-4 h-4 text-orange-400" />,
  Forward: <Crosshair className="w-4 h-4 text-rose-400" />,
};

export const StatusChecker: React.FC<StatusCheckerProps> = ({
  initialIdentifier = '',
  onGoToRegister,
}) => {
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState<PlayerStatusData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (queryId?: string) => {
    const query = (queryId || identifier).trim();
    if (!query) {
      setError('Please enter your Registration ID (e.g. PLR-2026-123456) or Email');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setStatusData(null);

      const res = await fetch(`/api/players/status/${encodeURIComponent(query)}`);
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'No application found for this ID or Email.');
      }

      setStatusData(result.data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve application status. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialIdentifier) {
      setIdentifier(initialIdentifier);
      handleSearch(initialIdentifier);
    }
  }, [initialIdentifier]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Search Header Card */}
      <div className="bg-pitch-card border border-pitch-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5 text-orange-400" />
            Check Player Application Status
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Enter the unique Registration ID generated upon submission, or the email address you registered with.
          </p>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              placeholder="e.g. PLR-2026-123456 or player@example.com"
              className="w-full bg-pitch-darker border border-pitch-border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 font-mono transition-all"
            />
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-football-accent hover:bg-football-accentHover disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider shadow-pitch-glow flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            {loading ? (
              <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Track Status</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Result Display Card */}
      {statusData && (
        <div className="bg-pitch-card border border-pitch-border rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          {/* Top Status Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-pitch-border pb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Registration Reference
              </span>
              <span className="text-lg font-black text-orange-400 font-mono">
                {statusData.registrationId}
              </span>
            </div>

            {/* Status Badges */}
            {statusData.status === 'APPROVED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black shadow-pitch-glow">
                <CheckCircle2 className="w-4 h-4" />
                APPROVED FOR AUCTION
              </span>
            )}

            {statusData.status === 'PENDING' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold animate-pulse">
                <Clock className="w-4 h-4" />
                UNDER REVIEW (PENDING)
              </span>
            )}

            {statusData.status === 'REJECTED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold">
                <XCircle className="w-4 h-4" />
                APPLICATION REJECTED
              </span>
            )}
          </div>

          {/* Player Identity Snapshot */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-pitch-darker border border-pitch-border">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-pitch-border shrink-0 bg-slate-900">
              <img
                src={statusData.photoUrl}
                alt="Profile Thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-white">
                {statusData.displayName}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1 font-semibold text-slate-200">
                  {positionIcons[statusData.playingPosition]}
                  {statusData.playingPosition}
                </span>
                <span>•</span>
                <span>Submitted {new Date(statusData.submittedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Status Specific Narrative Banner */}
          {statusData.status === 'APPROVED' && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
              <p className="font-bold text-sm text-emerald-400">
                🎉 Eligibility Verified by League Commissioners
              </p>
              <p className="text-slate-300 leading-relaxed">
                Your profile has been cleared and placed into the official Auction Draft Pool.
                Franchise teams will be able to bid on your player contract during the Live Auction round.
              </p>
            </div>
          )}

          {statusData.status === 'PENDING' && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300 space-y-1">
              <p className="font-bold text-sm text-amber-400">
                ⏳ Application in Review Queue
              </p>
              <p className="text-slate-300 leading-relaxed">
                League administrators are currently reviewing your documents and photo eligibility.
                Standard review turnaround is 24 to 48 hours. Please check back soon.
              </p>
            </div>
          )}

          {statusData.status === 'REJECTED' && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 space-y-1">
              <p className="font-bold text-sm text-rose-400">
                Application Status Notice
              </p>
              <p className="text-slate-300 leading-relaxed">
                Reason:{' '}
                <strong className="text-white">
                  {statusData.rejectionReason || 'Did not meet league verification standards.'}
                </strong>
              </p>
              <p className="text-slate-400 mt-2">
                You may submit a new application with updated and corrected documentation.
              </p>
              <button
                onClick={onGoToRegister}
                className="mt-2 text-xs font-bold text-rose-300 hover:text-white underline cursor-pointer"
              >
                Submit New Application →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
