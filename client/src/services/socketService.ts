import { io, Socket } from 'socket.io-client';
import { AuctionStatePayload, BidRecord } from '../types/auction';

class SocketService {
  private socket: Socket | null = null;
  private currentAuctionId: string | null = null;

  public connect(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (window.location.port === '5173' ? 'http://localhost:5000' : window.location.origin);

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('⚡ Socket.IO connected with id:', this.socket?.id);
      if (this.currentAuctionId) {
        this.joinAuction(this.currentAuctionId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    return this.socket;
  }

  public getSocket(): Socket | null {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  public joinAuction(auctionId: string = 'auc-2026') {
    this.currentAuctionId = auctionId;
    const socket = this.getSocket();
    if (socket) {
      socket.emit('join:auction', { auctionId });
    }
  }

  public leaveAuction(auctionId: string = 'auc-2026') {
    const socket = this.getSocket();
    if (socket) {
      socket.emit('leave:auction', { auctionId });
    }
    if (this.currentAuctionId === auctionId) {
      this.currentAuctionId = null;
    }
  }

  public placeBid(auctionId: string, amount: number, token: string) {
    const socket = this.getSocket();
    if (socket) {
      socket.emit('bid:place', { auctionId, amount, token });
    }
  }

  public onAuctionState(callback: (state: AuctionStatePayload) => void): () => void {
    const socket = this.getSocket();
    if (!socket) return () => {};
    socket.on('auction:state', callback);
    return () => socket.off('auction:state', callback);
  }

  public onBidPlaced(
    callback: (data: {
      auctionId: string;
      bid: BidRecord;
      currentHighestBid: number;
      leadingTeam: { id: string; name: string; logoUrl: string };
      remainingSeconds: number;
    }) => void
  ): () => void {
    const socket = this.getSocket();
    if (!socket) return () => {};
    socket.on('bid:placed', callback);
    return () => socket.off('bid:placed', callback);
  }

  public onBidAccepted(callback: (data: { message: string; bid: BidRecord }) => void): () => void {
    const socket = this.getSocket();
    if (!socket) return () => {};
    socket.on('bid:accepted', callback);
    return () => socket.off('bid:accepted', callback);
  }

  public onBidRejected(callback: (data: { message: string }) => void): () => void {
    const socket = this.getSocket();
    if (!socket) return () => {};
    socket.on('bid:rejected', callback);
    return () => socket.off('bid:rejected', callback);
  }

  public onTimerTick(
    callback: (data: { auctionId: string; remainingSeconds: number; endsAt: string }) => void
  ): () => void {
    const socket = this.getSocket();
    if (!socket) return () => {};
    socket.on('timer:tick', callback);
    return () => socket.off('timer:tick', callback);
  }

  public onTimerEnded(callback: (data: { auctionId: string; message: string }) => void): () => void {
    const socket = this.getSocket();
    if (!socket) return () => {};
    socket.on('timer:ended', callback);
    return () => socket.off('timer:ended', callback);
  }

  public onPlayerSold(callback: (data: any) => void): () => void {
    const socket = this.getSocket();
    if (!socket) return () => {};
    socket.on('player:sold', callback);
    return () => socket.off('player:sold', callback);
  }

  public onPlayerUnsold(callback: (data: any) => void): () => void {
    const socket = this.getSocket();
    if (!socket) return () => {};
    socket.on('player:unsold', callback);
    return () => socket.off('player:unsold', callback);
  }

  public onPlayerNext(callback: (data: any) => void): () => void {
    const socket = this.getSocket();
    if (!socket) return () => {};
    socket.on('player:next', callback);
    return () => socket.off('player:next', callback);
  }

  public onAuctionPaused(callback: (data: { auctionId: string }) => void): () => void {
    const socket = this.getSocket();
    if (!socket) return () => {};
    socket.on('auction:paused', callback);
    return () => socket.off('auction:paused', callback);
  }

  public onAuctionResumed(callback: (data: { auctionId: string }) => void): () => void {
    const socket = this.getSocket();
    if (!socket) return () => {};
    socket.on('auction:resumed', callback);
    return () => socket.off('auction:resumed', callback);
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
