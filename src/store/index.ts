import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  addFarmer: (farmerData: Omit<Farmer, 'id'>) => Promise<Farmer>;
  bookSlot: (booking: Omit<Booking, 'id'>) => Promise<Booking>;
  generateToken: (bookingId: string) => Promise<Token>;
  allowEntry: (tokenId: string) => Promise<void>;
  checkIn: (tokenId: string) => Promise<void>;
  updateCounterStatus: (centreId: string, counterId: string, status: "ACTIVE" | "PAUSED" | "OFFLINE") => Promise<void>;
  processNextInQueue: (centreId: string) => Promise<void>;
  sendToQC: (tokenId: string) => Promise<void>;
  updateQuality: (tokenId: string, moisture: number, grade: any, isAcceptable: boolean) => Promise<void>;
  updateWeighment: (tokenId: string, gross: number, tare: number, mspRate: number) => Promise<void>;
  initiatePayment: (tokenId: string) => Promise<void>;
  completePayment: (tokenId: string) => Promise<void>;
  addAuditLog: (tokenId: string, action: string) => Promise<void>;
}

// Mock Data for Seeding
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
      { id: "cnt1", centre_id: "c1", name: "Counter 1", status: "ACTIVE" },
      { id: "cnt2", centre_id: "c1", name: "Counter 2", status: "ACTIVE" },
      { id: "cnt3", centre_id: "c1", name: "Counter 3", status: "ACTIVE" },
      { id: "cnt4", centre_id: "c1", name: "Counter 4", status: "ACTIVE" },
      { id: "cnt5", centre_id: "c1", name: "Counter 5", status: "OFFLINE" },
    ] as any
  },
  {
    id: "c2",
    name: "Mandi Centre B (Shirur)",
    location: "Pune District",
    distance: "25 km",
    baseProcessingSpeed: 9.2,
    counters: [
      { id: "cnt1", centre_id: "c2", name: "Counter 1", status: "ACTIVE" },
      { id: "cnt2", centre_id: "c2", name: "Counter 2", status: "ACTIVE" },
      { id: "cnt3", centre_id: "c2", name: "Counter 3", status: "OFFLINE" },
    ] as any
  },
  {
    id: "c3",
    name: "Mandi Centre C (Baramati)",
    location: "Pune District",
    distance: "40 km",
    baseProcessingSpeed: 7.5,
    counters: [
      { id: "cnt1", centre_id: "c3", name: "Counter 1", status: "ACTIVE" },
      { id: "cnt2", centre_id: "c3", name: "Counter 2", status: "ACTIVE" },
    ] as any
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
    language: null,
    setLanguage: (lang) => set({ language: lang }),
    currentRole: "Farmer",
    setCurrentRole: (role) => set({ currentRole: role }),
    activeFarmerId: null,
    setActiveFarmerId: (id) => set({ activeFarmerId: id }),

    farmers: [],
    centres: [],
    bookings: [],
    tokens: [],
    queue: [],
    auditLogs: [],

    initSync: async () => {
      if (typeof window === 'undefined') return;
      
      console.log("Initializing Supabase Sync...");
      await supabase.removeAllChannels();

      // Fetch initial data
      const fetchInitialData = async () => {
        const [farmersRes, centresRes, bookingsRes, tokensRes, queueRes, auditLogsRes] = await Promise.all([
          supabase.from('farmers').select('*'),
          supabase.from('centres').select('*'),
          supabase.from('bookings').select('*'),
          supabase.from('tokens').select('*'),
          supabase.from('queue').select('*'),
          supabase.from('audit_logs').select('*')
        ]);

        let farmers = farmersRes.data || [];
        let centres = centresRes.data || [];

        // Seed if empty
        if (farmers.length === 0) {
          await supabase.from('farmers').insert(MOCK_FARMERS);
          farmers = MOCK_FARMERS;
        }
        if (centres.length === 0) {
          await supabase.from('centres').insert(MOCK_CENTRES);
          centres = MOCK_CENTRES;
        }

        set({
          farmers,
          centres,
          bookings: bookingsRes.data || [],
          tokens: tokensRes.data || [],
          queue: queueRes.data || [],
          auditLogs: auditLogsRes.data || []
        });
      };

      await fetchInitialData();

      // Realtime Subscriptions
      const channel = supabase.channel(`public-changes-${Date.now()}`);

      const setupSubscription = (table: string, stateKey: keyof AppState) => {
        channel.on('postgres_changes', { event: '*', schema: 'public', table: table }, (payload: any) => {
            console.log(`Realtime update on ${table}`, payload);
            set((state: any) => {
              const currentList = state[stateKey];
              if (payload.eventType === 'INSERT') {
                const idField = table === 'queue' ? 'tokenId' : 'id';
                if (currentList.some((item: any) => item[idField] === payload.new[idField])) return state;
                return { [stateKey]: [...currentList, payload.new] };
              }
              if (payload.eventType === 'UPDATE') {
                const idField = table === 'queue' ? 'tokenId' : 'id';
                return { [stateKey]: currentList.map((item: any) => item[idField] === payload.new[idField] ? payload.new : item) };
              }
              if (payload.eventType === 'DELETE') {
                const idField = table === 'queue' ? 'tokenId' : 'id';
                return { [stateKey]: currentList.filter((item: any) => item[idField] !== payload.old[idField]) };
              }
              return state;
            });
          });
      };

      setupSubscription('farmers', 'farmers');
      setupSubscription('centres', 'centres');
      setupSubscription('bookings', 'bookings');
      setupSubscription('tokens', 'tokens');
      setupSubscription('queue', 'queue');
      setupSubscription('audit_logs', 'auditLogs');

      channel.subscribe();
    },

    addFarmer: async (farmerData) => {
      const newFarmer: Farmer = { ...farmerData, id: `f${Date.now()}` };
      set((state: any) => ({ farmers: [...state.farmers, newFarmer] }));
      await supabase.from('farmers').insert([newFarmer]);
      return newFarmer;
    },

    bookSlot: async (bookingData) => {
      const newBooking: Booking = { ...bookingData, id: `b${Date.now()}` };
      set((state: any) => ({ bookings: [...state.bookings, newBooking] })); // Optimistic update
      const { error } = await supabase.from('bookings').insert([newBooking]);
      if (error) console.error("Error inserting booking:", error);
      return newBooking;
    },

    generateToken: async (bookingId) => {
      const booking = get().bookings.find(b => b.id === bookingId);
      if (!booking) throw new Error("Booking not found");
      const newToken: Token = {
        id: `t${Date.now()}`,
        bookingId,
        number: `${booking.crop.substring(0,3).toUpperCase()}-C01-${Math.floor(Math.random() * 1000)}`,
        status: "BOOKED",
        quality: null as any,
        weighment: null as any,
        payment: null as any,
        logistics: null as any
      };
      set((state: any) => ({ tokens: [...state.tokens, newToken] })); // Optimistic update
      const { error } = await supabase.from('tokens').insert([newToken]);
      if (error) console.error("Error inserting token:", error);
      return newToken;
    },

    allowEntry: async (tokenId) => {
      set((state: any) => ({
        tokens: state.tokens.map((t: any) => t.id === tokenId ? { ...t, status: 'ARRIVED' } : t)
      }));
      await supabase.from('tokens').update({ status: 'ARRIVED' }).eq('id', tokenId);
      await get().addAuditLog(tokenId, "Allowed entry at Gate");
    },

    checkIn: async (tokenId) => {
      const token = get().tokens.find(t => t.id === tokenId);
      if (!token) return;
      const booking = get().bookings.find(b => b.id === token.bookingId);
      const farmer = get().farmers.find(f => f.id === booking?.farmerId);
      
      const activeCounters = get().centres[0].counters.filter((c: any) => c.status === "ACTIVE").length || 1;
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

      set((state: any) => ({
        tokens: state.tokens.map((t: any) => t.id === tokenId ? { ...t, status: "WAITING", checkInTime: newQueueEntry.joinedAt } : t),
        queue: [...state.queue, newQueueEntry]
      }));

      await supabase.from('tokens').update({ status: 'WAITING', checkInTime: newQueueEntry.joinedAt }).eq('id', tokenId);
      await supabase.from('queue').insert([newQueueEntry]);
      await get().addAuditLog(tokenId, "Joined the queue");
    },

    updateCounterStatus: async (centreId, counterId, status) => {
      const centre = get().centres.find(c => c.id === centreId);
      if (!centre) return;
      
      const newCounters = centre.counters.map((cnt: any) => cnt.id === counterId ? { ...cnt, status } : cnt);
      
      set((state: any) => {
        const newCentres = state.centres.map((c: any) => c.id === centreId ? { ...c, counters: newCounters } : c);
        const activeCounters = newCounters.filter((c: any) => c.status === "ACTIVE").length || 1;
        const newQueue = state.queue.map((q: any) => {
          if (q.status === "WAITING") {
             return { ...q, estimatedWaitTime: Math.round((q.position * 8.4) / activeCounters) };
          }
          return q;
        });
        return { centres: newCentres, queue: newQueue };
      });

      await supabase.from('centres').update({ counters: newCounters }).eq('id', centreId);
      
      const activeCounters = newCounters.filter((c: any) => c.status === "ACTIVE").length || 1;
      const queueItems = get().queue;
      
      for (const q of queueItems) {
        if (q.status === "WAITING") {
          const newWaitTime = Math.round((q.position * 8.4) / activeCounters);
          if (newWaitTime !== q.estimatedWaitTime) {
             await supabase.from('queue').update({ estimatedWaitTime: newWaitTime }).eq('tokenId', q.tokenId);
          }
        }
      }
    },

    processNextInQueue: async (centreId) => {
      const queue = get().queue;
      const nextIdx = queue.findIndex(q => q.status === "WAITING");
      if (nextIdx === -1) return;

      const qItem = queue[nextIdx];
      const centre = get().centres.find(c => c.id === centreId) || get().centres[0];
      const activeCounters = centre.counters.filter((c: any) => c.status === "ACTIVE");
      const processingTokens = get().tokens.filter(t => t.status === "PROCESSING");

      // Find an active counter that doesn't currently have a processing token
      let availableCounter = activeCounters.find((c: any) => !processingTokens.some(t => t.counterId === c.id));
      if (!availableCounter) {
        availableCounter = activeCounters[0] || { id: "cnt1", name: "Counter 1" }; // Fallback
      }

      set((state: any) => {
        const newQueue = [...state.queue];
        newQueue[nextIdx] = { ...qItem, status: 'PROCESSING', position: 0, estimatedWaitTime: 0, assignedCounterId: availableCounter.id };
        for (let i = nextIdx + 1; i < newQueue.length; i++) {
          if (newQueue[i].status === "WAITING") {
            newQueue[i].position -= 1;
            newQueue[i].estimatedWaitTime = Math.round((newQueue[i].position * 8.4) / (activeCounters.length || 1));
          }
        }
        return {
          queue: newQueue,
          tokens: state.tokens.map((t: any) => t.id === qItem.tokenId ? { ...t, status: 'PROCESSING', counterId: availableCounter.id } : t)
        };
      });

      await supabase.from('queue').update({ status: 'PROCESSING', position: 0, estimatedWaitTime: 0, assignedCounterId: availableCounter.id }).eq('tokenId', qItem.tokenId);
      await supabase.from('tokens').update({ status: 'PROCESSING' }).eq('id', qItem.tokenId);

      for (let i = nextIdx + 1; i < queue.length; i++) {
        if (queue[i].status === "WAITING") {
          const newPos = queue[i].position - 1;
          const newWait = Math.round((newPos * 8.4) / (activeCounters.length || 1));
          await supabase.from('queue').update({ position: newPos, estimatedWaitTime: newWait }).eq('tokenId', queue[i].tokenId);
        }
      }
      
      await get().addAuditLog(qItem.tokenId, `Called to ${availableCounter.name || availableCounter.id}`);
    },

    sendToQC: async (tokenId) => {
      set((state: any) => ({
        tokens: state.tokens.map((t: any) => t.id === tokenId ? { ...t, status: 'READY_FOR_QC' } : t),
        queue: state.queue.map((q: any) => q.tokenId === tokenId ? { ...q, status: 'READY_FOR_QC' } : q)
      }));
      await supabase.from('tokens').update({ status: 'READY_FOR_QC' }).eq('id', tokenId);
      await supabase.from('queue').update({ status: 'READY_FOR_QC' }).eq('tokenId', tokenId);
      await get().addAuditLog(tokenId, "Sent to Quality Lab");
    },

    updateQuality: async (tokenId, moisture, grade, isAcceptable) => {
      const nextStatus = isAcceptable ? "QUALITY_CHECK" : "PROCUREMENT_REJECTED";
      set((state: any) => ({
        tokens: state.tokens.map((t: any) => t.id === tokenId ? { ...t, status: nextStatus, quality: { moisture, grade, isAcceptable } } : t),
        queue: state.queue.map((q: any) => q.tokenId === tokenId ? { ...q, status: nextStatus } : q)
      }));
      await supabase.from('tokens').update({ status: nextStatus, quality: { moisture, grade, isAcceptable } }).eq('id', tokenId);
      await supabase.from('queue').update({ status: nextStatus }).eq('tokenId', tokenId);
      await get().addAuditLog(tokenId, `Quality check completed. Moisture: ${moisture}%, Grade: ${grade}`);
    },

    updateWeighment: async (tokenId, gross, tare, mspRate) => {
      set((state: any) => ({
        tokens: state.tokens.map((t: any) => t.id === tokenId ? { ...t, status: 'WEIGHMENT', weighment: { grossWeight: gross, tareWeight: tare, netWeight: gross - tare, mspRate } } : t),
        queue: state.queue.map((q: any) => q.tokenId === tokenId ? { ...q, status: 'WEIGHMENT' } : q)
      }));
      await supabase.from('tokens').update({ status: 'WEIGHMENT', weighment: { grossWeight: gross, tareWeight: tare, netWeight: gross - tare, mspRate } }).eq('id', tokenId);
      await supabase.from('queue').update({ status: 'WEIGHMENT' }).eq('tokenId', tokenId);
      await get().addAuditLog(tokenId, `Weighment completed. Net: ${gross - tare}q`);
    },

    initiatePayment: async (tokenId) => {
      const token = get().tokens.find(t => t.id === tokenId);
      if (!token || !token.weighment) return;

      const netWeight = token.weighment.netWeight;
      const grossAmount = netWeight * token.weighment.mspRate;
      const moisture = token.quality?.moisture || 0;
      
      const deductions = [];
      if (moisture > 14) {
        const penaltyRate = (moisture - 14) * 0.01;
        deductions.push({ reason: `Moisture penalty (${moisture}%)`, amount: grossAmount * penaltyRate });
      }
      deductions.push({ reason: "Cleaning charges", amount: 200 });

      const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
      const paymentData = {
        grossAmount,
        deductions,
        netAmount: grossAmount - totalDeductions,
        status: "INITIATED"
      };

      set((state: any) => ({
        tokens: state.tokens.map((t: any) => t.id === tokenId ? { ...t, status: 'PAYMENT_INITIATED', payment: paymentData } : t),
        queue: state.queue.map((q: any) => q.tokenId === tokenId ? { ...q, status: 'PAYMENT_INITIATED' } : q)
      }));
      await supabase.from('tokens').update({ status: 'PAYMENT_INITIATED', payment: paymentData }).eq('id', tokenId);
      await supabase.from('queue').update({ status: 'PAYMENT_INITIATED' }).eq('tokenId', tokenId);
      await get().addAuditLog(tokenId, "Payment initiated");
    },

    completePayment: async (tokenId) => {
      const token = get().tokens.find(t => t.id === tokenId);
      if (!token || !token.payment) return;
      const paymentData = { ...token.payment, status: "COMPLETED", transactionId: `DBT-${Math.floor(Math.random()*1000000)}` };

      set((state: any) => ({
        tokens: state.tokens.map((t: any) => t.id === tokenId ? { ...t, status: 'PAYMENT_COMPLETED', payment: paymentData } : t),
        queue: state.queue.map((q: any) => q.tokenId === tokenId ? { ...q, status: 'PAYMENT_COMPLETED' } : q)
      }));
      await supabase.from('tokens').update({ status: 'PAYMENT_COMPLETED', payment: paymentData }).eq('id', tokenId);
      await supabase.from('queue').update({ status: 'PAYMENT_COMPLETED' }).eq('tokenId', tokenId);
      await get().addAuditLog(tokenId, "Payment completed successfully");
    },

    addAuditLog: async (tokenId, action) => {
      const newLog: AuditLogEntry = {
        id: `log${Date.now()}`,
        tokenId,
        timestamp: new Date().toISOString(),
        action,
        actorRole: get().currentRole,
        actorName: get().currentRole === "Farmer" ? "Farmer" : "System Operator"
      };
      set((state: any) => ({ auditLogs: [...state.auditLogs, newLog] }));
      await supabase.from('audit_logs').insert([newLog]);
    }
  }),
  {
    name: 'smart-mandi-storage',
    partialize: (state) => ({ 
      activeFarmerId: state.activeFarmerId,
      currentRole: state.currentRole,
      language: state.language
    })
  }
));
