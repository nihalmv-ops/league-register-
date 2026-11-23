import mongoose, { Schema, Document } from 'mongoose';

export interface IBid extends Document {
  auctionId: mongoose.Types.ObjectId | string;
  playerId: mongoose.Types.ObjectId | string;
  teamId: mongoose.Types.ObjectId | string;
  teamName: string;
  managerId: mongoose.Types.ObjectId | string;
  managerName: string;
  amount: number;
  isHighest: boolean;
  createdAt: Date;
}

const BidSchema = new Schema<IBid>(
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
      required: true,
      index: true,
    },
    teamName: {
      type: String,
      required: true,
    },
    managerId: {
      type: Schema.Types.Mixed,
      ref: 'Manager',
      required: true,
    },
    managerName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    isHighest: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

BidSchema.index({ auctionId: 1, playerId: 1, amount: -1 });

export const Bid = mongoose.model<IBid>('Bid', BidSchema);
export default Bid;
