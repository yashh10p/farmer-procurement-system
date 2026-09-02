import { Card } from "@/components/ui/card";
import { CalendarDays, Ticket, Package, Mic } from "lucide-react";

import { useAppStore } from "@/store";

interface FarmerHomeProps {
  onNavigate: (view: "BOOK" | "TOKEN" | "PROCUREMENT" | "VOICE" | "PROFILE") => void;
}

export function FarmerHome({ onNavigate }: FarmerHomeProps) {
  const activeFarmerId = useAppStore((state) => state.activeFarmerId);
  const farmers = useAppStore((state) => state.farmers);
  const activeFarmer = farmers.find(f => f.id === activeFarmerId);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-emerald-700 text-white p-6 shadow-md rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <h1 className="text-xl font-bold">Smart Procurement</h1>
          </div>
          <button 
            onClick={() => onNavigate("PROFILE")}
            className="text-xs bg-emerald-800 hover:bg-emerald-900 px-3 py-1 rounded-full border border-emerald-600"
          >
            Switch Profile
          </button>
        </div>
        <h2 className="text-4xl font-extrabold mb-1">नमस्कार, {activeFarmer?.name.split(" ")[0] || ""}!</h2>
        <p className="text-emerald-50 text-lg opacity-90">आप क्या करना चाहते हैं?</p>
        <p className="text-emerald-100 text-sm">What would you like to do?</p>
      </header>

      {/* Main Actions */}
      <div className="flex-1 p-4 grid grid-cols-1 gap-4 mt-2">
        <Card 
          className="flex items-center p-4 rounded-2xl shadow-sm border-emerald-100 bg-white hover:bg-emerald-50 transition-colors cursor-pointer"
          onClick={() => onNavigate("BOOK")}
        >
          <div className="bg-emerald-100 p-4 rounded-full mr-4 text-emerald-700">
            <CalendarDays size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">BOOK A SLOT</h3>
            <p className="text-slate-500 text-sm">Book your procurement date</p>
          </div>
        </Card>

        <Card 
          className="flex items-center p-4 rounded-2xl shadow-sm border-amber-100 bg-white hover:bg-amber-50 transition-colors cursor-pointer"
          onClick={() => onNavigate("TOKEN")}
        >
          <div className="bg-amber-100 p-4 rounded-full mr-4 text-amber-700">
            <Ticket size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">CHECK MY TOKEN</h3>
            <p className="text-slate-500 text-sm">See your live queue position</p>
          </div>
        </Card>

        <Card 
          className="flex items-center p-4 rounded-2xl shadow-sm border-blue-100 bg-white hover:bg-blue-50 transition-colors cursor-pointer"
          onClick={() => onNavigate("PROCUREMENT")}
        >
          <div className="bg-blue-100 p-4 rounded-full mr-4 text-blue-700">
            <Package size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">MY PROCUREMENT</h3>
            <p className="text-slate-500 text-sm">Check status & payment</p>
          </div>
        </Card>

        <Card 
          className="flex items-center p-4 rounded-2xl shadow-sm border-purple-100 bg-white hover:bg-purple-50 transition-colors cursor-pointer"
          onClick={() => onNavigate("VOICE")}
        >
          <div className="bg-purple-100 p-4 rounded-full mr-4 text-purple-700">
            <Mic size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">सुनें / Listen</h3>
            <p className="text-slate-500 text-sm">Use voice assistance</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
