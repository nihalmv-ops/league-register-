import React from 'react';
import { ArrowDown, Shield, Sparkles, Trophy } from 'lucide-react';

interface HeroSectionProps {
  onRegisterClick: () => void;
  onStatusClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onRegisterClick,
  onStatusClick,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 text-center">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Open Status Chip */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-6 shadow-pitch-glow">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>OFFICIAL LEAGUE REGISTRATION WINDOW: 2026-27</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-5">
          Enter The Pitch.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-500">
            Get Drafted in Live Auction.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          Submit your official player application for verification. Approved players enter the
          Premier Football League auction pool where 8 franchise clubs compete to sign top talent.
        </p>

        {/* Call to action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
          <button
            onClick={onRegisterClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-football-accent hover:bg-football-accentHover text-slate-950 font-black text-sm tracking-wide shadow-pitch-glow hover:shadow-pitch-glow-lg transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Register Now</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>
          <button
            onClick={onStatusClick}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-pitch-darker hover:bg-pitch-card border border-pitch-border text-slate-200 hover:text-white font-bold text-sm transition-all cursor-pointer"
          >
            Check Existing Application
          </button>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="p-4 rounded-2xl bg-pitch-card/70 border border-pitch-border backdrop-blur-sm flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Live Auction Draft</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                Approved players are cataloged on stage for franchise bidding.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-pitch-card/70 border border-pitch-border backdrop-blur-sm flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Fair Verification</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                Transparent admin review process with unique tracking ID.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-pitch-card/70 border border-pitch-border backdrop-blur-sm flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Instant Tracking</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                Monitor your PENDING approval status anytime with your ID.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
