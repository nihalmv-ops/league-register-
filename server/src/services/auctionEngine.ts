import { Server as SocketIOServer } from 'socket.io';
import { auctionRepository } from './auctionRepository';
import { logger } from '../utils/logger';

interface ActiveTimerState {
  remainingSeconds: number;
  endsAt: Date;
  interval: NodeJS.Timeout | null;
}

export class AuctionEngine {
  private io: SocketIOServer | null = null;
  private timerStates: Map<string, ActiveTimerState> = new Map();

  // Attach Socket.IO instance
  public setSocketServer(io: SocketIOServer) {
    this.io = io;
  }

  // Broadcast to all sockets watching this auction
  public broadcast(auctionId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`auction:${auctionId}`).emit(event, data);
      // Also emit to default room for root listeners
      this.io.emit(event, data);
    }
  }

  // Calculate age helper
  private calculateAge(dob: string | Date | undefined): number {
    if (!dob) return 22;
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return 22;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  // 1. Get full state for public / projector / manager / admin
  public async getAuctionState(auctionId: string, isAdmin: boolean = false) {
    const auction = await auctionRepository.getAuctionById(auctionId);
    if (!auction) return null;

    let currentPlayer: any = null;
    let recentBids: any[] = [];
    if (auction.currentPlayerId) {
      const p = await auctionRepository.getPlayerById(String(auction.currentPlayerId));
      if (p) {
        currentPlayer = {
          _id: p._id || p.id,
          registrationId: p.registrationId,
          fullName: p.fullName,
          dateOfBirth: p.dateOfBirth,
          age: this.calculateAge(p.dateOfBirth),
          playingPosition: p.playingPosition,
          photoUrl: p.photoUrl,
          overallRating: p.overallRating || 84,
          tier: p.tier || 'Gold',
          auctionStatus: p.auctionStatus || 'upcoming',
        };

        // If admin requested, provide full details
        if (isAdmin) {
          currentPlayer.phoneNumber = p.phoneNumber;
          currentPlayer.email = p.email;
        }
      }

      recentBids = await auctionRepository.getBidsForLot(auctionId, String(auction.currentPlayerId));
    }

    const timer = this.timerStates.get(auctionId);
    const remainingSeconds = timer ? timer.remainingSeconds : 0;
    const endsAt = timer ? timer.endsAt : auction.endsAt;

    let leadingTeam: any = null;
    if (auction.highestBidderTeamId) {
      leadingTeam = await auctionRepository.getTeamById(String(auction.highestBidderTeamId));
    }

    const eligibleQueue = await auctionRepository.getEligibleApprovedPlayers();
    const teams = await auctionRepository.getTeams();

    return {
      auction: {
        _id: auction._id || auction.id,
        name: auction.name,
        season: auction.season,
        status: auction.status,
        basePrice: auction.basePrice,
        currentHighestBid: auction.currentHighestBid,
        highestBidderTeamId: auction.highestBidderTeamId,
        highestBidderTeamName: auction.highestBidderTeamName,
        highestBidderManagerId: auction.highestBidderManagerId,
        countdownDuration: auction.countdownDuration || 30,
        isBiddingActive: auction.isBiddingActive || false,
        currentLotNumber: auction.currentLotNumber || 1,
        totalLotsCount: eligibleQueue.length,
        endsAt,
        remainingSeconds,
      },
      currentPlayer,
      leadingTeam: leadingTeam
        ? {
            id: leadingTeam._id || leadingTeam.id,
            name: leadingTeam.name,
            shortCode: leadingTeam.shortCode,
            logoUrl: leadingTeam.logoUrl,
            remainingBudget: leadingTeam.remainingBudget,
            playersCount: leadingTeam.playersCount,
            maxSquadSize: leadingTeam.maxSquadSize,
          }
        : null,
      recentBids: recentBids.slice(0, 15),
      eligibleQueueCount: eligibleQueue.length,
      eligibleQueue: eligibleQueue.slice(0, 20).map((p) => ({
        _id: p._id || p.id,
        registrationId: p.registrationId,
        fullName: p.fullName,
        playingPosition: p.playingPosition,
        photoUrl: p.photoUrl,
        age: this.calculateAge(p.dateOfBirth),
        overallRating: p.overallRating || 82,
        basePrice: p.basePrice || 100000,
        auctionStatus: p.auctionStatus,
      })),
      teams: teams.map((t) => ({
        id: t._id || t.id,
        name: t.name,
        shortCode: t.shortCode,
        logoUrl: t.logoUrl,
        totalBudget: t.totalBudget,
        remainingBudget: t.remainingBudget,
        playersCount: t.playersCount,
        maxSquadSize: t.maxSquadSize,
      })),
    };
  }

  // 2. Start Countdown Timer
  public startTimer(auctionId: string, durationSeconds: number) {
    this.stopTimer(auctionId);

    const endsAt = new Date(Date.now() + durationSeconds * 1000);
    const state: ActiveTimerState = {
      remainingSeconds: durationSeconds,
      endsAt,
      interval: null,
    };

    state.interval = setInterval(async () => {
      state.remainingSeconds--;

      if (state.remainingSeconds <= 0) {
        this.stopTimer(auctionId);
        await auctionRepository.updateAuction(auctionId, {
          isBiddingActive: false,
          endsAt: null,
        });

        logger.info(`⏰ Auction timer reached ZERO for auction ${auctionId}`);
        this.broadcast(auctionId, 'timer:ended', {
          auctionId,
          message: 'Bidding hammer down! Timer has expired.',
        });

        const updatedState = await this.getAuctionState(auctionId);
        this.broadcast(auctionId, 'auction:state', updatedState);
      } else {
        this.broadcast(auctionId, 'timer:tick', {
          auctionId,
          remainingSeconds: state.remainingSeconds,
          endsAt: state.endsAt,
        });
      }
    }, 1000);

    this.timerStates.set(auctionId, state);

    auctionRepository.updateAuction(auctionId, {
      endsAt,
      isBiddingActive: true,
      countdownDuration: durationSeconds,
    });
  }

  // Stop Timer
  public stopTimer(auctionId: string) {
    const existing = this.timerStates.get(auctionId);
    if (existing && existing.interval) {
      clearInterval(existing.interval);
      existing.interval = null;
    }
    this.timerStates.delete(auctionId);
  }

  // Reset Timer to configured duration
  public async resetTimer(auctionId: string, durationSeconds?: number) {
    const auction = await auctionRepository.getAuctionById(auctionId);
    const duration = durationSeconds || (auction ? auction.countdownDuration : 30);
    this.startTimer(auctionId, duration);

    this.broadcast(auctionId, 'timer:reset', {
      auctionId,
      remainingSeconds: duration,
    });

    const state = await this.getAuctionState(auctionId);
    this.broadcast(auctionId, 'auction:state', state);
    return state;
  }

  // 3. Start Auction
  public async startAuction(auctionId: string) {
    const auction = await auctionRepository.updateAuction(auctionId, {
      status: 'live',
    });
    const state = await this.getAuctionState(auctionId);
    this.broadcast(auctionId, 'auction:resumed', { auctionId });
    this.broadcast(auctionId, 'auction:state', state);
    return state;
  }

  // 4. Pause Auction
  public async pauseAuction(auctionId: string) {
    this.stopTimer(auctionId);
    await auctionRepository.updateAuction(auctionId, {
      status: 'paused',
      isBiddingActive: false,
    });

    const state = await this.getAuctionState(auctionId);
    this.broadcast(auctionId, 'auction:paused', { auctionId });
    this.broadcast(auctionId, 'auction:state', state);
    return state;
  }

  // 5. Resume Auction
  public async resumeAuction(auctionId: string) {
    await auctionRepository.updateAuction(auctionId, {
      status: 'live',
    });

    const state = await this.getAuctionState(auctionId);
    this.broadcast(auctionId, 'auction:resumed', { auctionId });
    this.broadcast(auctionId, 'auction:state', state);
    return state;
  }

  // 6. Select Next Player
  public async selectNextPlayer(
    auctionId: string,
    playerId: string,
    basePrice?: number,
    countdownDuration?: number
  ) {
    this.stopTimer(auctionId);

    const player = await auctionRepository.getPlayerById(playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found.`);
    }

    if (player.status !== 'APPROVED') {
      throw new Error('Only APPROVED players are eligible to enter the Live Auction draft.');
    }

    if (player.auctionStatus === 'sold') {
      throw new Error(`Player ${player.fullName} has already been SOLD.`);
    }

    const price = typeof basePrice === 'number' && basePrice > 0 ? basePrice : player.basePrice || 100000;
    const duration = typeof countdownDuration === 'number' && countdownDuration >= 5 ? countdownDuration : 30;

    // Update Player Status to 'live'
    await auctionRepository.updatePlayer(playerId, {
      auctionStatus: 'live',
      basePrice: price,
    });

    const currentAuction = await auctionRepository.getAuctionById(auctionId);
    const nextLotNumber = (currentAuction?.currentLotNumber || 0) + 1;

    // Update Auction Session
    await auctionRepository.updateAuction(auctionId, {
      currentPlayerId: player._id || player.id,
      basePrice: price,
      currentHighestBid: 0,
      highestBidderTeamId: null,
      highestBidderTeamName: null,
      highestBidderManagerId: null,
      isBiddingActive: false,
      countdownDuration: duration,
      currentLotNumber: nextLotNumber,
    });

    logger.info(`🎯 Lot #${nextLotNumber} on stage: ${player.fullName} (Base: $${price.toLocaleString()})`);

    const state = await this.getAuctionState(auctionId);
    this.broadcast(auctionId, 'player:next', {
      auctionId,
      player: state?.currentPlayer,
      basePrice: price,
      lotNumber: nextLotNumber,
    });
    this.broadcast(auctionId, 'auction:state', state);
    return state;
  }

  // 7. Start Bidding for on-stage player
  public async startBidding(auctionId: string, durationSeconds?: number) {
    const auction = await auctionRepository.getAuctionById(auctionId);
    if (!auction || !auction.currentPlayerId) {
      throw new Error('No player is currently on stage. Select a player first.');
    }

    const duration = durationSeconds || auction.countdownDuration || 30;
    this.startTimer(auctionId, duration);

    logger.info(`🔥 Bidding started for auction ${auctionId} (${duration}s clock)`);

    const state = await this.getAuctionState(auctionId);
    this.broadcast(auctionId, 'bidding:started', {
      auctionId,
      duration,
    });
    this.broadcast(auctionId, 'auction:state', state);
    return state;
  }

  // 8. Place a Bid (Validates manager, budget, squad slot, amount)
  public async placeBid(
    auctionId: string,
    managerId: string,
    amount: number
  ) {
    const auction = await auctionRepository.getAuctionById(auctionId);
    if (!auction) {
      throw new Error('Auction session not found.');
    }

    if (auction.status !== 'live') {
      throw new Error('Auction is currently not LIVE.');
    }

    if (!auction.isBiddingActive) {
      throw new Error('Bidding is currently closed or timer has ended.');
    }

    if (!auction.currentPlayerId) {
      throw new Error('No player is currently on the bidding podium.');
    }

    // Verify Manager
    const manager = await auctionRepository.getManagerById(managerId);
    if (!manager) {
      throw new Error('Unauthorized: Manager account not found.');
    }

    // Verify Assigned Team
    const team = await auctionRepository.getTeamById(String(manager.teamId));
    if (!team) {
      throw new Error('Manager has no valid assigned franchise team.');
    }

    // 1. Squad limit check
    if (team.playersCount >= team.maxSquadSize) {
      throw new Error(`Squad full: ${team.name} already has the maximum ${team.maxSquadSize} players.`);
    }

    // 2. Budget check
    if (team.remainingBudget < amount) {
      throw new Error(
        `Insufficient purse: ${team.name} remaining budget is $${team.remainingBudget.toLocaleString()}, but bid is $${amount.toLocaleString()}.`
      );
    }

    // 3. Amount validation (must be >= basePrice, and > currentHighestBid)
    const minRequired = auction.currentHighestBid > 0
      ? auction.currentHighestBid + 10000
      : auction.basePrice;

    if (amount < minRequired) {
      throw new Error(
        `Bid amount too low. Minimum required bid is $${minRequired.toLocaleString()}.`
      );
    }

    // 4. Save Bid
    const bidRecord = await auctionRepository.createBid({
      auctionId,
      playerId: String(auction.currentPlayerId),
      teamId: String(team._id || team.id),
      teamName: team.name,
      managerId: String(manager._id || manager.id),
      managerName: manager.name,
      amount,
    });

    // 5. Update Auction with new leader
    await auctionRepository.updateAuction(auctionId, {
      currentHighestBid: amount,
      highestBidderTeamId: team._id || team.id,
      highestBidderTeamName: team.name,
      highestBidderManagerId: manager._id || manager.id,
    });

    // 6. Reset Countdown Timer automatically upon valid bid!
    const resetSeconds = auction.countdownDuration || 30;
    this.startTimer(auctionId, resetSeconds);

    logger.info(`💰 Accepted Bid: $${amount.toLocaleString()} by ${team.name} (${manager.name})`);

    const updatedState = await this.getAuctionState(auctionId);

    // Broadcast live event to all connected screens
    this.broadcast(auctionId, 'bid:placed', {
      auctionId,
      bid: bidRecord,
      currentHighestBid: amount,
      leadingTeam: {
        id: team._id || team.id,
        name: team.name,
        logoUrl: team.logoUrl,
      },
      remainingSeconds: resetSeconds,
    });

    this.broadcast(auctionId, 'auction:state', updatedState);
    return {
      accepted: true,
      bid: bidRecord,
      state: updatedState,
    };
  }

  // 9. Declare SOLD
  public async declareSold(auctionId: string) {
    this.stopTimer(auctionId);

    const auction = await auctionRepository.getAuctionById(auctionId);
    if (!auction || !auction.currentPlayerId) {
      throw new Error('No player on stage to sell.');
    }

    const playerId = String(auction.currentPlayerId);
    const finalPrice = auction.currentHighestBid;

    if (finalPrice <= 0 || !auction.highestBidderTeamId) {
      throw new Error('Cannot declare SOLD without any valid bids. Declare UNSOLD instead.');
    }

    const winningTeam = await auctionRepository.getTeamById(String(auction.highestBidderTeamId));
    if (!winningTeam) {
      throw new Error('Winning team record not found.');
    }

    const player = await auctionRepository.getPlayerById(playerId);
    if (!player) {
      throw new Error('Player record not found.');
    }

    if (player.auctionStatus === 'sold') {
      throw new Error(`Player ${player.fullName} is already marked as SOLD.`);
    }

    // 1. Deduct Budget & Increment Squad on Team
    const newRemaining = Math.max(0, winningTeam.remainingBudget - finalPrice);
    const newCount = winningTeam.playersCount + 1;
    await auctionRepository.updateTeam(String(winningTeam._id || winningTeam.id), {
      remainingBudget: newRemaining,
      playersCount: newCount,
    });

    // 2. Mark Player as SOLD
    await auctionRepository.updatePlayer(playerId, {
      auctionStatus: 'sold',
      soldPrice: finalPrice,
      teamId: winningTeam._id || winningTeam.id,
      teamName: winningTeam.name,
    });

    // 3. Count total bids on this lot
    const bids = await auctionRepository.getBidsForLot(auctionId, playerId);

    // 4. Save AuctionResult
    const result = await auctionRepository.createAuctionResult({
      auctionId,
      playerId,
      teamId: String(winningTeam._id || winningTeam.id),
      teamName: winningTeam.name,
      finalPrice,
      resultStatus: 'SOLD',
      bidsCount: bids.length,
    });

    // 5. Reset Auction Current Lot
    await auctionRepository.updateAuction(auctionId, {
      currentPlayerId: null,
      currentHighestBid: 0,
      highestBidderTeamId: null,
      highestBidderTeamName: null,
      highestBidderManagerId: null,
      isBiddingActive: false,
      endsAt: null,
    });

    logger.info(`🔨 SOLD! ${player.fullName} sold to ${winningTeam.name} for $${finalPrice.toLocaleString()}!`);

    const updatedState = await this.getAuctionState(auctionId);

    this.broadcast(auctionId, 'player:sold', {
      auctionId,
      player: {
        id: player._id || player.id,
        name: player.fullName,
        position: player.playingPosition,
        photoUrl: player.photoUrl,
      },
      winningTeam: {
        id: winningTeam._id || winningTeam.id,
        name: winningTeam.name,
        logoUrl: winningTeam.logoUrl,
        remainingBudget: newRemaining,
      },
      finalPrice,
      result,
    });

    this.broadcast(auctionId, 'auction:state', updatedState);
    return {
      result,
      state: updatedState,
    };
  }

  // 10. Declare UNSOLD
  public async declareUnsold(auctionId: string) {
    this.stopTimer(auctionId);

    const auction = await auctionRepository.getAuctionById(auctionId);
    if (!auction || !auction.currentPlayerId) {
      throw new Error('No player on stage to mark unsold.');
    }

    const playerId = String(auction.currentPlayerId);
    const player = await auctionRepository.getPlayerById(playerId);
    if (!player) {
      throw new Error('Player record not found.');
    }

    // 1. Mark Player as UNSOLD (no budget deducted, no team assigned)
    await auctionRepository.updatePlayer(playerId, {
      auctionStatus: 'unsold',
      soldPrice: 0,
      teamId: undefined,
      teamName: undefined,
    });

    // 2. Count bids
    const bids = await auctionRepository.getBidsForLot(auctionId, playerId);

    // 3. Save AuctionResult
    const result = await auctionRepository.createAuctionResult({
      auctionId,
      playerId,
      finalPrice: 0,
      resultStatus: 'UNSOLD',
      bidsCount: bids.length,
    });

    // 4. Reset Auction Current Lot
    await auctionRepository.updateAuction(auctionId, {
      currentPlayerId: null,
      currentHighestBid: 0,
      highestBidderTeamId: null,
      highestBidderTeamName: null,
      highestBidderManagerId: null,
      isBiddingActive: false,
      endsAt: null,
    });

    logger.info(`⚪ UNSOLD: ${player.fullName} goes unsold.`);

    const updatedState = await this.getAuctionState(auctionId);

    this.broadcast(auctionId, 'player:unsold', {
      auctionId,
      player: {
        id: player._id || player.id,
        name: player.fullName,
        position: player.playingPosition,
        photoUrl: player.photoUrl,
      },
      result,
    });

    this.broadcast(auctionId, 'auction:state', updatedState);
    return {
      result,
      state: updatedState,
    };
  }
}

export const auctionEngine = new AuctionEngine();
