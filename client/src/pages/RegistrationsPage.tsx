import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SearchBar } from '../components/common/SearchBar';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import {
  playerService,
  PlayerApplication,
  PlayingPosition,
  PlayerStatus,
} from '../services/playerService';
import { authService, AdminUser } from '../services/authService';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Compass,
  Crosshair,
  ShieldAlert,
  RotateCw,
  Eye,
  User,
  Calendar,
  Phone,
  Mail,
  Camera,
  Check,
  Ban,
  LogIn,
} from 'lucide-react';

// Fallback seed applications if backend has 0 records yet
const demoApplications: PlayerApplication[] = [
  {
    _id: 'demo-101',
    registrationId: 'PLR-2026-849102',
    fullName: 'Liam Sterling',
    dateOfBirth: '2004-03-15T00:00:00.000Z',
    phoneNumber: '+44 7911 123456',
    email: 'liam.sterling@footballmail.com',
    playingPosition: 'Forward',
    photoUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: 'demo-102',
    registrationId: 'PLR-2026-619284',
    fullName: 'Marcus Vance',
    dateOfBirth: '2001-08-22T00:00:00.000Z',
    phoneNumber: '+1 415 555 0192',
    email: 'm.vance@sportspro.net',
    playingPosition: 'Midfielder',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    _id: 'demo-103',
    registrationId: 'PLR-2026-302914',
    fullName: 'Diego Navas',
    dateOfBirth: '1999-11-10T00:00:00.000Z',
    phoneNumber: '+506 8888 4321',
    email: 'd.navas@costaricafutbol.cr',
    playingPosition: 'Goalkeeper',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    _id: 'demo-104',
    registrationId: 'PLR-2026-448291',
    fullName: 'Babatunde Adeleke',
    dateOfBirth: '2003-05-18T00:00:00.000Z',
    phoneNumber: '+234 802 345 6789',
    email: 'b.adeleke@lagosfc.ng',
    playingPosition: 'Defender',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    status: 'APPROVED',
    reviewedBy: 'Commissioner Sterling',
    reviewedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    _id: 'demo-105',
    registrationId: 'PLR-2026-992015',
    fullName: 'Kenzo Shibuya',
    dateOfBirth: '2002-09-04T00:00:00.000Z',
    phoneNumber: '+81 90 1234 5678',
    email: 'kenzo.s@tokyofootball.jp',
    playingPosition: 'Midfielder',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    status: 'APPROVED',
    reviewedBy: 'Commissioner Sterling',
    reviewedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
];

const positionIcons: Record<PlayingPosition, React.ReactNode> = {
  Goalkeeper: <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />,
  Defender: <Shield className="w-3.5 h-3.5 text-blue-400" />,
  Midfielder: <Compass className="w-3.5 h-3.5 text-orange-400" />,
  Forward: <Crosshair className="w-3.5 h-3.5 text-rose-400" />,
};

export const RegistrationsPage: React.FC = () => {
  // State
  const [players, setPlayers] = useState<PlayerApplication[]>(demoApplications);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');

  // Modals & Selection
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerApplication | null>(null);
  const [rejectingPlayer, setRejectingPlayer] = useState<PlayerApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(authService.isAuthenticated());
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(authService.getCurrentAdmin());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('admin@football.league');
  const [loginPassword, setLoginPassword] = useState('Admin@123456');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch from backend API
  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await playerService.getPlayers({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        position: positionFilter === 'ALL' ? undefined : positionFilter,
        search: searchTerm.trim() || undefined,
      });

      if (res && res.players) {
        if (res.players.length > 0) {
          setPlayers(res.players);
        } else if (!searchTerm && statusFilter === 'PENDING' && positionFilter === 'ALL') {
          // If fresh database has no registrations yet, keep demo candidates visible for testing
          setPlayers(demoApplications);
        } else {
          setPlayers([]);
        }
      }
    } catch {
      // If unauthorized or network error, fallback to local state gracefully
      if (!authService.isAuthenticated()) {
        setPlayers((prev) => prev);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, positionFilter, searchTerm]);

  // Initial load
  useEffect(() => {
    // Attempt auto-login with default admin if not logged in yet
    if (!authService.isAuthenticated()) {
      authService
        .login('admin@football.league', 'Admin@123456')
        .then((res) => {
          setIsAdminLoggedIn(true);
          setCurrentAdmin(res.admin);
          fetchPlayers();
        })
        .catch(() => {
          fetchPlayers();
        });
    } else {
      fetchPlayers();
    }
  }, [fetchPlayers]);

  // Login handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoggingIn(true);
      setLoginError(null);
      const res = await authService.login(loginEmail, loginPassword);
      setIsAdminLoggedIn(true);
      setCurrentAdmin(res.admin);
      setShowLoginModal(false);
      showToast(`Welcome back, ${res.admin.name}!`);
      fetchPlayers();
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrator credentials');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Approve Player Action
  const handleApprove = async (player: PlayerApplication) => {
    try {
      // Optimistic update
      setPlayers((prev) =>
        prev.map((p) =>
          p._id === player._id
            ? { ...p, status: 'APPROVED' as PlayerStatus, reviewedBy: currentAdmin?.name || 'Administrator', reviewedAt: new Date().toISOString() }
            : p
        )
      );

      if (selectedPlayer && selectedPlayer._id === player._id) {
        setSelectedPlayer((prev) =>
          prev
            ? { ...prev, status: 'APPROVED' as PlayerStatus, reviewedBy: currentAdmin?.name || 'Administrator', reviewedAt: new Date().toISOString() }
            : null
        );
      }

      showToast(`Application for "${player.fullName}" APPROVED! Player added to Live Auction Pool.`);

      // Send to backend API
      if (isAdminLoggedIn) {
        await playerService.approvePlayer(player._id);
      }
    } catch (err: any) {
      showToast(`Approval error: ${err.message}`);
    }
  };

  // Reject Player Action
  const handleReject = async () => {
    if (!rejectingPlayer) return;
    const player = rejectingPlayer;
    const reason = rejectionReason.trim() || 'Did not meet league criteria';

    try {
      setPlayers((prev) =>
        prev.map((p) =>
          p._id === player._id
            ? {
                ...p,
                status: 'REJECTED' as PlayerStatus,
                rejectionReason: reason,
                reviewedBy: currentAdmin?.name || 'Administrator',
                reviewedAt: new Date().toISOString(),
              }
            : p
        )
      );

      if (selectedPlayer && selectedPlayer._id === player._id) {
        setSelectedPlayer((prev) =>
          prev
            ? {
                ...prev,
                status: 'REJECTED' as PlayerStatus,
                rejectionReason: reason,
                reviewedBy: currentAdmin?.name || 'Administrator',
                reviewedAt: new Date().toISOString(),
              }
            : null
        );
      }

      showToast(`Application for "${player.fullName}" REJECTED.`);
      setRejectingPlayer(null);
      setRejectionReason('');

      // Send to backend API
      if (isAdminLoggedIn) {
        await playerService.rejectPlayer(player._id, reason);
      }
    } catch (err: any) {
      showToast(`Rejection error: ${err.message}`);
    }
  };

  // Age helper
  const calculateAge = (dobString: string): number => {
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return 22;
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  // Filter local view
  const filteredPlayers = players.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesPosition = positionFilter === 'ALL' || p.playingPosition === positionFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchLower) ||
      (p.email ? p.email.toLowerCase().includes(searchLower) : false) ||
      p.registrationId.toLowerCase().includes(searchLower);
    return matchesStatus && matchesPosition && matchesSearch;
  });

  const pendingCount = players.filter((p) => p.status === 'PENDING').length;
  const approvedCount = players.filter((p) => p.status === 'APPROVED').length;
  const rejectedCount = players.filter((p) => p.status === 'REJECTED').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-pitch-card border border-orange-500/50 shadow-pitch-glow text-xs text-white flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Player Applications & Verification
            </h2>
            <Badge variant="orange" size="sm">
              Phase 2 Connected
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Audit public player submissions with all six submitted fields. Only APPROVED players
            can enter the auction draft.
          </p>
        </div>

        {/* Admin Authentication Status & Refresh */}
        <div className="flex items-center gap-2">
          {isAdminLoggedIn ? (
            <span className="text-xs text-slate-300 bg-pitch-darker px-3 py-1.5 rounded-xl border border-pitch-border flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="font-semibold">{currentAdmin?.name || 'Administrator'}</span>
            </span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLoginModal(true)}
              icon={LogIn}
            >
              Admin Sign In
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={fetchPlayers}
            isLoading={loading}
            icon={RotateCw}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Metric Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter('PENDING')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'PENDING'
              ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
              : 'bg-pitch-card border-pitch-border hover:border-slate-600'
          }`}
        >
          <div className="flex justify-between items-center text-slate-400 text-xs mb-1">
            <span className="font-bold">Pending Review</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{pendingCount}</div>
          <span className="text-[10px] text-slate-400">Action Required</span>
        </div>

        <div
          onClick={() => setStatusFilter('APPROVED')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'APPROVED'
              ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm'
              : 'bg-pitch-card border-pitch-border hover:border-slate-600'
          }`}
        >
          <div className="flex justify-between items-center text-slate-400 text-xs mb-1">
            <span className="font-bold">Approved Players</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{approvedCount}</div>
          <span className="text-[10px] text-slate-400">Qualified for Auction</span>
        </div>

        <div
          onClick={() => setStatusFilter('REJECTED')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'REJECTED'
              ? 'bg-rose-500/10 border-rose-500/50 shadow-sm'
              : 'bg-pitch-card border-pitch-border hover:border-slate-600'
          }`}
        >
          <div className="flex justify-between items-center text-slate-400 text-xs mb-1">
            <span className="font-bold">Rejected</span>
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">{rejectedCount}</div>
          <span className="text-[10px] text-slate-400">Ineligible</span>
        </div>

        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'ALL'
              ? 'bg-purple-500/10 border-purple-500/50 shadow-sm'
              : 'bg-pitch-card border-pitch-border hover:border-slate-600'
          }`}
        >
          <div className="flex justify-between items-center text-slate-400 text-xs mb-1">
            <span className="font-bold">Total Applicants</span>
            <ClipboardCheck className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{players.length}</div>
          <span className="text-[10px] text-slate-400">All Submissions</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="sm" className="space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by player name, email, or registration ID..."
            className="flex-1"
          />

          {/* Position Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
            {['ALL', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'].map((pos) => (
              <button
                key={pos}
                onClick={() => setPositionFilter(pos)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  positionFilter === pos
                    ? 'bg-football-accent text-slate-950 font-bold shadow-pitch-glow'
                    : 'bg-pitch-darker text-slate-400 hover:text-white border border-pitch-border'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            {[
              { id: 'PENDING', label: 'Pending' },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'REJECTED', label: 'Rejected' },
              { id: 'ALL', label: 'All' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st.id
                    ? 'bg-pitch-card text-orange-400 border border-orange-500/40'
                    : 'bg-pitch-darker text-slate-400 hover:text-white border border-pitch-border'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Applications Table */}
      {filteredPlayers.length === 0 ? (
        <EmptyState
          title="No player applications found"
          description="Try modifying your keyword search or adjusting the position/status filters."
          icon={ClipboardCheck}
          actionText="Show All Applications"
          onAction={() => {
            setSearchTerm('');
            setStatusFilter('ALL');
            setPositionFilter('ALL');
          }}
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-pitch-border bg-pitch-darker text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Player & Photo</th>
                  <th className="py-3.5 px-4">Registration ID</th>
                  <th className="py-3.5 px-4">Position</th>
                  <th className="py-3.5 px-4">Date of Birth (Age)</th>
                  <th className="py-3.5 px-4">Contact (Phone & Email)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pitch-border/50">
                {filteredPlayers.map((player) => (
                  <tr
                    key={player._id || player.registrationId}
                    className="hover:bg-pitch-cardHover transition-colors cursor-pointer"
                    onClick={() => setSelectedPlayer(player)}
                  >
                    {/* 1. Full Name & 6. Photo */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-pitch-border shrink-0 bg-slate-900 shadow-sm">
                          <img
                            src={player.photoUrl}
                            alt={player.fullName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-extrabold text-white text-sm hover:text-orange-400 transition-colors">
                            {player.fullName}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Registered {new Date(player.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Registration ID */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-orange-400 bg-pitch-darker px-2 py-1 rounded-lg border border-pitch-border">
                        {player.registrationId}
                      </span>
                    </td>

                    {/* 5. Playing Position */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-200">
                        {positionIcons[player.playingPosition]}
                        <span>{player.playingPosition}</span>
                      </div>
                    </td>

                    {/* 2. Date of Birth & Age */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-mono">
                        {new Date(player.dateOfBirth).toLocaleDateString()}
                      </div>
                      <span className="text-[10px] text-orange-400 font-bold">
                        Age: {calculateAge(player.dateOfBirth)}
                      </span>
                    </td>

                    {/* 3. Phone & 4. Email */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">{player.email || <span className="text-slate-500 italic">No email</span>}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{player.phoneNumber}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {player.status === 'APPROVED' && (
                        <Badge variant="green" size="sm" dot>
                          Approved
                        </Badge>
                      )}
                      {player.status === 'PENDING' && (
                        <Badge variant="yellow" size="sm" dot>
                          Pending Review
                        </Badge>
                      )}
                      {player.status === 'REJECTED' && (
                        <Badge variant="red" size="sm">
                          Rejected
                        </Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div
                        className="flex items-center justify-end gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {player.status !== 'APPROVED' && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-xs py-1 px-2.5"
                            onClick={() => handleApprove(player)}
                            icon={Check}
                          >
                            Approve
                          </Button>
                        )}

                        {player.status !== 'REJECTED' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs py-1 px-2 text-rose-400 hover:text-rose-300"
                            onClick={() => setRejectingPlayer(player)}
                            icon={Ban}
                          >
                            Reject
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs py-1 px-2"
                          onClick={() => setSelectedPlayer(player)}
                          icon={Eye}
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Player Detail Modal (Displays all 6 submitted fields) */}
      <Modal
        isOpen={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        title={selectedPlayer?.fullName || 'Player Application'}
        subtitle={`Ref: ${selectedPlayer?.registrationId} • Submitted: ${selectedPlayer ? new Date(selectedPlayer.createdAt).toLocaleString() : ''}`}
        maxWidth="lg"
        footer={
          <div className="flex items-center gap-2">
            {selectedPlayer && selectedPlayer.status !== 'APPROVED' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (selectedPlayer) handleApprove(selectedPlayer);
                }}
                icon={Check}
              >
                Approve for Auction Pool
              </Button>
            )}
            {selectedPlayer && selectedPlayer.status !== 'REJECTED' && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (selectedPlayer) setRejectingPlayer(selectedPlayer);
                }}
                icon={Ban}
              >
                Reject Application
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setSelectedPlayer(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedPlayer && (
          <div className="space-y-5 text-xs">
            {/* Header with Photo & Name */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-pitch-dark border border-pitch-border">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-500/50 shadow-pitch-glow shrink-0 bg-slate-900">
                <img
                  src={selectedPlayer.photoUrl}
                  alt={selectedPlayer.fullName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className="text-lg font-black text-white">
                    {selectedPlayer.fullName}
                  </span>
                  {selectedPlayer.status === 'APPROVED' && (
                    <Badge variant="green" size="sm" dot>Approved</Badge>
                  )}
                  {selectedPlayer.status === 'PENDING' && (
                    <Badge variant="yellow" size="sm" dot>Pending</Badge>
                  )}
                  {selectedPlayer.status === 'REJECTED' && (
                    <Badge variant="red" size="sm">Rejected</Badge>
                  )}
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-300">
                  <span className="font-mono font-bold text-orange-400">
                    {selectedPlayer.registrationId}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold">
                    {positionIcons[selectedPlayer.playingPosition]}
                    {selectedPlayer.playingPosition}
                  </span>
                </div>
              </div>
            </div>

            {/* All Six Submitted Fields Breakdown */}
            <div className="space-y-3">
              <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Six Submitted Registration Fields
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Full Name */}
                <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border space-y-1">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <User className="w-3.5 h-3.5 text-orange-400" />
                    1. Full Name
                  </span>
                  <span className="font-extrabold text-white text-sm block">
                    {selectedPlayer.fullName}
                  </span>
                </div>

                {/* 2. Date of Birth */}
                <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border space-y-1">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-orange-400" />
                    2. Date of Birth (Age)
                  </span>
                  <span className="font-bold text-white text-sm block">
                    {new Date(selectedPlayer.dateOfBirth).toLocaleDateString()} (Age {calculateAge(selectedPlayer.dateOfBirth)})
                  </span>
                </div>

                {/* 3. Phone Number */}
                <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border space-y-1">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-orange-400" />
                    3. Phone Number
                  </span>
                  <span className="font-mono font-bold text-white text-sm block">
                    {selectedPlayer.phoneNumber}
                  </span>
                </div>

                {/* 4. Email */}
                <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border space-y-1">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-orange-400" />
                    4. Email Address (Optional)
                  </span>
                  <span className="font-medium text-white text-sm block truncate">
                    {selectedPlayer.email || <span className="text-slate-500 italic">Not provided</span>}
                  </span>
                </div>

                {/* 5. Playing Position */}
                <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border space-y-1">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Compass className="w-3.5 h-3.5 text-orange-400" />
                    5. Playing Position
                  </span>
                  <span className="font-bold text-orange-400 text-sm block">
                    {selectedPlayer.playingPosition}
                  </span>
                </div>

                {/* 6. Profile Photo URL */}
                <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border space-y-1">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Camera className="w-3.5 h-3.5 text-orange-400" />
                    6. Cloudinary / Image URL
                  </span>
                  <a
                    href={selectedPlayer.photoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-orange-400 hover:underline block truncate"
                  >
                    {selectedPlayer.photoUrl}
                  </a>
                </div>
              </div>
            </div>

            {/* Audit & Decision Log */}
            <div className="p-3.5 rounded-xl bg-pitch-darker border border-pitch-border text-slate-300 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Application Status:</span>
                <span className="font-bold uppercase text-white">{selectedPlayer.status}</span>
              </div>
              {selectedPlayer.reviewedBy && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Reviewed By:</span>
                  <span className="font-bold text-orange-400">{selectedPlayer.reviewedBy}</span>
                </div>
              )}
              {selectedPlayer.reviewedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Decision Timestamp:</span>
                  <span className="font-mono text-slate-300">
                    {new Date(selectedPlayer.reviewedAt).toLocaleString()}
                  </span>
                </div>
              )}
              {selectedPlayer.rejectionReason && (
                <div className="pt-2 border-t border-pitch-border text-rose-300">
                  <span className="font-bold block text-rose-400">Rejection Reason:</span>
                  <p className="mt-0.5 italic">{selectedPlayer.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Reason Confirmation Modal */}
      <Modal
        isOpen={!!rejectingPlayer}
        onClose={() => setRejectingPlayer(null)}
        title="Reject Player Application"
        subtitle={`Applicant: ${rejectingPlayer?.fullName} (${rejectingPlayer?.registrationId})`}
        maxWidth="md"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setRejectingPlayer(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleReject}>
              Confirm Rejection
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-300">
            Please enter a reason for rejecting this player application. This will be visible to the player when they check their status.
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Photo resolution is too low, or candidate does not meet age requirements."
            rows={3}
            className="w-full bg-pitch-dark border border-pitch-border rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 text-xs"
          />
        </div>
      </Modal>

      {/* Admin Sign In Modal */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Admin Sign In"
        subtitle="Authenticate to manage registrations & approve players"
        maxWidth="sm"
      >
        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          {loginError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300">
              {loginError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Admin Email</label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full bg-pitch-darker border border-pitch-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Admin Password</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full bg-pitch-darker border border-pitch-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 text-xs"
            />
          </div>

          <p className="text-[11px] text-slate-400">
            Default credentials: <code className="text-orange-400">admin@football.league</code> /{' '}
            <code className="text-orange-400">Admin@123456</code>
          </p>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoggingIn}
          >
            Sign In As Administrator
          </Button>
        </form>
      </Modal>
    </div>
  );
};
