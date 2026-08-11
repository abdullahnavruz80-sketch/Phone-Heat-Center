import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Monitor, Gauge, Flame, AlertTriangle, RefreshCw, Zap, ShieldAlert } from 'lucide-react';
import { PerformanceData, AppMode } from '../types';

interface FpsMonitorProps {
  perf: PerformanceData;
  cpuTemp: number;
  gpuTemp: number;
  mode: AppMode;
  onRefreshRateChange: (hz: number) => void;
}

export const FpsMonitor: React.FC<FpsMonitorProps> = ({
  perf,
  cpuTemp,
  gpuTemp,
  mode,
  onRefreshRateChange,
}) => {
  // Real RAF frame rate counter for true browser frame measurement
  const [realBrowserFps, setRealBrowserFps] = useState(60);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let animId: number;

    const calcFps = (time: number) => {
      frameCountRef.current++;
      const delta = time - lastTimeRef.current;

      if (delta >= 1000) {
        const measured = Math.round((frameCountRef.current * 1000) / delta);
        setRealBrowserFps(measured);
        frameCountRef.current = 0;
        lastTimeRef.current = time;
      }

      animId = requestAnimationFrame(calcFps);
    };

    animId = requestAnimationFrame(calcFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  const effectiveFps = Math.min(perf.refreshRate, Math.round((perf.fps + realBrowserFps) / 2));
  const isThrottling = cpuTemp > 47 || gpuTemp > 49;

  return (
    <div className={`p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
      mode === 'gaming'
        ? 'bg-slate-900/90 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)]'
        : 'bg-slate-900/60 border-slate-800'
    }`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Gamepad2 className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">Gaming FPS & Sistem Performansı</h3>
              {mode === 'gaming' && (
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Gaming Mode Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Anlık Kare Hızı, Dokunma Tepki Süresi & Ekran Hızı</p>
          </div>
        </div>

        {/* Refresh Rate Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 px-2 font-medium hidden md:inline">Ekran Hızı:</span>
          {[60, 90, 120, 144].map((hz) => (
            <button
              key={hz}
              onClick={() => onRefreshRateChange(hz)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                perf.refreshRate === hz
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {hz}Hz
            </button>
          ))}
        </div>
      </div>

      {/* Main Display Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Large FPS Meter */}
        <div className="sm:col-span-1 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Oyun İçi FPS</span>
            <Monitor className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                isThrottling ? 'text-amber-400 animate-pulse' : 'text-cyan-400'
              }`}>
                {effectiveFps}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                / {perf.refreshRate} Max
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Kare Zamanı Delta: <span className="font-mono text-slate-200">{(1000 / Math.max(1, effectiveFps)).toFixed(1)} ms</span>
            </div>
          </div>

          {/* Throttling Warning Banner */}
          {isThrottling ? (
            <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Sıcaklıktan dolayı FPS düşüş riski var!</span>
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>Kare Hızı Kararlı & Ultra Akıcı</span>
            </div>
          )}
        </div>

        {/* Load & Latency Metrics */}
        <div className="sm:col-span-2 grid grid-cols-2 gap-3">
          
          {/* GPU Load */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>GPU Yükü</span>
              <span className="font-mono text-cyan-400 font-bold">%{perf.gpuLoad}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300"
                style={{ width: `${perf.gpuLoad}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500">
              GPU Sıcaklığı: <span className="text-slate-300 font-mono">{gpuTemp.toFixed(1)}°C</span>
            </div>
          </div>

          {/* CPU Load */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>CPU Yükü</span>
              <span className="font-mono text-purple-400 font-bold">%{perf.cpuLoad}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full transition-all duration-300"
                style={{ width: `${perf.cpuLoad}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500">
              CPU Sıcaklığı: <span className="text-slate-300 font-mono">{cpuTemp.toFixed(1)}°C</span>
            </div>
          </div>

          {/* Touch Latency */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Dokunma Gecikmesi</span>
              <span className="font-mono text-emerald-400 font-bold">{perf.touchLatencyMs} ms</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {perf.touchLatencyMs <= 10 ? 'Ultra Hızlı (1200Hz Sample)' : 'Standart (240Hz)'}
            </p>
          </div>

          {/* Network Ping */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Oyun Ping (MS)</span>
              <span className="font-mono text-blue-400 font-bold">{perf.pingMs} ms</span>
            </div>
            <p className="text-[11px] text-slate-500">
              5G Wi-Fi 6E Ağ Sunucusu
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
