import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, AlertTriangle, Map, ShieldAlert, Sparkles, Building2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const forecastData = [
  { time: "06:00", farmers: 12 },
  { time: "08:00", farmers: 45 },
  { time: "09:00", farmers: 85 },
  { time: "10:00", farmers: 150 }, // Peak
  { time: "11:00", farmers: 142 },
  { time: "12:00", farmers: 90 },
  { time: "14:00", farmers: 40 },
  { time: "16:00", farmers: 25 },
];

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">District Command Centre</h1>
        <p className="text-slate-500">Pune District • 24 Mandis</p>
      </header>

      {/* Top Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="p-4 bg-white border-0 shadow-sm rounded-xl">
          <p className="text-sm font-medium text-slate-500">Total Procurement (Today)</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1">18,420 <span className="text-lg text-slate-400 font-normal">q</span></h3>
        </Card>
        <Card className="p-4 bg-white border-0 shadow-sm rounded-xl">
          <p className="text-sm font-medium text-slate-500">Payments Disbursed</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1">₹4.82 <span className="text-lg text-slate-400 font-normal">Cr</span></h3>
        </Card>
        <Card className="p-4 bg-white border-0 shadow-sm rounded-xl border-l-4 border-l-amber-500">
          <p className="text-sm font-medium text-slate-500">High Congestion Centres</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1">4 <span className="text-lg text-slate-400 font-normal">/ 24</span></h3>
        </Card>
        <Card className="p-4 bg-white border-0 shadow-sm rounded-xl border-l-4 border-l-red-500">
          <p className="text-sm font-medium text-slate-500">Active Anomalies</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1">2</h3>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Column: AI Forecast & Map */}
        <div className="col-span-2 space-y-6">
          <Card className="bg-white border-0 shadow-sm rounded-xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" /> 48-Hour Congestion Forecast
                </h3>
                <p className="text-sm text-slate-500">Predictive modelling based on bookings & historical arrivals</p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Live Model V2
              </Badge>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <ReferenceLine x="10:00" stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'top', value: 'PEAK EXPECTED', fill: '#f59e0b', fontSize: 12 }} />
                  <Line type="monotone" dataKey="farmers" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100 flex gap-4 items-start">
              <div className="bg-white p-2 rounded-lg shadow-sm text-indigo-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-indigo-900">AI Recommendation</h4>
                <p className="text-sm text-indigo-800 mt-1">Expected arrivals of 150+ at 10:00 will exceed capacity at Centre A & B.</p>
                <div className="mt-3 flex gap-3">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Reduce 10:00 slot capacity by 18%</Button>
                  <Button size="sm" variant="outline" className="text-indigo-700 border-indigo-200">View Details</Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-0 shadow-sm rounded-xl overflow-hidden">
             <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Map className="w-5 h-5 text-emerald-600" /> Mandi Status Map
              </h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="border rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" /> Centre A (Khed)
                  </h4>
                  <Badge className="bg-amber-100 text-amber-800 border-0 hover:bg-amber-100">MODERATE</Badge>
                </div>
                <p className="text-sm text-slate-500 mb-2">Queue: 42 • Active: 4/5</p>
                <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-amber-500 h-1.5 rounded-full w-[70%]"></div></div>
              </div>
              
              <div className="border rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" /> Centre B (Shirur)
                  </h4>
                  <Badge className="bg-red-100 text-red-800 border-0 hover:bg-red-100">HIGH</Badge>
                </div>
                <p className="text-sm text-slate-500 mb-2">Queue: 85 • Active: 3/5</p>
                <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-red-500 h-1.5 rounded-full w-[90%]"></div></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Alerts & Fraud */}
        <div className="space-y-6">
          <Card className="bg-white border-0 shadow-sm rounded-xl overflow-hidden h-full">
            <div className="p-4 border-b bg-red-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" /> AI Anomaly Alerts
              </h3>
            </div>
            <ScrollArea className="h-[600px] p-4">
              <div className="space-y-4">
                
                <div className="border border-red-200 bg-red-50 p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-red-700 border-red-200 bg-white font-bold">HIGH SEVERITY</Badge>
                    <span className="text-xs text-slate-500">10m ago</span>
                  </div>
                  <h4 className="font-bold text-red-900">Weight Discrepancy</h4>
                  <div className="mt-2 text-sm text-red-800 space-y-1">
                    <p>Token: WHT-C01-238</p>
                    <div className="flex justify-between bg-white/50 p-1 rounded">
                      <span>Gate declared:</span> <span className="font-medium">46.0 q</span>
                    </div>
                    <div className="flex justify-between bg-white/50 p-1 rounded">
                      <span>Weighbridge:</span> <span className="font-bold">51.8 q</span>
                    </div>
                    <p className="text-xs font-bold mt-2">Difference: +5.8 q (Requires Verification)</p>
                  </div>
                  <Button size="sm" variant="outline" className="mt-3 w-full border-red-200 text-red-700 bg-white">Audit Transaction</Button>
                </div>

                <div className="border border-amber-200 bg-amber-50 p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-amber-700 border-amber-200 bg-white font-bold">WARNING</Badge>
                    <span className="text-xs text-slate-500">1h ago</span>
                  </div>
                  <h4 className="font-bold text-amber-900">Possible Duplicate Booking</h4>
                  <div className="mt-2 text-sm text-amber-800 space-y-1">
                    <p>Same land registration reference used across:</p>
                    <ul className="list-disc pl-5 mt-1 font-medium">
                      <li>Centre A (10:00 AM)</li>
                      <li>Centre C (14:00 PM)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="border border-amber-200 bg-amber-50 p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-amber-700 border-amber-200 bg-white font-bold">SYSTEM</Badge>
                    <span className="text-xs text-slate-500">2h ago</span>
                  </div>
                  <h4 className="font-bold text-amber-900">Unusual Rejection Spike</h4>
                  <div className="mt-2 text-sm text-amber-800 space-y-1">
                    <p>Centre B</p>
                    <p>Normal rejection: 4-7%</p>
                    <p>Current: <span className="font-bold text-red-600">18%</span></p>
                    <p className="text-xs font-bold mt-2 text-amber-900">Flagged for audit.</p>
                  </div>
                </div>

              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}
