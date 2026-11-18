import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Admin, IAdmin } from '../models/Admin';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export interface AdminDto {
  id: string;
  name: string;
  email: string;
  role: string;
}

// In-memory fallback admin store when MongoDB is disconnected
let inMemoryAdmins: Array<{
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'superadmin' | 'admin' | 'scout';
}> = [];

// Initialize default in-memory superadmin
const initDefaultInMemoryAdmin = async () => {
  if (inMemoryAdmins.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(config.adminPassword, salt);
    inMemoryAdmins.push({
      id: 'admin-root-001',
      name: config.adminName,
      email: config.adminEmail.toLowerCase(),
      passwordHash: hash,
      role: 'superadmin',
    });
  }
};

initDefaultInMemoryAdmin();

export const adminRepository = {
  async findByEmail(email: string) {
    const normalized = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      try {
        let admin = await Admin.findOne({ email: normalized });
        if (!admin && normalized === config.adminEmail.toLowerCase()) {
          admin = await Admin.create({
            name: config.adminName,
            email: normalized,
            password: config.adminPassword,
            role: 'superadmin',
          });
          logger.info(`👑 Initial administrator seeded in MongoDB: ${admin.email}`);
        }
        return admin;
      } catch (err: any) {
        logger.warn('MongoDB Admin lookup failed, falling back to memory store:', err?.message);
      }
    }

    // Memory fallback
    await initDefaultInMemoryAdmin();
    const memAdmin = inMemoryAdmins.find((a) => a.email === normalized);
    if (!memAdmin) return null;

    return {
      _id: memAdmin.id,
      id: memAdmin.id,
      name: memAdmin.name,
      email: memAdmin.email,
      role: memAdmin.role,
      async comparePassword(candidate: string) {
        return bcrypt.compare(candidate, memAdmin.passwordHash);
      },
    };
  },

  async findById(id: string) {
    if (mongoose.connection.readyState === 1) {
      try {
        return await Admin.findById(id).select('-password');
      } catch (err: any) {
        logger.warn('MongoDB Admin lookup by ID failed, falling back to memory store:', err?.message);
      }
    }

    await initDefaultInMemoryAdmin();
    const memAdmin = inMemoryAdmins.find((a) => a.id === id);
    if (!memAdmin) return null;
    return {
      _id: memAdmin.id,
      id: memAdmin.id,
      name: memAdmin.name,
      email: memAdmin.email,
      role: memAdmin.role,
    };
  },
};
