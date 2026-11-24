import { create } from 'zustand';
import type { Barber, Service, QueueEntry } from '../types';
import { DUMMY_SERVICES, DUMMY_BARBERS } from '../constants/dummyData';

interface JoinQueuePayload {
  customerName: string;
  customerPhone: string;
  serviceIds: string[];
  preferredBarberId?: string;
}

interface JoinQueueResult {
  success: boolean;
  token?: string;
  error?: 'duplicate_phone' | 'queue_closed' | 'invalid_input';
  existingToken?: string;
}

interface QueueState {
  isQueueOpen: boolean;
  barbers: Barber[];
  services: Service[];
  queue: QueueEntry[];
  tokenCounter: number;

  // Actions
  toggleQueueOpen: () => void;
  setBarberStatus: (barberId: string, status: Barber['status']) => void;
  getWaitingCount: () => number;
  getTotalEstimatedWait: () => number;
  calculateEstimatedWait: (selectedDurationMinutes: number, preferredBarberId?: string) => number;
  isPhoneInQueue: (phone: string) => { inQueue: boolean; entry?: QueueEntry };
  joinQueue: (payload: JoinQueuePayload) => JoinQueueResult;
  getEntryByToken: (token: string) => QueueEntry | undefined;
  cancelEntry: (token: string) => boolean;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  isQueueOpen: true,
  barbers: DUMMY_BARBERS,
  services: DUMMY_SERVICES,
  tokenCounter: 14, // Next token will be S-014
  queue: [
    {
      id: 'q-1',
      token: 'S-009',
      customerName: 'Kunal Patel',
      customerPhone: '9876543210',
      serviceIds: ['s-haircut'],
      preferredBarberId: 'b-ravi',
      assignedBarberId: 'b-ravi',
      status: 'In Chair',
      joinedAt: new Date(Date.now() - 35 * 60000).toISOString(),
      startedAt: new Date(Date.now() - 15 * 60000).toISOString(),
      totalDurationMinutes: 30,
      totalPrice: 150,
      estimatedWaitMinutes: 0,
      positionInQueue: 0,
    },
    {
      id: 'q-2',
      token: 'S-010',
      customerName: 'Aarav Mehta',
      customerPhone: '9822334455',
      serviceIds: ['s-haircut', 's-beard'],
      preferredBarberId: 'b-amit',
      assignedBarberId: 'b-amit',
      status: 'Called',
      joinedAt: new Date(Date.now() - 25 * 60000).toISOString(),
      calledAt: new Date(Date.now() - 2 * 60000).toISOString(),
      totalDurationMinutes: 45,
      totalPrice: 230,
      estimatedWaitMinutes: 5,
      positionInQueue: 1,
    },
    {
      id: 'q-3',
      token: 'S-011',
      customerName: 'Devang Joshi',
      customerPhone: '9877001122',
      serviceIds: ['s-haircut'],
      preferredBarberId: undefined,
      status: 'Waiting',
      joinedAt: new Date(Date.now() - 20 * 60000).toISOString(),
      totalDurationMinutes: 30,
      totalPrice: 150,
      estimatedWaitMinutes: 15,
      positionInQueue: 2,
    },
    {
      id: 'q-4',
      token: 'S-012',
      customerName: 'Priya Verma',
      customerPhone: '9899112233',
      serviceIds: ['s-spa'],
      preferredBarberId: undefined,
      status: 'Waiting',
      joinedAt: new Date(Date.now() - 15 * 60000).toISOString(),
      totalDurationMinutes: 45,
      totalPrice: 400,
      estimatedWaitMinutes: 30,
      positionInQueue: 3,
    },
    {
      id: 'q-5',
      token: 'S-013',
      customerName: 'Karan Mehra',
      customerPhone: '9811223344',
      serviceIds: ['s-beard', 's-massage'],
      preferredBarberId: 'b-ravi',
      status: 'Waiting',
      joinedAt: new Date(Date.now() - 10 * 60000).toISOString(),
      totalDurationMinutes: 35,
      totalPrice: 200,
      estimatedWaitMinutes: 45,
      positionInQueue: 4,
    },
  ],

  toggleQueueOpen: () => set((state) => ({ isQueueOpen: !state.isQueueOpen })),

  setBarberStatus: (barberId, status) =>
    set((state) => ({
      barbers: state.barbers.map((b) => (b.id === barberId ? { ...b, status } : b)),
    })),

