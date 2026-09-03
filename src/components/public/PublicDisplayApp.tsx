import { useAppStore } from "@/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volume2, MonitorPlay, Clock, Users, ShieldCheck, Banknote } from "lucide-react";
import { useEffect, useState } from "react";

export function PublicDisplayApp() {
  const store = useAppStore();
  const centreId = "c1"; // Hardcoded to Centre A for demo

  // Auto-scroll / rotate effect (optional visual polish for digital signage)
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const centre = store.centres.find(c => c.id === centreId);
  if (!centre) return <div>Centre not found</div>;

  const todayTokens = store.tokens.filter(t => {
    const booking = store.bookings.find(b => b.id === t.bookingId);
    return booking?.centreId === centreId;
  });

  // Group tokens by status
  const waitingTokens = todayTokens.filter(t => t.status === "WAITING");
  const processingTokens = todayTokens.filter(t => t.status === "PROCESSING");
  const qcTokens = todayTokens.filter(t => t.status === "READY_FOR_QC" || t.status === "QUALITY_CHECK");
  const paymentTokens = todayTokens.filter(t => t.status === "PAYMENT_INITIATED" || t.status === "PAYMENT_COMPLETED");

  const getFarmerName = (tokenId: string) => {
    const t = store.tokens.find(tk => tk.id === tokenId);
    const b = store.bookings.find(bk => bk.id === t?.bookingId);
    const f = store.farmers.find(fm => fm.id === b?.farmerId);
    return f ? f.name : "Unknown";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-6 flex justify-between items-center shadow-xl z-10 relative">
        <div className="flex items-center gap-4">
          <MonitorPlay className="w-10 h-10 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{centre.name}</h1>
            <p className="text-slate-400 font-medium">Smart Mandi Live Display Queue</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl text-blue-400 font-bold border border-slate-700">
            <Volume2 className="w-5 h-5" /> Audio Announcements ON
          </div>
          <div className="text-2xl font-bold tracking-wider text-slate-200">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left Column - Active Processing */}
        <div className="col-span-8 flex flex-col gap-6">
          
          {/* Currently Processing Counters */}
          <Card className="flex-1 bg-slate-900 border-slate-800 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
            <div className="bg-blue-600 p-4">
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <Users className="w-6 h-6" /> 
                Now Serving at Counters
              </h2>
            </div>
            <div className="flex-1 p-6 grid grid-cols-2 gap-4 auto-rows-fr">
              {centre.counters.filter(c => c.status === "ACTIVE").map(counter => {
                const activeToken = processingTokens.find(t => t.counterId === counter.id);
                return (
                  <div key={counter.id} className="bg-slate-950 rounded-xl border border-slate-800 p-6 flex flex-col justify-center items-center relative overflow-hidden">
                    <div className="absolute top-4 left-4 text-slate-400 font-bold uppercase">{counter.name}</div>
                    {activeToken ? (
                      <>
                        <div className="text-6xl font-black text-amber-400 tracking-tight mt-4 animate-pulse">
                          {activeToken.number}
                        </div>
                        <div className="mt-4 text-xl text-slate-300 font-medium bg-slate-800/50 px-4 py-2 rounded-lg backdrop-blur">
                          {getFarmerName(activeToken.id)}
                        </div>
                      </>
                    ) : (
                      <div className="text-3xl font-bold text-slate-600 mt-4 tracking-widest uppercase">
                        Available
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Next in Queue */}
          <Card className="h-1/3 bg-slate-900 border-slate-800 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-800 p-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-5 h-5" /> 
                Waiting Queue
              </h2>
            </div>
            <div className="flex-1 p-6 flex flex-wrap gap-4 content-start overflow-hidden relative">
              {waitingTokens.length === 0 ? (
                <div className="text-slate-500 font-medium text-lg flex w-full h-full items-center justify-center">No farmers waiting</div>
              ) : (
                waitingTokens.slice(0, 15).map(token => (
                  <div key={token.id} className="bg-slate-950 border border-slate-700 px-6 py-3 rounded-lg text-2xl font-bold text-slate-200 shadow-md">
                    {token.number}
                  </div>
                ))
              )}
              {waitingTokens.length > 15 && (
                <div className="absolute bottom-4 right-6 text-slate-400 font-bold">
                  + {waitingTokens.length - 15} more...
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Status Tracking */}
        <div className="col-span-4 flex flex-col gap-6">
          
          {/* Quality Check Queue */}
          <Card className="flex-1 bg-slate-900 border-slate-800 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
            <div className="bg-emerald-600 p-4">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> 
                Quality Lab & Weighment
              </h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {qcTokens.length === 0 ? (
                <div className="text-slate-500 text-center mt-10">Queue Empty</div>
              ) : (
                qcTokens.map(token => (
                  <div key={token.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-xl font-bold text-emerald-400">{token.number}</div>
                      <div className="text-sm text-slate-400">{getFarmerName(token.id)}</div>
                    </div>
                    <Badge variant={token.status === "QUALITY_CHECK" ? "default" : "outline"} className={token.status === "QUALITY_CHECK" ? "bg-emerald-500 animate-pulse" : "border-emerald-500 text-emerald-500"}>
                      {token.status === "READY_FOR_QC" ? "Waiting QC" : "In Progress"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Payment Status */}
          <Card className="flex-1 bg-slate-900 border-slate-800 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
            <div className="bg-purple-600 p-4">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Banknote className="w-5 h-5" /> 
                Payment Status
              </h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {paymentTokens.length === 0 ? (
                <div className="text-slate-500 text-center mt-10">No recent payments</div>
              ) : (
                paymentTokens.map(token => (
                  <div key={token.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-xl font-bold text-purple-400">{token.number}</div>
                      <div className="text-sm text-slate-400">{getFarmerName(token.id)}</div>
                    </div>
                    <Badge variant="outline" className={token.status === "PAYMENT_COMPLETED" ? "border-green-500 text-green-500" : "border-purple-500 text-purple-500"}>
                      {token.status === "PAYMENT_COMPLETED" ? "Settled" : "Processing"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>
      </div>
      
      {/* Ticker / Marquee at bottom */}
      <div className="bg-blue-600 text-white font-medium py-3 px-6 whitespace-nowrap overflow-hidden flex shadow-[0_-4px_20px_rgba(37,99,235,0.2)]">
        <div className="animate-[marquee_20s_linear_infinite] flex gap-12">
          <span>* Farmers must carry their valid Token SMS and Aadhaar Card to the counters.</span>
          <span>* Average estimated waiting time is currently 12 minutes.</span>
          <span>* Please ensure crop bags are standard 50kg for faster weighment.</span>
          <span>* Minimum Support Price (MSP) for Wheat is ₹2275/quintal.</span>
          <span>* Farmers must carry their valid Token SMS and Aadhaar Card to the counters.</span>
        </div>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
