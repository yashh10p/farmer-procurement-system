import { useAppStore } from "@/store";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, Circle, Truck, Receipt, Info, ChevronRight, AlertTriangle } from "lucide-react";

export function ProcurementJourney() {
  const tokens = useAppStore((state) => state.tokens);
  const activeFarmerId = useAppStore((state) => state.activeFarmerId);
  const bookings = useAppStore((state) => state.bookings);

  // Find the latest token that belongs to this specific farmer
  const myBookingIds = bookings.filter(b => b.farmerId === activeFarmerId).map(b => b.id);
  const myTokens = tokens.filter(t => myBookingIds.includes(t.bookingId));
  const latestToken = myTokens[myTokens.length - 1];

  if (!latestToken) {
    return (
      <div className="flex flex-col h-full bg-slate-50 p-6 pt-20 justify-center items-center text-center">
        <Receipt className="w-16 h-16 text-slate-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-700">No Procurement Record</h3>
        <p className="text-slate-500">You do not have any active procurement.</p>
      </div>
    );
  }

  const statusOrder = [
    "BOOKED", "ARRIVED", "CHECKED_IN", "WAITING", "PROCESSING", 
    "QUALITY_CHECK", "WEIGHMENT", "PROCUREMENT_ACCEPTED", "PAYMENT_INITIATED", "PAYMENT_COMPLETED", "TRANSPORTING", "COMPLETED"
  ];

  const currentIdx = statusOrder.indexOf(latestToken.status);
  
  const getStatusIcon = (status: string) => {
    const idx = statusOrder.indexOf(status);
    if (idx < currentIdx) return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
    if (idx === currentIdx) return <CheckCircle2 className="w-6 h-6 text-blue-500" />;
    return <Circle className="w-6 h-6 text-slate-300" />;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-emerald-700 text-white p-6 pt-16 pb-8 shadow-md">
        <h2 className="text-2xl font-bold">My Procurement</h2>
        <p className="text-emerald-100 text-sm opacity-90">Token {latestToken.number}</p>
      </header>

      <div className="flex-1 p-4 space-y-4 pb-12">
        
        {/* Timeline */}
        <Card className="p-6 rounded-2xl shadow-lg border-0 bg-white/90 backdrop-blur animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="font-bold text-slate-800 mb-4">Journey</h3>
          <div className="space-y-4 relative">
            <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-slate-100 z-0"></div>
            
            {[
              { id: "BOOKED", label: "Booked" },
              { id: "CHECKED_IN", label: "Checked In" },
              { id: "QUALITY_CHECK", label: "Quality Checked" },
              { id: "WEIGHMENT", label: "Weighment Done" },
              { id: "PAYMENT_COMPLETED", label: "Payment Completed" },
            ].map((step, i) => {
              const stepIdx = statusOrder.indexOf(step.id);
              const isActive = stepIdx === currentIdx;
              const isPast = stepIdx < currentIdx;
              const isFuture = stepIdx > currentIdx;
              
              return (
                <div key={step.id} className="flex items-center gap-4 relative z-10">
                  <div className="bg-white rounded-full">
                    {isPast ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : 
                     isActive ? <Circle className="w-6 h-6 text-blue-500 fill-blue-50" /> : 
                     <Circle className="w-6 h-6 text-slate-200" />}
                  </div>
                  <span className={`font-medium ${isPast ? 'text-slate-800' : isActive ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quality Section */}
        {latestToken.quality && (
          <Card className="p-0 overflow-hidden rounded-2xl shadow-sm border-0 bg-white">
            <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-center gap-2">
              <CheckCircle2 className="text-blue-600 w-5 h-5" />
              <h3 className="font-bold text-blue-900">QUALITY CHECK</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 font-medium">Moisture</p>
                <p className={`text-xl font-black ${latestToken.quality.moisture > 17 ? 'text-amber-500' : 'text-slate-800'}`}>
                  {latestToken.quality.moisture}%
                </p>
                {latestToken.quality.moisture > 17 && (
                  <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> High
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Grade</p>
                <p className="text-xl font-black text-slate-800">{latestToken.quality.grade}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Itemized Deduction Receipt */}
        {latestToken.payment && (
          <Card className="p-0 overflow-hidden rounded-2xl shadow-sm border-0 bg-white">
            <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Receipt className="text-emerald-600 w-5 h-5" />
                <h3 className="font-bold text-emerald-900">RECEIPT & PAYMENT</h3>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${latestToken.payment.status === 'COMPLETED' ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>
                {latestToken.payment.status}
              </span>
            </div>
            
            <div className="p-4 space-y-3 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Net Accepted Qty:</span>
                <span className="font-bold text-slate-800">{latestToken.weighment?.netWeight.toFixed(2)} q</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">MSP Rate:</span>
                <span className="font-bold text-slate-800">₹{latestToken.weighment?.mspRate.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-600">Gross Amount:</span>
                <span className="font-bold text-slate-800">₹{latestToken.payment.grossAmount.toLocaleString()}</span>
              </div>
              
              <div className="py-1">
                <p className="text-xs font-bold text-slate-400 mb-1">DEDUCTIONS</p>
                {latestToken.payment.deductions.map((d, i) => (
                  <div key={i} className="flex justify-between text-red-500">
                    <span className="flex items-center gap-1">
                      - {d.reason}
                      <Dialog>
                        <DialogTrigger className="bg-transparent border-none p-0 cursor-pointer">
                          <Info className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                        </DialogTrigger>
                        <DialogContent className="w-[90%] rounded-2xl">
                          <DialogHeader><DialogTitle>Why was this deducted?</DialogTitle></DialogHeader>
                          <p className="text-sm text-slate-600">
                            {d.reason.includes("Moisture") 
                              ? "The moisture content was above the standard 14%. A standard formula is applied to adjust for water weight." 
                              : "Standard mandal charges for cleaning and handling as per APMC rules."}
                          </p>
                        </DialogContent>
                      </Dialog>
                    </span>
                    <span>₹{d.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between border-t pt-3 mt-1">
                <span className="font-bold text-slate-800 text-base">FINAL PAYABLE:</span>
                <span className="font-black text-emerald-600 text-lg">₹{latestToken.payment.netAmount.toLocaleString()}</span>
              </div>
              
              {latestToken.payment.transactionId && (
                <div className="mt-4 bg-slate-50 p-2 rounded text-center text-xs text-slate-500">
                  DBT Ref: {latestToken.payment.transactionId}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Logistics */}
        {latestToken.status === "TRANSPORTING" || latestToken.status === "COMPLETED" ? (
          <Card className="p-4 rounded-2xl shadow-sm border-0 bg-slate-800 text-white flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">YOUR GRAIN IS SECURE</p>
              <h3 className="font-bold text-lg flex items-center gap-2 mt-1">
                <Truck className="w-5 h-5 text-blue-400" /> Transporting
              </h3>
              <p className="text-sm text-slate-300 mt-1">Truck MH-12-AB-1234 to FCI Pune</p>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-500" />
          </Card>
        ) : null}

      </div>
    </div>
  );
}
