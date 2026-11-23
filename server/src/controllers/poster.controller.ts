import { Request, Response } from 'express';
import { auctionRepository } from '../services/auctionRepository';
import { logger } from '../utils/logger';

export class PosterController {
  // 1. Get All Teams for Poster Selector
  public static async getTeams(req: Request, res: Response): Promise<void> {
    try {
      const teams = await auctionRepository.getTeams();
      res.status(200).json({
        success: true,
        data: teams.map((t) => ({
          id: String(t._id || t.id),
          name: t.name,
          shortCode: t.shortCode,
          logoUrl: t.logoUrl,
          primaryColor: t.primaryColor || '#10b981',
          secondaryColor: t.secondaryColor || '#0f172a',
          city: t.city || 'England',
          playersCount: t.playersCount || 0,
          maxSquadSize: t.maxSquadSize || 15,
        })),
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      logger.error('Error fetching teams for poster studio:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve tournament teams',
        error: { code: 'SERVER_ERROR', details: err.message },
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 2. Get Squad Poster Data for Selected Team
  public static async getTeamPosterData(req: Request, res: Response): Promise<void> {
    try {
      const teamId = String(req.params.teamId);
      const season = String(req.query.season || '2026-27');

      if (!teamId || teamId.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Team identifier is required',
          error: { code: 'VALIDATION_ERROR' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const squadData = await auctionRepository.getSquadByTeamId(teamId);
      if (!squadData) {
        res.status(404).json({
          success: false,
          message: `Franchise team "${teamId}" not found.`,
          error: { code: 'TEAM_NOT_FOUND' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { team, players } = squadData;

      // Calculate squad position breakdown
      const squadStats = {
        totalPlayers: players.length,
        goalkeepers: players.filter((p) => p.playingPosition === 'Goalkeeper').length,
        defenders: players.filter((p) => p.playingPosition === 'Defender').length,
        midfielders: players.filter((p) => p.playingPosition === 'Midfielder').length,
        forwards: players.filter((p) => p.playingPosition === 'Forward').length,
        captain: players.find((p) => p.isCaptain) || null,
        totalSquadValue: players.reduce((sum, p) => sum + (p.soldPrice || 0), 0),
      };

      res.status(200).json({
        success: true,
        data: {
          team,
          season,
          leagueName: 'Premier Football League 2026',
          officialTitle: `${team.name.toUpperCase()} SQUAD`,
          officialSubtitle: `OFFICIAL SQUAD ANNOUNCEMENT · SEASON ${season}`,
          squadStats,
          players,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      logger.error('Error compiling squad poster data:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to generate poster data',
        error: { code: 'SERVER_ERROR', details: err.message },
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 3. Get Individual Player Cards Data for Team
  public static async getTeamPlayerCards(req: Request, res: Response): Promise<void> {
    try {
      const teamId = String(req.params.teamId);
      const season = String(req.query.season || '2026-27');

      const squadData = await auctionRepository.getSquadByTeamId(teamId);
      if (!squadData) {
        res.status(404).json({
          success: false,
          message: `Franchise team "${teamId}" not found.`,
          error: { code: 'TEAM_NOT_FOUND' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { team, players } = squadData;

      const cards = players.map((player) => ({
        id: player.id,
        registrationId: player.registrationId,
        fullName: player.fullName,
        playingPosition: player.playingPosition,
        photoUrl: player.photoUrl,
        age: player.age,
        jerseyNumber: player.jerseyNumber,
        isCaptain: player.isCaptain,
        overallRating: player.overallRating,
        tier: player.tier,
        teamName: team.name,
        teamShortCode: team.shortCode,
        teamLogoUrl: team.logoUrl,
        primaryColor: team.primaryColor,
        secondaryColor: team.secondaryColor,
        season,
      }));

      res.status(200).json({
        success: true,
        data: {
          team: {
            id: team.id,
            name: team.name,
            shortCode: team.shortCode,
            logoUrl: team.logoUrl,
          },
          season,
          totalCards: cards.length,
          cards,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      logger.error('Error generating player cards data:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to generate player cards data',
        error: { code: 'SERVER_ERROR', details: err.message },
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 4. Log / Record Poster Export Event
  public static async logPosterExport(req: Request, res: Response): Promise<void> {
    try {
      const teamId = String(req.params.teamId);
      const { template, format, dimensions, count } = req.body || {};

      logger.info(
        `🎨 Poster Exported: Team=${teamId}, Template=${template}, Format=${format}, Dimensions=${dimensions}`
      );

      res.status(200).json({
        success: true,
        message: 'Poster export logged successfully',
        data: {
          exportId: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          teamId,
          template: template || 'modern',
          format: format || 'PNG',
          dimensions: dimensions || '1080x1350',
          count: count || 1,
          exportedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to record export event',
        error: { code: 'SERVER_ERROR', details: err.message },
        timestamp: new Date().toISOString(),
      });
    }
  }
}
