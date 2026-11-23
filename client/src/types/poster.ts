export type PosterTemplateId = 'modern' | 'announcement' | 'minimal';

export type ExportDimensionId =
  | 'instagram-portrait' // 1080 x 1350 (4:5)
  | 'instagram-square' // 1080 x 1080 (1:1)
  | 'instagram-story' // 1080 x 1920 (9:16)
  | 'ultra-hd'; // 1440 x 1800

export interface DimensionConfig {
  id: ExportDimensionId;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
}

export const EXPORT_DIMENSIONS: Record<ExportDimensionId, DimensionConfig> = {
  'instagram-portrait': {
    id: 'instagram-portrait',
    name: 'Instagram Portrait',
    width: 1080,
    height: 1350,
    aspectRatio: '4 / 5',
    description: '1080 × 1350 px · Optimal for Instagram feed posts',
  },
  'instagram-square': {
    id: 'instagram-square',
    name: 'Instagram Square',
    width: 1080,
    height: 1080,
    aspectRatio: '1 / 1',
    description: '1080 × 1080 px · Standard square social post',
  },
  'instagram-story': {
    id: 'instagram-story',
    name: 'Instagram Story / Reel',
    width: 1080,
    height: 1920,
    aspectRatio: '9 / 16',
    description: '1080 × 1920 px · Fullscreen mobile story',
  },
  'ultra-hd': {
    id: 'ultra-hd',
    name: 'Ultra HD Print',
    width: 1440,
    height: 1800,
    aspectRatio: '4 / 5',
    description: '1440 × 1800 px · High-resolution print & web',
  },
};

export interface SquadPlayer {
  id: string;
  registrationId: string;
  fullName: string;
  playingPosition: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
  photoUrl: string;
  age: number;
  jerseyNumber: number | null;
  isCaptain: boolean;
  soldPrice: number;
  overallRating: number;
  tier: string;
}

export interface PosterTeam {
  id: string;
  name: string;
  shortCode: string;
  logoUrl?: string;
  city?: string;
  primaryColor: string;
  secondaryColor: string;
  coach?: string;
  owner?: string;
  remainingBudget?: number;
  totalBudget?: number;
  playersCount: number;
  maxSquadSize: number;
}

export interface PosterSquadStats {
  totalPlayers: number;
  goalkeepers: number;
  defenders: number;
  midfielders: number;
  forwards: number;
  captain: SquadPlayer | null;
  totalSquadValue: number;
}

export interface PosterDataResponse {
  team: PosterTeam;
  season: string;
  leagueName: string;
  officialTitle: string;
  officialSubtitle: string;
  squadStats: PosterSquadStats;
  players: SquadPlayer[];
}

export interface PlayerCardItem {
  id: string;
  registrationId: string;
  fullName: string;
  playingPosition: string;
  photoUrl: string;
  age: number;
  jerseyNumber: number | null;
  isCaptain: boolean;
  overallRating: number;
  tier: string;
  teamName: string;
  teamShortCode: string;
  teamLogoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  season: string;
}

export interface PosterSettings {
  title: string;
  subtitle: string;
  template: PosterTemplateId;
  dimension: ExportDimensionId;
  showPositions: boolean;
  showJerseyNumbers: boolean;
  showCaptainBadge: boolean;
  showAge: boolean;
  showRating: boolean;
  customAccentColor?: string;
}
