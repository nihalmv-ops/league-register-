import React from 'react';
import { FileText, Camera, ShieldCheck, Gavel } from 'lucide-react';

export const InstructionsCard: React.FC = () => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-pitch-card to-pitch-darker border border-pitch-border p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Player Registration Instructions & Guidelines
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="p-3.5 rounded-xl bg-pitch-darker border border-pitch-border/60 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[10px]">
              1
            </span>
            <span>6 Required Fields</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Provide Full Name, Date of Birth, Phone Number, Email, Playing Position, and a Profile Photo.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-pitch-darker border border-pitch-border/60 space-y-1.5">
          <div className="flex items-center gap-2 text-blue-400 font-bold">
            <Camera className="w-4 h-4" />
            <span>Profile Photo Spec</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Upload a clear portrait photo in JPG, JPEG, or PNG format. Maximum file size is 5MB.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-pitch-darker border border-pitch-border/60 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Unique ID & PENDING</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Upon submission, you receive an official Registration ID (e.g. <code>PLR-2026-XXXXXX</code>) in PENDING status.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-pitch-darker border border-pitch-border/60 space-y-1.5">
          <div className="flex items-center gap-2 text-purple-400 font-bold">
            <Gavel className="w-4 h-4" />
            <span>Auction Clearance</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Once APPROVED by league commissioners, your player lot is unlocked for live bidding.
          </p>
        </div>
      </div>
    </div>
  );
};
