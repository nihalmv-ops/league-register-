import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { auctionService } from '../services/auctionService';
import { socketService } from '../services/socketService';
import {
  AuctionStatePayload,
  ManagerAccount,
  TeamFranchise,
} from '../types/auction';
import {
  Shield,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  Flame,
  Gavel,
  Radio,
  ChevronRight,
} from 'lucide-react';

const SEEDED_MANAGERS = [
  { email: 'manager.thunder@football.league', teamName: 'Thunder Strikers FC', shortCode: 'THU' },
  { email: 'manager.apex@football.league', teamName: 'Apex Predators', shortCode: 'APX' },
  { email: 'manager.titans@football.league', teamName: 'Iron Titans FC', shortCode: 'TIT' },
  { email: 'manager.solar@football.league', teamName: 'Solar Flare SC', shortCode: 'SOL' },
  { email: 'manager.coastal@football.league', teamName: 'Coastal Surge FC', shortCode: 'CSG' },
  { email: 'manager.wolves@football.league', teamName: 'Highland Wolves', shortCode: 'HLW' },
  { email: 'manager.metro@football.league', teamName: 'Metro Dynamos', shortCode: 'MET' },
  { email: 'manager.oasis@football.league', teamName: 'Oasis Wanderers', shortCode: 'OAS' },
];

