import React from 'react';
import { PlayerCardItem } from '../../types/poster';
import { Star } from 'lucide-react';

interface PlayerCardViewProps {
  card: PlayerCardItem;
  id?: string;
  showJerseyNumber?: boolean;
  showPosition?: boolean;
}

export const PlayerCardView: React.FC<PlayerCardViewProps> = ({
  card,
  id,
  showJerseyNumber = true,
  showPosition = true,
}) => {
  const accentColor = card.primaryColor || '#f97316';

  return (
    <div
      id={id}
      style={{
        width: 360,
        height: 520,
        backgroundColor: '#090d16',
        borderColor: `${accentColor}55`,
      }}
      className="relative rounded-3xl overflow-hidden border-2 shadow-2xl flex flex-col justify-between p-5 text-white select-none font-sans"
    >
      {/* Background Gradient & Glow */}
      <div
        className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/90 pointer-events-none" />

      {/* Top Bar: Team Logo, Name & Rating */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black bg-black/60 border shadow-inner"
            style={{ borderColor: `${accentColor}66`, color: accentColor }}
          >
            {card.teamLogoUrl && card.teamLogoUrl.length > 2 ? (
              <img
                src={card.teamLogoUrl}
                alt=""
                className="w-7 h-7 object-contain"
                crossOrigin="anonymous"
              />
            ) : (
              <span>{card.teamLogoUrl || '⚽'}</span>
            )}
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              {card.teamName}
            </h4>
            <span className="text-[10px] font-mono text-slate-400">
              Season {card.season}
            </span>
          </div>
        </div>

        {/* Rating & Position Badge */}
        <div className="text-right">
          <div
            className="text-2xl font-black font-mono leading-none"
            style={{ color: accentColor }}
          >
            {card.overallRating || 84}
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400">
            {card.tier || 'Gold'}
          </span>
        </div>
      </div>

      {/* Center: Large Player Photo */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-3">
        <div className="relative">
          <div
            className="absolute -inset-1 rounded-2xl blur-md opacity-40"
            style={{ backgroundColor: accentColor }}
          />
          <img
            src={card.photoUrl}
            alt={card.fullName}
            crossOrigin="anonymous"
            className="relative w-44 h-44 rounded-2xl object-cover border-2 shadow-2xl bg-slate-900"
            style={{ borderColor: `${accentColor}88` }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80';
            }}
          />

          {/* Captain Badge if assigned */}
          {card.isCaptain && (
            <div
              className="absolute -top-2 -left-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-black shadow-lg flex items-center gap-1 border border-white/40"
              style={{ backgroundColor: '#fbbf24' }}
            >
              <Star className="w-3 h-3 fill-black text-black" />
              CAPTAIN
            </div>
          )}

          {/* Jersey Number Badge if available */}
          {showJerseyNumber && card.jerseyNumber && (
            <div
              className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center font-black font-mono text-sm text-black shadow-xl border-2 border-black"
              style={{ backgroundColor: accentColor }}
            >
              #{card.jerseyNumber}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar: Player Name, Position, and Details */}
      <div className="relative z-10 pt-3 border-t border-white/10 text-center">
        <h3 className="text-xl font-black text-white tracking-tight uppercase truncate">
          {card.fullName}
        </h3>

        <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
          {showPosition && (
            <span
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-md text-white font-mono uppercase"
              style={{ backgroundColor: `${accentColor}33`, borderColor: `${accentColor}66` }}
            >
              {card.playingPosition}
            </span>
          )}
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
            Age: {card.age}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            ID: {card.registrationId}
          </span>
        </div>
      </div>
    </div>
  );
};
