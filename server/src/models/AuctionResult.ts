import mongoose, { Schema, Document } from 'mongoose';

export type AuctionResultStatus = 'SOLD' | 'UNSOLD';

export interface IAuctionResult extends Document {
  auctionId: mongoose.Types.ObjectId | string;
  playerId: mongoose.Types.ObjectId | string;
  teamId?: mongoose.Types.ObjectId | string | null;
  teamName?: string | null;
  finalPrice: number;
  resultStatus: AuctionResultStatus;
  bidsCount: number;
  createdAt: Date;
}

const AuctionResultSchema = new Schema<IAuctionResult>(
  {
    auctionId: {
      type: Schema.Types.Mixed,
      ref: 'Auction',
      required: true,
      index: true,
    },
    playerId: {
      type: Schema.Types.Mixed,
      ref: 'Player',
      required: true,
      index: true,
    },
    teamId: {
      type: Schema.Types.Mixed,
      ref: 'Team',
      default: null,
    },
    teamName: {
      type: String,
      default: null,
    },
    finalPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    resultStatus: {
      type: String,
      enum: ['SOLD', 'UNSOLD'],
      required: true,
      index: true,
    },
    bidsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AuctionResultSchema.index({ auctionId: 1, resultStatus: 1 });

export const AuctionResult = mongoose.model<IAuctionResult>('AuctionResult', AuctionResultSchema);
export default AuctionResult;
