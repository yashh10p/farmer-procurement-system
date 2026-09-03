"use client";

import { useState } from "react";
import { FarmerHome } from "./FarmerHome";
import { BookingFlow } from "./BookingFlow";
import { LiveQueue } from "./LiveQueue";
import { ProcurementJourney } from "./ProcurementJourney";
import { ProfileSetup } from "./ProfileSetup";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe2 } from "lucide-react";
import { useAppStore } from "@/store";
import { Card } from "@/components/ui/card";

type View = "LANGUAGE" | "HOME" | "PROFILE" | "BOOK" | "TOKEN" | "PROCUREMENT" | "VOICE";

export function FarmerApp() {
  const [currentView, setCurrentView] = useState<View>("LANGUAGE");
  const { activeFarmerId, language, setLanguage } = useAppStore();

  // Route logic
  if (!language && currentView !== "LANGUAGE") {
    setCurrentView("LANGUAGE");
  } else if (language && !activeFarmerId && currentView !== "PROFILE" && currentView !== "LANGUAGE") {
    setCurrentView("PROFILE");
  }

  const handleNavigate = (view: View) => {
    setCurrentView(view);
  };

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    if (activeFarmerId) {
      setCurrentView("HOME");
    } else {
      setCurrentView("PROFILE");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9f3] pb-24 mx-auto max-w-md shadow-2xl overflow-hidden relative">
      {currentView !== "HOME" && currentView !== "LANGUAGE" && (
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
        {currentView === "LANGUAGE" && (
          <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-emerald-100 p-6 rounded-full mb-8 text-emerald-700 shadow-inner">
              <Globe2 size={48} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">What language do you prefer?</h1>
            <p className="text-lg text-slate-500 mb-8">आप कौन सी भाषा पसंद करते हैं?</p>
            
            <div className="w-full space-y-3">
              {[
                { code: 'en', name: 'English', native: 'English' },
                { code: 'hi', name: 'Hindi', native: 'हिंदी' },
                { code: 'mr', name: 'Marathi', native: 'मराठी' },
                { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
                { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
                { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
              ].map(lang => (
                <Card 
                  key={lang.code}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
                  onClick={() => handleLanguageSelect(lang.code)}
                >
                  <span className="text-xl font-medium text-slate-800">{lang.native}</span>
                  <span className="text-sm text-slate-400">{lang.name}</span>
                </Card>
              ))}
            </div>
          </div>
        )}
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
