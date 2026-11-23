import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  X,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  User,
  Calendar,
  Phone,
  Mail,
  Shield,
  Compass,
  Crosshair,
  ShieldAlert,
} from 'lucide-react';
import { PlayingPosition, RegistrationSuccessData } from '../types';

interface RegistrationFormProps {
  onSuccess: (data: RegistrationSuccessData) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
  // Exactly the 6 required fields
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [playingPosition, setPlayingPosition] = useState<PlayingPosition | ''>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Validation & Submission States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Position options
  const positionOptions: {
    id: PlayingPosition;
    title: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'Goalkeeper',
      title: 'Goalkeeper',
      desc: 'Shot stopping, aerial presence & distribution',
      icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'Defender',
      title: 'Defender',
      desc: 'Central defense, full-back & tackling',
      icon: <Shield className="w-5 h-5 text-blue-400" />,
    },
    {
      id: 'Midfielder',
      title: 'Midfielder',
      desc: 'Playmaking, ball retention & box-to-box',
      icon: <Compass className="w-5 h-5 text-orange-400" />,
    },
    {
      id: 'Forward',
      title: 'Forward',
      desc: 'Finishing, pressing & attacking wing play',
      icon: <Crosshair className="w-5 h-5 text-rose-400" />,
    },
  ];

  // Photo change handler with validation
  const handlePhotoSelect = (file: File) => {
    setServerError(null);
    const newErrors = { ...errors };
    delete newErrors.photo;

    // Validate MIME type
    const validMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setErrors({
        ...newErrors,
        photo: 'Only JPG, JPEG, and PNG images are supported.',
      });
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({
        ...newErrors,
        photo: 'Photo size exceeds 5MB. Please upload a smaller image.',
      });
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrors(newErrors);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePhotoSelect(e.target.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Calculate age helper
  const calculateAge = (dob: string): number | null => {
    if (!dob) return null;
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const playerAge = calculateAge(dateOfBirth);

  // Validate form client-side
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Full Name
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(fullName.trim())) {
      newErrors.fullName = 'Full name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // 2. Date of Birth
    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = calculateAge(dateOfBirth);
      if (age === null) {
        newErrors.dateOfBirth = 'Invalid date of birth';
      } else if (age < 12) {
        newErrors.dateOfBirth = 'Player must be at least 12 years old';
      } else if (age > 60) {
        newErrors.dateOfBirth = 'Player age cannot exceed 60 years';
      }
    }

    // 3. Phone Number
    const phoneDigits = phoneNumber.replace(/\D/g, '');
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[\d\s()+.-]+$/.test(phoneNumber.trim()) || phoneDigits.length < 7 || phoneDigits.length > 15) {
      newErrors.phoneNumber = 'Please enter a valid phone number with 7-15 digits (e.g. +1 555 123 4567)';
    }

    // 4. Email (Optional)
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // 5. Playing Position
    if (!playingPosition) {
      newErrors.playingPosition = 'Please select your primary playing position';
    }

    // 6. Profile Photo
    if (!photoFile) {
      newErrors.photo = 'Profile photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      formData.append('dateOfBirth', dateOfBirth);
      formData.append('phoneNumber', phoneNumber.trim());
      if (email.trim()) {
        formData.append('email', email.toLowerCase().trim());
      }
      formData.append('playingPosition', playingPosition);
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const response = await fetch('/api/players/register', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to submit player registration.');
      }

      onSuccess(result.data);
    } catch (err: any) {
      setServerError(err.message || 'Network error occurred while submitting your registration.');
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-pitch-card/90 border border-pitch-border rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 backdrop-blur-md"
      >
        {/* Form Title & Subtitle */}
        <div className="border-b border-pitch-border pb-6 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Official Player Registration Form
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Please provide accurate identity details for tournament clearance. Email is optional.
          </p>
        </div>

        {/* Global Server Error Banner */}
        {serverError && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-xs sm:text-sm text-rose-300 flex items-start gap-3 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-200">Registration Submission Notice</p>
              <p className="mt-0.5 leading-relaxed">{serverError}</p>
            </div>
          </div>
        )}

        {/* 1. Full Name */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-orange-400" />
              1. Full Legal Name <span className="text-rose-400">*</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              As on official passport / ID
            </span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors({ ...errors, fullName: '' });
            }}
            placeholder="e.g. Mateo Rossi"
            className={`w-full bg-pitch-darker border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
              errors.fullName
                ? 'border-rose-500 ring-1 ring-rose-500/40'
                : 'border-pitch-border focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40'
            }`}
          />
          {errors.fullName && (
            <p className="text-xs text-rose-400 font-medium">{errors.fullName}</p>
          )}
        </div>

        {/* 2. Date of Birth & Age */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-orange-400" />
                2. Date of Birth <span className="text-rose-400">*</span>
              </span>
              {playerAge !== null && playerAge >= 0 && (
                <span className="text-[11px] font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                  Age: {playerAge}
                </span>
              )}
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => {
                setDateOfBirth(e.target.value);
                if (errors.dateOfBirth) setErrors({ ...errors, dateOfBirth: '' });
              }}
              className={`w-full bg-pitch-darker border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all ${
                errors.dateOfBirth
                  ? 'border-rose-500 ring-1 ring-rose-500/40'
                  : 'border-pitch-border focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40'
              }`}
            />
            {errors.dateOfBirth && (
              <p className="text-xs text-rose-400 font-medium">{errors.dateOfBirth}</p>
            )}
          </div>

          {/* 3. Phone Number */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-orange-400" />
              3. Phone Number <span className="text-rose-400">*</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' });
              }}
              placeholder="+1 555 123 4567"
              className={`w-full bg-pitch-darker border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                errors.phoneNumber
                  ? 'border-rose-500 ring-1 ring-rose-500/40'
                  : 'border-pitch-border focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40'
              }`}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-rose-400 font-medium">{errors.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* 4. Email (Optional) */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-orange-400" />
              4. Email Address <span className="text-slate-400 font-normal text-xs">(Optional)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              Digital receipt & updates (optional)
            </span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            placeholder="player@example.com (optional)"
            className={`w-full bg-pitch-darker border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
              errors.email
                ? 'border-rose-500 ring-1 ring-rose-500/40'
                : 'border-pitch-border focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40'
            }`}
          />
          {errors.email && (
            <p className="text-xs text-rose-400 font-medium">{errors.email}</p>
          )}
        </div>

        {/* 5. Playing Position */}
        <div className="space-y-3">
          <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-orange-400" />
              5. Playing Position <span className="text-rose-400">*</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              Select one primary tactical role
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {positionOptions.map((pos) => {
              const isSelected = playingPosition === pos.id;
              return (
                <div
                  key={pos.id}
                  onClick={() => {
                    setPlayingPosition(pos.id);
                    if (errors.playingPosition) setErrors({ ...errors, playingPosition: '' });
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-orange-500/10 border-orange-500 shadow-pitch-glow'
                      : 'bg-pitch-darker/80 border-pitch-border hover:border-slate-600 hover:bg-pitch-darker'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-pitch-card border border-pitch-border shrink-0">
                    {pos.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-sm font-extrabold ${
                          isSelected ? 'text-orange-400' : 'text-white'
                        }`}
                      >
                        {pos.title}
                      </h4>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                      {pos.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {errors.playingPosition && (
            <p className="text-xs text-rose-400 font-medium">{errors.playingPosition}</p>
          )}
        </div>

        {/* 6. Player Profile Photo */}
        <div className="space-y-3">
          <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-orange-400" />
              6. Player Profile Photo <span className="text-rose-400">*</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              JPG, JPEG, PNG • Max 5MB
            </span>
          </label>

          {/* Hidden native input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            className="hidden"
          />

          {!photoPreview ? (
            /* Upload Dropzone */
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 bg-pitch-darker/60 hover:bg-pitch-darker hover:border-orange-500/60 ${
                errors.photo
                  ? 'border-rose-500'
                  : 'border-pitch-border'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-3 shadow-pitch-glow">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                Upload Player Portrait Photo
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mb-3">
                Click to browse from your device. Clear headshot recommended for auction displays.
              </p>
              <span className="text-[10px] font-semibold text-slate-400 bg-pitch-card px-3 py-1 rounded-full border border-pitch-border">
                JPG, JPEG or PNG up to 5MB
              </span>
            </div>
          ) : (
            /* Photo Preview with Replace / Remove controls */
            <div className="p-4 rounded-2xl bg-pitch-darker border border-orange-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-orange-500/50 shadow-pitch-glow shrink-0">
                  <img
                    src={photoPreview}
                    alt="Player Profile Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white truncate max-w-xs">
                    {photoFile?.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Size: {((photoFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB • Ready for Cloudinary
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-400 mt-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid Photo Attached
                  </span>
                </div>
              </div>

              {/* Photo Actions: Replace & Remove */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-pitch-card hover:bg-slate-800 border border-pitch-border text-xs text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-orange-400" />
                  <span>Replace Photo</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="p-1.5 rounded-xl bg-pitch-card hover:bg-rose-950/40 border border-pitch-border hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {errors.photo && (
            <p className="text-xs text-rose-400 font-medium">{errors.photo}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-pitch-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            By submitting, you agree to official tournament rules and league verification terms.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-football-accent hover:bg-football-accentHover disabled:opacity-50 text-slate-950 font-black text-sm tracking-wide shadow-pitch-glow hover:shadow-pitch-glow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Submitting & Uploading...</span>
              </>
            ) : (
              <span>Submit Registration (PENDING)</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
