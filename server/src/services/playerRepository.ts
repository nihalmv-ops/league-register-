import mongoose from 'mongoose';
import { Player, IPlayer, PlayingPosition, PlayerStatus } from '../models/Player';
import { logger } from '../utils/logger';

export interface PlayerRecord {
  _id: string;
  id?: string;
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
  auctionStatus?: string;
  basePrice?: number;
  overallRating?: number;
  tier?: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory collection fallback
const inMemoryPlayers: PlayerRecord[] = [
  {
    _id: 'mem-plr-001',
    registrationId: 'PLR-2026-894102',
    fullName: 'Marcus Sterling',
    dateOfBirth: new Date('2002-04-15'),
    phoneNumber: '+1 555 492 1042',
    email: 'marcus.sterling@premierfootball.org',
    playingPosition: 'Forward',
    photoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    status: 'PENDING',
    auctionStatus: 'upcoming',
    basePrice: 50000,
    overallRating: 84,
    tier: 'Gold',
    createdAt: new Date(Date.now() - 3600000 * 2),
    updatedAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    _id: 'mem-plr-002',
    registrationId: 'PLR-2026-673190',
    fullName: 'Mateo Silva',
    dateOfBirth: new Date('1999-11-20'),
    phoneNumber: '+1 555 319 8401',
    email: 'mateo.silva@premierfootball.org',
    playingPosition: 'Midfielder',
    photoUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80',
    status: 'PENDING',
    auctionStatus: 'upcoming',
    basePrice: 50000,
    overallRating: 88,
    tier: 'Gold',
    createdAt: new Date(Date.now() - 3600000 * 5),
    updatedAt: new Date(Date.now() - 3600000 * 5),
  },
  {
    _id: 'mem-plr-003',
    registrationId: 'PLR-2026-118492',
    fullName: 'Lucas Hernandez',
    dateOfBirth: new Date('2001-08-04'),
    phoneNumber: '+1 555 772 9011',
    email: 'lucas.hernandez@premierfootball.org',
    playingPosition: 'Defender',
    photoUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80',
    status: 'APPROVED',
    reviewedAt: new Date(Date.now() - 3600000 * 12),
    reviewedBy: 'League Administrator',
    auctionStatus: 'upcoming',
    basePrice: 65000,
    overallRating: 85,
    tier: 'Gold',
    createdAt: new Date(Date.now() - 3600000 * 24),
    updatedAt: new Date(Date.now() - 3600000 * 12),
  },
  {
    _id: 'mem-plr-004',
    registrationId: 'PLR-2026-340918',
    fullName: 'David Alistair',
    dateOfBirth: new Date('1998-03-12'),
    phoneNumber: '+1 555 640 2219',
    email: 'david.alistair@premierfootball.org',
    playingPosition: 'Goalkeeper',
    photoUrl: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=600&q=80',
    status: 'APPROVED',
    reviewedAt: new Date(Date.now() - 3600000 * 18),
    reviewedBy: 'League Administrator',
    auctionStatus: 'upcoming',
    basePrice: 75000,
    overallRating: 89,
    tier: 'Platinum',
    createdAt: new Date(Date.now() - 3600000 * 30),
    updatedAt: new Date(Date.now() - 3600000 * 18),
  },
];

const isDbConnected = (): boolean => mongoose.connection.readyState === 1;

export const playerRepository = {
  async findByEmailOrPhone(email: string, phone: string) {
    const normEmail = email.toLowerCase().trim();
    const normPhone = phone.replace(/[\s-]/g, '').trim();

    if (isDbConnected()) {
      try {
        return await Player.findOne({
          $or: [{ email: normEmail }, { phoneNumber: normPhone }],
        });
      } catch (err: any) {
        logger.warn('Mongoose query failed, using memory fallback:', err?.message);
      }
    }

    return (
      inMemoryPlayers.find(
        (p) =>
          p.email.toLowerCase().trim() === normEmail ||
          p.phoneNumber.replace(/[\s-]/g, '').trim() === normPhone
      ) || null
    );
  },

  async findByIdentifier(identifier: string) {
    const trimmed = identifier.trim();
    const isEmail = trimmed.includes('@');

    if (isDbConnected()) {
      try {
        const query = isEmail
          ? { email: trimmed.toLowerCase() }
          : { registrationId: trimmed.toUpperCase() };
        return await Player.findOne(query);
      } catch (err: any) {
        logger.warn('Mongoose identifier lookup failed, using memory fallback:', err?.message);
      }
    }

    return (
      inMemoryPlayers.find((p) =>
        isEmail
          ? p.email.toLowerCase() === trimmed.toLowerCase()
          : p.registrationId.toUpperCase() === trimmed.toUpperCase()
      ) || null
    );
  },

  async findById(id: string) {
    if (isDbConnected()) {
      try {
        return await Player.findById(id);
      } catch (err: any) {
        logger.warn('Mongoose findById failed, using memory fallback:', err?.message);
      }
    }

    return inMemoryPlayers.find((p) => p._id === id || p.registrationId === id) || null;
  },

  async create(data: Omit<PlayerRecord, '_id' | 'createdAt' | 'updatedAt'>) {
    if (isDbConnected()) {
      try {
        return await Player.create(data);
      } catch (err: any) {
        logger.warn('Mongoose Player.create failed, storing in memory:', err?.message);
      }
    }

    const newRecord: PlayerRecord = {
      ...data,
      _id: `mem-plr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryPlayers.unshift(newRecord);
    return newRecord;
  },

  async isRegistrationIdTaken(regId: string): Promise<boolean> {
    if (isDbConnected()) {
      try {
        const found = await Player.findOne({ registrationId: regId }).lean();
        return Boolean(found);
      } catch {
        // fallback
      }
    }
    return inMemoryPlayers.some((p) => p.registrationId === regId);
  },

  async findAll(params: {
    status?: string;
    position?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: string;
  }) {
    const {
      status,
      position,
      search,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      order = 'desc',
    } = params;

    if (isDbConnected()) {
      try {
        const filterQuery: any = {};
        if (status && status !== 'ALL') filterQuery.status = status.toUpperCase();
        if (position && position !== 'ALL') filterQuery.playingPosition = position;
        if (search && search.trim() !== '') {
          const s = search.trim();
          filterQuery.$or = [
            { fullName: { $regex: s, $options: 'i' } },
            { email: { $regex: s, $options: 'i' } },
            { registrationId: { $regex: s, $options: 'i' } },
            { phoneNumber: { $regex: s, $options: 'i' } },
          ];
        }

        const skip = (page - 1) * limit;
        const sortOption: any = {};
        sortOption[sortBy] = order === 'asc' ? 1 : -1;

        const [players, total, totalAll, pendingCount, approvedCount, rejectedCount] =
          await Promise.all([
            Player.find(filterQuery).sort(sortOption).skip(skip).limit(limit),
            Player.countDocuments(filterQuery),
            Player.countDocuments(),
            Player.countDocuments({ status: 'PENDING' }),
            Player.countDocuments({ status: 'APPROVED' }),
            Player.countDocuments({ status: 'REJECTED' }),
          ]);

        return {
          players,
          total,
          stats: {
            total: totalAll,
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount,
          },
        };
      } catch (err: any) {
        logger.warn('Mongoose findAll failed, using memory fallback:', err?.message);
      }
    }

    // Memory query implementation
    let filtered = [...inMemoryPlayers];

    if (status && status !== 'ALL') {
      filtered = filtered.filter((p) => p.status === status.toUpperCase());
    }

    if (position && position !== 'ALL') {
      filtered = filtered.filter((p) => p.playingPosition === position);
    }

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.registrationId.toLowerCase().includes(q) ||
          p.phoneNumber.includes(q)
      );
    }

    filtered.sort((a: any, b: any) => {
      const valA = a[sortBy] instanceof Date ? a[sortBy].getTime() : a[sortBy];
      const valB = b[sortBy] instanceof Date ? b[sortBy].getTime() : b[sortBy];
      if (order === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    const total = filtered.length;
    const start = (page - 1) * limit;
    const players = filtered.slice(start, start + limit);

    const pendingCount = inMemoryPlayers.filter((p) => p.status === 'PENDING').length;
    const approvedCount = inMemoryPlayers.filter((p) => p.status === 'APPROVED').length;
    const rejectedCount = inMemoryPlayers.filter((p) => p.status === 'REJECTED').length;

    return {
      players,
      total,
      stats: {
        total: inMemoryPlayers.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    };
  },

  async updateStatus(
    id: string,
    update: {
      status: PlayerStatus;
      reviewedBy: string;
      rejectionReason?: string;
    }
  ) {
    if (isDbConnected()) {
      try {
        const player = await Player.findById(id);
        if (player) {
          player.status = update.status;
          player.reviewedAt = new Date();
          player.reviewedBy = update.reviewedBy;
          if (update.status === 'APPROVED') {
            player.auctionStatus = 'upcoming';
            player.rejectionReason = undefined;
          } else {
            player.auctionStatus = 'withdrawn';
            player.rejectionReason = update.rejectionReason || 'Application rejected';
          }
          await player.save();
          return player;
        }
      } catch (err: any) {
        logger.warn('Mongoose updateStatus failed, updating memory record:', err?.message);
      }
    }

    const idx = inMemoryPlayers.findIndex((p) => p._id === id || p.registrationId === id);
    if (idx === -1) return null;

    inMemoryPlayers[idx] = {
      ...inMemoryPlayers[idx],
      status: update.status,
      reviewedAt: new Date(),
      reviewedBy: update.reviewedBy,
      rejectionReason: update.status === 'REJECTED' ? update.rejectionReason : undefined,
      auctionStatus: update.status === 'APPROVED' ? 'upcoming' : 'withdrawn',
      updatedAt: new Date(),
    };

    return inMemoryPlayers[idx];
  },

  async getStats() {
    if (isDbConnected()) {
      try {
        const [total, pending, approved, rejected, byPos] = await Promise.all([
          Player.countDocuments(),
          Player.countDocuments({ status: 'PENDING' }),
          Player.countDocuments({ status: 'APPROVED' }),
          Player.countDocuments({ status: 'REJECTED' }),
          Player.aggregate([
            { $group: { _id: '$playingPosition', count: { $sum: 1 } } },
          ]),
        ]);

        const positionMap: Record<string, number> = {
          Goalkeeper: 0,
          Defender: 0,
          Midfielder: 0,
          Forward: 0,
        };
        byPos.forEach((item) => {
          if (item._id) positionMap[item._id] = item.count;
        });

        return {
          summary: { total, pending, approved, rejected },
          byPosition: positionMap,
        };
      } catch (err: any) {
        logger.warn('Mongoose stats failed, calculating from memory:', err?.message);
      }
    }

    const total = inMemoryPlayers.length;
    const pending = inMemoryPlayers.filter((p) => p.status === 'PENDING').length;
    const approved = inMemoryPlayers.filter((p) => p.status === 'APPROVED').length;
    const rejected = inMemoryPlayers.filter((p) => p.status === 'REJECTED').length;

    const byPosition: Record<string, number> = {
      Goalkeeper: 0,
      Defender: 0,
      Midfielder: 0,
      Forward: 0,
    };
    inMemoryPlayers.forEach((p) => {
      if (byPosition[p.playingPosition] !== undefined) {
        byPosition[p.playingPosition]++;
      }
    });

    return {
      summary: { total, pending, approved, rejected },
      byPosition,
    };
  },
};
