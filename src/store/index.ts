import { create } from 'zustand';
import { 
  Farmer, ProcurementCentre, Booking, Token, QueueEntry, Role, AuditLogEntry 
} from '../types';
import { supabase } from '../lib/supabase';

interface AppState {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  activeFarmerId: string | null;
  setActiveFarmerId: (id: string | null) => void;

  farmers: Farmer[];
  centres: ProcurementCentre[];
  bookings: Booking[];
  tokens: Token[];
  queue: QueueEntry[];
  auditLogs: AuditLogEntry[];

  // Actions
  initSync: () => void;
  addFarmer: (farmerData: Omit<Farmer, 'id'>) => Farmer;
  bookSlot: (booking: Omit<Booking, 'id'>) => Booking;
  generateToken: (bookingId: string) => Token;
  allowEntry: (tokenId: string) => void;
  checkIn: (tokenId: string) => void;
  updateCounterStatus: (centreId: string, counterId: string, status: "ACTIVE" | "PAUSED" | "OFFLINE") => void;
  processNextInQueue: (centreId: string) => void;
  sendToQC: (tokenId: string) => void;
  updateQuality: (tokenId: string, moisture: number, grade: any, isAcceptable: boolean) => void;
  updateWeighment: (tokenId: string, gross: number, tare: number, mspRate: number) => void;
  initiatePayment: (tokenId: string) => void;
  completePayment: (tokenId: string) => void;
  addAuditLog: (tokenId: string, action: string) => void;
}

// Mock Data
const MOCK_FARMERS: Farmer[] = [
  {
    id: "f_demo1",
    name: "Ramesh Patil",
    phone: "9876543210",
    password: "password123",
    village: "Shirur",
    landRegistered: true,
    eligibleQuantity: 50,
  }
];

const MOCK_CENTRES: ProcurementCentre[] = [
  {
    id: "c1",
    name: "Mandi Centre A",
    location: "Pune District",
    distance: "12 km",
    baseProcessingSpeed: 8.4,
    counters: [
      { id: "cnt1", name: "Counter 1", status: "ACTIVE" },
      { id: "cnt2", name: "Counter 2", status: "ACTIVE" },
      { id: "cnt3", name: "Counter 3", status: "ACTIVE" },
      { id: "cnt4", name: "Counter 4", status: "ACTIVE" },
      { id: "cnt5", name: "Counter 5", status: "OFFLINE" },
    ]
  }
];

// Initial Queue Setup
const MOCK_QUEUE: QueueEntry[] = [
  { tokenId: "WHT-C01-238", farmerName: "Farmer A", crop: "Wheat", quantity: 42, joinedAt: new Date(Date.now() - 1000*60*20).toISOString(), estimatedWaitTime: 0, position: 0, status: "PROCESSING", assignedCounterId: "cnt1" },
  { tokenId: "WHT-C01-239", farmerName: "Farmer B", crop: "Wheat", quantity: 35, joinedAt: new Date(Date.now() - 1000*60*15).toISOString(), estimatedWaitTime: 4, position: 1, status: "WAITING" },
  { tokenId: "WHT-C01-240", farmerName: "Farmer C", crop: "Paddy", quantity: 50, joinedAt: new Date(Date.now() - 1000*60*10).toISOString(), estimatedWaitTime: 12, position: 2, status: "WAITING" },
];

const channel = supabase.channel('mandi-room');

