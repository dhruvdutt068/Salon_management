import { create } from 'zustand';
import type { Barber, Service, QueueEntry, QueueStatus } from '../types';
import { DUMMY_SERVICES, DUMMY_BARBERS } from '../constants/dummyData';

export interface JoinQueuePayload {
  customerName: string;
  customerPhone: string;
  serviceIds: string[];
  preferredBarberId?: string;
  isWalkIn?: boolean;
}

export interface JoinQueueResult {
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
  getEntryByToken: (token: string) => (QueueEntry & { computedPosition: number }) | undefined;
  cancelEntry: (token: string) => boolean;
  markNoShow: (token: string) => boolean;
  updateEntryStatus: (token: string, newStatus: QueueStatus, barberId?: string) => void;
  callNextForBarber: (barberId: string) => { success: boolean; customer?: QueueEntry; message?: string };
  completeBarberService: (barberId: string) => void;
  setSimulatedPosition: (token: string, pos: number) => void;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  isQueueOpen: true,
  barbers: [
    {
      id: 'b-ravi',
      name: 'Ravi',
      status: 'Busy',
      currentCustomerToken: 'S-008',
      currentCustomerName: 'Rohan Gupta',
      serviceStartTime: new Date(Date.now() - 18 * 60000).toISOString(),
    },
    {
      id: 'b-amit',
      name: 'Amit',
      status: 'Available',
    },
    {
      id: 'b-imran',
      name: 'Imran',
      status: 'On Break',
    },
  ],
  services: DUMMY_SERVICES,
  tokenCounter: 16, // Next token will be S-016
  queue: [
    {
      id: 'q-1',
      token: 'S-008',
      customerName: 'Rohan Gupta',
      customerPhone: '9811002211',
      serviceIds: ['s-haircut'],
      preferredBarberId: 'b-ravi',
      assignedBarberId: 'b-ravi',
      status: 'In Chair',
      joinedAt: new Date(Date.now() - 40 * 60000).toISOString(),
      startedAt: new Date(Date.now() - 18 * 60000).toISOString(),
      totalDurationMinutes: 30,
      totalPrice: 150,
      estimatedWaitMinutes: 0,
      positionInQueue: 0,
    },
    {
      id: 'q-2',
      token: 'S-009',
      customerName: 'Kunal Patel',
      customerPhone: '9876543210',
      serviceIds: ['s-haircut', 's-beard'],
      preferredBarberId: 'b-amit',
      assignedBarberId: 'b-amit',
      status: 'Called',
      joinedAt: new Date(Date.now() - 30 * 60000).toISOString(),
      calledAt: new Date(Date.now() - 2 * 60000).toISOString(),
      totalDurationMinutes: 45,
      totalPrice: 230,
      estimatedWaitMinutes: 5,
      positionInQueue: 1,
    },
    {
      id: 'q-3',
      token: 'S-010',
      customerName: 'Devang Joshi',
      customerPhone: '9877001122',
      serviceIds: ['s-haircut'],
      preferredBarberId: 'b-amit',
      status: 'Waiting',
      joinedAt: new Date(Date.now() - 25 * 60000).toISOString(),
      totalDurationMinutes: 30,
      totalPrice: 150,
      estimatedWaitMinutes: 15,
      positionInQueue: 2,
    },
    {
      id: 'q-4',
      token: 'S-011',
      customerName: 'Priya Verma',
      customerPhone: '9899112233',
      serviceIds: ['s-spa'],
      preferredBarberId: undefined, // Any Barber
      status: 'Waiting',
      joinedAt: new Date(Date.now() - 20 * 60000).toISOString(),
      totalDurationMinutes: 45,
      totalPrice: 400,
      estimatedWaitMinutes: 30,
      positionInQueue: 3,
    },
    {
      id: 'q-5',
      token: 'S-012',
      customerName: 'Karan Mehra',
      customerPhone: '9811223344',
      serviceIds: ['s-beard', 's-massage'],
      preferredBarberId: 'b-ravi',
      status: 'Waiting',
      joinedAt: new Date(Date.now() - 65 * 60000).toISOString(), // >60m amber
      totalDurationMinutes: 35,
      totalPrice: 200,
      estimatedWaitMinutes: 65,
      positionInQueue: 4,
    },
    {
      id: 'q-6',
      token: 'S-013',
      customerName: 'Aarav Shah',
      customerPhone: '9844556677',
      serviceIds: ['s-haircut'],
      preferredBarberId: 'b-imran',
      status: 'Waiting',
      joinedAt: new Date(Date.now() - 15 * 60000).toISOString(),
      totalDurationMinutes: 30,
      totalPrice: 150,
      estimatedWaitMinutes: 50,
      positionInQueue: 5,
    },
    {
      id: 'q-7',
      token: 'S-014',
      customerName: 'Vikram Singh',
      customerPhone: '9833221100',
      serviceIds: ['s-haircut', 's-beard'],
      preferredBarberId: undefined, // Any Barber
      status: 'Waiting',
      joinedAt: new Date(Date.now() - 70 * 60000).toISOString(), // >60m amber
      totalDurationMinutes: 45,
      totalPrice: 230,
      estimatedWaitMinutes: 70,
      positionInQueue: 6,
    },
    {
      id: 'q-8',
      token: 'S-015',
      customerName: 'Neha Sharma',
      customerPhone: '9877889900',
      serviceIds: ['s-color'],
      preferredBarberId: undefined, // Any Barber
      status: 'Waiting',
      joinedAt: new Date(Date.now() - 80 * 60000).toISOString(), // >60m amber
      totalDurationMinutes: 60,
      totalPrice: 500,
      estimatedWaitMinutes: 85,
      positionInQueue: 7,
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
    const workingBarbers = get().barbers.filter((b) => b.status !== 'On Break').length || 1;
    return Math.max(10, Math.round(totalMinutes / workingBarbers));
  },

  calculateEstimatedWait: (selectedDurationMinutes: number, preferredBarberId?: string) => {
    const queue = get().queue;
    const barbers = get().barbers;
    const workingBarbers = barbers.filter((b) => b.status !== 'On Break').length || 1;

    let durationAhead = 0;
    const activeWaiting = queue.filter((item) => item.status === 'Waiting');

    if (preferredBarberId && preferredBarberId !== 'any') {
      for (const item of activeWaiting) {
        if (!item.preferredBarberId || item.preferredBarberId === preferredBarberId) {
          durationAhead += item.totalDurationMinutes;
        }
      }
      const barber = barbers.find((b) => b.id === preferredBarberId);
      if (barber?.status === 'Busy') {
        durationAhead += 15;
      }
      return Math.max(10, durationAhead);
    } else {
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
    const queue = get().queue;
    const entry = queue.find((item) => item.token.toLowerCase() === token.toLowerCase());
    if (!entry) return undefined;

    const waitingItems = queue.filter((item) => item.status === 'Waiting');
    const waitingIndex = waitingItems.findIndex((item) => item.id === entry.id);
    const computedPosition =
      entry.status === 'Waiting'
        ? (waitingIndex >= 0 ? waitingIndex + 1 : entry.positionInQueue)
        : entry.status === 'Called'
        ? 1
        : 0;

    return { ...entry, computedPosition };
  },

  cancelEntry: (token: string) => {
    let cancelled = false;
    set((state) => ({
      barbers: state.barbers.map((b) =>
        b.currentCustomerToken?.toLowerCase() === token.toLowerCase()
          ? { ...b, status: 'Available' as const, currentCustomerToken: undefined, currentCustomerName: undefined }
          : b
      ),
      queue: state.queue.map((item) => {
        if (item.token.toLowerCase() === token.toLowerCase() && (item.status === 'Waiting' || item.status === 'Called')) {
          cancelled = true;
          return { ...item, status: 'Cancelled' as QueueStatus };
        }
        return item;
      }),
    }));
    return cancelled;
  },

  markNoShow: (token: string) => {
    let marked = false;
    set((state) => ({
      barbers: state.barbers.map((b) =>
        b.currentCustomerToken?.toLowerCase() === token.toLowerCase()
          ? { ...b, status: 'Available' as const, currentCustomerToken: undefined, currentCustomerName: undefined }
          : b
      ),
      queue: state.queue.map((item) => {
        if (item.token.toLowerCase() === token.toLowerCase()) {
          marked = true;
          return { ...item, status: 'No-show' as QueueStatus };
        }
        return item;
      }),
    }));
    return marked;
  },

  // Call Next rule according to docs/03-flows-rules.md:
  // "Call next for barber X picks the earliest customer who chose X or 'Any'.
  // A customer who chose Ravi is never given to another barber."
  callNextForBarber: (barberId: string) => {
    const state = get();
    const barber = state.barbers.find((b) => b.id === barberId);
    if (!barber) return { success: false, message: 'Barber not found.' };

    if (barber.status === 'On Break') {
      return { success: false, message: `${barber.name} is currently on break.` };
    }

    // Find earliest waiting customer matching barberId or Any
    const eligibleCustomer = state.queue.find(
      (item) =>
        item.status === 'Waiting' &&
        (!item.preferredBarberId || item.preferredBarberId === barberId)
    );

    if (!eligibleCustomer) {
      return {
        success: false,
        message: `No eligible waiting customers for ${barber.name} (checked specific preference and 'Any barber').`,
      };
    }

    // Transition customer to Called and assign to barber
    set((s) => ({
      barbers: s.barbers.map((b) =>
        b.id === barberId
          ? {
              ...b,
              status: 'Busy' as const,
              currentCustomerToken: eligibleCustomer.token,
              currentCustomerName: eligibleCustomer.customerName,
              serviceStartTime: new Date().toISOString(),
            }
          : b
      ),
      queue: s.queue.map((item) =>
        item.id === eligibleCustomer.id
          ? {
              ...item,
              status: 'Called' as QueueStatus,
              assignedBarberId: barberId,
              calledAt: new Date().toISOString(),
            }
          : item
      ),
    }));

    return { success: true, customer: eligibleCustomer };
  },

  completeBarberService: (barberId: string) => {
    set((state) => {
      const barber = state.barbers.find((b) => b.id === barberId);
      const activeToken = barber?.currentCustomerToken;

      return {
        barbers: state.barbers.map((b) =>
          b.id === barberId
            ? { ...b, status: 'Available' as const, currentCustomerToken: undefined, currentCustomerName: undefined }
            : b
        ),
        queue: state.queue.map((item) =>
          activeToken && item.token.toLowerCase() === activeToken.toLowerCase()
            ? { ...item, status: 'Completed' as QueueStatus, completedAt: new Date().toISOString() }
            : item
        ),
      };
    });
  },

  updateEntryStatus: (token: string, newStatus: QueueStatus, barberId?: string) => {
    set((state) => ({
      queue: state.queue.map((item) => {
        if (item.token.toLowerCase() === token.toLowerCase()) {
          return {
            ...item,
            status: newStatus,
            assignedBarberId: barberId || item.assignedBarberId,
            calledAt: newStatus === 'Called' ? new Date().toISOString() : item.calledAt,
            startedAt: newStatus === 'In Chair' ? new Date().toISOString() : item.startedAt,
            completedAt: newStatus === 'Completed' ? new Date().toISOString() : item.completedAt,
          };
        }
        return item;
      }),
    }));
  },

  setSimulatedPosition: (token: string, pos: number) => {
    set((state) => ({
      queue: state.queue.map((item) => {
        if (item.token.toLowerCase() === token.toLowerCase()) {
          return { ...item, positionInQueue: pos };
        }
        return item;
      }),
    }));
  },
}));
