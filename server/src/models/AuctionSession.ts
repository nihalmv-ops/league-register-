import mongoose, { Schema, Document } from 'mongoose';

export interface IAuctionSession extends Document {
  title: string;
  season: string;
  status: 'upcoming' | 'live' | 'completed' | 'paused';
  currentLotNumber?: number;
  currentLotPlayerId?: mongoose.Types.ObjectId;
  totalLotsCount: number;
  scheduledStartTime?: Date;
  actualStartTime?: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AuctionSessionSchema = new Schema<IAuctionSession>(
  {
    title: { type: String, required: true, default: 'Season 2026 Premier League Auction' },
    season: { type: String, required: true, default: '2026' },
    status: {
      type: String,
      enum: ['upcoming', 'live', 'completed', 'paused'],
      default: 'upcoming',
    },
    currentLotNumber: { type: Number, default: 0 },
    currentLotPlayerId: { type: Schema.Types.ObjectId, ref: 'Player' },
    totalLotsCount: { type: Number, default: 0 },
    scheduledStartTime: { type: Date },
    actualStartTime: { type: Date },
    endTime: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const AuctionSession = mongoose.model<IAuctionSession>('AuctionSession', AuctionSessionSchema);
