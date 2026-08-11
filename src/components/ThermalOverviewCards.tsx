import React from 'react';
import { Cpu, Gamepad, Battery, Thermometer, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { TemperatureData, AppMode } from '../types';
import { formatTemp } from '../utils/simulation';

interface ThermalOverviewCardsProps {
  temps: TemperatureData;
  tempUnit: 'C' | 'F';
  mode: AppMode;
  highTempThreshold: number;
}

export const ThermalOverviewCards: React.FC<ThermalOverviewCardsProps> = ({
  temps,
  tempUnit,
  mode,
  highTempThreshold,
}) => {
  const getTempColor = (val: number) => {
    if (val >= highTempThreshold + 2) return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', bar: 'bg-gradient-to-r from-orange-500 to-red-500' };
    if (val >= highTempThreshold - 2) return { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', bar: 'bg-gradient-to-r from-amber-500 to-orange-500' };
    if (val >= 38) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', bar: 'bg-gradient-to-r from-yellow-500 to-amber-500' };
    return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', bar: 'bg-gradient-to-r from-cyan-500 to-emerald-500' };
  };

  const cpuStyle = getTempColor(temps.cpu);
  const gpuStyle = getTempColor(temps.gpu);
  const batStyle = getTempColor(temps.battery);

  // Core load simulation
  const cores = [
    { name: 'Cortex-X4 (Ultra Core)', temp: +(temps.cpu + 2.1).toFixed(1), load: mode === 'gaming' ? '92%' : '41%' },
    { name: 'Cortex-A720 (Performance Core)', temp: +(temps.cpu + 0.5).toFixed(1), load: mode === 'gaming' ? '85%' : '30%' },
    { name: 'Cortex-A520 (Efficiency Core)', temp: +(temps.cpu - 1.8).toFixed(1), load: mode === 'gaming' ? '64%' : '18%' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* CPU Temp Card */}
      <div className={`p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 relative overflow-hidden group ${
        mode === 'gaming' ? 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${cpuStyle.bg} ${cpuStyle.text}`}>
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">CPU Sıcaklığı</h3>
              <p className="text-[11px] text-slate-400">İşlemci Çekirdekleri</p>
            </div>
          </div>
          {temps.cpu >= highTempThreshold && (
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </div>

        <div className="flex items-baseline justify-between my-2">
          <span className={`text-3xl font-extrabold font-mono tracking-tight ${cpuStyle.text}`}>
            {formatTemp(temps.cpu, tempUnit)}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Eşik: {formatTemp(highTempThreshold, tempUnit)}
          </span>
        </div>

        {/* Temperature Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-3">
          <div
            className={`h-full transition-all duration-500 rounded-full ${cpuStyle.bar}`}
            style={{ width: `${Math.min(100, Math.max(10, (temps.cpu / 65) * 100))}%` }}
          />
        </div>

        {/* Micro Core breakdown */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          {cores.map((c, idx) => (
            <div key={idx} className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400 truncate max-w-[130px]">{c.name}</span>
              <span className="font-mono text-slate-300 font-medium">
                {formatTemp(c.temp, tempUnit)} <span className="text-slate-500">({c.load})</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* GPU Temp Card */}
      <div className={`p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 relative overflow-hidden group ${
        mode === 'gaming' ? 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${gpuStyle.bg} ${gpuStyle.text}`}>
              <Gamepad className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">GPU Sıcaklığı</h3>
              <p className="text-[11px] text-slate-400">Grafik İşlemci & NPU</p>
            </div>
          </div>
        </div>

        <div className="flex items-baseline justify-between my-2">
          <span className={`text-3xl font-extrabold font-mono tracking-tight ${gpuStyle.text}`}>
            {formatTemp(temps.gpu, tempUnit)}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Hotspot: {formatTemp(temps.hotspot, tempUnit)}
          </span>
        </div>

        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-3">
          <div
            className={`h-full transition-all duration-500 rounded-full ${gpuStyle.bar}`}
            style={{ width: `${Math.min(100, Math.max(10, (temps.gpu / 65) * 100))}%` }}
          />
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">Thermal Throttling Risk:</span>
          <span className={`font-semibold ${temps.gpu > 48 ? 'text-red-400 animate-pulse' : temps.gpu > 42 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {temps.gpu > 48 ? '%85 Yüksek' : temps.gpu > 42 ? '%30 Orta' : 'Yok (%0)'}
          </span>
        </div>
      </div>

      {/* Battery Temp Card */}
      <div className={`p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 relative overflow-hidden group ${
        mode === 'gaming' ? 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${batStyle.bg} ${batStyle.text}`}>
              <Battery className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Batarya Sıcaklığı</h3>
              <p className="text-[11px] text-slate-400">Pil Kimyası & Isısı</p>
            </div>
          </div>
        </div>

        <div className="flex items-baseline justify-between my-2">
          <span className={`text-3xl font-extrabold font-mono tracking-tight ${batStyle.text}`}>
            {formatTemp(temps.battery, tempUnit)}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {temps.battery > 43 ? 'Aşırı Isınmış' : 'Mükemmel Sağlık'}
          </span>
        </div>

        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-3">
          <div
            className={`h-full transition-all duration-500 rounded-full ${batStyle.bar}`}
            style={{ width: `${Math.min(100, Math.max(10, (temps.battery / 55) * 100))}%` }}
          />
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Güvenli Şarj Limiti:</span>
          <span className="font-mono text-slate-200 font-medium">Maks 45.0°C</span>
        </div>
      </div>

      {/* Hotspot & Ambient Temp Delta */}
      <div className={`p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 relative overflow-hidden group ${
        mode === 'gaming' ? 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Ortam & Sıcaklık Farkı</h3>
              <p className="text-[11px] text-slate-400">Isı Dağılım Delta (ΔT)</p>
            </div>
          </div>
        </div>

        <div className="flex items-baseline justify-between my-2">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-purple-400">
            +{(temps.cpu - temps.ambient).toFixed(1)}°C
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Ortam: {formatTemp(temps.ambient, tempUnit)}
          </span>
        </div>

        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-3">
          <div
            className="h-full transition-all duration-500 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
            style={{ width: `${Math.min(100, Math.max(15, ((temps.cpu - temps.ambient) / 30) * 100))}%` }}
          />
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Isı Dağılım Hızı:</span>
          <span className="font-medium text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Normal
          </span>
        </div>
      </div>

    </div>
  );
};
