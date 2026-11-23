import React from 'react';
import { PosterDataResponse, PosterSettings, DimensionConfig } from '../../types/poster';
import { Star } from 'lucide-react';

interface TemplateProps {
  data: PosterDataResponse;
  settings: PosterSettings;
  dimension: DimensionConfig;
}

export const MinimalPosterTemplate: React.FC<TemplateProps> = ({
  data,
  settings,
  dimension,
}) => {
  const { team, players, season } = data;

  return (
    <div
      style={{
        width: `${dimension.width}px`,
        height: `${dimension.height}px`,
        backgroundColor: '#000000',
      }}
      className="relative text-white font-sans flex flex-col justify-between p-14 select-none overflow-hidden"
    >
      {/* Subtle Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-start justify-between pb-8 border-b-2 border-white/20">
        <div>
          <span className="text-xs font-mono font-bold tracking-[0.3em] uppercase text-slate-400 block mb-2">
            SEASON {season} · {team.shortCode}
          </span>
          <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tighter uppercase">
            {settings.title || team.name}
          </h1>
          <p className="text-sm font-mono text-slate-400 tracking-wider uppercase mt-1">
            {settings.subtitle || 'OFFICIAL SQUAD LINEUP'}
          </p>
        </div>

        {/* Minimal Crest */}
        <div className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center text-2xl font-bold bg-white/5 shrink-0">
          {team.logoUrl && team.logoUrl.length > 2 ? (
            <img
              src={team.logoUrl}
              alt=""
              className="w-10 h-10 object-contain"
              crossOrigin="anonymous"
            />
          ) : (
            <span>{team.logoUrl || '⚽'}</span>
          )}
        </div>
      </header>

      {/* Main Squad Grid */}
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
              className="p-3 bg-[#0a0a0a] border border-white/15 flex flex-col items-center text-center relative"
            >
              <div className="relative mb-2">
                <img
                  src={p.photoUrl}
                  alt={p.fullName}
                  crossOrigin="anonymous"
                  className="w-24 h-24 sm:w-28 sm:h-28 object-cover grayscale contrast-125 bg-neutral-900 border border-white/20"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80';
                  }}
                />

                {settings.showCaptainBadge && p.isCaptain && (
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-white text-black font-mono font-black text-[9px] uppercase tracking-wider flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-black" />
                    CPT
                  </div>
                )}

                {settings.showJerseyNumbers && p.jerseyNumber && (
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/90 text-white font-mono font-black text-[11px] border border-white/30">
                    #{p.jerseyNumber}
                  </div>
                )}
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight uppercase truncate w-full">
                {p.fullName}
              </h4>

              {settings.showPositions && (
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                  {p.playingPosition}
                </span>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pt-6 border-t-2 border-white/20 flex items-center justify-between text-xs font-mono text-slate-500 uppercase tracking-widest">
        <div>{team.name} · SQUAD ARCHIVE</div>
        <div>ALL RIGHTS RESERVED · {season}</div>
      </footer>
    </div>
  );
};
