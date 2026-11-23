import { request } from './api';
import {
  PosterTeam,
  PosterDataResponse,
  PlayerCardItem,
} from '../types/poster';

export const posterService = {
  // 1. Get all teams for selector
  async getTeams(): Promise<PosterTeam[]> {
    const res = await request<PosterTeam[]>('/admin/teams');
    return res.data || [];
  },

  // 2. Get full team squad poster data
  async getTeamPosterData(
    teamId: string,
    season: string = '2026-27'
  ): Promise<PosterDataResponse> {
    const res = await request<PosterDataResponse>(
      `/admin/teams/${encodeURIComponent(teamId)}/poster-data?season=${encodeURIComponent(season)}`
    );
    return res.data!;
  },

  // 3. Get individual player cards dataset
  async getTeamPlayerCards(
    teamId: string,
    season: string = '2026-27'
  ): Promise<{ team: Partial<PosterTeam>; season: string; totalCards: number; cards: PlayerCardItem[] }> {
    const res = await request<{
      team: Partial<PosterTeam>;
      season: string;
      totalCards: number;
      cards: PlayerCardItem[];
    }>(
      `/admin/teams/${encodeURIComponent(teamId)}/player-cards?season=${encodeURIComponent(season)}`
    );
    return res.data!;
  },

  // 4. Log poster export activity
  async logPosterExport(
    teamId: string,
    payload: { template: string; format: string; dimensions: string; count?: number }
  ): Promise<{ exportId: string }> {
    const res = await request<{ exportId: string }>(
      `/admin/teams/${encodeURIComponent(teamId)}/poster-export`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return res.data!;
  },
};
