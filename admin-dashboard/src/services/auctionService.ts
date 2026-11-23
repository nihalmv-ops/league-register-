import { request } from './api';
import {
  AuctionStatePayload,
  AuctionResultRecord,
  ManagerAccount,
  BidRecord,
} from '../types/auction';

export const auctionService = {
  // 1. Get active auction session
  async getActiveAuction(): Promise<AuctionStatePayload> {
    const res = await request<AuctionStatePayload>('/admin/auctions/active');
    return res.data!;
  },

  // 2. Get auction state by ID (Admin)
  async getAuctionById(auctionId: string): Promise<AuctionStatePayload> {
    const res = await request<AuctionStatePayload>(`/admin/auctions/${auctionId}`);
    return res.data!;
  },

  // 3. Start Auction
  async startAuction(auctionId: string): Promise<AuctionStatePayload> {
    const res = await request<AuctionStatePayload>(`/admin/auctions/${auctionId}/start`, {
      method: 'PATCH',
    });
    return res.data!;
  },

  // 4. Pause Auction
  async pauseAuction(auctionId: string): Promise<AuctionStatePayload> {
    const res = await request<AuctionStatePayload>(`/admin/auctions/${auctionId}/pause`, {
      method: 'PATCH',
    });
    return res.data!;
  },

  // 5. Resume Auction
  async resumeAuction(auctionId: string): Promise<AuctionStatePayload> {
    const res = await request<AuctionStatePayload>(`/admin/auctions/${auctionId}/resume`, {
      method: 'PATCH',
    });
    return res.data!;
  },

  // 6. Select Next Player
  async selectNextPlayer(
    auctionId: string,
    playerId: string,
    basePrice?: number,
    countdownDuration?: number
  ): Promise<AuctionStatePayload> {
    const res = await request<AuctionStatePayload>(`/admin/auctions/${auctionId}/next-player`, {
      method: 'PATCH',
      body: JSON.stringify({ playerId, basePrice, countdownDuration }),
    });
    return res.data!;
  },

  // 7. Start Bidding Floor (starts clock)
  async startBidding(
    auctionId: string,
    durationSeconds: number = 30
  ): Promise<AuctionStatePayload> {
    const res = await request<AuctionStatePayload>(`/admin/auctions/${auctionId}/start-bidding`, {
      method: 'PATCH',
      body: JSON.stringify({ durationSeconds }),
    });
    return res.data!;
  },

  // 8. Reset Timer
  async resetTimer(
    auctionId: string,
    durationSeconds?: number
  ): Promise<AuctionStatePayload> {
    const res = await request<AuctionStatePayload>(`/admin/auctions/${auctionId}/reset-timer`, {
      method: 'PATCH',
      body: JSON.stringify({ durationSeconds }),
    });
    return res.data!;
  },

  // 9. Declare SOLD
  async declareSold(auctionId: string): Promise<{
    auctionId: string;
    result: AuctionResultRecord;
    state: AuctionStatePayload;
  }> {
    const res = await request<{
      auctionId: string;
      result: AuctionResultRecord;
      state: AuctionStatePayload;
    }>(`/admin/auctions/${auctionId}/sold`, {
      method: 'PATCH',
    });
    return res.data!;
  },

  // 10. Declare UNSOLD
  async declareUnsold(auctionId: string): Promise<{
    auctionId: string;
    result: AuctionResultRecord;
    state: AuctionStatePayload;
  }> {
    const res = await request<{
      auctionId: string;
      result: AuctionResultRecord;
      state: AuctionStatePayload;
    }>(`/admin/auctions/${auctionId}/unsold`, {
      method: 'PATCH',
    });
    return res.data!;
  },

  // 11. Get Auction History
  async getAuctionHistory(auctionId: string): Promise<AuctionResultRecord[]> {
    const res = await request<AuctionResultRecord[]>(`/admin/auctions/${auctionId}/history`);
    return res.data || [];
  },

  // 12. Projector Live Public Feed (NO AUTH REQUIRED)
  async getProjectorLive(auctionId: string = 'auc-2026'): Promise<AuctionStatePayload> {
    const res = await fetch(`/api/auctions/${auctionId}/live`);
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to load live projector feed');
    }
    return data.data;
  },

  // 13. Team Manager Authentication
  async managerLogin(
    email: string,
    password: string = 'Manager@123'
  ): Promise<{ token: string; manager: ManagerAccount }> {
    const res = await fetch('/api/auth/manager/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Manager authentication failed');
    }
    return data.data;
  },

  // 14. Get Manager Profile with Franchise Details
  async getManagerProfile(token: string): Promise<{ manager: ManagerAccount; team: any }> {
    const res = await fetch('/api/auth/manager/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch manager profile');
    }
    return data.data;
  },

  // 15. Manager Place Bid via REST fallback
  async managerPlaceBid(
    auctionId: string,
    amount: number,
    token: string
  ): Promise<{ bid: BidRecord; state: AuctionStatePayload }> {
    const res = await fetch(`/api/manager/auctions/${auctionId}/bid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Bid rejected');
    }
    return data.data;
  },
};
