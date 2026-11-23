import { Router } from 'express';
import { AuctionController } from '../controllers/auction.controller';
import { authenticateAdmin, authenticateManager } from '../middleware/auth';

const router = Router();

// ================= PUBLIC PROJECTOR & GENERAL DISPLAY =================
// Public live display screen (strictly masks sensitive contact details)
router.get('/auctions/:id/live', AuctionController.getPublicLiveDisplay);
router.get('/auctions/active', AuctionController.getActiveAuction);

// ================= MANAGER AUTH & ACTIONS =================
router.post('/auth/manager/login', AuctionController.managerLogin);
router.get('/auth/managers', AuctionController.getManagersList);
router.get('/auth/manager/me', authenticateManager, AuctionController.getManagerProfile);

router.post('/manager/auctions/:id/bid', authenticateManager, AuctionController.placeManagerBid);
router.get('/manager/auctions/:id', authenticateManager, AuctionController.getManagerAuctionView);
router.get('/manager/team', authenticateManager, AuctionController.getManagerProfile);

// ================= ADMIN AUCTION CONTROLS =================
router.get('/admin/auctions', authenticateAdmin, AuctionController.getAuctions);
router.post('/admin/auctions', authenticateAdmin, AuctionController.createAuction);
router.get('/admin/auctions/active', authenticateAdmin, AuctionController.getActiveAuction);
router.get('/admin/auctions/:id', authenticateAdmin, AuctionController.getAuctionById);
router.get('/admin/auctions/:id/history', authenticateAdmin, AuctionController.getAuctionHistory);
router.get('/admin/auctions/:id/eligible-players', authenticateAdmin, AuctionController.getEligiblePlayers);

router.patch('/admin/auctions/:id/start', authenticateAdmin, AuctionController.startAuction);
router.patch('/admin/auctions/:id/pause', authenticateAdmin, AuctionController.pauseAuction);
router.patch('/admin/auctions/:id/resume', authenticateAdmin, AuctionController.resumeAuction);
router.patch('/admin/auctions/:id/next-player', authenticateAdmin, AuctionController.selectNextPlayer);
router.patch('/admin/auctions/:id/start-bidding', authenticateAdmin, AuctionController.startBidding);
router.patch('/admin/auctions/:id/timer', authenticateAdmin, AuctionController.resetTimer);
router.patch('/admin/auctions/:id/sold', authenticateAdmin, AuctionController.declareSold);
router.patch('/admin/auctions/:id/unsold', authenticateAdmin, AuctionController.declareUnsold);

export default router;
