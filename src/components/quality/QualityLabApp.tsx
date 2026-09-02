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
  const [tokenIdInput, setTokenIdInput] = useState("");
  const [searchedTokenId, setSearchedTokenId] = useState("");
  const [moisture, setMoisture] = useState("");
  const [grade, setGrade] = useState("A");

  // In a real app we'd fetch this. Here we just find the token in store.
  const activeToken = store.tokens.find(t => t.number.includes(searchedTokenId) && searchedTokenId.length > 2);
  const queueEntry = activeToken ? store.queue.find(q => q.tokenId === activeToken.id) : null;

  const handleLookup = () => {
    setSearchedTokenId(tokenIdInput);
  };

  const handleQualitySubmit = () => {
    if (!activeToken) return;
    const m = parseFloat(moisture);
    const acceptable = m <= 17; // Demo threshold
    store.updateQuality(activeToken.id, m, grade, acceptable);
    setTokenIdInput("");
    setSearchedTokenId("");
    setMoisture("");
  };

  const handleWeighmentSubmit = () => {
    if (!activeToken || !queueEntry) return;
    const gross = queueEntry.quantity + 4.2; // random tare addition
    store.updateWeighment(activeToken.id, gross, 4.2, 2369);
    store.initiatePayment(activeToken.id);
    store.completePayment(activeToken.id);
    setTokenIdInput("");
    setSearchedTokenId("");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex justify-center">
      <div className="w-full max-w-2xl">
        <header className="mb-8 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-3 rounded-xl shadow">
            <FlaskConical className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Quality & Weighbridge Lab</h1>
            <p className="text-slate-500">Mandi Centre A</p>
          </div>
        </header>

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

        {activeToken && queueEntry && activeToken.status === "READY_FOR_QC" && (
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

        {activeToken && queueEntry && activeToken.status === "QUALITY_CHECK" && (
          <Card className="p-6 bg-white/95 backdrop-blur border-0 shadow-xl rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-start mb-6 border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Weighment</h2>
                <p className="text-slate-500">Token: {activeToken.number} • Est Qty: {queueEntry.quantity}q</p>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">QC Passed</Badge>
            </div>
            
            <div className="bg-slate-800 text-white p-6 rounded-xl text-center mb-6">
              <p className="text-sm text-slate-400 font-medium mb-1">CONNECTED WEIGHBRIDGE 01 🟢</p>
              <h3 className="text-5xl font-black font-mono">
                {(queueEntry.quantity + 4.2).toFixed(2)} <span className="text-2xl text-slate-400">q</span>
              </h3>
              <p className="text-sm mt-2 text-slate-400">Stable reading</p>
            </div>

            <Button 
              className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
              onClick={handleWeighmentSubmit}
            >
              <Scale className="w-5 h-5 mr-2" /> Record Weight & Generate Bill
            </Button>
          </Card>
        )}

        {activeToken && activeToken.status !== "READY_FOR_QC" && activeToken.status !== "QUALITY_CHECK" && (
          <Card className="p-8 text-center bg-white/90 backdrop-blur border-0 shadow-lg rounded-xl animate-in zoom-in-95 duration-300">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">Token Not Ready</h3>
            <p className="text-slate-500 mt-2">
              Token <span className="font-bold">{activeToken.number}</span> is currently in <Badge variant="outline" className="ml-1 uppercase">{activeToken.status}</Badge> state.
            </p>
            <p className="text-slate-500 mt-2 text-sm">
              The Centre Manager needs to "Send to Lab" from the queue before this token can proceed to Quality Check.
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
