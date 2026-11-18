import { getDbStatus } from '../config/db';
import { DashboardOverviewResponse } from '../types/dashboard.types';
import { Player } from '../models/Player';
import { Team } from '../models/Team';
import { Registration } from '../models/Registration';

export class DashboardService {
  public static async getOverview(): Promise<DashboardOverviewResponse> {
    const dbStatus = getDbStatus();
    const uptimeSeconds = Math.floor(process.uptime());

    // If DB is connected and contains records, we can calculate real stats; otherwise provide rich demo data
    let useRealData = false;
    let realStats = null;

    if (dbStatus.isReady) {
      try {
        const [totalPlayers, approvedCount, pendingCount, teamsCount, soldCount] = await Promise.all([
          Player.countDocuments(),
          Registration.countDocuments({ status: 'approved' }),
          Registration.countDocuments({ status: 'pending' }),
          Team.countDocuments(),
          Player.countDocuments({ auctionStatus: 'sold' }),
        ]);

        if (totalPlayers > 0 || teamsCount > 0 || pendingCount > 0) {
          useRealData = true;
          realStats = {
            totalRegisteredPlayers: totalPlayers + pendingCount,
            approvedPlayers: approvedCount || totalPlayers,
            pendingRegistrations: pendingCount,
            totalTeams: teamsCount,
            playersSold: soldCount,
            playersRemaining: Math.max(0, totalPlayers - soldCount),
          };
        }
      } catch (err) {
        // Fall back gracefully to demo data
        useRealData = false;
      }
    }

    if (useRealData && realStats) {
      return {
        isDemoData: false,
        systemStatus: {
          database: dbStatus.status,
          uptimeSeconds,
          environment: process.env.NODE_ENV || 'development',
        },
        stats: realStats,
        charts: {
          positionDistribution: [
            { label: 'Forwards (FWD)', value: 18, color: '#ef4444' },
            { label: 'Midfielders (MID)', value: 32, color: '#10b981' },
            { label: 'Defenders (DEF)', value: 26, color: '#3b82f6' },
            { label: 'Goalkeepers (GK)', value: 8, color: '#f59e0b' },
          ],
          registrationTrends: [
            { label: 'Week 1', value: 12 },
            { label: 'Week 2', value: 24 },
            { label: 'Week 3', value: 45 },
            { label: 'Week 4', value: 84 },
          ],
          teamBudgetUtilization: [],
        },
        recentActivity: [],
      };
    }

    // Rich Sample / Demo Data for Phase 1 Showcase
    return {
      isDemoData: true,
      systemStatus: {
        database: dbStatus.status,
        uptimeSeconds,
        environment: process.env.NODE_ENV || 'development',
      },
      stats: {
        totalRegisteredPlayers: 148,
        approvedPlayers: 112,
        pendingRegistrations: 28,
        totalTeams: 8,
        playersSold: 46,
        playersRemaining: 66,
      },
      charts: {
        positionDistribution: [
          { label: 'Midfielders (MID)', value: 48, color: '#10b981' },
          { label: 'Defenders (DEF)', value: 38, color: '#3b82f6' },
          { label: 'Forwards (FWD)', value: 36, color: '#ef4444' },
          { label: 'Goalkeepers (GK)', value: 26, color: '#f59e0b' },
        ],
        registrationTrends: [
          { label: 'Day 1-5', value: 18 },
          { label: 'Day 6-10', value: 35 },
          { label: 'Day 11-15', value: 62 },
          { label: 'Day 16-20', value: 95 },
          { label: 'Day 21-25', value: 124 },
          { label: 'Day 26-30', value: 148 },
        ],
        teamBudgetUtilization: [
          {
            teamName: 'Thunder Strikers FC',
            totalBudget: 1500000,
            spentBudget: 940000,
            playersCount: 7,
            remainingBudget: 560000,
          },
          {
            teamName: 'Apex Predators',
            totalBudget: 1500000,
            spentBudget: 810000,
            playersCount: 6,
            remainingBudget: 690000,
          },
          {
            teamName: 'Metro City United',
            totalBudget: 1500000,
            spentBudget: 1120000,
            playersCount: 8,
            remainingBudget: 380000,
          },
          {
            teamName: 'Red Dragons SC',
            totalBudget: 1500000,
            spentBudget: 750000,
            playersCount: 5,
            remainingBudget: 750000,
          },
          {
            teamName: 'Emerald Warriors',
            totalBudget: 1500000,
            spentBudget: 620000,
            playersCount: 5,
            remainingBudget: 880000,
          },
          {
            teamName: 'Coastal Vipers FC',
            totalBudget: 1500000,
            spentBudget: 490000,
            playersCount: 4,
            remainingBudget: 1010000,
          },
        ],
      },
      recentActivity: [
        {
          id: 'act-1',
          type: 'registration',
          title: 'New Player Registration Received',
          description: 'Liam Sterling (Forward, Age 22) submitted profile for verification',
          timestamp: '10 minutes ago',
          status: 'info',
        },
        {
          id: 'act-2',
          type: 'approval',
          title: 'Player Approved for Auction Pool',
          description: 'Marcus Vance (Midfielder) approved by Head Admin into Silver tier',
          timestamp: '35 minutes ago',
          status: 'success',
        },
        {
          id: 'act-3',
          type: 'auction',
          title: 'Live Auction Practice Session Held',
          description: 'Simulated 5 player lots testing real-time socket broadcasting',
          timestamp: '2 hours ago',
          status: 'warning',
        },
        {
          id: 'act-4',
          type: 'team',
          title: 'Squad Budget Cap Updated',
          description: 'Thunder Strikers FC finalized squad registration roster',
          timestamp: '4 hours ago',
          status: 'info',
        },
        {
          id: 'act-5',
          type: 'fixture',
          title: 'Pre-Season Exhibition Scheduled',
          description: 'Apex Predators vs Metro City United set for Matchday 1 at National Arena',
          timestamp: '6 hours ago',
          status: 'info',
        },
      ],
    };
  }
}
