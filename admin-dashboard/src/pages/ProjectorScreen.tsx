import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { auctionService } from '../services/auctionService';
import { socketService } from '../services/socketService';
import { AuctionStatePayload } from '../types/auction';
import {
  Maximize2,
  Minimize2,
  Clock,
  Flame,
  Gavel,
  Volume2,
  VolumeX,
  TrendingUp,
} from 'lucide-react';

export const ProjectorScreen: React.FC = () => {
  const { auctionId: routeAuctionId } = useParams<{ auctionId?: string }>();
  const activeAuctionId = routeAuctionId || 'auc-2026';

  const [state, setState] = useState<AuctionStatePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30);
  const [isBiddingActive, setIsBiddingActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sold / Unsold Overlay animation state
  const [overlayStatus, setOverlayStatus] = useState<'SOLD' | 'UNSOLD' | null>(null);
  const [soldDetails, setSoldDetails] = useState<{
    teamName?: string;
    finalPrice?: number;
    playerFullName?: string;
  } | null>(null);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Fetch initial public state & connect socket
  useEffect(() => {
    let mounted = true;

    const loadState = async () => {
      try {
        setLoading(true);
        const data = await auctionService.getProjectorLive(activeAuctionId);
        if (!mounted) return;
        setState(data);
        setRemainingSeconds(data.auction.remainingSeconds || 30);
        setIsBiddingActive(data.auction.isBiddingActive || false);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || 'Unable to connect to live projector feed');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadState();

    // Setup Socket
    socketService.connect();
    socketService.joinAuction(activeAuctionId);

    const unsubState = socketService.onAuctionState((newState) => {
      if (!mounted) return;
      setState(newState);
      setRemainingSeconds(newState.auction.remainingSeconds || 0);
      setIsBiddingActive(newState.auction.isBiddingActive || false);
    });

    const unsubTick = socketService.onTimerTick((data) => {
      if (!mounted) return;
      setRemainingSeconds(data.remainingSeconds);
    });

    const unsubTimerEnded = socketService.onTimerEnded(() => {
      if (!mounted) return;
      setIsBiddingActive(false);
      setRemainingSeconds(0);
    });

    const unsubBid = socketService.onBidPlaced((data) => {
      if (!mounted) return;
      setRemainingSeconds(data.remainingSeconds);
    });

    const unsubSold = (data: any) => {
      if (!mounted) return;
      setOverlayStatus('SOLD');
      setSoldDetails({
        teamName: data.winningTeamName,
        finalPrice: data.finalPrice,
        playerFullName: data.player?.fullName,
      });
      setTimeout(() => {
        if (mounted) setOverlayStatus(null);
      }, 7000);
    };

    const unsubUnsold = (data: any) => {
      if (!mounted) return;
      setOverlayStatus('UNSOLD');
      setSoldDetails({
        playerFullName: data.player?.fullName,
      });
      setTimeout(() => {
        if (mounted) setOverlayStatus(null);
      }, 5000);
    };

    const unsubNext = () => {
      if (!mounted) return;
      setOverlayStatus(null);
      setSoldDetails(null);
    };

    const cleanupSold = socketService.onPlayerSold(unsubSold);
    const cleanupUnsold = socketService.onPlayerUnsold(unsubUnsold);
    const cleanupNext = socketService.onPlayerNext(unsubNext);

    return () => {
      mounted = false;
      unsubState();
      unsubTick();
      unsubTimerEnded();
      unsubBid();
      cleanupSold();
      cleanupUnsold();
      cleanupNext();
      socketService.leaveAuction(activeAuctionId);
    };
  }, [activeAuctionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4" />
        <h2 className="text-2xl font-black tracking-widest text-orange-400 uppercase">
          Initializing Projector Feed
        </h2>
        <p className="text-slate-500 text-sm mt-1">Connecting to League Live Auction Network...</p>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 text-rose-500">
          <Gavel className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Projector Feed Offline</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
          {error || 'Unable to establish link with auction server.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 font-bold text-white transition-all"
        >
          Reconnect
        </button>
      </div>
    );
  }

  const { auction, currentPlayer, leadingTeam, recentBids, eligibleQueue } = state;

  // Visual status pill
  const getAuctionStageText = () => {
    if (overlayStatus === 'SOLD') return 'SOLD!';
    if (overlayStatus === 'UNSOLD') return 'UNSOLD';
    if (!currentPlayer) return 'UPCOMING LOT';
    if (isBiddingActive) return 'LIVE BIDDING';
    if (auction.status === 'paused') return 'AUCTION PAUSED';
    return 'ON STAGE';
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between select-none relative overflow-hidden">
      {/* Dynamic Background Pitch Atmosphere */}
      <div className="absolute inset-0 bg-radial-gradient from-orange-950/20 via-black to-black pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-orange-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* SOLD / UNSOLD Full-Screen Overlay Animation */}
      {overlayStatus && (
        <div
          className={`absolute inset-0 z-50 flex flex-col items-center justify-center text-center p-6 transition-all duration-500 backdrop-blur-md ${
            overlayStatus === 'SOLD'
              ? 'bg-emerald-950/95 border-8 border-emerald-500'
              : 'bg-slate-950/95 border-8 border-amber-500'
          }`}
        >
          {overlayStatus === 'SOLD' ? (
            <div className="animate-in zoom-in-75 duration-300 space-y-4 max-w-3xl">
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 mb-2">
                <Gavel className="w-12 h-12 animate-bounce" />
              </div>
              <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-white uppercase drop-shadow-2xl">
                SOLD!
              </h1>
              <p className="text-2xl sm:text-4xl font-extrabold text-emerald-300">
                {soldDetails?.playerFullName || currentPlayer?.fullName}
              </p>
              <div className="py-3 px-8 rounded-2xl bg-black/50 border border-emerald-400/40 inline-block">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                  Winning Franchise
                </p>
                <p className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                  {soldDetails?.teamName || leadingTeam?.name}
                </p>
                <p className="text-2xl sm:text-3xl font-mono font-black text-emerald-400 mt-1">
                  ${soldDetails?.finalPrice?.toLocaleString() || auction.currentHighestBid.toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="animate-in zoom-in-75 duration-300 space-y-4 max-w-2xl">
              <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-amber-400 uppercase drop-shadow-2xl">
                UNSOLD
              </h1>
              <p className="text-2xl sm:text-3xl font-bold text-slate-300">
                {soldDetails?.playerFullName || currentPlayer?.fullName}
              </p>
              <p className="text-sm text-slate-400 uppercase tracking-widest">
                Player returned to the draft pool for subsequent rounds
              </p>
            </div>
          )}
        </div>
      )}

      {/* Top Navigation & Status Bar */}
      <header className="relative z-10 px-6 sm:px-12 py-5 flex items-center justify-between border-b border-white/10 bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-orange-500 animate-ping" />
            <span className="text-sm sm:text-base font-black tracking-widest uppercase text-orange-400">
              OFFICIAL LEAGUE LIVE AUCTION
            </span>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/10 text-slate-300 hidden sm:inline-block">
            {auction.name} · {auction.season}
          </span>
        </div>

        {/* Center Live Stage Pill */}
        <div className="flex items-center gap-2">
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase border shadow-lg ${
              overlayStatus === 'SOLD'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : overlayStatus === 'UNSOLD'
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : isBiddingActive
                ? 'bg-rose-600/30 text-rose-300 border-rose-500 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {getAuctionStageText()}
          </span>
          <span className="text-xs font-mono font-bold text-slate-400 hidden md:inline">
            Lot #{auction.currentLotNumber}
          </span>
        </div>

        {/* Right Tools: Fullscreen, Sound, Admin Link */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 border border-orange-500/30 transition-all text-xs flex items-center gap-1.5"
            title="Toggle Stadium Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline font-bold">
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Stadium Auction Arena */}
      <main className="relative z-10 flex-1 px-6 sm:px-12 py-6 flex flex-col justify-center max-w-7xl mx-auto w-full">
        {currentPlayer ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Stage: Player Card (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center text-center">
              <div className="relative mb-5 group">
                {/* Glowing border around high-res photo */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 rounded-3xl blur-lg opacity-70 group-hover:opacity-100 transition duration-1000" />
                <img
                  src={currentPlayer.photoUrl}
                  alt={currentPlayer.fullName}
                  className="relative w-60 h-60 sm:w-72 sm:h-72 rounded-3xl object-cover border-4 border-orange-500/80 shadow-2xl bg-slate-900"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80';
                  }}
                />
                <span className="absolute -bottom-3 -right-2 px-4 py-1 rounded-full text-sm font-black bg-orange-600 text-white shadow-xl uppercase tracking-wider border-2 border-black">
                  {currentPlayer.playingPosition}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
                {currentPlayer.fullName}
              </h1>

              {/* Player Metadata (Privacy Safe: NO email, NO phone) */}
              <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                <span className="px-3.5 py-1 rounded-xl bg-white/10 text-slate-200 text-sm font-bold border border-white/15">
                  Age: {currentPlayer.age} yrs
                </span>
                <span className="px-3.5 py-1 rounded-xl bg-orange-500/20 text-orange-300 text-sm font-bold border border-orange-500/30">
                  Rating: {currentPlayer.overallRating || 84}
                </span>
                <span className="px-3.5 py-1 rounded-xl bg-white/5 text-slate-400 font-mono text-xs">
                  ID: {currentPlayer.registrationId}
                </span>
              </div>

              {/* Base Price Pill */}
              <div className="mt-5 px-6 py-2 rounded-2xl bg-white/5 border border-white/10 inline-flex items-center gap-3">
                <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                  Opening Base Price:
                </span>
                <span className="text-lg font-mono font-bold text-white">
                  ${auction.basePrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Right Stage: Giant Bid Spotlight & Server Countdown (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              {/* Countdown Timer Spotlight */}
              <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-950/80 border-2 border-white/15 shadow-2xl backdrop-blur-xl">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-400" />
                    Hammer Countdown
                  </p>
                  <p className="text-xs text-slate-500">
                    {isBiddingActive
                      ? 'Server-synchronized hammer countdown'
                      : 'Timer halted. Awaiting arbitrator action.'}
                  </p>
                </div>

                <div
                  className={`text-5xl sm:text-7xl font-mono font-black tracking-tighter px-6 py-2 rounded-2xl transition-all ${
                    remainingSeconds <= 5 && isBiddingActive
                      ? 'text-rose-500 bg-rose-950/40 border border-rose-500 animate-pulse'
                      : remainingSeconds <= 10 && isBiddingActive
                      ? 'text-amber-400 bg-amber-950/40 border border-amber-500'
                      : 'text-orange-400 bg-black/40 border border-white/10'
                  }`}
                >
                  00:{remainingSeconds.toString().padStart(2, '0')}
                </div>
              </div>

              {/* Giant Current Highest Bid Box */}
              <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-orange-950/70 via-black to-slate-950 border-4 border-orange-500 shadow-pitch-glow text-center sm:text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-orange-400 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                    CURRENT HIGHEST BID
                  </span>
                  {isBiddingActive && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      ACCEPTING BIDS
                    </span>
                  )}
                </div>

                {/* Highest Bid Number */}
                <div className="text-5xl sm:text-7xl md:text-8xl font-black font-mono text-white tracking-tight my-2">
                  ${auction.currentHighestBid > 0 ? auction.currentHighestBid.toLocaleString() : '---'}
                </div>

                {/* Leading Franchise Banner */}
                {leadingTeam ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 pt-6 border-t border-orange-500/30">
                    <img
                      src={leadingTeam.logoUrl}
                      alt={leadingTeam.name}
                      className="w-16 h-16 rounded-full bg-slate-900 p-1 object-contain border-2 border-orange-500 shadow-xl"
                    />
                    <div className="text-center sm:text-left">
                      <p className="text-xs text-orange-400 uppercase tracking-widest font-bold">
                        Leading Franchise
                      </p>
                      <h2 className="text-2xl sm:text-3xl font-black text-white leading-none mt-0.5">
                        {leadingTeam.name}
                      </h2>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        Franchise Code: {leadingTeam.shortCode}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 pt-4 border-t border-white/10 text-slate-400 text-sm font-medium">
                    Awaiting opening bid of ${auction.basePrice.toLocaleString()}...
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-24 text-center max-w-2xl mx-auto space-y-4">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
              <Gavel className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Awaiting Next Draft Lot
            </h1>
            <p className="text-slate-400 text-base">
              The commissioner is currently preparing the next approved candidate for the bidding podium.
            </p>
            {eligibleQueue.length > 0 && (
              <p className="text-xs text-orange-400 font-mono">
                {eligibleQueue.length} approved candidates on deck in the auction room.
              </p>
            )}
          </div>
        )}
      </main>

      {/* Bottom Ticker: Recent Bids & Upcoming Lots */}
      <footer className="relative z-10 px-6 sm:px-12 py-4 border-t border-white/10 bg-black/80 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        {/* Recent Bids Ticker */}
        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto">
          <span className="text-[11px] font-black uppercase text-orange-400 tracking-wider shrink-0 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            LIVE TICKER:
          </span>
          {recentBids.length > 0 ? (
            <div className="flex items-center gap-4 text-xs font-mono">
              {recentBids.slice(0, 3).map((b, i) => (
                <div key={b.id || i} className="flex items-center gap-1.5 shrink-0">
                  <span className="font-bold text-white">{b.teamName}</span>
                  <span className="text-emerald-400 font-bold">${b.amount.toLocaleString()}</span>
                  <span className="text-slate-600">·</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-slate-500">No active bids yet on this lot.</span>
          )}
        </div>

        {/* Footer Credit & Privacy Statement */}
        <div className="text-[11px] text-slate-500 font-mono shrink-0">
          STADIUM DISPLAY ENGINE · PRIVACY-COMPLIANT BROADCAST
        </div>
      </footer>
    </div>
  );
};
