import mongoose, { Schema, Document } from 'mongoose';
import { PlayerPosition, PlayerCategory, PlayerAuctionStatus } from '../types';

export interface IPlayer extends Document {
  name: string;
  jerseyNumber?: number;
  position: PlayerPosition;
  category: PlayerCategory;
  age: number;
  nationality?: string;
  basePrice: number;
  finalBidAmount?: number;
  auctionStatus: PlayerAuctionStatus;
  teamId?: mongoose.Types.ObjectId;
  stats?: {
    matchesPlayed: number;
    goals: number;
    assists: number;
    cleanSheets?: number;
    yellowCards: number;
    redCards: number;
  };
  phone?: string;
  email?: string;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema = new Schema<IPlayer>(
  {
    name: { type: String, required: true, trim: true },
    jerseyNumber: { type: Number, min: 1, max: 99 },
    position: {
      type: String,
      enum: ['GK', 'DEF', 'MID', 'FWD'],
      required: true,
      default: 'MID',
    },
    category: {
      type: String,
      enum: ['Icon', 'Gold', 'Silver', 'Bronze', 'Emerging'],
      required: true,
      default: 'Silver',
    },
    age: { type: Number, required: true, min: 14, max: 50 },
    nationality: { type: String, default: 'Domestic' },
    basePrice: { type: Number, required: true, min: 0 },
    finalBidAmount: { type: Number, min: 0 },
    auctionStatus: {
      type: String,
      enum: ['available', 'bidding', 'sold', 'unsold'],
      default: 'available',
    },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    stats: {
      matchesPlayed: { type: Number, default: 0 },
      goals: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
      cleanSheets: { type: Number, default: 0 },
      yellowCards: { type: Number, default: 0 },
      redCards: { type: Number, default: 0 },
    },
    phone: { type: String },
    email: { type: String },
    photoUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Player = mongoose.model<IPlayer>('Player', PlayerSchema);
