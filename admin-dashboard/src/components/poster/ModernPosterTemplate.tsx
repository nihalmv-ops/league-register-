import React from 'react';
import { PosterDataResponse, PosterSettings, DimensionConfig } from '../../types/poster';
import { Star, Trophy } from 'lucide-react';

interface TemplateProps {
  data: PosterDataResponse;
  settings: PosterSettings;
  dimension: DimensionConfig;
}

export const ModernPosterTemplate: React.FC<TemplateProps> = ({
  data,
  settings,
  dimension,
}) => {
  const { team, players, season } = data;
  const accentColor = settings.customAccentColor || team.primaryColor || '#10b981';

  return (
    <div
      style={{
        width: `${dimension.width}px`,
        height: `${dimension.height}px`,
        backgroundColor: '#070a12',
      }}
      className="relative text-white font-sans flex flex-col justify-between p-12 overflow-hidden select-none"
    >
      {/* Background Graphic Accents */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] opacity-25 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[140px] opacity-20 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/80 pointer-events-none" />

      {/* Header Section: Club Crest, Titles & Season */}
      <header className="relative z-10 flex items-center justify-between pb-6 border-b border-white/15">
        <div className="flex items-center gap-5">
          {/* Team Crest */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black bg-black/60 border-2 shadow-2xl shrink-0"
            style={{ borderColor: `${accentColor}88`, color: accentColor }}
          >
            {team.logoUrl && team.logoUrl.length > 2 ? (
              <img
                src={team.logoUrl}
                alt=""
                className="w-14 h-14 object-contain"
                crossOrigin="anonymous"
              />
            ) : (
              <span>{team.logoUrl || '⚡'}</span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full text-black font-mono shadow"
                style={{ backgroundColor: accentColor }}
              >
                OFFICIAL SQUAD
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                SEASON {season}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight uppercase">
              {settings.title || `${team.name} SQUAD`}
            </h1>
            <p className="text-sm font-semibold text-slate-300 mt-0.5 tracking-wider uppercase">
              {settings.subtitle || `OFFICIAL ROSTER ANNOUNCEMENT · ${season}`}
            </p>
          </div>
        </div>

        {/* League Watermark */}
        <div className="text-right hidden sm:block">
          <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Trophy className="w-4 h-4" style={{ color: accentColor }} />
            PREMIER LEAGUE
          </div>
          <p className="text-xs font-mono text-slate-500 mt-1">
            {players.length} SQUAD MEMBERS
          </p>
        </div>
      </header>

      {/* Main Squad Grid Section */}
      <main className="relative z-10 flex-1 my-6 flex flex-col justify-center">
        <div
          className={`grid gap-4 w-full h-full items-center content-center ${
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
              className="p-3.5 rounded-2xl bg-black/60 border border-white/10 hover:border-white/30 transition-all flex flex-col items-center text-center relative overflow-hidden group shadow-lg backdrop-blur-sm"
              style={{ borderColor: p.isCaptain ? `${accentColor}88` : undefined }}
            >
              {/* Photo Container */}
              <div className="relative mb-2.5">
                <div
                  className="absolute -inset-1 rounded-xl blur-sm opacity-20"
                  style={{ backgroundColor: accentColor }}
                />
                <img
                  src={p.photoUrl}
                  alt={p.fullName}
                  crossOrigin="anonymous"
                  className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl object-cover border-2 shadow-xl bg-slate-900"
                  style={{ borderColor: `${accentColor}66` }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80';
                  }}
                />

                {/* Captain Badge */}
                {settings.showCaptainBadge && p.isCaptain && (
                  <div className="absolute -top-1.5 -left-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-black shadow-md flex items-center gap-0.5 border border-white/50">
                    <Star className="w-2.5 h-2.5 fill-black" />
                    CPT
                  </div>
                )}

                {/* Jersey Number */}
                {settings.showJerseyNumbers && p.jerseyNumber && (
                  <div
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center font-black font-mono text-xs text-black shadow-md border border-black"
                    style={{ backgroundColor: accentColor }}
                  >
                    #{p.jerseyNumber}
                  </div>
                )}
              </div>

              {/* Player Name */}
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight truncate w-full">
                {p.fullName}
              </h3>

              {/* Position & Age Badges */}
              <div className="flex items-center justify-center gap-1.5 mt-1 flex-wrap">
                {settings.showPositions && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded text-white font-mono uppercase"
                    style={{ backgroundColor: `${accentColor}33`, borderColor: `${accentColor}55` }}
                  >
                    {p.playingPosition}
                  </span>
                )}
                {settings.showAge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                    {p.age}y
                  </span>
                )}
                {settings.showRating && p.overallRating && (
                  <span
                    className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded text-black"
                    style={{ backgroundColor: accentColor }}
                  >
                    {p.overallRating}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Section: Official League Stamp & Franchise Info */}
      <footer className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full animate-ping"
              style={{ backgroundColor: accentColor }}
            />
            <span className="font-bold text-white uppercase tracking-wider">
              {team.name}
            </span>
          </div>
          <span>·</span>
          <span>Coach: {team.coach || 'Head Coach'}</span>
          <span>·</span>
          <span>Home: {team.city || 'United Kingdom'}</span>
        </div>

        <div className="font-mono text-[11px] text-slate-500 uppercase tracking-widest">
          OFFICIAL TOURNAMENT SQUAD POSTER · {season}
        </div>
      </footer>
    </div>
  );
};