export const ManagerBiddingPage: React.FC = () => {
  // Authentication State
  const [managerToken, setManagerToken] = useState<string | null>(() =>
    localStorage.getItem('manager_token')
  );
  const [managerProfile, setManagerProfile] = useState<ManagerAccount | null>(null);
  const [assignedTeam, setAssignedTeam] = useState<TeamFranchise | null>(null);
  const [loginEmail, setLoginEmail] = useState('manager.thunder@football.league');
  const [loginPassword, setLoginPassword] = useState('Manager@123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Auction State
  const [auctionState, setAuctionState] = useState<AuctionStatePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState(30);
  const [isBiddingActive, setIsBiddingActive] = useState(false);

  // Bidding Input & Feedback
  const [customBidAmount, setCustomBidAmount] = useState<number>(0);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [bidFeedback, setBidFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setBidFeedback({ type, message });
    feedbackTimeoutRef.current = setTimeout(() => {
      setBidFeedback(null);
    }, 5000);
  };

  // 1. Fetch Manager Profile if token exists
  useEffect(() => {
    let mounted = true;
    if (managerToken) {
      auctionService
        .getManagerProfile(managerToken)
        .then((data) => {
          if (!mounted) return;
          setManagerProfile(data.manager);
          setAssignedTeam(data.team);
        })
        .catch(() => {
          if (!mounted) return;
          localStorage.removeItem('manager_token');
          setManagerToken(null);
          setManagerProfile(null);
          setAssignedTeam(null);
        });
    }
    return () => {
      mounted = false;
    };
  }, [managerToken]);

  // 2. Fetch Auction State & Connect Socket
  useEffect(() => {
    let mounted = true;

    const initAuction = async () => {
      try {
        setLoading(true);
        const data = await auctionService.getProjectorLive('auc-2026');
        if (!mounted) return;
        setAuctionState(data);
        setRemainingSeconds(data.auction.remainingSeconds || 30);
        setIsBiddingActive(data.auction.isBiddingActive || false);

        // Pre-fill next min bid
        calculateNextBid(data);
      } catch (err) {
        console.warn('Could not fetch auction state for manager portal', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuction();

    socketService.connect();
    socketService.joinAuction('auc-2026');

    const unsubState = socketService.onAuctionState((newState) => {
      if (!mounted) return;
      setAuctionState(newState);
      setRemainingSeconds(newState.auction.remainingSeconds || 0);
      setIsBiddingActive(newState.auction.isBiddingActive || false);
      calculateNextBid(newState);
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
      if (data.leadingTeam.name === assignedTeam?.name) {
        showFeedback('success', `🎉 Your team placed the highest bid: $${data.currentHighestBid.toLocaleString()}!`);
      }
    });

    const unsubAccepted = socketService.onBidAccepted((data) => {
      if (!mounted) return;
      showFeedback('success', data.message);
    });

    const unsubRejected = socketService.onBidRejected((data) => {
      if (!mounted) return;
      showFeedback('error', data.message);
    });

    const unsubSold = (data: any) => {
      if (!mounted) return;
      if (data.winningTeamId === assignedTeam?.id) {
        showFeedback('success', `🏆 PLAYER SOLD TO YOUR FRANCHISE FOR $${data.finalPrice?.toLocaleString()}!`);
      } else {
        showFeedback('error', `Sold to ${data.winningTeamName} for $${data.finalPrice?.toLocaleString()}`);
      }
    };

    const unsubUnsold = () => {
      if (!mounted) return;
      showFeedback('error', 'Player lot declared UNSOLD.');
    };

    const cleanupSold = socketService.onPlayerSold(unsubSold);
    const cleanupUnsold = socketService.onPlayerUnsold(unsubUnsold);

    return () => {
      mounted = false;
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      unsubState();
      unsubTick();
      unsubTimerEnded();
      unsubBid();
      unsubAccepted();
      unsubRejected();
      cleanupSold();
      cleanupUnsold();
      socketService.leaveAuction('auc-2026');
    };
  }, [assignedTeam]);

  const calculateNextBid = (state: AuctionStatePayload) => {
    if (!state.currentPlayer) return;
    const current = state.auction.currentHighestBid;
    const base = state.auction.basePrice;
    const nextAmount = current > 0 ? current + 10000 : base;
    setCustomBidAmount(nextAmount);
  };

  // Manager Login
  const handleLogin = async (e?: React.FormEvent, directEmail?: string) => {
    if (e) e.preventDefault();
    const targetEmail = directEmail || loginEmail;
    try {
      setIsLoggingIn(true);
      setLoginError(null);
      const res = await auctionService.managerLogin(targetEmail, loginPassword);
      localStorage.setItem('manager_token', res.token);
      setManagerToken(res.token);
      setManagerProfile(res.manager);
      const profile = await auctionService.getManagerProfile(res.token);
      setAssignedTeam(profile.team);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('manager_token');
    setManagerToken(null);
    setManagerProfile(null);
    setAssignedTeam(null);
  };

  // Submit Bid
  const handlePlaceBid = async (amountToBid?: number) => {
    const amount = amountToBid || customBidAmount;
    if (!auctionState || !managerToken) return;

    if (!isBiddingActive) {
      showFeedback('error', 'Bidding is currently closed or timer has ended.');
      return;
    }

    if (assignedTeam && assignedTeam.remainingBudget < amount) {
      showFeedback(
        'error',
        `Insufficient budget! Your team has $${assignedTeam.remainingBudget.toLocaleString()} remaining.`
      );
      return;
    }

    if (assignedTeam && assignedTeam.playersCount >= assignedTeam.maxSquadSize) {
      showFeedback('error', 'Your franchise squad is already full (18/18 slots)!');
      return;
    }

    try {
      setIsSubmittingBid(true);
      // Emit through Socket.IO for lowest latency
      socketService.placeBid(auctionState.auction._id, amount, managerToken);
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to place bid');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const handleIncrementBid = (delta: number) => {
    if (!auctionState) return;
    const current = auctionState.auction.currentHighestBid || auctionState.auction.basePrice;
    const newAmount = current + delta;
    setCustomBidAmount(newAmount);
    handlePlaceBid(newAmount);
  };

  // If Not Authenticated, Show Manager Login Screen
  if (!managerToken || !managerProfile) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-8 animate-in fade-in duration-300">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center mx-auto text-orange-400 mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Team Manager Bidding Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Log in with your franchise manager credentials to participate in the live player draft floor.
          </p>
        </div>

        {/* Quick Franchise Switcher Pills */}
        <Card className="p-4 border-orange-500/30 bg-pitch-card">
          <p className="text-xs font-bold text-orange-400 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
            <Flame className="w-4 h-4 text-orange-500" />
            Quick Demo: 1-Click Franchise Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SEEDED_MANAGERS.map((m) => (
              <button
                key={m.email}
                onClick={() => handleLogin(undefined, m.email)}
                className="p-2.5 rounded-xl bg-pitch-darker hover:bg-orange-600/20 border border-pitch-border hover:border-orange-500/50 text-left transition-all text-xs flex items-center justify-between group"
              >
                <div>
                  <p className="font-bold text-white group-hover:text-orange-300">
                    {m.teamName}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">{m.shortCode}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </Card>

        {/* Standard Login Form */}
        <Card className="p-6 border-pitch-border bg-pitch-card">
          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Manager Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 font-bold"
              disabled={isLoggingIn}
              icon={LogIn}
            >
              {isLoggingIn ? 'Authenticating...' : 'Sign In as Manager'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (loading && !auctionState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-medium">Connecting to Live Auction Floor...</p>
      </div>
    );
  }

  const currentPlayer = auctionState?.currentPlayer;
  const leadingTeam = auctionState?.leadingTeam;
  const minRequiredBid = auctionState
    ? auctionState.auction.currentHighestBid > 0
      ? auctionState.auction.currentHighestBid + 10000
      : auctionState.auction.basePrice
    : 100000;

  const isLeadingBidder = Boolean(
    leadingTeam && assignedTeam && leadingTeam.id === assignedTeam.id
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Bid Feedback Toast */}
      {bidFeedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all duration-300 shadow-xl ${
            bidFeedback.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
              : 'bg-rose-950/95 border-rose-500 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {bidFeedback.type === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
            )}
            <p className="font-bold text-sm">{bidFeedback.message}</p>
          </div>
          <button
            onClick={() => setBidFeedback(null)}
            className="text-xs opacity-60 hover:opacity-100 px-2 py-1 rounded bg-black/40"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Franchise Manager Header & Purse Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-950/80 via-pitch-card to-slate-900 border-2 border-orange-500/50 shadow-pitch-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={assignedTeam?.logoUrl}
            alt={assignedTeam?.name}
            className="w-16 h-16 rounded-2xl bg-slate-900 p-1 object-contain border-2 border-orange-500 shadow-lg shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                Assigned Franchise
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {assignedTeam?.name || managerProfile.teamName}
            </h1>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              Manager: {managerProfile.name} ({managerProfile.email})
            </p>
          </div>
        </div>

        {/* Purse & Squad Slots Stats */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="p-3.5 rounded-xl bg-pitch-darker border border-pitch-border min-w-[140px]">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Remaining Budget</p>
            <p className="text-xl font-black text-emerald-400 font-mono">
              ${assignedTeam?.remainingBudget.toLocaleString()}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-pitch-darker border border-pitch-border min-w-[120px]">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Squad Slots</p>
            <p className="text-xl font-black text-white font-mono">
              {assignedTeam?.playersCount} / {assignedTeam?.maxSquadSize}
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleLogout}
            icon={LogOut}
            className="text-xs"
          >
            Switch Team
          </Button>
        </div>
      </div>

      {/* Main Floor Arena (Active Player on Stage & Bidding Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stage Player Card (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="p-6 border-pitch-border bg-pitch-card h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-pitch-border mb-4">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  PLAYER ON AUCTION PODIUM
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Lot #{auctionState?.auction.currentLotNumber}
                </span>
              </div>

              {currentPlayer ? (
                <div className="space-y-4 text-center">
                  <div className="relative inline-block mx-auto">
                    <img
                      src={currentPlayer.photoUrl}
                      alt={currentPlayer.fullName}
                      className="w-40 h-40 rounded-2xl object-cover border-2 border-orange-500/60 shadow-xl mx-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop&q=80';
                      }}
                    />
                    <span className="absolute -bottom-2 -right-2 px-3 py-0.5 rounded-full text-xs font-black bg-orange-600 text-white shadow">
                      {currentPlayer.playingPosition}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-black text-white">{currentPlayer.fullName}</h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Reg ID: {currentPlayer.registrationId}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                      Age: {currentPlayer.age} yrs
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300">
                      Rating: {currentPlayer.overallRating || 84}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300">
                      Base: ${auctionState?.auction.basePrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-500 text-sm">
                  Awaiting next player to be called to the podium...
                </div>
              )}
            </div>

            {/* Leading Team Banner */}
            <div className="mt-6 pt-4 border-t border-pitch-border">
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">
                Current Floor Leader
              </p>
              {leadingTeam ? (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isLeadingBidder
                      ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
                      : 'bg-pitch-darker border-pitch-border text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={leadingTeam.logoUrl}
                      alt={leadingTeam.name}
                      className="w-7 h-7 rounded-full bg-slate-800 object-contain"
                    />
                    <div>
                      <p className="text-xs font-bold text-white leading-none">
                        {leadingTeam.name}
                      </p>
                      {isLeadingBidder && (
                        <p className="text-[10px] text-emerald-400 font-bold mt-0.5">
                          ✓ YOUR FRANCHISE LEADS!
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    ${auctionState?.auction.currentHighestBid.toLocaleString()}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No bids placed on this lot yet.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Bidding Control Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hammer Countdown Clock Card */}
          <Card className="p-6 border-pitch-border bg-pitch-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-orange-400 tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  HAMMER COUNTDOWN CLOCK
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isBiddingActive
                    ? 'Bids accepted in real-time. Clock resets on valid bids.'
                    : 'Bidding clock currently paused or halted.'}
                </p>
              </div>

              <div
                className={`text-4xl sm:text-5xl font-mono font-black px-5 py-2 rounded-2xl ${
                  remainingSeconds <= 5 && isBiddingActive
                    ? 'bg-rose-950/80 border border-rose-500 text-rose-400 animate-pulse'
                    : remainingSeconds <= 10 && isBiddingActive
                    ? 'bg-amber-950/80 border border-amber-500 text-amber-300'
                    : 'bg-pitch-darker border border-pitch-border text-orange-400'
                }`}
              >
                00:{remainingSeconds.toString().padStart(2, '0')}
              </div>
            </div>
          </Card>

          {/* Place Bid Deck */}
          <Card className="p-6 border-orange-500/40 bg-gradient-to-br from-pitch-card to-slate-950 shadow-pitch-glow">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-pitch-border">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Gavel className="w-5 h-5 text-orange-400" />
                Place Franchise Bid
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Min Bid: ${minRequiredBid.toLocaleString()}
              </span>
            </div>

            {/* Warning if Manager is already leading */}
            {isLeadingBidder && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>You currently hold the highest bid on the floor!</span>
              </div>
            )}

            {/* Quick Increment Buttons */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-300">Quick Increment Bids:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[10000, 25000, 50000, 100000].map((inc) => (
                  <button
                    key={inc}
                    onClick={() => handleIncrementBid(inc)}
                    disabled={!isBiddingActive || isSubmittingBid || !currentPlayer}
                    className="p-3 rounded-xl bg-pitch-darker hover:bg-orange-600/20 border border-pitch-border hover:border-orange-500/50 text-white font-mono font-bold text-sm transition-all disabled:opacity-40 disabled:hover:bg-pitch-darker shadow-sm"
                  >
                    + ${(inc / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Bid Input & Submit Button */}
            <div className="mt-6 pt-4 border-t border-pitch-border space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Custom Bid Amount ($):
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="number"
                  step="10000"
                  min={minRequiredBid}
                  value={customBidAmount || ''}
                  onChange={(e) => setCustomBidAmount(Number(e.target.value))}
                  placeholder={`Min $${minRequiredBid.toLocaleString()}`}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-base font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                />
                <Button
                  variant="primary"
                  onClick={() => handlePlaceBid()}
                  disabled={
                    !isBiddingActive ||
                    isSubmittingBid ||
                    !currentPlayer ||
                    customBidAmount < minRequiredBid
                  }
                  className="w-full sm:w-auto px-8 py-3 text-sm font-black whitespace-nowrap bg-orange-600 hover:bg-orange-500"
                  icon={Flame}
                >
                  {isSubmittingBid ? 'Submitting...' : 'SUBMIT BID'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Live Recent Bids for this lot */}
          <Card className="p-5 border-pitch-border bg-pitch-card">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
              Recent Bids on this Lot
            </h4>
            {auctionState?.recentBids && auctionState.recentBids.length > 0 ? (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {auctionState.recentBids.map((b, idx) => (
                  <div
                    key={b.id || idx}
                    className="p-2 rounded-xl bg-pitch-darker border border-pitch-border flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-white">{b.teamName}</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ${b.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3 text-center">No bids placed yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
