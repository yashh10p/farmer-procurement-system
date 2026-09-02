"use client";

import { useState } from "react";
import { FarmerHome } from "./FarmerHome";
import { BookingFlow } from "./BookingFlow";
import { LiveQueue } from "./LiveQueue";
import { ProcurementJourney } from "./ProcurementJourney";
import { ProfileSetup } from "./ProfileSetup";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAppStore } from "@/store";

type View = "HOME" | "PROFILE" | "BOOK" | "TOKEN" | "PROCUREMENT" | "VOICE";

export function FarmerApp() {
  const [currentView, setCurrentView] = useState<View>("HOME");
  const activeFarmerId = useAppStore((state) => state.activeFarmerId);

  // If no profile is active, force to profile setup
  if (!activeFarmerId && currentView !== "PROFILE") {
    setCurrentView("PROFILE");
  }

  const handleNavigate = (view: View) => {
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-[#f7f9f3] pb-24 mx-auto max-w-md shadow-2xl overflow-hidden relative">
      {currentView !== "HOME" && (
        <div className="absolute top-4 left-4 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-white/50 backdrop-blur rounded-full shadow-sm hover:bg-white"
            onClick={() => setCurrentView("HOME")}
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </Button>
        </div>
      )}

      <div className="animate-in slide-in-from-right-4 fade-in duration-300">
        {currentView === "HOME" && <FarmerHome onNavigate={handleNavigate} />}
        {currentView === "PROFILE" && <ProfileSetup onComplete={() => setCurrentView("BOOK")} />}
        {currentView === "BOOK" && <BookingFlow onComplete={() => setCurrentView("TOKEN")} />}
        {currentView === "TOKEN" && <LiveQueue />}
        {currentView === "PROCUREMENT" && <ProcurementJourney />}
        {currentView === "VOICE" && (
          <div className="p-12 text-center pt-32">
            <h2 className="text-2xl font-bold mb-4">Voice Assistant</h2>
            <p className="text-slate-500 mb-8">Coming soon in Phase 7...</p>
          </div>
        )}
      </div>
    </div>
  );
}
