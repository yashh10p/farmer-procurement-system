import { create } from 'zustand';
import { 
  Farmer, ProcurementCentre, Booking, Token, QueueEntry, Role, AuditLogEntry 
} from '../types';
import { supabase } from '../lib/supabase';

interface AppState {
  language: string | null;
  setLanguage: (lang: string) => void;
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
    name: "Mandi Centre A (Khed)",
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
  },
  {
    id: "c2",
    name: "Mandi Centre B (Shirur)",
    location: "Pune District",
    distance: "25 km",
    baseProcessingSpeed: 9.2,
    counters: [
      { id: "cnt1", name: "Counter 1", status: "ACTIVE" },
      { id: "cnt2", name: "Counter 2", status: "ACTIVE" },
      { id: "cnt3", name: "Counter 3", status: "OFFLINE" },
    ]
  },
  {
    id: "c3",
    name: "Mandi Centre C (Baramati)",
    location: "Pune District",
    distance: "40 km",
    baseProcessingSpeed: 7.5,
    counters: [
      { id: "cnt1", name: "Counter 1", status: "ACTIVE" },
      { id: "cnt2", name: "Counter 2", status: "ACTIVE" },
    ]
  }
];

// Initial Queue Setup
const MOCK_QUEUE: QueueEntry[] = [];

// Use API polling for cross-device local synchronization
let syncInterval: any = null;

export const useAppStore = create<AppState>((set, get) => {

  const setAndSync = (partial: any) => {
    set(partial);
    
    // Get the fully merged state after the update
    const fullState = get();
    
    // Push full state to API for cross-device sync
    if (typeof window !== 'undefined') {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmers: fullState.farmers,
          centres: fullState.centres,
          bookings: fullState.bookings,
          tokens: fullState.tokens,
          queue: fullState.queue,
          auditLogs: fullState.auditLogs,
        })
      }).catch(err => console.error("Sync failed:", err));
    }
  };

  return {
    language: null,
    setLanguage: (lang) => set({ language: lang }),
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
      if (typeof window === 'undefined') return;
      
      // Prevent double subscription
      if ((window as any)._syncInitialized) return;
      (window as any)._syncInitialized = true;
      
      const fetchState = async () => {
        try {
          const res = await fetch(`/api/sync?t=${Date.now()}`, { cache: 'no-store' });
          const data = await res.json();
          if (data && data.tokens) {
            set(data);
          }
        } catch (err) {
          console.error("Failed to fetch sync state:", err);
        }
      };

      // Initial fetch
      fetchState();

      // Poll every 2 seconds for updates
      syncInterval = setInterval(fetchState, 2000);
      console.log("Connected to API Sync! Polling for cross-device updates...");
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
