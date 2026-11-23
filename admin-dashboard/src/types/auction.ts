export type AuctionStatus = 'upcoming' | 'live' | 'paused' | 'completed';
export type LotStatus = 'upcoming' | 'live' | 'sold' | 'unsold';

export interface AuctionPlayer {
  _id: string;
  registrationId: string;
  fullName: string;
  dateOfBirth?: string;
  age: number;
  playingPosition: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward' | 'GK' | 'DEF' | 'MID' | 'FWD';
  photoUrl: string;
  overallRating?: number;
  tier?: string;
  auctionStatus: LotStatus;
  basePrice?: number;
  soldPrice?: number;
  teamName?: string;
  phoneNumber?: string; // Only present for admin
  email?: string; // Only present for admin
}

export interface LeadingTeam {
  id: string;
  name: string;
  shortCode: string;
  logoUrl: string;
  remainingBudget?: number;
  playersCount?: number;
  maxSquadSize?: number;
}

export interface BidRecord {
  id: string;
  auctionId: string;
  playerId: string;
  teamId: string;
  teamName: string;
  managerId: string;
  managerName: string;
  amount: number;
  createdAt: string;
}

export interface TeamFranchise {
  id: string;
  name: string;
  shortCode: string;
  logoUrl: string;
  totalBudget: number;
  remainingBudget: number;
  playersCount: number;
  maxSquadSize: number;
}

export interface AuctionSession {
  _id: string;
  name: string;
  season: string;
  status: AuctionStatus;
  basePrice: number;
  currentHighestBid: number;
  highestBidderTeamId?: string | null;
  highestBidderTeamName?: string | null;
  highestBidderManagerId?: string | null;
  countdownDuration: number;
  isBiddingActive: boolean;
  currentLotNumber: number;
  totalLotsCount: number;
  endsAt?: string | null;
  remainingSeconds: number;
}

export interface AuctionStatePayload {
  auction: AuctionSession;
  currentPlayer: AuctionPlayer | null;
  leadingTeam: LeadingTeam | null;
  recentBids: BidRecord[];
  eligibleQueueCount: number;
  eligibleQueue: AuctionPlayer[];
  teams: TeamFranchise[];
}

export interface ManagerAccount {
  id: string;
  name: string;
  email: string;
  teamId: string;
  teamName: string;
  role: 'manager';
  team?: TeamFranchise;
}

export interface AuctionResultRecord {
  id: string;
  auctionId: string;
  playerId: string;
  lotNumber: number;
  resultStatus: 'SOLD' | 'UNSOLD';
  winningTeamId?: string | null;
  winningTeamName?: string | null;
  finalPrice: number;
  totalBidsCount: number;
  createdAt: string;
  player?: AuctionPlayer;
}
