import { 
  Activity, 
  Server, 
  Database, 
  HardDrive, 
  Zap, 
  Globe, 
  CheckCircle2, 
  BarChart3,
  RefreshCcw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { cn } from '../../utils/cn';

export const HealthPage = () => {
  // Mock real-time data for charts
  const performanceData = [
    { time: '10:00', latency: 42, load: 24 },
    { time: '10:05', latency: 38, load: 28 },
    { time: '10:10', latency: 55, load: 35 },
    { time: '10:15', latency: 40, load: 30 },
    { time: '10:20', latency: 35, load: 22 },
    { time: '10:25', latency: 45, load: 26 },
  ];

  const regionalTraffic = [
    { region: 'Singapore', load: 45, color: 'bg-[#3b82f6]' },
    { region: 'Tokyo', load: 25, color: 'bg-[#10b981]' },
    { region: 'US-East', load: 15, color: 'bg-[#f59e0b]' },
    { region: 'London', load: 15, color: 'bg-[#8b5cf6]' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-display-lg font-bold text-white tracking-tight flex items-center gap-3">
            <Activity className="text-primary" size={32} />
            Real-time System Health
          </h1>
          <p className="text-on-surface/60">Live infrastructure performance and global edge status monitoring.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">All Systems Operational</span>
          </div>
          <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all border border-white/5" title="Refresh Metrics">
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      {/* Primary Infrastructure Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'API Server', status: 'Operational', value: '42ms', icon: Server, color: 'text-blue-400' },
          { label: 'Database (D1)', status: 'Operational', value: '12ms', icon: Database, color: 'text-emerald-400' },
          { label: 'Storage (R2)', status: 'Operational', value: '1.2 GB/s', icon: HardDrive, color: 'text-amber-400' },
          { label: 'Edge Cache', status: 'Operational', value: '94.2%', icon: Zap, color: 'text-purple-400' },
        ].map((s, i) => (
          <div key={i} className="glass p-6 rounded-3xl border border-white/5 hover:border-primary/20 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-3 rounded-2xl bg-white/5", s.color)}>
                <s.icon size={24} />
              </div>
              <CheckCircle2 size={16} className="text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest">{s.label}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{s.value}</span>
                <span className="text-[10px] font-bold text-on-surface/40 uppercase">Latency</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Graph */}
        <div className="lg:col-span-2 glass rounded-[32px] p-8 border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="text-primary" size={24} />
                Network Performance Trend
              </h2>
              <p className="text-[10px] text-on-surface/40 uppercase tracking-widest mt-1">Real-time latency and server load metrics</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-[10px] font-black rounded-lg bg-primary text-on-primary uppercase tracking-widest">Latency</button>
              <button className="px-3 py-1 text-[10px] font-black rounded-lg bg-white/5 text-on-surface/40 uppercase tracking-widest">Load</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="time" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}ms`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1C1E', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#3b82f6', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLatency)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="glass rounded-[32px] p-8 border border-white/5 flex flex-col">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-8">
            <Globe className="text-secondary" size={24} />
            Global Traffic
          </h2>
          <div className="flex-1 space-y-6">
            {regionalTraffic.map((r, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-on-surface/60">{r.region}</span>
                  <span className="text-white">{r.load}% Load</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      r.color,
                      r.region === 'Singapore' ? "w-[45%]" :
                      r.region === 'Tokyo' ? "w-[25%]" : "w-[15%]"
                    )}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest">Active Requests</span>
              <span className="text-sm font-mono text-white">1,245 / sec</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest">Edge Uptime</span>
              <span className="text-sm font-mono text-emerald-400">99.998%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
