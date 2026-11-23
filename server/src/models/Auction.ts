import mongoose, { Schema, Document } from 'mongoose';

export type AuctionStatus = 'upcoming' | 'live' | 'paused' | 'completed';

export interface IAuction extends Document {
  name: string;
  season: string;
  status: AuctionStatus;
  currentPlayerId?: mongoose.Types.ObjectId | string | null;
  basePrice: number;
  currentHighestBid: number;
  highestBidderTeamId?: mongoose.Types.ObjectId | string | null;
  highestBidderTeamName?: string | null;
  highestBidderManagerId?: mongoose.Types.ObjectId | string | null;
  countdownDuration: number;
  endsAt?: Date | null;
  isBiddingActive: boolean;
  currentLotNumber: number;
  totalLotsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AuctionSchema = new Schema<IAuction>(
  {
    name: {
      type: String,
      required: true,
      default: 'Season 2026 Premier League Auction',
      trim: true,
    },
    season: {
      type: String,
      required: true,
      default: '2026-27',
      trim: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'live', 'paused', 'completed'],
      default: 'upcoming',
      index: true,
    },
    currentPlayerId: {
      type: Schema.Types.Mixed,
      ref: 'Player',
      default: null,
    },
    basePrice: {
      type: Number,
      required: true,
      default: 100000,
      min: 0,
    },
    currentHighestBid: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    highestBidderTeamId: {
      type: Schema.Types.Mixed,
      ref: 'Team',
      default: null,
    },
    highestBidderTeamName: {
      type: String,
      default: null,
    },
    highestBidderManagerId: {
      type: Schema.Types.Mixed,
      ref: 'Manager',
      default: null,
    },
    countdownDuration: {
      type: Number,
      default: 30,
      min: 5,
      max: 120,
    },
    endsAt: {
      type: Date,
      default: null,
    },
    isBiddingActive: {
      type: Boolean,
      default: false,
    },
    currentLotNumber: {
      type: Number,
      default: 0,
    },
    totalLotsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Auction = mongoose.model<IAuction>('Auction', AuctionSchema);
export default Auction;
