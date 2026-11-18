import mongoose, { Schema, Document } from 'mongoose';

export interface IFixture extends Document {
  matchNumber: number;
  homeTeam: mongoose.Types.ObjectId;
  awayTeam: mongoose.Types.ObjectId;
  matchDate: Date;
  venue: string;
  status: 'scheduled' | 'live' | 'completed' | 'postponed';
  score?: {
    home: number;
    away: number;
  };
  referee?: string;
  round?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FixtureSchema = new Schema<IFixture>(
  {
    matchNumber: { type: Number, required: true },
    homeTeam: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    awayTeam: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    matchDate: { type: Date, required: true },
    venue: { type: String, required: true, default: 'Main Stadium' },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'postponed'],
      default: 'scheduled',
    },
    score: {
      home: { type: Number, default: 0 },
      away: { type: Number, default: 0 },
    },
    referee: { type: String },
    round: { type: String, default: 'League Stage' },
  },
  {
    timestamps: true,
  }
);

export const Fixture = mongoose.model<IFixture>('Fixture', FixtureSchema);
