import { useState } from "react";
import { useAppStore } from "@/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Search, ShieldCheck, UserCheck, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Helper to parse "10:00 AM" into minutes since midnight
function parseTime(timeStr: string) {
  const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let h = parseInt(match[1]);
  let m = parseInt(match[2]);
  const isPM = match[3].toUpperCase() === "PM";
  if (h === 12 && !isPM) h = 0;
  if (h !== 12 && isPM) h += 12;
  return h * 60 + m;
}

function checkTimeSlot(slot: string, current: string) {
  if (!current) return "VALID";
  const parts = slot.split("–").map(s => s.trim());
  if (parts.length !== 2) return "VALID";
  
  const startMins = parseTime(parts[0]);
  const endMins = parseTime(parts[1]);
  const currentMins = parseTime(current);
  
  if (currentMins < startMins) return "EARLY";
  if (currentMins > endMins) return "LATE";
  return "VALID";
}

export function GateGuardApp() {
  const store = useAppStore();
  const [tokenId, setTokenId] = useState("");
  const [scanned, setScanned] = useState(false);
  const [simulatedTime, setSimulatedTime] = useState<string>("");

  // Simple lookup
  const activeToken = store.tokens.find(t => t.number.includes(tokenId) && tokenId.length > 2);
  const booking = activeToken ? store.bookings.find(b => b.id === activeToken.bookingId) : null;
  const farmer = booking ? store.farmers.find(f => f.id === booking.farmerId) : null;

  const handleAllowEntry = async () => {
    if (activeToken) {
      await store.allowEntry(activeToken.id);
      setTokenId("");
      setScanned(false);
    }
  };

  const timeStatus = booking ? checkTimeSlot(booking.timeSlot, simulatedTime) : "VALID";
  const canEnter = activeToken?.status === "BOOKED" && timeStatus === "VALID";

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex justify-center">
      <div className="w-full max-w-md">
        
        {/* Testing Tool for Judges */}
        <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-xl p-4 shadow-sm">
          <Label className="text-amber-800 font-bold mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Simulate Current Time (For Demo)
          </Label>
          <select 
            className="w-full h-10 px-3 rounded-lg border border-amber-300 bg-white"
            value={simulatedTime}
            onChange={(e) => setSimulatedTime(e.target.value)}
          >
            <option value="">No enforcement (Ignore time)</option>
            <option value="09:30 AM">09:30 AM (Early for 10 AM slot)</option>
            <option value="10:30 AM">10:30 AM (On time for 10 AM slot)</option>
            <option value="11:30 AM">11:30 AM (Late for 10 AM slot)</option>
            <option value="02:30 PM">02:30 PM</option>
          </select>
        </div>

        <header className="mb-8 text-center">
          <div className="bg-slate-800 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Gate Verification</h1>
          <p className="text-slate-500">Mandi Centre A</p>
        </header>

        {!scanned ? (
          <Card className="p-8 bg-white/90 backdrop-blur border-0 shadow-xl rounded-2xl text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-48 h-48 border-4 border-dashed border-slate-200 rounded-2xl mx-auto mb-6 flex flex-col items-center justify-center text-slate-400 bg-slate-50 cursor-pointer hover:bg-slate-100 hover:scale-105 transition-all"
                 onClick={() => { 
                   // Mock scanning by finding the latest booked token for demo purposes
                   const bookedTokens = store.tokens.filter(t => t.status === "BOOKED");
                   const latestToken = bookedTokens[bookedTokens.length - 1];
                   if (latestToken && !tokenId) {
                     setTokenId(latestToken.number);
                   }
                   setScanned(true); 
                 }}>
              <QrCode className="w-16 h-16 mb-2" />
              <p className="font-bold">Tap to Scan QR</p>
            </div>
            
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-slate-500">OR ENTER TOKEN</span></div>
            </div>

            <div className="flex gap-2">
              <Input 
                placeholder="Token number" 
                className="h-14 text-lg bg-slate-50"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
              />
              <Button className="h-14 w-14 bg-blue-600 p-0" onClick={() => setScanned(true)}><Search className="w-6 h-6" /></Button>
            </div>
          </Card>
        ) : (
          <Card className="p-0 bg-white/95 backdrop-blur border-0 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {activeToken && farmer && booking ? (
              <>
                <div className={`${canEnter ? 'bg-emerald-500' : 'bg-red-500'} p-6 text-white text-center transition-colors`}>
                  {canEnter ? <UserCheck className="w-12 h-12 mx-auto mb-2" /> : <AlertTriangle className="w-12 h-12 mx-auto mb-2" />}
                  <h2 className="text-2xl font-bold">{canEnter ? 'Valid Token' : 'Cannot Enter'}</h2>
                  <p className="opacity-90">{activeToken.number}</p>
                </div>
                <div className="p-6 space-y-4">
                  
                  {timeStatus === "EARLY" && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm font-bold flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      Farmer arrived too early! Their slot is {booking.timeSlot}. Please ask them to wait outside.
                    </div>
                  )}

                  {timeStatus === "LATE" && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm font-bold flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      Farmer arrived too late! Their slot was {booking.timeSlot}. Entry denied.
                    </div>
                  )}

                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Farmer Name</span>
                    <span className="font-bold text-slate-800">{farmer.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Time Slot</span>
                    <span className="font-bold text-slate-800">{booking.timeSlot}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Crop</span>
                    <span className="font-bold text-slate-800">{booking.crop}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Status</span>
                    <Badge variant="outline">{activeToken.status}</Badge>
                  </div>

                  <Button 
                    className={`w-full h-14 text-lg mt-4 ${canEnter ? 'bg-slate-800 hover:bg-slate-900' : 'bg-slate-200 text-slate-500'}`}
                    disabled={!canEnter}
                    onClick={handleAllowEntry}
                  >
                    Allow Entry
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full text-slate-500"
                    onClick={() => { setScanned(false); setTokenId(""); }}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Token Not Found</h3>
                <p className="text-slate-500 mb-8">Please check the number and try again.</p>
                <Button 
                  className="w-full h-14 text-lg bg-slate-800 hover:bg-slate-900"
                  onClick={() => { setScanned(false); setTokenId(""); }}
                >
                  Try Again
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
