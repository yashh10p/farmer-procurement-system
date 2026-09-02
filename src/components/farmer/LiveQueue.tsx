import { useState, useEffect } from "react";
import { useAppStore } from "@/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Ticket, Users, Clock, PlayCircle, Info, RefreshCw } from "lucide-react";

export function LiveQueue() {
  const tokens = useAppStore((state) => state.tokens);
  const queue = useAppStore((state) => state.queue);
  const centres = useAppStore((state) => state.centres);
  const checkIn = useAppStore((state) => state.checkIn);
  const activeFarmerId = useAppStore((state) => state.activeFarmerId);
  const bookings = useAppStore((state) => state.bookings);

  // Find the latest token that belongs to this specific farmer
  const myBookingIds = bookings.filter(b => b.farmerId === activeFarmerId).map(b => b.id);
  const myTokens = tokens.filter(t => myBookingIds.includes(t.bookingId));
  const latestToken = myTokens[myTokens.length - 1];
  
  const queueEntry = queue.find(q => q.tokenId === latestToken?.id);
  const activeCounters = centres[0]?.counters.filter(c => c.status === "ACTIVE").length || 1;

  // Queue visual representation
  const getQueueVisual = () => {
    const currentlyServing = queue.filter(q => q.status === "PROCESSING").map(q => q.tokenId.split('-').pop());
    
    if (!queueEntry) return [];
    
    // Simulate the visual list around the user's position
    const currentNumStr = latestToken.number.split('-').pop();
    const currentNum = currentNumStr ? parseInt(currentNumStr) : 0;
    
    let visual = [];
    if (currentlyServing.length > 0) {
      visual.push({ type: "serving", text: `Now Serving ${currentlyServing.join(", ")}` });
    }
    visual.push({ type: "arrow", text: "↓" });
    
    for (let i = queueEntry.position - 3; i < queueEntry.position; i++) {
      if (i > 0) {
        visual.push({ type: "waiting", text: (currentNum - (queueEntry.position - i)).toString() });
      }
    }
    
    visual.push({ type: "you", text: `YOU → ${currentNum}` });
    
    for (let i = queueEntry.position + 1; i <= queueEntry.position + 2; i++) {
       visual.push({ type: "waiting", text: (currentNum + (i - queueEntry.position)).toString() });
    }
    
    return visual;
  };

  if (!latestToken) {
    return (
      <div className="flex flex-col h-full bg-slate-50 p-6 pt-20 justify-center items-center text-center">
        <Ticket className="w-16 h-16 text-slate-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-700">No Active Token</h3>
        <p className="text-slate-500">Please book a slot to get a token.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-emerald-700 text-white p-6 pt-16 pb-12 rounded-b-3xl shadow-lg relative">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider mb-1">Your Token</p>
            <h2 className="text-4xl font-black flex items-center gap-3">
              <Ticket className="w-8 h-8 opacity-80" />
              {latestToken.number.split('-').pop()}
            </h2>
            <p className="text-emerald-200 text-xs mt-2 font-mono">{latestToken.number}</p>
          </div>
          
          <div className="flex items-center gap-1 bg-emerald-800/50 px-3 py-1.5 rounded-full border border-emerald-600/50">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-50">LIVE</span>
          </div>
        </div>
      </header>

      <div className="px-4 -mt-6 flex-1 overflow-y-auto pb-8">
        
        {latestToken.status === "BOOKED" ? (
          <Card className="p-6 rounded-2xl shadow-lg border-0 bg-white text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Proceed to Gate</h3>
            <p className="text-slate-500 mb-6">Show your token/QR to the Guard at the Mandi gate to enter.</p>
          </Card>
        ) : latestToken.status === "ARRIVED" ? (
          <Card className="p-6 rounded-2xl shadow-lg border-0 bg-white text-center animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold text-slate-800 mb-2">You are inside</h3>
            <p className="text-slate-500 mb-6">Please check in to join the live processing queue.</p>
            <Button 
              className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
              onClick={() => checkIn(latestToken.id)}
            >
              I have arrived (Join Queue)
            </Button>
          </Card>
        ) : latestToken.status === "WAITING" && queueEntry ? (
          <div className="space-y-4">
            
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 rounded-2xl shadow-sm border-0 bg-white flex flex-col justify-center items-center">
                <Users className="w-6 h-6 text-blue-500 mb-2" />
                <p className="text-sm text-slate-500 font-medium">Position</p>
                <p className="text-2xl font-black text-slate-800">#{queueEntry.position}</p>
                <p className="text-xs text-slate-400 mt-1">{queueEntry.position - 1} ahead</p>
              </Card>

              <Card className="p-4 rounded-2xl shadow-sm border-0 bg-white flex flex-col justify-center items-center">
                <Clock className="w-6 h-6 text-amber-500 mb-2" />
                <p className="text-sm text-slate-500 font-medium">Est. Wait</p>
                <p className="text-2xl font-black text-slate-800">{queueEntry.estimatedWaitTime} <span className="text-sm font-normal text-slate-500">min</span></p>
                
                <Dialog>
                  <DialogTrigger className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-none p-0">
                      <Info className="w-3 h-3" /> Why this time?
                  </DialogTrigger>
                  <DialogContent className="w-[90%] rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>Wait Time Explanation</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-slate-600 space-y-3">
                      <p>Your estimated wait is <strong>{queueEntry.estimatedWaitTime} minutes</strong>.</p>
                      <p>This is calculated in real-time based on:</p>
                      <ul className="list-disc pl-5 space-y-1 font-medium text-slate-700">
                        <li>{activeCounters} active processing counters</li>
                        <li>{queueEntry.position - 1} farmers ahead of you</li>
                        <li>Average processing speed of 8.4 mins</li>
                      </ul>
                      <p className="text-xs text-slate-500 mt-4 italic">
                        If a counter is paused, your time will automatically increase.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>

              </Card>
            </div>

            <Card className="p-6 rounded-2xl shadow-sm border-0 bg-white">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 text-center">Live Queue</h3>
              
              <div className="flex flex-col items-center space-y-2 font-mono text-lg">
                {getQueueVisual().map((item, idx) => (
                  <div key={idx} className={`
                    ${item.type === 'serving' ? 'text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-lg' : ''}
                    ${item.type === 'arrow' ? 'text-slate-300 py-1' : ''}
                    ${item.type === 'waiting' ? 'text-slate-400' : ''}
                    ${item.type === 'you' ? 'text-white bg-blue-600 px-6 py-2 rounded-xl font-bold shadow-md transform scale-110 my-2' : ''}
                  `}>
                    {item.text}
                  </div>
                ))}
              </div>
            </Card>

            <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-2 mt-4">
              <RefreshCw className="w-3 h-3 animate-spin-slow" />
              Auto-updating via live connection
            </div>
            
          </div>
        ) : (
          <Card className="p-8 rounded-2xl shadow-sm border-0 bg-white text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlayCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">It's Your Turn!</h3>
            <p className="text-slate-500">Please proceed to your assigned counter.</p>
            <p className="text-lg font-bold text-blue-700 mt-4">Status: {latestToken.status.replace('_', ' ')}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
