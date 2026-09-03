import { Card } from "@/components/ui/card";
import { CalendarDays, Ticket, Package, Mic } from "lucide-react";

import { useAppStore } from "@/store";
import { useTranslation } from "@/lib/translations";

interface FarmerHomeProps {
  onNavigate: (view: "BOOK" | "TOKEN" | "PROCUREMENT" | "VOICE" | "PROFILE") => void;
}

export function FarmerHome({ onNavigate }: FarmerHomeProps) {
  const activeFarmerId = useAppStore((state) => state.activeFarmerId);
  const language = useAppStore((state) => state.language);
  const t = useTranslation(language);
  const farmers = useAppStore((state) => state.farmers);
  const activeFarmer = farmers.find(f => f.id === activeFarmerId);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-emerald-700 text-white p-6 shadow-md rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <h1 className="text-xl font-bold">{t('smartProcurement')}</h1>
          </div>
          <button 
            onClick={() => onNavigate("PROFILE")}
            className="text-xs bg-emerald-800 hover:bg-emerald-900 px-3 py-1 rounded-full border border-emerald-600"
          >
            {t('switchProfile')}
          </button>
        </div>
        <h2 className="text-4xl font-extrabold mb-1">{t('greeting')}, {activeFarmer?.name.split(" ")[0] || ""}!</h2>
        <p className="text-emerald-50 text-lg opacity-90">{t('whatToDo')}</p>
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
            <h3 className="text-xl font-bold text-slate-800">{t('bookSlotTitle')}</h3>
            <p className="text-slate-500 text-sm">{t('bookSlotDesc')}</p>
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
            <h3 className="text-xl font-bold text-slate-800">{t('checkTokenTitle')}</h3>
            <p className="text-slate-500 text-sm">{t('checkTokenDesc')}</p>
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
            <h3 className="text-xl font-bold text-slate-800">{t('myProcurementTitle')}</h3>
            <p className="text-slate-500 text-sm">{t('myProcurementDesc')}</p>
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
            <h3 className="text-xl font-bold text-slate-800">{t('voiceTitle')}</h3>
            <p className="text-slate-500 text-sm">{t('voiceDesc')}</p>
          </div>
        </Card>

        <Card 
          className="flex items-center p-4 rounded-2xl shadow-sm border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
          onClick={() => onNavigate("SMS")}
        >
          <div className="bg-slate-200 p-4 rounded-full mr-4 text-slate-700">
            <Ticket size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">SMS Booking Demo</h3>
            <p className="text-slate-500 text-sm">Book without internet via text message</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
