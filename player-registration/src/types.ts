export type PlayingPosition = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';

export interface RegistrationFormData {
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  playingPosition: PlayingPosition | '';
  photo: File | null;
}

export interface RegistrationSuccessData {
  registrationId: string;
  fullName: string;
  email: string;
  playingPosition: PlayingPosition;
  photoUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface PlayerStatusData {
  registrationId: string;
  displayName: string;
  playingPosition: PlayingPosition;
  photoUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
}
