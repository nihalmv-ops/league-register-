import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { getDbStatus } from '../config/db';
import { Auction, IAuction, AuctionStatus } from '../models/Auction';
import { Team, ITeam } from '../models/Team';
import { Manager, IManager } from '../models/Manager';
import { Player, IPlayer } from '../models/Player';
import { Bid, IBid } from '../models/Bid';
import { AuctionResult, IAuctionResult } from '../models/AuctionResult';
import { playerRepository } from './playerRepository';
import { logger } from '../utils/logger';

// Standard 8 Franchise Seeds for Live Auction
export const DEFAULT_TEAMS_DATA = [
  {
    id: 'team-1',
    name: 'Thunder Strikers FC',
    shortCode: 'TSFC',
    city: 'Manchester',
    logoUrl: '⚡',
    primaryColor: '#f97316',
    secondaryColor: '#18181b',
    totalBudget: 1500000,
    remainingBudget: 1500000,
    maxSquadSize: 15,
    playersCount: 0,
    coach: 'Erik Veldman',
    owner: 'Marcus Sterling Holdings',
  },
  {
    id: 'team-2',
    name: 'Apex Predators',
    shortCode: 'APEX',
    city: 'London',
    logoUrl: '🦅',
    primaryColor: '#ef4444',
    secondaryColor: '#18181b',
    totalBudget: 1500000,
    remainingBudget: 1500000,
    maxSquadSize: 15,
    playersCount: 0,
    coach: 'Carlos Moretti',
    owner: 'Apex Global Sports',
  },
  {
    id: 'team-3',
    name: 'Metro City United',
    shortCode: 'MCU',
    city: 'Birmingham',
    logoUrl: '🏙️',
    primaryColor: '#3b82f6',
    secondaryColor: '#18181b',
    totalBudget: 1500000,
    remainingBudget: 1500000,
    maxSquadSize: 15,
    playersCount: 0,
    coach: 'David Henderson',
    owner: 'Midlands Capital Group',
  },
  {
    id: 'team-4',
    name: 'Red Dragons SC',
    shortCode: 'RDSC',
    city: 'Cardiff',
    logoUrl: '🐉',
    primaryColor: '#dc2626',
    secondaryColor: '#18181b',
    totalBudget: 1500000,
    remainingBudget: 1500000,
    maxSquadSize: 15,
    playersCount: 0,
    coach: 'Gareth Thomas',
    owner: 'Welsh Heritage Sports',
  },
  {
    id: 'team-5',
    name: 'Emerald Warriors',
    shortCode: 'EWAR',
    city: 'Dublin',
    logoUrl: '☘️',
    primaryColor: '#10b981',
    secondaryColor: '#18181b',
    totalBudget: 1500000,
    remainingBudget: 1500000,
    maxSquadSize: 15,
    playersCount: 0,
    coach: 'Sean O’Connor',
    owner: 'Emerald Ventures',
  },
  {
    id: 'team-6',
    name: 'Coastal Vipers FC',
    shortCode: 'CVFC',
    city: 'Brighton',
    logoUrl: '🐍',
    primaryColor: '#8b5cf6',
    secondaryColor: '#18181b',
    totalBudget: 1500000,
    remainingBudget: 1500000,
    maxSquadSize: 15,
    playersCount: 0,
    coach: 'Luciano Rossi',
    owner: 'South Coast Consortium',
  },
  {
    id: 'team-7',
    name: 'Ironclad Athletic',
    shortCode: 'IAFC',
    city: 'Newcastle',
    logoUrl: '🛡️',
    primaryColor: '#64748b',
    secondaryColor: '#18181b',
    totalBudget: 1500000,
    remainingBudget: 1500000,
    maxSquadSize: 15,
    playersCount: 0,
    coach: 'Alan Campbell',
    owner: 'Northern Iron Sports',
  },
  {
    id: 'team-8',
    name: 'Solar Flare SC',
    shortCode: 'SFSC',
    city: 'Southampton',
    logoUrl: '☀️',
    primaryColor: '#eab308',
    secondaryColor: '#18181b',
    totalBudget: 1500000,
    remainingBudget: 1500000,
    maxSquadSize: 15,
    playersCount: 0,
    coach: 'Mateo Gomez',
    owner: 'Solent Star Ventures',
  },
];

