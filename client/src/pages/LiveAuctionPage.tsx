import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { auctionService } from '../services/auctionService';
import { socketService } from '../services/socketService';
import {
  AuctionStatePayload,
  AuctionResultRecord,
  AuctionPlayer,
} from '../types/auction';
import {
  Gavel,
  Radio,
  Clock,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  Users,
  TrendingUp,
  Monitor,
  ExternalLink,
  AlertTriangle,
  Flame,
  ChevronRight,
} from 'lucide-react';

export const LiveAuctionPage: React.FC = () => {
  const [auctionState, setAuctionState] = useState<AuctionStatePayload | null>(null);
  const [history, setHistory] = useState<AuctionResultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'control' | 'queue' | 'history' | 'franchises'>('control');

  // Timer state
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30);
  const [isBiddingActive, setIsBiddingActive] = useState<boolean>(false);

  // Modal for selecting player
  const [isSelectPlayerModalOpen, setIsSelectPlayerModalOpen] = useState(false);
  const [selectedPlayerForStage, setSelectedPlayerForStage] = useState<AuctionPlayer | null>(null);
  const [customBasePrice, setCustomBasePrice] = useState<number>(100000);
  const [customDuration, setCustomDuration] = useState<number>(30);

  // Success / Announcement banner
  const [announcement, setAnnouncement] = useState<{
    type: 'sold' | 'unsold' | 'bid';
    message: string;
    subtext?: string;
  } | null>(null);

  const announcementTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showAnnouncement = (type: 'sold' | 'unsold' | 'bid', message: string, subtext?: string) => {
    if (announcementTimeoutRef.current) clearTimeout(announcementTimeoutRef.current);
    setAnnouncement({ type, message, subtext });
    announcementTimeoutRef.current = setTimeout(() => {
      setAnnouncement(null);
    }, 6000);
  };

  // Initial Fetch & Socket Connection
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await auctionService.getActiveAuction();
        if (!mounted) return;
        setAuctionState(data);
        setRemainingSeconds(data.auction.remainingSeconds || 30);
        setIsBiddingActive(data.auction.isBiddingActive || false);

        // Load history
        try {
          const hist = await auctionService.getAuctionHistory(data.auction._id);
          if (mounted) setHistory(hist);
        } catch (e) {
          console.warn('Could not load auction history', e);
        }
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || 'Failed to initialize auction control room');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    // Connect Socket.IO
    socketService.connect();
    socketService.joinAuction('auc-2026');

    // Subscribe to events
    const unsubState = socketService.onAuctionState((state) => {
      if (!mounted) return;
      setAuctionState(state);
      setRemainingSeconds(state.auction.remainingSeconds || 0);
      setIsBiddingActive(state.auction.isBiddingActive || false);
    });

    const unsubTick = socketService.onTimerTick((data) => {
      if (!mounted) return;
      setRemainingSeconds(data.remainingSeconds);
    });

    const unsubTimerEnded = socketService.onTimerEnded(() => {
      if (!mounted) return;
      setIsBiddingActive(false);
      setRemainingSeconds(0);
      showAnnouncement('unsold', '⏰ TIME EXPIRED!', 'Hammer down! Timer has reached zero.');
    });

    const unsubBid = socketService.onBidPlaced((data) => {
      if (!mounted) return;
      setRemainingSeconds(data.remainingSeconds);
      showAnnouncement(
        'bid',
        `💰 NEW HIGHEST BID: $${data.currentHighestBid.toLocaleString()}`,
        `${data.leadingTeam.name} leads the auction floor!`
      );
    });

    const unsubSold = socketService.onPlayerSold((data) => {
      if (!mounted) return;
      showAnnouncement(
        'sold',
        `🔨 SOLD TO ${data.winningTeamName?.toUpperCase()}!`,
        `Final Price: $${data.finalPrice?.toLocaleString()}`
      );
      // Refresh history
      if (auctionState?.auction?._id) {
        auctionService.getAuctionHistory(auctionState.auction._id).then(setHistory);
      }
    });

    const unsubUnsold = socketService.onPlayerUnsold(() => {
      if (!mounted) return;
      showAnnouncement('unsold', '⚪ LOT DECLARED UNSOLD', 'Player returned to unsold pool.');
      if (auctionState?.auction?._id) {
        auctionService.getAuctionHistory(auctionState.auction._id).then(setHistory);
      }
    });

    const unsubNext = socketService.onPlayerNext((data) => {
      if (!mounted) return;
      showAnnouncement(
        'bid',
        `🎯 LOT #${data.lotNumber} ON STAGE: ${data.player?.fullName}`,
        `Base Price: $${data.basePrice?.toLocaleString()}`
      );
    });

    return () => {
      mounted = false;
      if (announcementTimeoutRef.current) clearTimeout(announcementTimeoutRef.current);
      unsubState();
      unsubTick();
      unsubTimerEnded();
      unsubBid();
      unsubSold();
      unsubUnsold();
      unsubNext();
      socketService.leaveAuction('auc-2026');
    };
  }, []);

  // Admin Actions
  const handleStartAuction = async () => {
    if (!auctionState) return;
    try {
      setActionLoading('start');
      const updated = await auctionService.startAuction(auctionState.auction._id);
      setAuctionState(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to start auction');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePauseAuction = async () => {
    if (!auctionState) return;
    try {
      setActionLoading('pause');
      const updated = await auctionService.pauseAuction(auctionState.auction._id);
      setAuctionState(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to pause auction');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeAuction = async () => {
    if (!auctionState) return;
    try {
      setActionLoading('resume');
      const updated = await auctionService.resumeAuction(auctionState.auction._id);
      setAuctionState(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to resume auction');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenSelectPlayer = (player?: AuctionPlayer) => {
    if (player) {
      setSelectedPlayerForStage(player);
      setCustomBasePrice(player.basePrice || 100000);
    } else if (auctionState?.eligibleQueue && auctionState.eligibleQueue.length > 0) {
      setSelectedPlayerForStage(auctionState.eligibleQueue[0]);
      setCustomBasePrice(auctionState.eligibleQueue[0].basePrice || 100000);
    }
    setIsSelectPlayerModalOpen(true);
  };

  const handleConfirmSelectPlayer = async () => {
    if (!auctionState || !selectedPlayerForStage) return;
    try {
      setActionLoading('next-player');
      const updated = await auctionService.selectNextPlayer(
        auctionState.auction._id,
        selectedPlayerForStage._id,
        customBasePrice,
        customDuration
      );
      setAuctionState(updated);
      setIsSelectPlayerModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to bring player to stage');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartBidding = async () => {
    if (!auctionState) return;
    try {
      setActionLoading('start-bidding');
      const updated = await auctionService.startBidding(
        auctionState.auction._id,
        customDuration || auctionState.auction.countdownDuration || 30
      );
      setAuctionState(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to start bidding clock');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetTimer = async () => {
    if (!auctionState) return;
    try {
      setActionLoading('reset-timer');
      const updated = await auctionService.resetTimer(
        auctionState.auction._id,
        auctionState.auction.countdownDuration || 30
      );
      setAuctionState(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to reset timer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclareSold = async () => {
    if (!auctionState) return;
    if (
      !confirm(
        `🔨 DECLARE SOLD?\n\nSell ${auctionState.currentPlayer?.fullName} to ${auctionState.leadingTeam?.name} for $${auctionState.auction.currentHighestBid.toLocaleString()}?`
      )
    ) {
      return;
    }
    try {
      setActionLoading('sold');
      const res = await auctionService.declareSold(auctionState.auction._id);
      setAuctionState(res.state);
    } catch (err: any) {
      alert(err.message || 'Failed to declare SOLD');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclareUnsold = async () => {
    if (!auctionState) return;
    if (
      !confirm(
        `⚪ DECLARE UNSOLD?\n\nMark ${auctionState.currentPlayer?.fullName} as UNSOLD?`
      )
    ) {
      return;
    }
    try {
      setActionLoading('unsold');
      const res = await auctionService.declareUnsold(auctionState.auction._id);
      setAuctionState(res.state);
    } catch (err: any) {
      alert(err.message || 'Failed to declare UNSOLD');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-medium">Connecting to Live Auction Floor...</p>
      </div>
    );
  }

  if (error || !auctionState) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-red-500/30 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Live Auction Arena Offline</h2>
        <p className="text-slate-400 text-sm mb-6">{error || 'Could not fetch active auction session.'}</p>
        <Button onClick={() => window.location.reload()} variant="primary">
          Reconnect to Floor
        </Button>
      </div>
    );
  }

  const { auction, currentPlayer, leadingTeam, recentBids, eligibleQueue, teams } = auctionState;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Live Announcement Banner */}
      {announcement && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all duration-300 shadow-xl ${
            announcement.type === 'sold'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
              : announcement.type === 'bid'
              ? 'bg-orange-950/90 border-orange-500 text-orange-200'
              : 'bg-slate-900/90 border-slate-600 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {announcement.type === 'sold' ? (
              <Gavel className="w-7 h-7 text-emerald-400 animate-bounce" />
            ) : announcement.type === 'bid' ? (
              <Flame className="w-7 h-7 text-orange-400 animate-pulse" />
            ) : (
              <Clock className="w-7 h-7 text-slate-400" />
            )}
            <div>
              <p className="font-black text-lg tracking-tight">{announcement.message}</p>
              {announcement.subtext && (
                <p className="text-xs opacity-80">{announcement.subtext}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setAnnouncement(null)}
            className="text-xs opacity-60 hover:opacity-100 px-2 py-1 rounded bg-black/40"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner & Live Control Room Status */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-orange-950/70 via-pitch-card to-slate-900 border border-orange-500/40 shadow-pitch-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                auction.status === 'live'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                  : auction.status === 'paused'
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <Radio className="w-3 h-3" />
              {auction.status.toUpperCase()} DRAFT FLOOR
            </span>
            <Badge variant="orange" size="sm">
              Session: {auction.name}
            </Badge>
            <span className="text-xs text-slate-400 font-mono">
              Lot #{auction.currentLotNumber} of {auction.totalLotsCount || eligibleQueue.length}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Executive Auction Control Deck
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-0.5">
            Admin console for live bidding arbitration, server-authoritative timer execution,
            lot sequencing, and atomic squad purse deductions.
          </p>
        </div>

        {/* Quick Launch Buttons for External Screens */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href="/auction/projector"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/40 text-xs font-bold transition-all shadow-sm hover:scale-[1.02]"
          >
            <Monitor className="w-4 h-4 text-orange-400" />
            Projector Screen
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
          <a
            href="/auction/manager"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-sm hover:scale-[1.02]"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            Manager Portal
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-pitch-border pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('control')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'control'
              ? 'bg-football-accent text-slate-950 shadow-pitch-glow'
              : 'text-slate-400 hover:text-white bg-pitch-darker'
          }`}
        >
          Stage Control Room
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'queue'
              ? 'bg-football-accent text-slate-950 shadow-pitch-glow'
              : 'text-slate-400 hover:text-white bg-pitch-darker'
          }`}
        >
          Draft Queue ({eligibleQueue.length} Approved)
        </button>
        <button
          onClick={() => setActiveTab('franchises')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'franchises'
              ? 'bg-football-accent text-slate-950 shadow-pitch-glow'
              : 'text-slate-400 hover:text-white bg-pitch-darker'
          }`}
        >
          Franchise Purses ({teams.length} Teams)
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'history'
              ? 'bg-football-accent text-slate-950 shadow-pitch-glow'
              : 'text-slate-400 hover:text-white bg-pitch-darker'
          }`}
        >
          Auction Ledger ({history.length} Lots Resolved)
        </button>
      </div>

      {/* Tab 1: Stage Control Room */}
      {activeTab === 'control' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stage Spotlight Card (Col Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border-orange-500/30 bg-gradient-to-b from-pitch-card to-slate-950 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-pitch-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <Gavel className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">Active Stage Spotlight</h2>
                    <p className="text-xs text-slate-400">
                      {currentPlayer
                        ? `Lot #${auction.currentLotNumber}: ${currentPlayer.fullName}`
                        : 'No player currently on stage'}
                    </p>
                  </div>
                </div>

                {/* Server Timer Pill */}
                <div className="flex items-center gap-3">
                  <div
                    className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-mono font-bold text-sm ${
                      remainingSeconds <= 5 && isBiddingActive
                        ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                        : remainingSeconds <= 10 && isBiddingActive
                        ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                        : 'bg-pitch-darker border-pitch-border text-orange-400'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>00:{remainingSeconds.toString().padStart(2, '0')}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-sans">
                      {isBiddingActive ? 'LIVE CLOCK' : 'STOPPED'}
                    </span>
                  </div>
                </div>
              </div>

              {currentPlayer ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Photo & Badges (5 cols) */}
                  <div className="md:col-span-5 flex flex-col items-center text-center p-4 rounded-2xl bg-pitch-darker border border-pitch-border relative">
                    <div className="relative mb-3">
                      <img
                        src={currentPlayer.photoUrl}
                        alt={currentPlayer.fullName}
                        className="w-36 h-36 rounded-2xl object-cover border-2 border-orange-500/50 shadow-2xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop&q=80';
                        }}
                      />
                      <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-600 text-white shadow-md">
                        {currentPlayer.playingPosition}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white">{currentPlayer.fullName}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Reg ID: {currentPlayer.registrationId}
                    </p>

                    <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        Age: {currentPlayer.age} yrs
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Rating: {currentPlayer.overallRating || 84}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Status: APPROVED
                      </span>
                    </div>
                  </div>

                  {/* Financial & Bid Spotlight (7 cols) */}
                  <div className="md:col-span-7 space-y-4">
                    {/* Base Price Card */}
                    <div className="p-3.5 rounded-xl bg-pitch-darker border border-pitch-border flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Draft Base Price:</span>
                      <span className="text-base font-bold text-slate-200 font-mono">
                        ${auction.basePrice.toLocaleString()}
                      </span>
                    </div>

                    {/* Current Highest Bid Card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-950/60 to-pitch-darker border-2 border-orange-500 shadow-pitch-glow">
                      <div className="flex items-center justify-between text-xs text-orange-400 font-bold mb-1">
                        <span>CURRENT HIGHEST BID</span>
                        {isBiddingActive && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            FLOOR OPEN
                          </span>
                        )}
                      </div>

                      <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight my-1">
                        ${auction.currentHighestBid > 0 ? auction.currentHighestBid.toLocaleString() : 'No Bids Yet'}
                      </div>

                      {leadingTeam ? (
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-orange-500/30">
                          <img
                            src={leadingTeam.logoUrl}
                            alt={leadingTeam.name}
                            className="w-8 h-8 rounded-full bg-slate-800 p-0.5 object-contain border border-orange-500/40"
                          />
                          <div>
                            <p className="text-xs font-bold text-white leading-none">
                              {leadingTeam.name}
                            </p>
                            <p className="text-[11px] text-orange-400/90 font-mono mt-0.5">
                              Remaining Purse: ${leadingTeam.remainingBudget?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 mt-2 italic">
                          Awaiting opening bid of ${auction.basePrice.toLocaleString()} or above...
                        </p>
                      )}
                    </div>

                    {/* Quick Admin Actions on Stage */}
                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      <Button
                        variant="primary"
                        onClick={handleDeclareSold}
                        disabled={auction.currentHighestBid <= 0 || actionLoading !== null}
                        icon={Gavel}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black"
                      >
                        DECLARE SOLD
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleDeclareUnsold}
                        disabled={actionLoading !== null}
                        icon={XCircle}
                        className="border-amber-500/40 text-amber-300 hover:bg-amber-950/40 font-bold"
                      >
                        DECLARE UNSOLD
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-500">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Podium is Empty</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Select an approved player from the draft queue to bring them to the podium and begin bidding.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => handleOpenSelectPlayer()}
                    icon={ChevronRight}
                    className="mt-2"
                  >
                    Select Player from Queue ({eligibleQueue.length} Ready)
                  </Button>
                </div>
              )}
            </Card>

            {/* Admin Command Deck (Play / Pause / Next Player / Timer Controls) */}
            <Card className="p-6 border-pitch-border bg-pitch-card">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                Floor Arbitration Controls
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {auction.status === 'live' ? (
                  <Button
                    variant="secondary"
                    onClick={handlePauseAuction}
                    disabled={actionLoading !== null}
                    icon={Pause}
                  >
                    Pause Draft
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={auction.status === 'paused' ? handleResumeAuction : handleStartAuction}
                    disabled={actionLoading !== null}
                    icon={Play}
                  >
                    {auction.status === 'paused' ? 'Resume Draft' : 'Start Draft'}
                  </Button>
                )}

                <Button
                  variant="secondary"
                  onClick={() => handleOpenSelectPlayer()}
                  disabled={actionLoading !== null || eligibleQueue.length === 0}
                  icon={Users}
                >
                  Next Player...
                </Button>

                <Button
                  variant="secondary"
                  onClick={handleStartBidding}
                  disabled={!currentPlayer || isBiddingActive || actionLoading !== null}
                  icon={Play}
                  className="text-emerald-400 border-emerald-500/30"
                >
                  Start Clock (30s)
                </Button>

                <Button
                  variant="secondary"
                  onClick={handleResetTimer}
                  disabled={!currentPlayer || actionLoading !== null}
                  icon={RotateCcw}
                >
                  Reset Clock
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column: Live Bids Stream & Quick Queue (Col Span 1) */}
          <div className="space-y-6">
            {/* Live Bids Feed */}
            <Card className="p-5 border-pitch-border bg-pitch-card">
              <div className="flex items-center justify-between pb-3 border-b border-pitch-border mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  <h3 className="text-sm font-bold text-white">Live Bids Stream</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {recentBids.length} bids
                </span>
              </div>

              {recentBids.length > 0 ? (
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {recentBids.map((b, idx) => (
                    <div
                      key={b.id || idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        idx === 0
                          ? 'bg-orange-950/40 border-orange-500/50 shadow-sm'
                          : 'bg-pitch-darker border-pitch-border text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          {idx === 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
                          )}
                          <span className="font-bold text-white">{b.teamName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Mgr: {b.managerName}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-emerald-400">
                          ${b.amount.toLocaleString()}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {new Date(b.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No bids recorded for this lot yet.
                </div>
              )}
            </Card>

            {/* Upcoming On-Deck Queue */}
            <Card className="p-5 border-pitch-border bg-pitch-card">
              <div className="flex items-center justify-between pb-3 border-b border-pitch-border mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Next Up in Draft</h3>
                </div>
                <button
                  onClick={() => setActiveTab('queue')}
                  className="text-xs text-orange-400 hover:underline font-bold"
                >
                  View All ({eligibleQueue.length})
                </button>
              </div>

              <div className="space-y-2">
                {eligibleQueue.slice(0, 4).map((p) => (
                  <div
                    key={p._id}
                    className="p-2.5 rounded-xl bg-pitch-darker border border-pitch-border flex items-center justify-between gap-3 hover:border-orange-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={p.photoUrl}
                        alt={p.fullName}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{p.fullName}</p>
                        <p className="text-[10px] text-slate-400">
                          {p.playingPosition} · Base: ${p.basePrice?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenSelectPlayer(p)}
                      disabled={actionLoading !== null}
                      className="text-[11px] py-1 px-2.5 shrink-0"
                    >
                      Stage
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Draft Queue */}
      {activeTab === 'queue' && (
        <Card className="p-6 border-pitch-border bg-pitch-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Eligible Draft Pool</h3>
              <p className="text-xs text-slate-400">
                Only approved players with status "upcoming" or "unsold" can enter the auction draft.
              </p>
            </div>
            <span className="text-xs font-bold text-orange-400 px-3 py-1 rounded-full bg-orange-950/60 border border-orange-500/40 font-mono">
              {eligibleQueue.length} Players Eligible
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eligibleQueue.map((p) => (
              <div
                key={p._id}
                className="p-4 rounded-xl bg-pitch-darker border border-pitch-border hover:border-orange-500/50 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={p.photoUrl}
                    alt={p.fullName}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{p.fullName}</h4>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-orange-400 mt-1">
                      {p.playingPosition}
                    </span>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">
                      Reg: {p.registrationId}
                    </p>
                    <p className="text-xs font-mono font-bold text-emerald-400 mt-1">
                      Base: ${p.basePrice?.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-pitch-border flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">
                    Rating: {p.overallRating || 82}
                  </span>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleOpenSelectPlayer(p)}
                    icon={Gavel}
                  >
                    Put on Stage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 3: Franchise Purses */}
      {activeTab === 'franchises' && (
        <Card className="p-6 border-pitch-border bg-pitch-card">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">Franchise Purse & Roster Tracker</h3>
            <p className="text-xs text-slate-400">
              Live remaining budgets and squad slot utilization across all 8 competing franchises.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teams.map((t) => {
              const percentBudgetLeft = Math.round((t.remainingBudget / t.totalBudget) * 100);
              return (
                <div
                  key={t.id}
                  className="p-4 rounded-xl bg-pitch-darker border border-pitch-border flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={t.logoUrl}
                      alt={t.name}
                      className="w-10 h-10 rounded-full bg-slate-800 p-0.5 object-contain border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{t.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        {t.shortCode}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-400">Remaining:</span>
                        <span className="font-bold text-emerald-400">
                          ${t.remainingBudget.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-orange-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentBudgetLeft}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-pitch-border">
                      <span>Squad:</span>
                      <span className="font-mono text-white font-bold">
                        {t.playersCount} / {t.maxSquadSize}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tab 4: Auction Ledger / History */}
      {activeTab === 'history' && (
        <Card className="p-6 border-pitch-border bg-pitch-card">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Resolved Lots Ledger</h3>
              <p className="text-xs text-slate-400">
                Official transaction record of all sold and unsold players in this auction draft.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={RotateCcw}
              onClick={() => {
                if (auction._id) {
                  auctionService.getAuctionHistory(auction._id).then(setHistory);
                }
              }}
            >
              Refresh Ledger
            </Button>
          </div>

          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-pitch-darker text-slate-400 uppercase font-mono text-[10px] border-b border-pitch-border">
                  <tr>
                    <th className="py-3 px-4">Lot #</th>
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4">Winning Franchise</th>
                    <th className="py-3 px-4">Final Price</th>
                    <th className="py-3 px-4">Total Bids</th>
                    <th className="py-3 px-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pitch-border">
                  {history.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        #{record.lotNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {record.player?.photoUrl && (
                            <img
                              src={record.player.photoUrl}
                              alt=""
                              className="w-7 h-7 rounded object-cover"
                            />
                          )}
                          <span className="font-bold text-white">
                            {record.player?.fullName || record.playerId}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            record.resultStatus === 'SOLD'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {record.resultStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-200">
                        {record.winningTeamName || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        {record.finalPrice > 0 ? `$${record.finalPrice.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono">{record.totalBidsCount}</td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        {new Date(record.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              No auction lots have been resolved yet.
            </div>
          )}
        </Card>
      )}

      {/* Modal: Select Player for Podium */}
      <Modal
        isOpen={isSelectPlayerModalOpen}
        onClose={() => setIsSelectPlayerModalOpen(false)}
        title="Put Player on Auction Podium"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Select the player and configure the opening base price and countdown clock for this lot.
          </p>

          {/* Player Select */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Select Approved Player:
            </label>
            <select
              value={selectedPlayerForStage?._id || ''}
              onChange={(e) => {
                const p = eligibleQueue.find((item) => item._id === e.target.value);
                if (p) {
                  setSelectedPlayerForStage(p);
                  setCustomBasePrice(p.basePrice || 100000);
                }
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
            >
              {eligibleQueue.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.fullName} ({p.playingPosition} - Reg: {p.registrationId})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Player Preview Card */}
          {selectedPlayerForStage && (
            <div className="p-3 rounded-xl bg-pitch-darker border border-pitch-border flex items-center gap-3">
              <img
                src={selectedPlayerForStage.photoUrl}
                alt={selectedPlayerForStage.fullName}
                className="w-12 h-12 rounded-lg object-cover border border-slate-700"
              />
              <div>
                <h4 className="text-sm font-bold text-white">
                  {selectedPlayerForStage.fullName}
                </h4>
                <p className="text-xs text-slate-400">
                  {selectedPlayerForStage.playingPosition} · Age: {selectedPlayerForStage.age} yrs
                </p>
              </div>
            </div>
          )}

          {/* Base Price Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Draft Base Price ($):
            </label>
            <input
              type="number"
              step="10000"
              min="10000"
              value={customBasePrice}
              onChange={(e) => setCustomBasePrice(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Duration Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Countdown Clock Duration (seconds):
            </label>
            <input
              type="number"
              min="10"
              max="120"
              value={customDuration}
              onChange={(e) => setCustomDuration(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-pitch-border">
            <Button
              variant="secondary"
              onClick={() => setIsSelectPlayerModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmSelectPlayer}
              disabled={!selectedPlayerForStage || actionLoading !== null}
              icon={Gavel}
            >
              Confirm & Put on Stage
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
