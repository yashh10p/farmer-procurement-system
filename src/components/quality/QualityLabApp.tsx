import { useState } from "react";
import { useAppStore } from "@/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Search, CheckCircle2, AlertTriangle, Scale } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function QualityLabApp() {
  const store = useAppStore();
  const [activeStation, setActiveStation] = useState<"QUALITY" | "WEIGHBRIDGE">("QUALITY");
  const [tokenIdInput, setTokenIdInput] = useState("");
  const [searchedTokenId, setSearchedTokenId] = useState("");
  const [moisture, setMoisture] = useState("");
  const [grade, setGrade] = useState("A");
  const [grossWeight, setGrossWeight] = useState("");
  const [tareWeight, setTareWeight] = useState("");

  // In a real app we'd fetch this. Here we just find the token in store.
  const activeToken = store.tokens.find(t => t.number.includes(searchedTokenId) && searchedTokenId.length > 2);
  const queueEntry = activeToken ? store.queue.find(q => q.tokenId === activeToken.id) : null;

  const handleLookup = () => {
    setSearchedTokenId(tokenIdInput);
  };

  const handleQualitySubmit = async () => {
    if (!activeToken) return;
    const m = parseFloat(moisture);
    const acceptable = m <= 17; // Demo threshold
    await store.updateQuality(activeToken.id, m, grade, acceptable);
    setTokenIdInput("");
    setSearchedTokenId("");
    setMoisture("");
  };

  const handleWeighmentSubmit = async () => {
    if (!activeToken || !grossWeight || !tareWeight) return;
    const gross = parseFloat(grossWeight);
    const tare = parseFloat(tareWeight);
    if (isNaN(gross) || isNaN(tare) || gross <= tare) return;
    
    await store.updateWeighment(activeToken.id, gross, tare, 2369);
    await store.initiatePayment(activeToken.id);
    await store.completePayment(activeToken.id);
    setTokenIdInput("");
    setSearchedTokenId("");
    setGrossWeight("");
    setTareWeight("");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex justify-center">
      <div className="w-full max-w-2xl">
        <header className="mb-8 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-3 rounded-xl shadow">
            {activeStation === "QUALITY" ? <FlaskConical className="w-8 h-8" /> : <Scale className="w-8 h-8" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {activeStation === "QUALITY" ? "Quality Lab Station" : "Weighbridge Station"}
            </h1>
            <p className="text-slate-500">Mandi Centre A</p>
          </div>
        </header>

        <div className="flex bg-slate-200/50 p-1 rounded-xl mb-6">
          <button 
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeStation === "QUALITY" ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:bg-slate-200'}`}
            onClick={() => { setActiveStation("QUALITY"); setSearchedTokenId(""); setTokenIdInput(""); }}
          >
            Quality Testing
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeStation === "WEIGHBRIDGE" ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:bg-slate-200'}`}
            onClick={() => { setActiveStation("WEIGHBRIDGE"); setSearchedTokenId(""); setTokenIdInput(""); }}
          >
            Weighbridge
          </button>
        </div>

        <Card className="p-6 bg-white/90 backdrop-blur border-0 shadow-lg rounded-xl mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <Label htmlFor="token" className="text-sm font-bold text-slate-700">Scan or Enter Token Number</Label>
          <div className="flex gap-4 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input 
                id="token"
                placeholder="e.g. 238" 
                className="pl-10 h-12 text-lg bg-slate-50" 
                value={tokenIdInput}
                onChange={(e) => setTokenIdInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              />
            </div>
            <Button className="h-12 px-8 bg-slate-800" onClick={handleLookup}>Lookup</Button>
          </div>
        </Card>

        {/* QUALITY STATION VIEW */}
        {activeStation === "QUALITY" && activeToken && queueEntry && activeToken.status === "READY_FOR_QC" && (
          <Card className="p-6 bg-white/95 backdrop-blur border-0 shadow-xl rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Farmer: {queueEntry.farmerName}</h2>
                <p className="text-slate-500">Token: {activeToken.number} • Crop: {queueEntry.crop}</p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Ready for QC</Badge>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-sm font-bold text-slate-700">Moisture Content (%)</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  className="h-12 text-lg mt-2 w-1/2" 
                  value={moisture}
                  onChange={(e) => setMoisture(e.target.value)}
                  placeholder="e.g. 14.5"
                />
                {parseFloat(moisture) > 17 && (
                  <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> High moisture detected. Deduction will apply.
                  </p>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-bold text-slate-700">Grade</Label>
                <div className="flex gap-3 mt-2">
                  {["A", "B", "C", "REJECT"].map(g => (
                    <Button 
                      key={g} 
                      variant={grade === g ? "default" : "outline"}
                      onClick={() => setGrade(g)}
                      className={grade === g ? (g === "REJECT" ? "bg-red-600" : "bg-emerald-600") : ""}
                    >
                      Grade {g}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 mt-4"
                disabled={!moisture}
                onClick={handleQualitySubmit}
              >
                <CheckCircle2 className="w-5 h-5 mr-2" /> Complete Quality Check
              </Button>
            </div>
          </Card>
        )}

        {/* WEIGHBRIDGE STATION VIEW */}
        {activeStation === "WEIGHBRIDGE" && activeToken && queueEntry && activeToken.status === "QUALITY_CHECK" && (
          <Card className="p-6 bg-white/95 backdrop-blur border-0 shadow-xl rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-start mb-6 border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Weighment</h2>
                <p className="text-slate-500">Token: {activeToken.number} • Est Qty: {queueEntry.quantity}q</p>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">QC Passed</Badge>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <Label className="text-sm font-bold text-slate-700">Gross Weight (Loaded Truck) in quintals</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  className="h-12 text-lg mt-2 bg-white" 
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                  placeholder="e.g. 54.20"
                />
              </div>
              <div>
                <Label className="text-sm font-bold text-slate-700">Tare Weight (Empty Truck) in quintals</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  className="h-12 text-lg mt-2 bg-white" 
                  value={tareWeight}
                  onChange={(e) => setTareWeight(e.target.value)}
                  placeholder="e.g. 4.20"
                />
              </div>
              {grossWeight && tareWeight && parseFloat(grossWeight) > parseFloat(tareWeight) && (
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex justify-between items-center border border-emerald-200">
                  <span className="font-medium">Net Weight:</span>
                  <span className="text-xl font-bold">{(parseFloat(grossWeight) - parseFloat(tareWeight)).toFixed(2)} q</span>
                </div>
              )}
            </div>

            <Button 
              className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
              disabled={!grossWeight || !tareWeight || parseFloat(grossWeight) <= parseFloat(tareWeight)}
              onClick={handleWeighmentSubmit}
            >
              <Scale className="w-5 h-5 mr-2" /> Record Weight & Generate Bill
            </Button>
          </Card>
        )}

        {activeToken && activeStation === "QUALITY" && activeToken.status !== "READY_FOR_QC" && (
          <Card className="p-8 text-center bg-white/90 backdrop-blur border-0 shadow-lg rounded-xl animate-in zoom-in-95 duration-300">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">Not Ready for Quality Check</h3>
            <p className="text-slate-500 mt-2">
              Token <span className="font-bold">{activeToken.number}</span> is currently in <Badge variant="outline" className="ml-1 uppercase">{activeToken.status}</Badge> state.
            </p>
            <p className="text-slate-500 mt-2 text-sm">
              The Centre Manager needs to "Send to Lab" from the queue first.
            </p>
          </Card>
        )}

        {activeToken && activeStation === "WEIGHBRIDGE" && activeToken.status !== "QUALITY_CHECK" && (
          <Card className="p-8 text-center bg-white/90 backdrop-blur border-0 shadow-lg rounded-xl animate-in zoom-in-95 duration-300">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">Not Ready for Weighment</h3>
            <p className="text-slate-500 mt-2">
              Token <span className="font-bold">{activeToken.number}</span> is currently in <Badge variant="outline" className="ml-1 uppercase">{activeToken.status}</Badge> state.
            </p>
            <p className="text-slate-500 mt-2 text-sm">
              This token must pass Quality Check before weighment.
            </p>
          </Card>
        )}

        {!activeToken && searchedTokenId.length > 2 && (
           <div className="text-center p-8 text-slate-500">
             Token not found in system.
           </div>
        )}
      </div>
    </div>
  );
}
