import { useAppStore } from "@/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Clock, PackageCheck, AlertCircle, Play, Pause, ChevronRight, Sparkles } from "lucide-react";

export function CentreDashboard() {
  const store = useAppStore();
  const centre = store.centres[0];
  const queue = store.queue;

  const activeCountersCount = centre.counters.filter(c => c.status === "ACTIVE").length || 1;
  const totalCountersCount = centre.counters.length;
  const pendingCount = queue.filter(q => q.status === "WAITING").length;
  const processingCount = queue.filter(q => q.status === "PROCESSING").length;
  
  const dynamicVariance = pendingCount * 0.15; // Adds a slight fluctuation based on queue congestion
  const avgServiceTime = (centre.baseProcessingSpeed * (totalCountersCount / activeCountersCount) + dynamicVariance).toFixed(1);
  const procuredToday = store.tokens.reduce((acc, t) => acc + (t.weighment?.netWeight || 0), 0);
  
  const isCongested = pendingCount > 2;
  const inactiveCounter = centre.counters.find(c => c.status !== "ACTIVE");
  
  const handleToggleCounter = (counterId: string, isActive: boolean) => {
    store.updateCounterStatus(centre.id, counterId, isActive ? "ACTIVE" : "PAUSED");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Operations Command</h1>
          <p className="text-slate-500">{centre.name}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="bg-white border-slate-200">
            <AlertCircle className="w-4 h-4 mr-2 text-amber-500" /> View Alerts
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50" 
            onClick={() => store.processNextInQueue(centre.id)}
            disabled={pendingCount === 0}
          >
            <Play className="w-4 h-4 mr-2" /> Call Next Farmer
          </Button>
        </div>
      </header>

      {/* Top Metrics */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <Card className="p-4 bg-white border-0 shadow-sm rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Users size={20} /></div>
            <p className="text-sm font-medium text-slate-500">Live Queue</p>
          </div>
          <h3 className="text-3xl font-black text-slate-800">{pendingCount + processingCount}</h3>
          <p className="text-xs text-slate-400 mt-1">{pendingCount} waiting</p>
        </Card>

        <Card className="p-4 bg-white border-0 shadow-sm rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><Play size={20} /></div>
            <p className="text-sm font-medium text-slate-500">Active Counters</p>
          </div>
          <h3 className="text-3xl font-black text-slate-800">{activeCountersCount} <span className="text-xl text-slate-400 font-normal">/ {totalCountersCount}</span></h3>
          <p className="text-xs text-slate-400 mt-1">Capacity operating</p>
        </Card>

        <Card className="p-4 bg-white border-0 shadow-sm rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><Clock size={20} /></div>
            <p className="text-sm font-medium text-slate-500">Avg Service Time</p>
          </div>
          <h3 className="text-3xl font-black text-slate-800">{avgServiceTime} <span className="text-xl text-slate-400 font-normal">min</span></h3>
          <p className="text-xs text-slate-400 mt-1">Based on active counters</p>
        </Card>

        <Card className="p-4 bg-white border-0 shadow-sm rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><PackageCheck size={20} /></div>
            <p className="text-sm font-medium text-slate-500">Procured Today</p>
          </div>
          <h3 className="text-3xl font-black text-slate-800">{procuredToday.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-xl text-slate-400 font-normal">q</span></h3>
          <p className="text-xs text-slate-400 mt-1">Updated in real-time</p>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-8">
        
        {/* Left Column: Queue Table */}
        <div className="col-span-2 space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
          <Card className="bg-white/90 backdrop-blur border-0 shadow-lg rounded-xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Live Queue & Operations</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="w-[100px]">Token</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Crop (Qty)</TableHead>
                  <TableHead>Wait</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.map((q) => (
                  <TableRow key={q.tokenId}>
                    <TableCell className="font-mono font-medium text-slate-700">{q.tokenId.split('-').pop()}</TableCell>
                    <TableCell className="font-medium text-slate-800">{q.farmerName}</TableCell>
                    <TableCell className="text-slate-600">{q.crop} ({q.quantity}q)</TableCell>
                    <TableCell>
                      {q.status === "WAITING" ? `${q.estimatedWaitTime}m` : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`
                        ${q.status === 'WAITING' ? 'bg-amber-100 text-amber-700 border-amber-200' : ''}
                        ${q.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
                        ${q.status === 'READY_FOR_QC' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : ''}
                        ${q.status === 'QUALITY_CHECK' || q.status === 'WEIGHMENT' ? 'bg-purple-100 text-purple-700 border-purple-200' : ''}
                        ${q.status.includes('PAYMENT') ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}
                        ${!['WAITING', 'PROCESSING', 'READY_FOR_QC', 'QUALITY_CHECK', 'WEIGHMENT'].includes(q.status) && !q.status.includes('PAYMENT') ? 'bg-slate-100 text-slate-700 border-slate-200' : ''}
                      `}>
                        {q.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {q.status === "WAITING" && (
                        <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50" onClick={() => store.processNextInQueue(centre.id)}>
                          Call Next
                        </Button>
                      )}
                      {q.status === "PROCESSING" && (
                        <Button size="sm" variant="ghost" className="text-emerald-600 hover:bg-emerald-50" onClick={() => store.sendToQC(q.tokenId)}>
                          Send to Lab
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {queue.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      Queue is currently empty
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Right Column: Counters & Capacity */}
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <Card className="bg-white/90 backdrop-blur border-0 shadow-lg rounded-xl overflow-hidden">
            <div className="p-4 border-b bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Processing Counters</h3>
              <p className="text-xs text-slate-500 mt-1">Toggling a counter automatically recalculates queue ETA for all waiting farmers.</p>
            </div>
            <div className="p-4 space-y-4">
              {centre.counters.map(counter => (
                <div key={counter.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${counter.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    <div>
                      <p className="font-medium text-slate-800">{counter.name}</p>
                      <p className="text-xs text-slate-500">{counter.status}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={counter.status === "ACTIVE"}
                    onCheckedChange={(c) => handleToggleCounter(counter.id, c)}
                    disabled={counter.status === "OFFLINE"}
                  />
                </div>
              ))}
            </div>
          </Card>

          {isCongested && inactiveCounter ? (
            <Card className="bg-amber-50 border-2 border-amber-200 shadow-sm rounded-xl p-4">
              <div className="flex gap-2 items-start text-amber-800 mb-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <h4 className="font-bold">AI Congestion Alert</h4>
              </div>
              <p className="text-sm text-amber-900 mb-3">
                Wait times are increasing due to high traffic. Turn on {inactiveCounter.name} to maintain &lt;30m ETA.
              </p>
              <Button 
                size="sm" 
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => handleToggleCounter(inactiveCounter.id, true)}
              >
                Activate {inactiveCounter.name}
              </Button>
            </Card>
          ) : (
            <Card className="bg-emerald-50 border-2 border-emerald-200 shadow-sm rounded-xl p-4">
              <div className="flex gap-2 items-start text-emerald-800 mb-2">
                <Sparkles className="w-5 h-5 shrink-0" />
                <h4 className="font-bold">AI Status: Optimal</h4>
              </div>
              <p className="text-sm text-emerald-900">
                Queue is processing smoothly. Active capacity is sufficient for current traffic.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
