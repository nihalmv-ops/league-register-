import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SearchBar } from '../components/common/SearchBar';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Registration, RegistrationStatus } from '../types/football';
import {
  ClipboardCheck,
  CheckCircle2,
  ShieldCheck,
  HeartPulse,
} from 'lucide-react';

const initialRegistrations: Registration[] = [
  {
    id: 'reg-101',
    applicantName: 'Liam Sterling',
    email: 'liam.sterling@footballmail.com',
    phone: '+44 7911 123456',
    age: 22,
    position: 'FWD',
    experienceYears: 4,
    previousClubs: 'Leeds Youth Academy, Harrogate Town',
    status: 'pending',
    submittedAt: '2026-11-18 09:45',
    idProofVerified: true,
    medicalFitnessCleared: true,
    notes: 'Exceptional pace on the left flank; tested sprint speed 34.2 km/h',
  },
  {
    id: 'reg-102',
    applicantName: 'Marcus Vance',
    email: 'm.vance@sportspro.net',
    phone: '+1 415 555 0192',
    age: 25,
    position: 'MID',
    experienceYears: 6,
    previousClubs: 'Portland Timbers 2, Seattle Sounders Reserve',
    status: 'pending',
    submittedAt: '2026-11-18 08:30',
    idProofVerified: true,
    medicalFitnessCleared: true,
    notes: 'Box-to-box midfielder with high work rate and tactical awareness',
  },
  {
    id: 'reg-103',
    applicantName: 'Diego Navas',
    email: 'd.navas@costaricafutbol.cr',
    phone: '+506 8888 4321',
    age: 27,
    position: 'GK',
    experienceYears: 8,
    previousClubs: 'Deportivo Saprissa, Alajuelense',
    status: 'pending',
    submittedAt: '2026-11-17 19:15',
    idProofVerified: true,
    medicalFitnessCleared: false,
    notes: 'Awaiting updated shoulder scan report from medical board',
  },
  {
    id: 'reg-104',
    applicantName: 'Babatunde Adeleke',
    email: 'b.adeleke@lagosfc.ng',
    phone: '+234 802 345 6789',
    age: 23,
    position: 'DEF',
    experienceYears: 5,
    previousClubs: 'Enyimba FC, Shooting Stars SC',
    status: 'pending',
    submittedAt: '2026-11-17 14:10',
    idProofVerified: true,
    medicalFitnessCleared: true,
    notes: 'Tall central defender with strong aerial duel percentage (78%)',
  },
  {
    id: 'reg-105',
    applicantName: 'Kenzo Shibuya',
    email: 'kenzo.s@tokyofootball.jp',
    phone: '+81 90 1234 5678',
    age: 24,
    position: 'MID',
    experienceYears: 5,
    previousClubs: 'Gamba Osaka U23, Yokohama FC',
    status: 'approved',
    submittedAt: '2026-11-16 11:20',
    idProofVerified: true,
    medicalFitnessCleared: true,
    notes: 'Approved by commissioner into Silver tier bidding pool',
  },
  {
    id: 'reg-106',
    applicantName: 'Jean-Luc Dubois',
    email: 'jldubois@lyonfoot.fr',
    phone: '+33 6 12 34 56 78',
    age: 29,
    position: 'FWD',
    experienceYears: 7,
    previousClubs: 'AS Saint-Étienne B, Grenoble Foot',
    status: 'rejected',
    submittedAt: '2026-11-15 16:45',
    idProofVerified: false,
    medicalFitnessCleared: false,
    notes: 'Missing certified birth certificate and fitness clearance',
  },
];

