import { request } from './api';

export type PlayingPosition = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
export type PlayerStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PlayerApplication {
  _id: string;
  registrationId: string;
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  playingPosition: PlayingPosition;
  photoUrl: string;
  photoPublicId?: string;
  status: PlayerStatus;
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
  overallRating?: number;
  tier?: string;
  basePrice?: number;
  auctionStatus?: string;
}

export interface PlayerListResponse {
  players: PlayerApplication[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface PlayerStatsResponse {
  summary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  byPosition: Record<string, number>;
}

export const playerService = {
  getPlayers: async (params: {
    status?: string;
    position?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PlayerListResponse> => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.position) query.append('position', params.position);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const endpoint = `/players${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await request<PlayerListResponse>(endpoint);
    return res.data;
  },

  getPlayerById: async (id: string): Promise<PlayerApplication> => {
    const res = await request<PlayerApplication>(`/players/${id}`);
    return res.data;
  },

  approvePlayer: async (id: string): Promise<PlayerApplication> => {
    const res = await request<PlayerApplication>(`/players/${id}/approve`, {
      method: 'PATCH',
    });
    return res.data;
  },

  rejectPlayer: async (id: string, reason?: string): Promise<PlayerApplication> => {
    const res = await request<PlayerApplication>(`/players/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
    return res.data;
  },

  getStats: async (): Promise<PlayerStatsResponse> => {
    const res = await request<PlayerStatsResponse>('/players/stats');
    return res.data;
  },
};
