import React from 'react';
import { PosterDataResponse, PosterSettings, DimensionConfig } from '../../types/poster';
import { Star, ShieldCheck, Trophy } from 'lucide-react';

interface TemplateProps {
  data: PosterDataResponse;
  settings: PosterSettings;
  dimension: DimensionConfig;
}

export const AnnouncementPosterTemplate: React.FC<TemplateProps> = ({
  data,
  settings,
  dimension,
}) => {
  const { team, players, season } = data;
  const accentColor = settings.customAccentColor || team.primaryColor || '#f97316';

  return (
    <div
      style={{
        width: `${dimension.width}px`,
        height: `${dimension.height}px`,
        backgroundColor: '#05070e',
      }}
      className="relative text-white font-sans flex flex-col justify-between p-12 overflow-hidden select-none border-[12px] border-[#0c1222]"
    >
      {/* Top Banner Ribbon */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500" />

      {/* Decorative Diagonal Stripes in background */}
      <div className="absolute -right-40 -top-40 w-96 h-96 bg-white/5 rotate-45 pointer-events-none" />

      {/* Header Section */}
      <header className="relative z-10 text-center pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/15 text-xs font-mono font-bold uppercase tracking-widest text-amber-300 mb-3">
          <Trophy className="w-3.5 h-3.5" />
          OFFICIAL LEAGUE SQUAD ANNOUNCEMENT · SEASON {season}
        </div>

        <div className="flex items-center justify-center gap-4 my-1">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black bg-black/80 border-2 shadow-2xl"
            style={{ borderColor: accentColor }}
          >
            {team.logoUrl && team.logoUrl.length > 2 ? (
              <img
                src={team.logoUrl}
                alt=""
                className="w-12 h-12 object-contain"
                crossOrigin="anonymous"
              />
            ) : (
              <span>{team.logoUrl || '⚡'}</span>
            )}
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase drop-shadow-lg">
            {settings.title || team.name}
          </h1>
        </div>

        <p className="text-xs sm:text-sm font-mono tracking-widest uppercase text-slate-400 mt-1">
          {settings.subtitle || `CONFIRMED ROSTER & SQUAD NUMBERS · ${players.length} PLAYERS`}
        </p>
      </header>

      {/* Center Squad Cards Section */}
      <main className="relative z-10 flex-1 my-6 flex flex-col justify-center">
        <div
          className={`grid gap-3.5 w-full h-full items-center content-center ${
            players.length <= 6
              ? 'grid-cols-3'
              : players.length <= 8
              ? 'grid-cols-4'
              : players.length <= 12
              ? 'grid-cols-4'
              : 'grid-cols-5'
          }`}
        >
          {players.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-xl bg-gradient-to-b from-[#0e1628] to-[#070b14] border-2 shadow-2xl flex flex-col items-center text-center relative group"
              style={{
                borderColor: p.isCaptain ? '#fbbf24' : `${accentColor}44`,
              }}
            >
              {/* Photo Box */}
              <div className="relative mb-2">
                <img
                  src={p.photoUrl}
                  alt={p.fullName}
                  crossOrigin="anonymous"
                  className="w-26 h-26 sm:w-28 sm:h-28 rounded-lg object-cover border shadow-lg bg-slate-900"
                  style={{ borderColor: p.isCaptain ? '#fbbf24' : 'rgba(255,255,255,0.15)' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80';
                  }}
                />

                {/* Captain Gold Tag */}
                {settings.showCaptainBadge && p.isCaptain && (
                  <div className="absolute -top-1.5 -left-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-400 text-black shadow-md flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-black" />
                    CAPTAIN
                  </div>
                )}

                {/* Jersey Number */}
                {settings.showJerseyNumbers && p.jerseyNumber && (
                  <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-black/90 border border-white/30 text-white font-mono font-black text-xs">
                    #{p.jerseyNumber}
                  </div>
                )}
              </div>

              {/* Player Name */}
              <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight truncate w-full">
                {p.fullName}
              </h4>

              {/* Details Line */}
              <div className="flex items-center justify-center gap-1.5 mt-1">
                {settings.showPositions && (
                  <span
                    className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded font-mono"
                    style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
                  >
                    {p.playingPosition}
                  </span>
                )}
                {settings.showRating && (
                  <span className="text-[9px] font-mono font-bold text-slate-300">
                    OVR {p.overallRating}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Section */}
      <footer className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white uppercase">{team.name}</span>
          <span>·</span>
          <span>Max Squad: {team.maxSquadSize}</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
          <span>REGISTRATION VERIFIED</span>
          <span>·</span>
          <span className="text-amber-400">PREMIER LEAGUE 2026</span>
        </div>
      </footer>
    </div>
  );
};
