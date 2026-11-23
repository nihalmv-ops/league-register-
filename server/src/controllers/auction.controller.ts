import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { auctionRepository } from '../services/auctionRepository';
import { auctionEngine } from '../services/auctionEngine';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { config } from '../config/env';

// Validation Schemas
const nextPlayerSchema = z.object({
  playerId: z.string().min(1, 'Player ID is required'),
  basePrice: z.number().positive().optional(),
  countdownDuration: z.number().min(5).max(120).optional(),
});

const timerSchema = z.object({
  durationSeconds: z.number().min(5).max(120).optional(),
});

const managerBidSchema = z.object({
  amount: z.number().positive('Bid amount must be a positive number'),
});

const managerLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export class AuctionController {
  // ================= ADMIN AUCTION CONTROLS =================

  public static async getActiveAuction(req: Request, res: Response): Promise<void> {
    try {
      const auction = await auctionRepository.getActiveAuction();
      const state = await auctionEngine.getAuctionState(auction._id || auction.id, true);
      sendSuccess(res, state, 'Active live auction state retrieved');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  public static async getAuctions(req: Request, res: Response): Promise<void> {
    try {
      const list = await auctionRepository.listAuctions();
      sendSuccess(res, list, 'Auctions retrieved');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  public static async getAuctionById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const state = await auctionEngine.getAuctionState(id, true);
      if (!state) {
        sendError(res, 'Auction not found', 404);
        return;
      }
      sendSuccess(res, state, 'Auction state retrieved');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  public static async createAuction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, season, countdownDuration, basePrice } = req.body;
      const created = await auctionRepository.updateAuction(`auc-${Date.now()}`, {
        name: name || 'Premier League Live Auction',
        season: season || '2026-27',
        countdownDuration: countdownDuration || 30,
        basePrice: basePrice || 100000,
        status: 'upcoming',
        currentHighestBid: 0,
        isBiddingActive: false,
      } as any);
      sendSuccess(res, created, 'New auction initialized', 201);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  public static async startAuction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const state = await auctionEngine.startAuction(id);
      sendSuccess(res, state, 'Auction is now LIVE');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  public static async pauseAuction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const state = await auctionEngine.pauseAuction(id);
      sendSuccess(res, state, 'Auction has been PAUSED');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  public static async resumeAuction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const state = await auctionEngine.resumeAuction(id);
      sendSuccess(res, state, 'Auction has been RESUMED');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  public static async selectNextPlayer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const parsed = nextPlayerSchema.parse(req.body);
      const state = await auctionEngine.selectNextPlayer(
        id,
        parsed.playerId,
        parsed.basePrice,
        parsed.countdownDuration
      );
      sendSuccess(res, state, 'Next player brought to the podium');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  public static async startBidding(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const { durationSeconds } = req.body;
      const state = await auctionEngine.startBidding(id, durationSeconds);
      sendSuccess(res, state, 'Bidding is now active on the floor');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  public static async resetTimer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const parsed = timerSchema.parse(req.body);
      const state = await auctionEngine.resetTimer(id, parsed.durationSeconds);
      sendSuccess(res, state, 'Auction countdown reset');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  public static async declareSold(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const result = await auctionEngine.declareSold(id);
      sendSuccess(res, result, 'Player successfully SOLD and allocated to squad');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  public static async declareUnsold(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const result = await auctionEngine.declareUnsold(id);
      sendSuccess(res, result, 'Player declared UNSOLD');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  public static async getAuctionHistory(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const history = await auctionRepository.getAuctionHistory(id);
      sendSuccess(res, history, 'Auction history retrieved');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  public static async getEligiblePlayers(req: Request, res: Response): Promise<void> {
    try {
      const players = await auctionRepository.getEligibleApprovedPlayers();
      sendSuccess(res, players, 'Eligible approved players retrieved');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  // ================= TEAM MANAGER BIDS & AUTH =================

  public static async managerLogin(req: Request, res: Response): Promise<void> {
    try {
      const parsed = managerLoginSchema.parse(req.body);
      const manager = await auctionRepository.getManagerByEmail(parsed.email);

      if (!manager) {
        sendError(res, 'Invalid manager credentials.', 401, null, 'INVALID_CREDENTIALS');
        return;
      }

      // Check password
      let isValid = false;
      if (typeof manager.comparePassword === 'function') {
        isValid = await manager.comparePassword(parsed.password);
      } else if (manager.password) {
        isValid = await require('bcryptjs').compare(parsed.password, manager.password);
      }

      if (!isValid) {
        sendError(res, 'Invalid manager credentials.', 401, null, 'INVALID_CREDENTIALS');
        return;
      }

      const team = await auctionRepository.getTeamById(String(manager.teamId));

      const token = jwt.sign(
        {
          id: manager._id || manager.id,
          email: manager.email,
          role: 'manager',
          name: manager.name,
          teamId: manager.teamId,
          teamName: manager.teamName,
        },
        config.jwtSecret,
        { expiresIn: '12h' }
      );

      sendSuccess(
        res,
        {
          token,
          manager: {
            id: manager._id || manager.id,
            name: manager.name,
            email: manager.email,
            teamId: manager.teamId,
            teamName: manager.teamName,
          },
          team: team
            ? {
                id: team._id || team.id,
                name: team.name,
                shortCode: team.shortCode,
                logoUrl: team.logoUrl,
                totalBudget: team.totalBudget,
                remainingBudget: team.remainingBudget,
                playersCount: team.playersCount,
                maxSquadSize: team.maxSquadSize,
              }
            : null,
        },
        'Manager authenticated successfully'
      );
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  public static async getManagersList(req: Request, res: Response): Promise<void> {
    try {
      await auctionRepository.ensureSeeded();
      const teams = await auctionRepository.getTeams();
      // Provide clean test manager accounts
      const list = teams.map((t, idx) => ({
        teamName: t.name,
        shortCode: t.shortCode,
        logoUrl: t.logoUrl,
        teamId: t._id || t.id,
        email: `manager.${t.shortCode.toLowerCase()}@football.league`,
        defaultPassword: 'Manager@123',
        managerName: t.coach || `Manager #${idx + 1}`,
        remainingBudget: t.remainingBudget,
        playersCount: t.playersCount,
        maxSquadSize: t.maxSquadSize,
      }));
      sendSuccess(res, list, 'Available franchise manager profiles');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  public static async getManagerProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.manager) {
        sendError(res, 'Manager authorization required', 401);
        return;
      }
      const team = await auctionRepository.getTeamById(req.manager.teamId);
      sendSuccess(
        res,
        {
          manager: req.manager,
          team,
        },
        'Manager profile retrieved'
      );
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  public static async placeManagerBid(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      if (!req.manager) {
        sendError(res, 'Unauthorized: Only team managers can place bids.', 401);
        return;
      }

      const parsed = managerBidSchema.parse(req.body);

      // Execute bid via auction engine
      const result = await auctionEngine.placeBid(id, req.manager.id, parsed.amount);
      sendSuccess(res, result, `Bid of $${parsed.amount.toLocaleString()} accepted!`);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  public static async getManagerAuctionView(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const state = await auctionEngine.getAuctionState(id, false);
      if (!state) {
        sendError(res, 'Auction not found', 404);
        return;
      }

      let myTeam = null;
      if (req.manager?.teamId) {
        myTeam = await auctionRepository.getTeamById(req.manager.teamId);
      }

      sendSuccess(
        res,
        {
          ...state,
          myTeam,
        },
        'Manager auction dashboard state'
      );
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  // ================= PUBLIC PROJECTOR LIVE VIEW =================

  public static async getPublicLiveDisplay(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      // isAdmin: false ensures phone, email, and address are strictly omitted
      const state = await auctionEngine.getAuctionState(id, false);
      if (!state) {
        sendError(res, 'Auction session not found', 404);
        return;
      }
      sendSuccess(res, state, 'Public live projector display telemetry');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}
