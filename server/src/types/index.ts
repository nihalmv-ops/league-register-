export * from './dashboard.types';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code?: string;
    details?: unknown;
  };
  timestamp: string;
}

export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';
export type PlayerCategory = 'Icon' | 'Gold' | 'Silver' | 'Bronze' | 'Emerging';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';
export type AuctionStatus = 'upcoming' | 'live' | 'completed' | 'paused';
export type PlayerAuctionStatus = 'available' | 'bidding' | 'sold' | 'unsold';
