import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IManager extends Document {
  name: string;
  email: string;
  password: string;
  teamId: mongoose.Types.ObjectId | string;
  teamName: string;
  role: 'manager';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const ManagerSchema = new Schema<IManager>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    teamId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    teamName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['manager'],
      default: 'manager',
    },
  },
  {
    timestamps: true,
  }
);

ManagerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

ManagerSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const Manager = mongoose.model<IManager>('Manager', ManagerSchema);
