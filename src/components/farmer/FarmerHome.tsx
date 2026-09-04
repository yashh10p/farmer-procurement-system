import { Card } from "@/components/ui/card";
import { CalendarDays, Ticket, Package, Mic, Sprout, Clock, MapPin, ChevronRight, MessageSquare } from "lucide-react";
import { useAppStore } from "@/store";
import { useTranslation } from "@/lib/translations";

interface FarmerHomeProps {
  onNavigate: (view: "BOOK" | "TOKEN" | "PROCUREMENT" | "VOICE" | "PROFILE" | "SMS") => void;
}

export function FarmerHome({ onNavigate }: FarmerHomeProps) {
  const { activeFarmerId, language, farmers, bookings, tokens, queue, centres } = useAppStore();
  const t = useTranslation(language);
  const activeFarmer = farmers.find(f => f.id === activeFarmerId);

  // Derive "Today's Status" logic
  const farmerBookings = bookings.filter(b => b.farmerId === activeFarmerId);
  const latestBooking = farmerBookings[farmerBookings.length - 1];
  const activeToken = latestBooking ? tokens.find(t => t.bookingId === latestBooking.id) : null;
  const activeQueue = activeToken ? queue.find(q => q.tokenId === activeToken.id) : null;
  const activeCentre = latestBooking ? centres.find(c => c.id === latestBooking.centreId) : null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative">
      {/* Background Decorative Graphic */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 rounded-b-[40px] shadow-lg overflow-hidden pointer-events-none z-0">
        <Sprout className="absolute -bottom-6 -right-6 w-48 h-48 text-white opacity-5 rotate-12" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 pt-10 pb-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white/20">
            <Sprout className="w-5 h-5 text-emerald-100" />
            <span className="font-semibold text-emerald-50 tracking-wide text-sm uppercase">Smart Mandi</span>
          </div>
          <button 
            onClick={() => onNavigate("PROFILE")}
            className="text-xs bg-black/20 hover:bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 transition-colors font-medium flex items-center gap-2"
          >
            {t('switchProfile')}
          </button>
        </div>
        
        <div>
          <h1 className="text-3xl font-extrabold mb-1 drop-shadow-md">
            {t('greeting')} 👋
          </h1>
          <h2 className="text-xl font-bold mb-2 opacity-90">
            {activeFarmer?.name}
          </h2>
          <p className="text-emerald-100 text-sm font-medium leading-relaxed max-w-[280px]">
            {t('smartProcurement')}
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 px-4 pb-24 space-y-6">
        
        {/* Today's Status Card (Conditional) */}
        {latestBooking && (
          <Card className="p-5 rounded-3xl shadow-xl shadow-emerald-900/5 border-emerald-100 bg-white relative overflow-hidden -mt-2">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400" />
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Today's Status
              </h3>
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-md">
                {activeToken?.status || "BOOKED"}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mb-3 text-slate-700">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">{activeCentre?.name || "Mandi Centre"}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" /> Date & Time
                </div>
                <div className="font-bold text-slate-800 text-sm">{latestBooking.date}</div>
                <div className="font-bold text-emerald-700 text-sm">{latestBooking.timeSlot}</div>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                  <Ticket className="w-3 h-3" /> Token No
                </div>
                {activeToken ? (
                  <div className="font-black text-amber-600 text-lg">{activeToken.number}</div>
                ) : (
                  <div className="font-medium text-slate-400 text-sm italic">Not checked in</div>
                )}
              </div>
            </div>

            {activeQueue && (
              <div className="mt-3 bg-amber-50 p-3 rounded-2xl flex items-center justify-between border border-amber-100">
                <div>
                  <div className="text-xs text-amber-700 font-medium mb-1">Queue Position</div>
                  <div className="font-black text-amber-900 text-xl">#{activeQueue.position}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-amber-700 font-medium mb-1">Wait Time</div>
                  <div className="font-bold text-amber-900 flex items-center justify-end gap-1">
                    <Clock className="w-4 h-4" />
                    {activeQueue.estimatedWaitTime} min
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Primary Actions */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 text-lg px-1">{t('whatToDo')}</h3>
          
          <Card 
            className="group flex items-center p-4 rounded-[24px] shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 border-transparent bg-white cursor-pointer relative overflow-hidden"
            onClick={() => onNavigate("BOOK")}
          >
            <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-4 rounded-2xl mr-4 text-emerald-700 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <CalendarDays size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-0.5">{t('bookSlotTitle')}</h3>
              <p className="text-slate-500 text-sm font-medium">{t('bookSlotDesc')}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors mr-2" />
          </Card>

          <Card 
            className="group flex items-center p-4 rounded-[24px] shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 border-transparent bg-white cursor-pointer relative overflow-hidden"
            onClick={() => onNavigate("TOKEN")}
          >
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-4 rounded-2xl mr-4 text-amber-700 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <Ticket size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-0.5">{t('checkTokenTitle')}</h3>
              <p className="text-slate-500 text-sm font-medium">{t('checkTokenDesc')}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 transition-colors mr-2" />
          </Card>

          <Card 
            className="group flex items-center p-4 rounded-[24px] shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 border-transparent bg-white cursor-pointer relative overflow-hidden"
            onClick={() => onNavigate("PROCUREMENT")}
          >
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl mr-4 text-blue-700 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <Package size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-0.5">{t('myProcurementTitle')}</h3>
              <p className="text-slate-500 text-sm font-medium">{t('myProcurementDesc')}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors mr-2" />
          </Card>
        </div>

        {/* Secondary Actions */}
        <div className="pt-4 border-t border-slate-200">
          <h3 className="font-bold text-slate-600 text-sm mb-3 uppercase tracking-wider px-1">Options</h3>
          <div className="grid grid-cols-2 gap-3">
            <Card 
              className="flex flex-col items-center justify-center p-4 rounded-[20px] shadow-sm border border-slate-200 bg-white hover:bg-purple-50 hover:border-purple-200 active:scale-95 transition-all cursor-pointer text-center"
              onClick={() => onNavigate("VOICE")}
            >
              <Mic className="w-6 h-6 text-purple-600 mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">{t('voiceTitle')}</h3>
            </Card>

            <Card 
              className="flex flex-col items-center justify-center p-4 rounded-[20px] shadow-sm border border-slate-200 bg-white hover:bg-slate-100 hover:border-slate-300 active:scale-95 transition-all cursor-pointer text-center"
              onClick={() => onNavigate("SMS")}
            >
              <MessageSquare className="w-6 h-6 text-slate-600 mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">SMS Demo</h3>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