// Seed Managers (1 per Team)
export const DEFAULT_MANAGERS_DATA = [
  {
    id: 'mgr-1',
    email: 'manager.thunder@football.league',
    password: 'Manager@123',
    name: 'Erik Veldman',
    teamId: 'team-1',
    teamName: 'Thunder Strikers FC',
    role: 'manager' as const,
  },
  {
    id: 'mgr-2',
    email: 'manager.apex@football.league',
    password: 'Manager@123',
    name: 'Carlos Moretti',
    teamId: 'team-2',
    teamName: 'Apex Predators',
    role: 'manager' as const,
  },
  {
    id: 'mgr-3',
    email: 'manager.metro@football.league',
    password: 'Manager@123',
    name: 'David Henderson',
    teamId: 'team-3',
    teamName: 'Metro City United',
    role: 'manager' as const,
  },
  {
    id: 'mgr-4',
    email: 'manager.dragons@football.league',
    password: 'Manager@123',
    name: 'Gareth Thomas',
    teamId: 'team-4',
    teamName: 'Red Dragons SC',
    role: 'manager' as const,
  },
  {
    id: 'mgr-5',
    email: 'manager.emerald@football.league',
    password: 'Manager@123',
    name: 'Sean O’Connor',
    teamId: 'team-5',
    teamName: 'Emerald Warriors',
    role: 'manager' as const,
  },
  {
    id: 'mgr-6',
    email: 'manager.vipers@football.league',
    password: 'Manager@123',
    name: 'Luciano Rossi',
    teamId: 'team-6',
    teamName: 'Coastal Vipers FC',
    role: 'manager' as const,
  },
  {
    id: 'mgr-7',
    email: 'manager.ironclad@football.league',
    password: 'Manager@123',
    name: 'Alan Campbell',
    teamId: 'team-7',
    teamName: 'Ironclad Athletic',
    role: 'manager' as const,
  },
  {
    id: 'mgr-8',
    email: 'manager.solar@football.league',
    password: 'Manager@123',
    name: 'Mateo Gomez',
    teamId: 'team-8',
    teamName: 'Solar Flare SC',
    role: 'manager' as const,
  },
];

// In-Memory state fallback
class MemoryAuctionStore {
  public auctions: any[] = [];
  public teams: any[] = [];
  public managers: any[] = [];
  public bids: any[] = [];
  public results: any[] = [];

  constructor() {
    this.init();
  }