export const RegistrationsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStatusChange = (id: string, newStatus: RegistrationStatus) => {
    setRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    if (selectedReg && selectedReg.id === id) {
      setSelectedReg((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    showToast(
      `Application for ${registrations.find((r) => r.id === id)?.applicantName} marked as ${newStatus.toUpperCase()}`
    );
  };

  const filteredRegistrations = registrations.filter((r) => {
    const matchesSearch =
      r.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.previousClubs.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = registrations.filter((r) => r.status === 'pending').length;
  const approvedCount = registrations.filter((r) => r.status === 'approved').length;
  const rejectedCount = registrations.filter((r) => r.status === 'rejected').length;

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case 'approved':
        return <Badge variant="green" size="sm" dot>Approved</Badge>;
      case 'pending':
        return <Badge variant="yellow" size="sm" dot>Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="red" size="sm">Rejected</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-pitch-card border border-emerald-500/50 shadow-pitch-glow text-xs text-white flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Player Registrations & Verifications</span>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
              {pendingCount} Pending Action
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Audit player candidate submissions, ID documents, and medical fitness for auction clearance.
          </p>
        </div>

        {/* Quick status counters */}
        <div className="flex items-center gap-2">
          <Badge variant="yellow" size="md">
            {pendingCount} Pending
          </Badge>
          <Badge variant="green" size="md">
            {approvedCount} Approved
          </Badge>
          <Badge variant="red" size="md">
            {rejectedCount} Rejected
          </Badge>
        </div>
      </div>

      {/* Search and Status Filters */}
      <Card padding="sm" className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search applicant name, email, previous clubs..."
            className="flex-1"
          />

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'approved', label: `Approved (${approvedCount})` },
              { id: 'rejected', label: `Rejected (${rejectedCount})` },
              { id: 'ALL', label: 'All Submissions' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st.id
                    ? 'bg-football-accent text-slate-950 font-bold shadow-pitch-glow'
                    : 'bg-pitch-darker text-slate-400 hover:text-white border border-pitch-border'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Registrations Table */}
      {filteredRegistrations.length === 0 ? (
        <EmptyState
          title="No registration applications found"
          description="There are currently no candidates matching the active filter and search keywords."
          icon={ClipboardCheck}
          actionText="Show All Submissions"
          onAction={() => {
            setSearchTerm('');
            setStatusFilter('ALL');
          }}
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-pitch-border bg-pitch-darker text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Applicant</th>
                  <th className="py-3.5 px-4">Position</th>
                  <th className="py-3.5 px-4">Experience</th>
                  <th className="py-3.5 px-4">Verification Checks</th>
                  <th className="py-3.5 px-4">Submitted Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pitch-border/50">
                {filteredRegistrations.map((reg) => (
                  <tr
                    key={reg.id}
                    className="hover:bg-pitch-cardHover transition-colors cursor-pointer"
                    onClick={() => setSelectedReg(reg)}
                  >
                    {/* Applicant */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{reg.applicantName}</div>
                      <div className="text-[11px] text-slate-400">{reg.email}</div>
                    </td>

                    {/* Position */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-400 bg-pitch-darker px-2 py-0.5 rounded border border-pitch-border">
                        {reg.position}
                      </span>
                    </td>

                    {/* Experience */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">{reg.experienceYears} Years</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {reg.previousClubs}
                      </div>
                    </td>

                    {/* Verifications */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded ${
                            reg.idProofVerified
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          ID {reg.idProofVerified ? 'Verified' : 'Missing'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded ${
                            reg.medicalFitnessCleared
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          <HeartPulse className="w-3 h-3" />
                          Med {reg.medicalFitnessCleared ? 'Cleared' : 'Pending'}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {reg.submittedAt}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{getStatusBadge(reg.status)}</td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {reg.status !== 'approved' && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-xs py-1 px-2.5"
                            onClick={() => handleStatusChange(reg.id, 'approved')}
                          >
                            Approve
                          </Button>
                        )}
                        {reg.status !== 'rejected' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs py-1 px-2.5 text-rose-400 hover:text-rose-300"
                            onClick={() => handleStatusChange(reg.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs py-1 px-2"
                          onClick={() => setSelectedReg(reg)}
                        >
                          Details
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

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedReg}
        onClose={() => setSelectedReg(null)}
        title={selectedReg?.applicantName || 'Registration Review'}
        subtitle={`Application ID: ${selectedReg?.id} • Submitted: ${selectedReg?.submittedAt}`}
        maxWidth="lg"
        footer={
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (selectedReg) handleStatusChange(selectedReg.id, 'rejected');
              }}
            >
              Reject Candidate
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (selectedReg) handleStatusChange(selectedReg.id, 'approved');
              }}
            >
              Approve for Auction Pool
            </Button>
          </div>
        }
      >
        {selectedReg && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-pitch-dark border border-pitch-border">
              <div>
                <h4 className="text-sm font-bold text-white">{selectedReg.applicantName}</h4>
                <p className="text-xs text-slate-400">
                  {selectedReg.email} • {selectedReg.phone}
                </p>
              </div>
              {getStatusBadge(selectedReg.status)}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
                <span className="text-slate-400 block text-[11px]">Primary Position</span>
                <span className="text-sm font-bold text-emerald-400">{selectedReg.position}</span>
              </div>
              <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
                <span className="text-slate-400 block text-[11px]">Age & Experience</span>
                <span className="text-sm font-bold text-white">
                  {selectedReg.age} Years ({selectedReg.experienceYears} yrs pro experience)
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-pitch-dark border border-pitch-border space-y-2 text-xs">
              <span className="text-slate-400 block font-semibold text-[11px]">Previous Clubs</span>
              <p className="text-slate-200">{selectedReg.previousClubs}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-pitch-dark border border-pitch-border space-y-2 text-xs">
              <span className="text-slate-400 block font-semibold text-[11px]">Scout / Admin Notes</span>
              <p className="text-slate-200 italic">{selectedReg.notes}</p>
            </div>

            <div className="p-3 rounded-xl bg-pitch-darker border border-pitch-border flex items-center justify-around text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className={`w-4 h-4 ${
                    selectedReg.idProofVerified ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                />
                <span className="text-slate-300">
                  Government ID: {selectedReg.idProofVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <HeartPulse
                  className={`w-4 h-4 ${
                    selectedReg.medicalFitnessCleared ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                />
                <span className="text-slate-300">
                  Medical Clearance: {selectedReg.medicalFitnessCleared ? 'Cleared' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
