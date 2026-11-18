import mongoose, { Schema, Document } from 'mongoose';
import { PlayerPosition, RegistrationStatus } from '../types';

export interface IRegistration extends Document {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  preferredPosition: PlayerPosition;
  secondaryPosition?: PlayerPosition;
  currentClub?: string;
  experienceYears: number;
  idProofUrl?: string;
  status: RegistrationStatus;
  rejectionReason?: string;
  reviewedAt?: Date;
  reviewedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    preferredPosition: {
      type: String,
      enum: ['GK', 'DEF', 'MID', 'FWD'],
      required: true,
    },
    secondaryPosition: {
      type: String,
      enum: ['GK', 'DEF', 'MID', 'FWD'],
    },
    currentClub: { type: String },
    experienceYears: { type: Number, default: 0 },
    idProofUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String },
    reviewedAt: { type: Date },
    reviewedBy: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Registration = mongoose.model<IRegistration>('Registration', RegistrationSchema);
