import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  shortCode: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  totalBudget: number;
  remainingBudget: number;
  maxSquadSize: number;
  playersCount: number;
  coach?: string;
  owner?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    shortCode: { type: String, required: true, uppercase: true, trim: true, maxlength: 4 },
    logoUrl: { type: String },
    primaryColor: { type: String, default: '#10b981' },
    secondaryColor: { type: String, default: '#0f172a' },
    totalBudget: { type: Number, required: true, default: 1000000 },
    remainingBudget: { type: Number, required: true, default: 1000000 },
    maxSquadSize: { type: Number, default: 18 },
    playersCount: { type: Number, default: 0 },
    coach: { type: String },
    owner: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Team = mongoose.model<ITeam>('Team', TeamSchema);
