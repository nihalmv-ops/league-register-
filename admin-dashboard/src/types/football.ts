export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';
export type PlayerTier = 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
export type AuctionStatus = 'upcoming' | 'live' | 'sold' | 'unsold' | 'withdrawn';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface Player {
  id: string;
  name: string;
  jerseyNumber?: number;
  position: PlayerPosition;
  tier: PlayerTier;
  age: number;
  nationality: string;
  currentClub?: string;
  basePrice: number;
  soldPrice?: number;
  teamId?: string;
  teamName?: string;
  auctionStatus: AuctionStatus;
  overallRating: number;
  stats: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
  };
  preferredFoot: 'Left' | 'Right' | 'Both';
  matchesPlayed: number;
  goals: number;
  assists: number;
  cleanSheets?: number;
  registeredDate: string;
  avatarUrl?: string;
}

export interface Registration {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  age: number;
  position: PlayerPosition;
  experienceYears: number;
  previousClubs: string;
  status: RegistrationStatus;
  submittedAt: string;
  idProofVerified: boolean;
  medicalFitnessCleared: boolean;
  notes?: string;
}

export interface Team {
  id: string;
  name: string;
  shortCode: string;
  city: string;
  stadium: string;
  manager: string;
  owner: string;
  primaryColor: string;
  secondaryColor: string;
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  squadCount: number;
  maxSquadSize: number;
  trophiesWon: number;
  foundedYear: number;
  logoBadge: string;
}

export interface Fixture {
  id: string;
  matchNumber: number;
  round: string;
  homeTeam: string;
  homeTeamCode: string;
  homeTeamColor: string;
  awayTeam: string;
  awayTeamCode: string;
  awayTeamColor: string;
  date: string;
  time: string;
  venue: string;
  status: 'scheduled' | 'live' | 'completed' | 'postponed';
  referee?: string;
}

export interface MatchResult {
  id: string;
  matchNumber: number;
  date: string;
  venue: string;
  homeTeam: string;
  homeTeamCode: string;
  awayTeam: string;
  awayTeamCode: string;
  homeScore: number;
  awayScore: number;
  scorers: {
    player: string;
    team: string;
    minute: number;
  }[];
  manOfTheMatch: string;
  attendance: number;
  highlightSummary: string;
}

export interface LeagueStanding {
  rank: number;
  team: string;
  shortCode: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}
