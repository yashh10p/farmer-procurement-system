import { useState } from "react";
import { useAppStore } from "@/store";
import { Crop } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Bot, MapPin, Calendar, Clock, ChevronRight } from "lucide-react";

interface BookingFlowProps {
  onComplete: () => void;
}

export function BookingFlow({ onComplete }: BookingFlowProps) {
  const [step, setStep] = useState(1);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [estimatedQuantity, setEstimatedQuantity] = useState<number | "">("");
  const [selectedCentre, setSelectedCentre] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("2026-09-10");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const activeFarmerId = useAppStore((state) => state.activeFarmerId);
  const farmers = useAppStore((state) => state.farmers);
  const farmer = farmers.find(f => f.id === activeFarmerId);
  const centres = useAppStore((state) => state.centres);
  const bookSlot = useAppStore((state) => state.bookSlot);
  const generateToken = useAppStore((state) => state.generateToken);

  const crops: Crop[] = ["Paddy", "Wheat", "Maize", "Chana", "Mustard", "Cotton", "Potato", "Onion"];

  const handleConfirm = () => {
    if (!selectedCrop || !selectedCentre || !selectedSlot || !estimatedQuantity || !farmer) return;
    const booking = bookSlot({
      farmerId: farmer.id,
      centreId: selectedCentre,
      crop: selectedCrop,
      date: selectedDate,
      timeSlot: selectedSlot,
      estimatedQuantity: estimatedQuantity as number
    });
    generateToken(booking.id);
    onComplete();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-emerald-700 text-white p-6 pb-8 pt-16 shadow-md">
        <h2 className="text-2xl font-bold">Book a Slot</h2>
        <p className="text-emerald-100 text-sm opacity-90">Step {step} of 5</p>
      </header>

      <div className="flex-1 p-4 -mt-4">
        {step === 1 && (
          <Card className="p-6 rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Select Crop</h3>
            <p className="text-slate-500 text-sm mb-6">Which crop are you selling?</p>
            <div className="grid grid-cols-2 gap-3">
              {crops.map((crop) => (
                <Button
                  key={crop}
                  variant={selectedCrop === crop ? "default" : "outline"}
                  className={`h-16 text-lg rounded-xl ${selectedCrop === crop ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-emerald-200 text-slate-700 hover:bg-emerald-50'}`}
                  onClick={() => setSelectedCrop(crop)}
                >
                  {crop}
                </Button>
              ))}
            </div>
            <Button 
              className="w-full mt-8 h-14 text-lg bg-slate-800 hover:bg-slate-900 rounded-xl"
              disabled={!selectedCrop}
              onClick={() => setStep(2)}
            >
              Continue <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-6 rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Enter Crop Details</h3>
            
            <div className="space-y-4">
              <Label className="text-slate-600">Estimated Quantity (Quintals)</Label>
              <Input 
                type="number"
                placeholder="e.g. 42"
                className="h-14 text-lg bg-slate-50"
                value={estimatedQuantity}
                onChange={(e) => setEstimatedQuantity(Number(e.target.value) || "")}
              />
            </div>

            <Button 
              className="w-full mt-8 h-14 text-lg bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              disabled={!estimatedQuantity}
              onClick={() => setStep(3)}
            >
              Find Centres <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Card>
        )}

        {step === 3 && (
          <Card className="p-0 overflow-hidden rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-6 border-b bg-emerald-700 text-white">
              <h3 className="text-xl font-bold">Select Mandi Centre</h3>
            </div>
            <div className="p-4 space-y-3 bg-slate-50">
              {centres.map((c, idx) => (
                <div 
                  key={c.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedCentre === c.id ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-slate-200 bg-white hover:border-emerald-300'}`}
                  onClick={() => setSelectedCentre(c.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="text-emerald-600 w-5 h-5" />
                      <h4 className="font-bold text-lg text-slate-800">{c.name}</h4>
                    </div>
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      {c.distance}
                    </Badge>
                  </div>
                  {idx === 0 && (
                     <div className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-200/50 px-2 py-1 rounded">
                       <Bot className="w-3 h-3" /> AI RECOMMENDED
                     </div>
                  )}
                  <div className="ml-7 space-y-1">
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> LOW CONGESTION
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t">
              <Button 
                className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                disabled={!selectedCentre}
                onClick={() => setStep(4)}
              >
                Select Time Slot <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="p-6 rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Select a Time Slot</h3>
              <div className="space-y-3">
                {["10:00 AM – 11:00 AM", "11:00 AM – 12:00 PM", "02:00 PM – 03:00 PM"].map((slot, idx) => (
                  <Button 
                    key={slot}
                    variant={selectedSlot === slot ? "default" : "outline"} 
                    className={`w-full justify-between h-14 rounded-xl border-slate-200 text-slate-700 ${selectedSlot === slot ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'hover:bg-slate-50'}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <span className="flex items-center gap-2">
                      {idx === 0 && <Bot className={`w-4 h-4 ${selectedSlot === slot ? 'text-emerald-200' : 'text-emerald-500'}`} />} 
                      {slot}
                    </span>
                    {idx === 0 ? (
                      <span className={`text-xs px-2 py-1 rounded ${selectedSlot === slot ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'}`}>Recommended</span>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded ${selectedSlot === slot ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}>Available</span>
                    )}
                  </Button>
                ))}
              </div>

              <Button 
                className="w-full mt-8 h-14 text-lg bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
                disabled={!selectedSlot}
                onClick={() => setStep(5)}
              >
                Confirm Details <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Card>
          </div>
        )}

        {step === 5 && (
          <Card className="p-6 rounded-2xl shadow-lg border-0 text-center bg-white/80 backdrop-blur animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Almost Done!</h3>
            <p className="text-slate-500 mb-8">Please confirm your booking details.</p>
            
            <div className="bg-slate-50 rounded-xl p-4 text-left space-y-3 mb-8">
              <div className="flex justify-between items-center border-b pb-2 border-slate-200">
                <span className="text-slate-500">Centre</span>
                <span className="font-bold text-slate-800">{centres.find(c => c.id === selectedCentre)?.name}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2 border-slate-200">
                <span className="text-slate-500">Date</span>
                <span className="font-bold text-slate-800">10 September 2026</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-slate-200">
                <span className="text-slate-500">Time</span>
                <span className="font-bold text-slate-800">{selectedSlot}</span>
              </div>
            </div>

            <Button 
              className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
              onClick={handleConfirm}
            >
              Confirm Booking
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