  public init() {
    this.teams = DEFAULT_TEAMS_DATA.map((t) => ({ ...t, _id: t.id }));
    const hashedPwd = bcrypt.hashSync('Manager@123', 8);
    this.managers = DEFAULT_MANAGERS_DATA.map((m) => ({
      ...m,
      _id: m.id,
      password: hashedPwd,
    }));
    this.auctions = [
      {
        _id: 'auc-2026',
        id: 'auc-2026',
        name: 'Season 2026-27 Premier Live Auction',
        season: '2026-27',
        status: 'upcoming' as AuctionStatus,
        currentPlayerId: null,
        basePrice: 100000,
        currentHighestBid: 0,
        highestBidderTeamId: null,
        highestBidderTeamName: null,
        highestBidderManagerId: null,
        countdownDuration: 30,
        endsAt: null,
        isBiddingActive: false,
        currentLotNumber: 0,
        totalLotsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}

const memoryStore = new MemoryAuctionStore();

export class AuctionRepository {
  // Ensure default seeds exist in database or memory
  public async ensureSeeded(): Promise<void> {
    const dbStatus = getDbStatus();
    if (dbStatus.isReady) {
      try {
        // Seed Teams if empty
        const teamCount = await Team.countDocuments();
        if (teamCount === 0) {
          for (const t of DEFAULT_TEAMS_DATA) {
            await Team.create({
              name: t.name,
              shortCode: t.shortCode,
              logoUrl: t.logoUrl,
              primaryColor: t.primaryColor,
              secondaryColor: t.secondaryColor,
              totalBudget: t.totalBudget,
              remainingBudget: t.remainingBudget,
              maxSquadSize: t.maxSquadSize,
              playersCount: t.playersCount,
              coach: t.coach,
              owner: t.owner,
            });
          }
          logger.info('⚽ Seeded 8 default franchise teams into MongoDB');
        }

        // Seed Managers if empty
        const managerCount = await Manager.countDocuments();
        if (managerCount === 0) {
          const teams = await Team.find();
          for (const m of DEFAULT_MANAGERS_DATA) {
            const matchedTeam = teams.find((t) => t.name === m.teamName);
            await Manager.create({
              name: m.name,
              email: m.email.toLowerCase(),
              password: m.password, // hashed by pre-save hook
              teamId: matchedTeam ? matchedTeam._id : m.teamId,
              teamName: m.teamName,
              role: 'manager',
            });
          }
          logger.info('👔 Seeded 8 franchise team managers into MongoDB');
        }

        // Seed default Auction if empty
        const auctionCount = await Auction.countDocuments();
        if (auctionCount === 0) {
          await Auction.create({
            name: 'Season 2026-27 Premier Live Auction',
            season: '2026-27',
            status: 'upcoming',
            countdownDuration: 30,
            basePrice: 100000,
            currentHighestBid: 0,
            isBiddingActive: false,
            currentLotNumber: 0,
            totalLotsCount: 0,
          });
          logger.info('🏆 Seeded active Live Auction session into MongoDB');
        }
      } catch (err: any) {
        logger.warn('Seed attempt caught:', err?.message || err);
      }
    }
  }

  // 1. Get or create active auction
  public async getActiveAuction(): Promise<any> {
    await this.ensureSeeded();
    const dbStatus = getDbStatus();

    if (dbStatus.isReady) {
      try {
        let auction = await Auction.findOne({
          status: { $in: ['live', 'paused', 'upcoming'] },
        }).sort({ updatedAt: -1 });

        if (!auction) {
          auction = await Auction.findOne().sort({ createdAt: -1 });
        }
        if (!auction) {
          auction = await Auction.create({
            name: 'Season 2026-27 Premier Live Auction',
            season: '2026-27',
            status: 'upcoming',
            countdownDuration: 30,
            basePrice: 100000,
          });
        }
        return auction.toObject ? auction.toObject() : auction;
      } catch (err) {
        logger.warn('getActiveAuction fallback to memory:', err);
      }
    }

    let active = memoryStore.auctions.find((a) => a.status === 'live' || a.status === 'paused' || a.status === 'upcoming');
    if (!active) {
      active = memoryStore.auctions[0];
    }
    return active;
  }

  // 2. Get Auction by ID
  public async getAuctionById(id: string): Promise<any> {
    const dbStatus = getDbStatus();
    if (dbStatus.isReady) {
      try {
        if (mongoose.Types.ObjectId.isValid(id)) {
          const auction = await Auction.findById(id);
          if (auction) return auction.toObject ? auction.toObject() : auction;
        }
      } catch (err) {
        logger.warn('getAuctionById fallback to memory:', err);
      }
    }

    return (
      memoryStore.auctions.find((a) => a._id === id || a.id === id) ||
      memoryStore.auctions[0]
    );
  }

  // 3. List all Auctions
  public async listAuctions(): Promise<any[]> {
    const dbStatus = getDbStatus();
    if (dbStatus.isReady) {
      try {
        const list = await Auction.find().sort({ createdAt: -1 });
        if (list.length > 0) return list.map((a) => (a.toObject ? a.toObject() : a));
      } catch (err) {
        logger.warn('listAuctions fallback to memory:', err);
      }
    }
    return memoryStore.auctions;
  }

  // 4. Update Auction
  public async updateAuction(id: string, updateData: Partial<IAuction>): Promise<any> {
    const dbStatus = getDbStatus();
    if (dbStatus.isReady) {
      try {
        if (mongoose.Types.ObjectId.isValid(id)) {
          const updated = await Auction.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: new Date() },
            { new: true }
          );
          if (updated) return updated.toObject ? updated.toObject() : updated;
        }
      } catch (err) {
        logger.warn('updateAuction fallback to memory:', err);
      }
    }

    const idx = memoryStore.auctions.findIndex((a) => a._id === id || a.id === id);
    if (idx !== -1) {
      memoryStore.auctions[idx] = {
        ...memoryStore.auctions[idx],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      return memoryStore.auctions[idx];
    }
    return null;
  }

  // 5. Teams
  public async getTeams(): Promise<any[]> {
    const dbStatus = getDbStatus();
    if (dbStatus.isReady) {
      try {
        const teams = await Team.find().sort({ name: 1 });
        if (teams.length > 0) return teams.map((t) => (t.toObject ? t.toObject() : t));
      } catch (err) {
        logger.warn('getTeams fallback to memory:', err);
      }
    }
    return memoryStore.teams;
  }

  public async getTeamById(teamId: string): Promise<any> {
    const dbStatus = getDbStatus();
    if (dbStatus.isReady) {
      try {
        if (mongoose.Types.ObjectId.isValid(teamId)) {
          const team = await Team.findById(teamId);
          if (team) return team.toObject ? team.toObject() : team;
        }
        const byCode = await Team.findOne({
          $or: [{ shortCode: teamId.toUpperCase() }, { name: teamId }],
        });
        if (byCode) return byCode.toObject ? byCode.toObject() : byCode;
      } catch (err) {
        logger.warn('getTeamById fallback to memory:', err);
      }
    }

    return (
      memoryStore.teams.find(
        (t) =>
          t._id === teamId ||
          t.id === teamId ||
          t.shortCode.toLowerCase() === teamId.toLowerCase() ||
          t.name.toLowerCase() === teamId.toLowerCase()
      ) || null
    );
  }

  public async updateTeam(teamId: string, updateData: Partial<ITeam>): Promise<any> {
    const dbStatus = getDbStatus();
    if (dbStatus.isReady) {
      try {
        if (mongoose.Types.ObjectId.isValid(teamId)) {
          const updated = await Team.findByIdAndUpdate(
            teamId,
            { ...updateData, updatedAt: new Date() },
            { new: true }
          );
          if (updated) return updated.toObject ? updated.toObject() : updated;
        }
      } catch (err) {
        logger.warn('updateTeam fallback to memory:', err);
      }
    }

    const idx = memoryStore.teams.findIndex(
      (t) => t._id === teamId || t.id === teamId || t.name === teamId
    );
    if (idx !== -1) {
      memoryStore.teams[idx] = {
        ...memoryStore.teams[idx],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      return memoryStore.teams[idx];
    }
    return null;
  }

  // 6. Managers
  public async getManagerByEmail(email: string): Promise<any> {
    const normEmail = email.toLowerCase().trim();
    const dbStatus = getDbStatus();

    if (dbStatus.isReady) {
      try {
        const mgr = await Manager.findOne({ email: normEmail });
        if (mgr) return mgr;
      } catch (err) {
        logger.warn('getManagerByEmail fallback to memory:', err);
      }
    }

    return memoryStore.managers.find((m) => m.email.toLowerCase() === normEmail) || null;
  }

  public async getManagerById(managerId: string): Promise<any> {
    const dbStatus = getDbStatus();
    if (dbStatus.isReady) {
      try {
        if (mongoose.Types.ObjectId.isValid(managerId)) {
          const mgr = await Manager.findById(managerId);
          if (mgr) return mgr.toObject ? mgr.toObject() : mgr;
        }
      } catch (err) {
        logger.warn('getManagerById fallback to memory:', err);
      }
    }

    return memoryStore.managers.find((m) => m._id === managerId || m.id === managerId) || null;
  }

  // 7. Eligible Approved Players
  public async getEligibleApprovedPlayers(): Promise<any[]> {
    const dbStatus = getDbStatus();
    if (dbStatus.isReady) {
      try {
        const players = await Player.find({
          status: 'APPROVED',
          auctionStatus: { $ne: 'sold' },
        }).sort({ createdAt: -1 });

        if (players.length > 0) {
          return players.map((p) => (p.toObject ? p.toObject() : p));
        }
      } catch (err) {
        logger.warn('getEligibleApprovedPlayers fallback to memory:', err);
      }
    }

    // Query in-memory repository
    const memResult: any = await playerRepository.findAll({ status: 'APPROVED' });
    const list = Array.isArray(memResult) ? memResult : memResult.players || [];
    return list.filter((p: any) => p.auctionStatus !== 'sold');
  }

  // 8. Single Player by ID
  public async getPlayerById(playerId: string): Promise<any> {
    const dbStatus = getDbStatus();
    if (dbStatus.isReady) {
      try {
        if (mongoose.Types.ObjectId.isValid(playerId)) {
          const player = await Player.findById(playerId);
          if (player) return player.toObject ? player.toObject() : player;
        }
        const byReg = await Player.findOne({ registrationId: playerId });
        if (byReg) return byReg.toObject ? byReg.toObject() : byReg;
      } catch (err) {
        logger.warn('getPlayerById fallback to memory:', err);
      }
    }

    return (await playerRepository.findById(playerId)) || null;
  }

  // 9. Update Player
  public async updatePlayer(playerId: string, updateData: Partial<IPlayer>): Promise<any> {
    const dbStatus = getDbStatus();
    if (dbStatus.isReady) {
      try {
        if (mongoose.Types.ObjectId.isValid(playerId)) {
          const updated = await Player.findByIdAndUpdate(
            playerId,
            { ...updateData, updatedAt: new Date() },
            { new: true }
          );
          if (updated) return updated.toObject ? updated.toObject() : updated;
        }
        const byReg = await Player.findOneAndUpdate(
          { registrationId: playerId },
          { ...updateData, updatedAt: new Date() },
          { new: true }
        );
        if (byReg) return byReg.toObject ? byReg.toObject() : byReg;
      } catch (err) {
        logger.warn('updatePlayer fallback to memory:', err);
      }
    }

    const memPlayer = await playerRepository.findById(playerId);
    if (memPlayer) {
      Object.assign(memPlayer, updateData, { updatedAt: new Date() });
      return memPlayer;
    }
    return null;
  }

  // 10. Record Bids
  public async createBid(bidData: {
    auctionId: string;
    playerId: string;
    teamId: string;
    teamName: string;
    managerId: string;
    managerName: string;
    amount: number;
  }): Promise<any> {
    const dbStatus = getDbStatus();
    if (dbStatus.isReady) {
      try {
        // Mark previous bids for this player as not highest
        await Bid.updateMany(
          { auctionId: bidData.auctionId, playerId: bidData.playerId },
          { isHighest: false }
        );

        const newBid = await Bid.create({
          ...bidData,
          isHighest: true,
        });
        return newBid.toObject ? newBid.toObject() : newBid;
      } catch (err) {
        logger.warn('createBid fallback to memory:', err);
      }
    }

    // In-memory bid creation
    memoryStore.bids.forEach((b) => {
      if (b.auctionId === bidData.auctionId && b.playerId === bidData.playerId) {
        b.isHighest = false;
      }
    });

    const memBid = {
      _id: `bid-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...bidData,
      isHighest: true,
      createdAt: new Date().toISOString(),
    };
    memoryStore.bids.unshift(memBid);
    return memBid;
  }

  public async getBidsForLot(auctionId: string, playerId: string): Promise<any[]> {
    const dbStatus = getDbStatus();
    if (dbStatus.isReady) {
      try {
        const bids = await Bid.find({ auctionId, playerId }).sort({ createdAt: -1 });
        return bids.map((b) => (b.toObject ? b.toObject() : b));
      } catch (err) {
        logger.warn('getBidsForLot fallback to memory:', err);
      }
    }

    return memoryStore.bids
      .filter((b) => b.auctionId === auctionId && b.playerId === playerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // 11. Record Auction Result
  public async createAuctionResult(resultData: {
    auctionId: string;
    playerId: string;
    teamId?: string | null;
    teamName?: string | null;
    finalPrice: number;
    resultStatus: 'SOLD' | 'UNSOLD';
    bidsCount: number;
  }): Promise<any> {
    const dbStatus = getDbStatus();
    if (dbStatus.isReady) {
      try {
        const result = await AuctionResult.create(resultData);
        return result.toObject ? result.toObject() : result;
      } catch (err) {
        logger.warn('createAuctionResult fallback to memory:', err);
      }
    }

    const memResult = {
      _id: `res-${Date.now()}`,
      ...resultData,
      createdAt: new Date().toISOString(),
    };
    memoryStore.results.unshift(memResult);
    return memResult;
  }

  public async getAuctionHistory(auctionId: string): Promise<any[]> {
    const dbStatus = getDbStatus();
    if (dbStatus.isReady) {
      try {
        const results = await AuctionResult.find({ auctionId })
          .populate('playerId')
          .sort({ createdAt: -1 });
        return results.map((r) => (r.toObject ? r.toObject() : r));
      } catch (err) {
        logger.warn('getAuctionHistory fallback to memory:', err);
      }
    }

    return memoryStore.results.filter((r) => r.auctionId === auctionId);
  }
}

export const auctionRepository = new AuctionRepository();
