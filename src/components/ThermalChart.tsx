import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AreaChart as ChartIcon, Clock, Flame, Info } from 'lucide-react';
import { HistoricalHeatPoint, AppMode } from '../types';
import { formatTemp } from '../utils/simulation';

interface ThermalChartProps {
  history: HistoricalHeatPoint[];
  tempUnit: 'C' | 'F';
  mode: AppMode;
  highTempThreshold: number;
}

export const ThermalChart: React.FC<ThermalChartProps> = ({
  history,
  tempUnit,
  mode,
  highTempThreshold,
}) => {
  const [rangeFilter, setRangeFilter] = useState<'15m' | '30m' | '1h'>('1h');

  const filteredData = React.useMemo(() => {
    if (rangeFilter === '15m') return history.slice(-15);
    if (rangeFilter === '30m') return history.slice(-30);
    return history;
  }, [history, rangeFilter]);

  // Find max and min temperatures
  const maxCpu = Math.max(...filteredData.map(d => d.cpu));
  const maxGpu = Math.max(...filteredData.map(d => d.gpu));
  const maxBat = Math.max(...filteredData.map(d => d.battery));

  return (
    <div className={`p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
      mode === 'gaming' ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-900/60 border-slate-800'
    }`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <ChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">1 Saatlik Sıcaklık & Tüketim Grafiği</h3>
            <p className="text-xs text-slate-400">Zamansal Isı Eğrisi, Zirve Değerleri & Termal Kısıtlama Eşiği</p>
          </div>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-slate-400 ml-1.5 hidden sm:inline" />
          {(['15m', '30m', '1h'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRangeFilter(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                rangeFilter === r
                  ? 'bg-orange-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r === '15m' ? '15 Dk' : r === '30m' ? '30 Dk' : '1 Saat'}
            </button>
          ))}
        </div>
      </div>

      {/* Sensor Color Legend & Peaks */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 text-xs font-medium">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
            <span className="text-slate-300">CPU: <span className="font-mono text-red-400 font-bold">{formatTemp(maxCpu, tempUnit)} Peak</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block shadow-[0_0_8px_rgba(34,211,238,0.5)]"></span>
            <span className="text-slate-300">GPU: <span className="font-mono text-cyan-300 font-bold">{formatTemp(maxGpu, tempUnit)} Peak</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
            <span className="text-slate-300">Batarya: <span className="font-mono text-emerald-300 font-bold">{formatTemp(maxBat, tempUnit)} Peak</span></span>
          </div>
        </div>

        <div className="text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1">
          <Flame className="w-3.5 h-3.5" />
          <span>Kırmızı Çizgi: Termal Isınma Eşiği ({formatTemp(highTempThreshold, tempUnit)})</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="batteryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis domain={[20, 60]} stroke="#64748b" fontSize={11} tickLine={false} />
            
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-950/90 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1">
                      <p className="font-mono text-slate-400 border-b border-slate-800 pb-1 mb-1">{label}</p>
                      <p className="text-red-400 font-semibold font-mono">CPU: {formatTemp(payload[0]?.value as number, tempUnit)}</p>
                      <p className="text-cyan-300 font-semibold font-mono">GPU: {formatTemp(payload[1]?.value as number, tempUnit)}</p>
                      <p className="text-emerald-300 font-semibold font-mono">Batarya: {formatTemp(payload[2]?.value as number, tempUnit)}</p>
                      {payload[0] && (
                        <p className="text-amber-400 text-[10px] pt-1">
                          FPS: {filteredData.find(d => d.time === label)?.fps ?? 60} FPS | Power: {filteredData.find(d => d.time === label)?.watt ?? 12}W
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            <ReferenceLine y={highTempThreshold} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'UYARI EŞİĞİ', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} />

            <Area type="monotone" dataKey="cpu" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#cpuGradient)" />
            <Area type="monotone" dataKey="gpu" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#gpuGradient)" />
            <Area type="monotone" dataKey="battery" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#batteryGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
