const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

export interface BackendService {
  id: string;
  name_en: string;
  name_gu: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

export interface BackendBarber {
  id: string;
  name: string;
  status: 'Available' | 'Busy' | 'On Break';
  current_customer_token: string | null;
  current_customer_name: string | null;
  service_start_time: string | null;
}

export interface BackendQueueEntry {
  id: string;
  token: string;
  customer_name: string;
  customer_phone: string;
  service_ids: string[];
  preferred_barber_id: string | null;
  assigned_barber_id: string | null;
  status: 'Waiting' | 'Called' | 'In Chair' | 'Completed' | 'Cancelled' | 'No-show';
  joined_at: string;
  called_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  total_duration_minutes: number;
  total_price: number;
  estimated_wait_minutes: number;
  position_in_queue: number;
  services?: BackendService[];
}

export interface BackendQueueListResponse {
  waiting_count: number;
  active_entries: BackendQueueEntry[];
}

export interface BackendStats {
  served_count: number;
  average_wait_minutes: number;
  in_queue_count: number;
  no_show_count: number;
  total_revenue: number;
  is_queue_open: boolean;
}

export interface JoinQueuePayload {
  customer_name: string;
  customer_phone: string;
  service_ids: string[];
  preferred_barber_id?: string | null;
  is_walk_in?: boolean;
}

// REST API Methods
export const api = {
  // Queue
  async getQueue(): Promise<BackendQueueListResponse> {
    const res = await fetch(`${API_BASE_URL}/api/queue`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getQueueEntry(token: string): Promise<BackendQueueEntry> {
    const res = await fetch(`${API_BASE_URL}/api/queue/${token}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async joinQueue(payload: JoinQueuePayload): Promise<BackendQueueEntry> {
    const res = await fetch(`${API_BASE_URL}/api/queue/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Failed to join queue' }));
      throw new Error(errData.detail || 'Failed to join queue');
    }
    return res.json();
  },

  async callNext(barberId: string): Promise<BackendQueueEntry> {
    const res = await fetch(`${API_BASE_URL}/api/queue/call-next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barber_id: barberId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to call next customer' }));
      throw new Error(err.detail || 'Failed to call next customer');
    }
    return res.json();
  },

  async startService(token: string): Promise<BackendQueueEntry> {
    const res = await fetch(`${API_BASE_URL}/api/queue/${token}/start`, { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async finishService(token: string): Promise<BackendQueueEntry> {
    const res = await fetch(`${API_BASE_URL}/api/queue/${token}/done`, { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async markNoShow(token: string): Promise<BackendQueueEntry> {
    const res = await fetch(`${API_BASE_URL}/api/queue/${token}/no-show`, { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async cancelQueueEntry(token: string): Promise<BackendQueueEntry> {
    const res = await fetch(`${API_BASE_URL}/api/queue/${token}/cancel`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to cancel spot' }));
      throw new Error(err.detail || 'Failed to cancel spot');
    }
    return res.json();
  },

  // Barbers
  async getBarbers(): Promise<BackendBarber[]> {
    const res = await fetch(`${API_BASE_URL}/api/barbers`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async toggleBarberBreak(barberId: string): Promise<BackendBarber> {
    const res = await fetch(`${API_BASE_URL}/api/barbers/${barberId}/break`, { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Services
  async getServices(activeOnly: boolean = false): Promise<BackendService[]> {
    const res = await fetch(`${API_BASE_URL}/api/services?active_only=${activeOnly}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async updateService(id: string, updates: Partial<BackendService>): Promise<BackendService> {
    const res = await fetch(`${API_BASE_URL}/api/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Stats & Settings
  async getStats(): Promise<BackendStats> {
    const res = await fetch(`${API_BASE_URL}/api/stats`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getSettings(): Promise<{ is_queue_open: boolean }> {
    const res = await fetch(`${API_BASE_URL}/api/settings`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async setQueueOpen(isOpen: boolean): Promise<{ is_queue_open: boolean }> {
    const res = await fetch(`${API_BASE_URL}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_queue_open: isOpen }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// Realtime WebSocket Client helper
export function connectQueueWebSocket(onEvent: (event: string, data: any) => void) {
  let socket: WebSocket | null = null;
  let heartbeatInterval: any = null;

  try {
    socket = new WebSocket(WS_BASE_URL);

    socket.onopen = () => {
      // Periodic ping
      heartbeatInterval = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send('ping');
        }
      }, 30000);
    };

    socket.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.event && payload.event !== 'pong') {
          onEvent(payload.event, payload.data);
        }
      } catch {
        // ignore parse error
      }
    };

    socket.onerror = () => {
      // silently handle socket error
    };

    socket.onclose = () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    };
  } catch {
    // silently handle connection error in offline environments
  }

  return () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
  };
}
