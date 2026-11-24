import { create } from 'zustand';
import type { Barber, Service, QueueEntry, QueueStatus } from '../types';
import { DUMMY_SERVICES } from '../constants/dummyData';

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

export interface TodayStats {
  served: number;
  avgWait: number;
  noShows: number;
  activeQueue: number;
  revenue: number;
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
  toggleBarberOnDuty: (barberId: string) => void;
  toggleServiceActive: (serviceId: string) => void;
  updateServicePriceAndDuration: (serviceId: string, durationMinutes: number, price: number) => void;
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
  startBarberService: (barberId: string) => void;
  completeBarberService: (barberId: string) => void;
  toggleBarberBreak: (barberId: string) => void;
  getNextCustomerForBarber: (barberId: string) => QueueEntry | undefined;
  getTodayStats: () => TodayStats;
  setSimulatedPosition: (token: string, pos: number) => void;
  resetToDefaultData: () => void;
}

export const INITIAL_BARBERS: Barber[] = [
  {
    id: 'b-ravi',
    name: 'Ravi',
    status: 'Available',
  },
  {
    id: 'b-amit',
    name: 'Amit',
    status: 'Available',
  },
  {
    id: 'b-imran',
    name: 'Imran',
    status: 'Available',
  },
];

export const INITIAL_QUEUE: QueueEntry[] = [];