  getWaitingCount: () => {
    return get().queue.filter((item) => item.status === 'Waiting').length;
  },

  getTotalEstimatedWait: () => {
    const waitingItems = get().queue.filter((item) => item.status === 'Waiting');
    const totalMinutes = waitingItems.reduce((acc, item) => acc + item.totalDurationMinutes, 0);
    // Number of available working barbers (not on break)
    const workingBarbers = get().barbers.filter((b) => b.status !== 'On Break').length || 1;
    return Math.max(10, Math.round(totalMinutes / workingBarbers));
  },

  calculateEstimatedWait: (selectedDurationMinutes: number, preferredBarberId?: string) => {
    const queue = get().queue;
    const barbers = get().barbers;
    const workingBarbers = barbers.filter((b) => b.status !== 'On Break').length || 1;

    // Filter relevant customers ahead
    let durationAhead = 0;
    const activeWaiting = queue.filter((item) => item.status === 'Waiting');

    if (preferredBarberId && preferredBarberId !== 'any') {
      // Waiting only for this barber: all people who chose this barber or 'Any'
      for (const item of activeWaiting) {
        if (!item.preferredBarberId || item.preferredBarberId === preferredBarberId) {
          durationAhead += item.totalDurationMinutes;
        }
      }
      // If barber is currently busy in chair, add estimated remaining time (approx 15 min)
      const barber = barbers.find((b) => b.id === preferredBarberId);
      if (barber?.status === 'Busy') {
        durationAhead += 15;
      }
      return Math.max(10, durationAhead);
    } else {
      // Any barber (fastest): sum of all waiting duration / working barbers
      for (const item of activeWaiting) {
        durationAhead += item.totalDurationMinutes;
      }
      return Math.max(10, Math.round((durationAhead + selectedDurationMinutes) / workingBarbers));
    }
  },

  isPhoneInQueue: (phone: string) => {
    const cleaned = phone.trim();
    const existing = get().queue.find(
      (item) =>
        item.customerPhone === cleaned &&
        (item.status === 'Waiting' || item.status === 'Called' || item.status === 'In Chair')
    );
    return { inQueue: !!existing, entry: existing };
  },

  joinQueue: ({ customerName, customerPhone, serviceIds, preferredBarberId }) => {
    const state = get();
    if (!state.isQueueOpen) {
      return { success: false, error: 'queue_closed' };
    }

    const cleanedPhone = customerPhone.trim();
    const phoneCheck = state.isPhoneInQueue(cleanedPhone);
    if (phoneCheck.inQueue && phoneCheck.entry) {
      return {
        success: false,
        error: 'duplicate_phone',
        existingToken: phoneCheck.entry.token,
      };
    }

    // Calculate totals
    const services = state.services.filter((s) => serviceIds.includes(s.id));
    const totalDuration = services.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalPrice = services.reduce((acc, s) => acc + s.price, 0);

    const nextCounter = state.tokenCounter;
    const token = `S-${nextCounter.toString().padStart(3, '0')}`;
    const waitingItems = state.queue.filter((q) => q.status === 'Waiting');
    const positionInQueue = waitingItems.length + 1;
    const estimatedWait = state.calculateEstimatedWait(totalDuration, preferredBarberId);

    const newEntry: QueueEntry = {
      id: `q-${Date.now()}`,
      token,
      customerName: customerName.trim(),
      customerPhone: cleanedPhone,
      serviceIds,
      preferredBarberId: preferredBarberId === 'any' ? undefined : preferredBarberId,
      status: 'Waiting',
      joinedAt: new Date().toISOString(),
      totalDurationMinutes: totalDuration,
      totalPrice,
      estimatedWaitMinutes: estimatedWait,
      positionInQueue,
    };

    set((s) => ({
      queue: [...s.queue, newEntry],
      tokenCounter: s.tokenCounter + 1,
    }));

    return { success: true, token };
  },

  getEntryByToken: (token: string) => {
    return get().queue.find((item) => item.token.toLowerCase() === token.toLowerCase());
  },

  cancelEntry: (token: string) => {
    let cancelled = false;
    set((state) => ({
      queue: state.queue.map((item) => {
        if (item.token.toLowerCase() === token.toLowerCase() && item.status === 'Waiting') {
          cancelled = true;
          return { ...item, status: 'Cancelled' };
        }
        return item;
      }),
    }));
    return cancelled;
  },
}));
