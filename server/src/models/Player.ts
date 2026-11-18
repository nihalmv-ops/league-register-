import mongoose, { Document, Schema } from 'mongoose';

export type PlayingPosition = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
export type PlayerStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AuctionStatus = 'upcoming' | 'live' | 'sold' | 'unsold' | 'withdrawn';

export interface IPlayer extends Document {
  registrationId: string;
  fullName: string;
  dateOfBirth: Date;
  phoneNumber: string;
  email: string;
  playingPosition: PlayingPosition;
  photoUrl: string;
  photoPublicId?: string;
  status: PlayerStatus;
  rejectionReason?: string;
  reviewedAt?: Date;
  reviewedBy?: string;

  // Auction & League Integration fields (used once APPROVED)
  auctionStatus: AuctionStatus;
  tier?: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  basePrice?: number;
  soldPrice?: number;
  teamId?: mongoose.Types.ObjectId | string;
  teamName?: string;
  overallRating?: number;
  jerseyNumber?: number;

  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema = new Schema<IPlayer>(
  {
    registrationId: {
      type: String,
      required: [true, 'Registration ID is required'],
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    playingPosition: {
      type: String,
      required: [true, 'Playing position is required'],
      enum: {
        values: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
        message: '{VALUE} is not a valid playing position',
      },
      index: true,
    },
    photoUrl: {
      type: String,
      required: [true, 'Player profile photo is required'],
    },
    photoPublicId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: String,
      default: null,
    },

    // Auction pool fields
    auctionStatus: {
      type: String,
      enum: ['upcoming', 'live', 'sold', 'unsold', 'withdrawn'],
      default: 'upcoming',
      index: true,
    },
    tier: {
      type: String,
      enum: ['Platinum', 'Gold', 'Silver', 'Bronze'],
      default: 'Silver',
    },
    basePrice: {
      type: Number,
      default: 50000,
    },
    soldPrice: {
      type: Number,
      default: null,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    teamName: {
      type: String,
      default: null,
    },
    overallRating: {
      type: Number,
      default: 75,
      min: 50,
      max: 99,
    },
    jerseyNumber: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for name and search
PlayerSchema.index({ fullName: 'text', email: 'text', registrationId: 'text' });

export const Player = mongoose.model<IPlayer>('Player', PlayerSchema);