export const useAppStore = create<AppState>((set, get) => {

  const setAndSync = (partial: any) => {
    set((state) => {
      const nextState = typeof partial === 'function' ? partial(state) : partial;
      
      // If Supabase key is configured, broadcast the patch to other devices
      if (supabase.supabaseKey !== 'REPLACE_ME_ANON_KEY') {
        channel.send({
          type: 'broadcast',
          event: 'STATE_PATCH',
          payload: nextState
        }).catch(err => console.error("Broadcast failed:", err));
      }
      
      return nextState;
    });
  };

  return {
    currentRole: "Farmer",
    setCurrentRole: (role) => set({ currentRole: role }),
    activeFarmerId: null,
    setActiveFarmerId: (id) => set({ activeFarmerId: id }),

    farmers: MOCK_FARMERS,
    centres: MOCK_CENTRES,
    bookings: [],
    tokens: [],
    queue: MOCK_QUEUE,
    auditLogs: [],

    initSync: () => {
      if (supabase.supabaseKey === 'REPLACE_ME_ANON_KEY') {
        console.warn("Supabase not configured. Using local state. Please update src/lib/supabase.ts");
        return;
      }
      
      // Prevent double subscription (e.g. from React Strict Mode)
      if ((window as any)._supabaseSyncInitialized) return;
      (window as any)._supabaseSyncInitialized = true;
      
      // Listen for patches from other devices
      channel.on('broadcast', { event: 'STATE_PATCH' }, ({ payload }) => {
        set(payload); // Apply silently without rebroadcasting
      });
      
      // If a new device joins and asks for the state, send them our current state
      channel.on('broadcast', { event: 'REQUEST_STATE' }, () => {
        channel.send({
          type: 'broadcast',
          event: 'STATE_PATCH',
          payload: {
            farmers: get().farmers,
            centres: get().centres,
            bookings: get().bookings,
            tokens: get().tokens,
            queue: get().queue,
            auditLogs: get().auditLogs,
          }
        }).catch(err => console.error("REQUEST_STATE reply failed:", err));
      });
      
      // Subscribe to the channel
      channel.subscribe((status, err) => {
        console.log("Supabase Realtime status:", status, err || "");
        if (status === 'SUBSCRIBED') {
          console.log("Connected to Supabase Realtime! Requesting state from peers...");
          channel.send({ type: 'broadcast', event: 'REQUEST_STATE', payload: {} })
            .catch(e => console.error("Initial REQUEST_STATE failed:", e));
        }
      });
    },

    addFarmer: (farmerData) => {
      const newFarmer: Farmer = { ...farmerData, id: `f${Date.now()}` };
      setAndSync((state: AppState) => ({ farmers: [...state.farmers, newFarmer] }));
      return newFarmer;
    },

    bookSlot: (bookingData) => {
      const newBooking: Booking = { ...bookingData, id: `b${Date.now()}` };
      setAndSync((state: AppState) => ({ bookings: [...state.bookings, newBooking] }));
      return newBooking;
    },

    generateToken: (bookingId) => {
      const booking = get().bookings.find(b => b.id === bookingId);
      if (!booking) throw new Error("Booking not found");
      const newToken: Token = {
        id: `t${Date.now()}`,
        bookingId,
        number: `${booking.crop.substring(0,3).toUpperCase()}-C01-${Math.floor(Math.random() * 1000)}`,
        status: "BOOKED"
      };
      setAndSync((state: AppState) => ({ tokens: [...state.tokens, newToken] }));
      return newToken;
    },

    allowEntry: (tokenId) => {
      setAndSync((state: AppState) => ({
        tokens: state.tokens.map(t => t.id === tokenId ? { ...t, status: "ARRIVED" } : t)
      }));
      get().addAuditLog(tokenId, "Allowed entry at Gate");
    },

    checkIn: (tokenId) => {
      const token = get().tokens.find(t => t.id === tokenId);
      if (!token) return;

      const booking = get().bookings.find(b => b.id === token.bookingId);
      const farmer = get().farmers.find(f => f.id === booking?.farmerId);
      
      const activeCounters = get().centres[0].counters.filter(c => c.status === "ACTIVE").length || 1;
      const waitingCount = get().queue.filter(q => q.status === "WAITING").length;
      const position = waitingCount + 1;

      const newQueueEntry: QueueEntry = {
        tokenId,
        farmerName: farmer?.name || "Unknown",
        crop: booking?.crop || "Wheat",
        quantity: booking?.estimatedQuantity || 0,
        joinedAt: new Date().toISOString(),
        estimatedWaitTime: Math.round((position * 8.4) / activeCounters),
        position: position,
        status: "WAITING"
      };

      setAndSync((state: AppState) => ({
        tokens: state.tokens.map(t => t.id === tokenId ? { ...t, status: "WAITING", checkInTime: new Date().toISOString() } : t),
        queue: [...state.queue, newQueueEntry]
      }));
      get().addAuditLog(tokenId, "Joined the queue");
    },

    updateCounterStatus: (centreId, counterId, status) => {
      setAndSync((state: AppState) => {
        const newCentres = state.centres.map(c => {
          if (c.id !== centreId) return c;
          return {
            ...c,
            counters: c.counters.map(cnt => cnt.id === counterId ? { ...cnt, status } : cnt)
          };
        });

        const activeCounters = newCentres[0].counters.filter(c => c.status === "ACTIVE").length || 1;
        const newQueue = state.queue.map(q => ({
          ...q,
          estimatedWaitTime: q.status === "WAITING" ? Math.round((q.position * 8.4) / activeCounters) : q.estimatedWaitTime
        }));

        return { centres: newCentres, queue: newQueue };
      });
    },

    processNextInQueue: (centreId) => {
      const state = get();
      const nextIdx = state.queue.findIndex(q => q.status === "WAITING");
      if (nextIdx === -1) return;

      const qItem = state.queue[nextIdx];
      const newQueueEntry = {
        ...qItem,
        status: "PROCESSING" as const,
        position: 0,
        estimatedWaitTime: 0
      };

      setAndSync((s: AppState) => {
        const newQueue = [...s.queue];
        newQueue[nextIdx] = newQueueEntry;
        const activeCounters = s.centres[0].counters.filter(c => c.status === "ACTIVE").length || 1;
        
        for (let i = nextIdx + 1; i < newQueue.length; i++) {
          if (newQueue[i].status === "WAITING") {
            newQueue[i].position -= 1;
            newQueue[i].estimatedWaitTime = Math.round((newQueue[i].position * 8.4) / activeCounters);
          }
        }
        
        const newTokens = s.tokens.map(t => 
          t.id === qItem.tokenId ? { ...t, status: "PROCESSING" as const } : t
        );

        return { queue: newQueue, tokens: newTokens };
      });
    },

    sendToQC: (tokenId) => {
      setAndSync((state: AppState) => ({
        tokens: state.tokens.map(t => t.id === tokenId ? { ...t, status: "READY_FOR_QC" } : t),
        queue: state.queue.map(q => q.tokenId === tokenId ? { ...q, status: "READY_FOR_QC" } : q)
      }));
      get().addAuditLog(tokenId, "Sent to Quality Lab");
    },

    updateQuality: (tokenId, moisture, grade, isAcceptable) => {
      const nextStatus = isAcceptable ? "QUALITY_CHECK" : "PROCUREMENT_REJECTED";
      setAndSync((state: AppState) => ({
        tokens: state.tokens.map(t => t.id === tokenId ? { 
          ...t, 
          status: nextStatus,
          quality: { moisture, grade, isAcceptable }
        } : t),
        queue: state.queue.map(q => q.tokenId === tokenId ? { ...q, status: nextStatus } : q)
      }));
      get().addAuditLog(tokenId, `Quality check completed. Moisture: ${moisture}%, Grade: ${grade}`);
    },

    updateWeighment: (tokenId, gross, tare, mspRate) => {
      setAndSync((state: AppState) => ({
        tokens: state.tokens.map(t => t.id === tokenId ? {
          ...t,
          status: "WEIGHMENT",
          weighment: { grossWeight: gross, tareWeight: tare, netWeight: gross - tare, mspRate }
        } : t),
        queue: state.queue.map(q => q.tokenId === tokenId ? { ...q, status: "WEIGHMENT" } : q)
      }));
      get().addAuditLog(tokenId, `Weighment completed. Net: ${gross - tare}q`);
    },

    initiatePayment: (tokenId) => {
      const token = get().tokens.find(t => t.id === tokenId);
      if (!token || !token.weighment) return;

      const netWeight = token.weighment.netWeight;
      const grossAmount = netWeight * token.weighment.mspRate;
      const moisture = token.quality?.moisture || 0;
      
      const deductions = [];
      if (moisture > 14) {
        const penaltyRate = (moisture - 14) * 0.01;
        deductions.push({ 
          reason: `Moisture penalty (${moisture}%)`, 
          amount: grossAmount * penaltyRate 
        });
      }
      deductions.push({ reason: "Cleaning charges", amount: 200 });

      const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

      const paymentData = {
        grossAmount,
        deductions,
        netAmount: grossAmount - totalDeductions,
        status: "INITIATED" as const
      };

      setAndSync((state: AppState) => ({
        tokens: state.tokens.map(t => t.id === tokenId ? {
          ...t,
          status: "PAYMENT_INITIATED",
          payment: paymentData
        } : t),
        queue: state.queue.map(q => q.tokenId === tokenId ? { ...q, status: "PAYMENT_INITIATED" } : q)
      }));
      get().addAuditLog(tokenId, "Payment initiated");
    },

    completePayment: (tokenId) => {
      setAndSync((state: AppState) => ({
        tokens: state.tokens.map(t => t.id === tokenId ? {
          ...t,
          status: "PAYMENT_COMPLETED",
          payment: t.payment ? { ...t.payment, status: "COMPLETED", transactionId: `DBT-${Math.floor(Math.random()*1000000)}` } : undefined
        } : t),
        queue: state.queue.map(q => q.tokenId === tokenId ? { ...q, status: "PAYMENT_COMPLETED" } : q)
      }));
      get().addAuditLog(tokenId, "Payment completed successfully");
    },

    addAuditLog: (tokenId, action) => {
      setAndSync((state: AppState) => {
        const newLog: AuditLogEntry = {
          id: `log${Date.now()}`,
          tokenId,
          timestamp: new Date().toISOString(),
          action,
          actorRole: state.currentRole,
          actorName: state.currentRole === "Farmer" ? "Farmer" : "System Operator"
        };
        return { auditLogs: [...state.auditLogs, newLog] };
      });
    }
  };
});