export const useQueueStore = create<QueueState>((set, get) => ({
  isQueueOpen: true,
  barbers: INITIAL_BARBERS,
  services: DUMMY_SERVICES,
  tokenCounter: 1, // First token will be S-001
  queue: INITIAL_QUEUE,

  toggleQueueOpen: () => set((state) => ({ isQueueOpen: !state.isQueueOpen })),

  setBarberStatus: (barberId, status) =>
    set((state) => ({
      barbers: state.barbers.map((b) => (b.id === barberId ? { ...b, status } : b)),
    })),

  toggleBarberOnDuty: (barberId) =>
    set((state) => ({
      barbers: state.barbers.map((b) => {
        if (b.id === barberId) {
          const isCurrentlyBreak = b.status === 'On Break';
          return { ...b, status: isCurrentlyBreak ? 'Available' : 'On Break' };
        }
        return b;
      }),
    })),

  toggleServiceActive: (serviceId) =>
    set((state) => ({
      services: state.services.map((s) =>
        s.id === serviceId ? { ...s, isActive: !s.isActive } : s
      ),
    })),

  updateServicePriceAndDuration: (serviceId, durationMinutes, price) =>
    set((state) => ({
      services: state.services.map((s) =>
        s.id === serviceId ? { ...s, durationMinutes, price } : s
      ),
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

  joinQueue: ({ customerName, customerPhone, serviceIds, preferredBarberId, isWalkIn }) => {
    const state = get();
    // Online join is prevented when queue is closed, but walk-ins are still allowed
    if (!state.isQueueOpen && !isWalkIn) {
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

  callNextForBarber: (barberId: string) => {
    const state = get();
    const barber = state.barbers.find((b) => b.id === barberId);
    if (!barber) return { success: false, message: 'Barber not found.' };

    if (barber.status === 'On Break') {
      return { success: false, message: `${barber.name} is currently on break.` };
    }

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

  startBarberService: (barberId: string) => {
    set((state) => {
      const barber = state.barbers.find((b) => b.id === barberId);
      const activeToken = barber?.currentCustomerToken;
      const now = new Date().toISOString();

      return {
        barbers: state.barbers.map((b) =>
          b.id === barberId
            ? { ...b, status: 'Busy' as const, serviceStartTime: now }
            : b
        ),
        queue: state.queue.map((item) =>
          activeToken && item.token.toLowerCase() === activeToken.toLowerCase()
            ? { ...item, status: 'In Chair' as QueueStatus, startedAt: now }
            : item
        ),
      };
    });
  },

  completeBarberService: (barberId: string) => {
    set((state) => {
      const barber = state.barbers.find((b) => b.id === barberId);
      const activeToken = barber?.currentCustomerToken;

      return {
        barbers: state.barbers.map((b) =>
          b.id === barberId
            ? { ...b, status: 'Available' as const, currentCustomerToken: undefined, currentCustomerName: undefined, serviceStartTime: undefined }
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

  toggleBarberBreak: (barberId: string) => {
    set((state) => ({
      barbers: state.barbers.map((b) => {
        if (b.id === barberId) {
          const nextStatus = b.status === 'On Break' ? 'Available' : 'On Break';
          return { ...b, status: nextStatus };
        }
        return b;
      }),
    }));
  },

  getNextCustomerForBarber: (barberId: string) => {
    const queue = get().queue;
    return queue.find(
      (item) =>
        item.status === 'Waiting' &&
        (!item.preferredBarberId || item.preferredBarberId === barberId)
    );
  },

  getTodayStats: () => {
    const queue = get().queue;
    const completed = queue.filter((q) => q.status === 'Completed');
    const noShows = queue.filter((q) => q.status === 'No-show');
    const waiting = queue.filter((q) => q.status === 'Waiting');

    // Baseline stats + live increments
    const baseServed = 18;
    const totalServed = baseServed + completed.length;
    const totalRevenue = 4250 + completed.reduce((acc, q) => acc + q.totalPrice, 0);

    const totalWait = waiting.reduce((acc, q) => acc + q.estimatedWaitMinutes, 0);
    const avgWait = waiting.length > 0 ? Math.round(totalWait / waiting.length) : 25;

    return {
      served: totalServed,
      avgWait,
      noShows: 2 + noShows.length,
      activeQueue: waiting.length,
      revenue: totalRevenue,
    };
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

  resetToDefaultData: () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('salon_queue_store_v1');
        localStorage.removeItem('salon_queue_store_v2');
      }
    } catch {}
    set({
      isQueueOpen: true,
      barbers: INITIAL_BARBERS,
      services: DUMMY_SERVICES,
      tokenCounter: 1,
      queue: INITIAL_QUEUE,
    });
  },
}));

// Real-Time Cross-Window / Cross-Tab Synchronization via BroadcastChannel
let syncChannel: BroadcastChannel | null = null;
let isReceivingBroadcast = false;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel('salon_queue_sync_channel');
    syncChannel.onmessage = (event) => {
      if (event.data?.type === 'QUEUE_STATE_SYNC' && event.data.payload) {
        isReceivingBroadcast = true;
        useQueueStore.setState((prev) => ({
          ...prev,
          ...event.data.payload,
        }));
        setTimeout(() => {
          isReceivingBroadcast = false;
        }, 50);
      }
    };
  } catch (err) {
    console.warn('BroadcastChannel not initialized:', err);
  }
}

// Hydrate from localStorage and synchronize across tabs
if (typeof window !== 'undefined') {
  try {
    // Clear out old v1 cache that contained demo tickets
    localStorage.removeItem('salon_queue_store_v1');

    const cached = localStorage.getItem('salon_queue_store_v2');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.queue) && Array.isArray(parsed.barbers)) {
        useQueueStore.setState({
          isQueueOpen: parsed.isQueueOpen ?? true,
          barbers: parsed.barbers,
          services: parsed.services ?? DUMMY_SERVICES,
          queue: parsed.queue,
          tokenCounter: parsed.tokenCounter ?? 1,
        });
      }
    }
  } catch {}

  // Auto-broadcast state changes to other tabs & save to localStorage
  useQueueStore.subscribe((state) => {
    try {
      localStorage.setItem(
        'salon_queue_store_v2',
        JSON.stringify({
          isQueueOpen: state.isQueueOpen,
          barbers: state.barbers,
          services: state.services,
          queue: state.queue,
          tokenCounter: state.tokenCounter,
        })
      );
    } catch {}

    if (syncChannel && !isReceivingBroadcast) {
      try {
        syncChannel.postMessage({
          type: 'QUEUE_STATE_SYNC',
          payload: {
            isQueueOpen: state.isQueueOpen,
            barbers: state.barbers,
            services: state.services,
            queue: state.queue,
            tokenCounter: state.tokenCounter,
          },
        });
      } catch {}
    }
  });
}

