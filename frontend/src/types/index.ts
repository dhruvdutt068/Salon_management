export type Language = 'en' | 'gu';

export type QueueStatus = 'Waiting' | 'Called' | 'In Chair' | 'Completed' | 'Cancelled' | 'No-show';

export type BarberStatus = 'Available' | 'Busy' | 'On Break';

export interface Service {
  id: string;
  nameEn: string;
  nameGu: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

export interface Barber {
  id: string;
  name: string;
  status: BarberStatus;
  currentCustomerToken?: string;
  currentCustomerName?: string;
  serviceStartTime?: string;
}

export interface QueueEntry {
  id: string;
  token: string;
  customerName: string;
  customerPhone: string;
  serviceIds: string[];
  preferredBarberId?: string; // undefined or null means 'Any Barber'
  assignedBarberId?: string;
  status: QueueStatus;
  joinedAt: string;
  calledAt?: string;
  startedAt?: string;
  completedAt?: string;
  totalDurationMinutes: number;
  totalPrice: number;
  estimatedWaitMinutes: number;
  positionInQueue: number;
}
