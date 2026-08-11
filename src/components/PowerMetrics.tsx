import React from 'react';
import { Zap, Activity, BatteryCharging, ShieldCheck, Clock, Gauge } from 'lucide-react';
import { PowerData, AppMode } from '../types';

interface PowerMetricsProps {
  power: PowerData;
  mode: AppMode;
}

export const PowerMetrics: React.FC<PowerMetricsProps> = ({ power, mode }) => {
  return (
    <div className={`p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
      mode === 'gaming' ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-900/60 border-slate-800'
    }`}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Anlık Güç & Şarj Bilgileri</h3>
            <p className="text-xs text-slate-400">Watt, Volt, Amper Güç Akış Dinamikleri</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <BatteryCharging className="w-3.5 h-3.5 animate-bounce" />
            <span>{power.charging ? 'Hızlı Şarj Oluyor' : 'Pilden Harcanıyor'}</span>
          </span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Instant Wattage */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Anlık Güç</span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-400">
            {power.wattage.toFixed(1)} <span className="text-sm text-slate-400 font-normal">Watt</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Maksimum Destek: 67W Turbo
          </div>
        </div>

        {/* Voltage */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Gerilim (Volt)</span>
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-blue-400">
            {power.voltage.toFixed(2)} <span className="text-sm text-slate-400 font-normal">V</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Nominal Hücre Voltajı
          </div>
        </div>

        {/* Amperage */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Akım (Amper)</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-cyan-400">
            {power.amperage} <span className="text-sm text-slate-400 font-normal">mA</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {(power.amperage / 1000).toFixed(2)} Amper Akış
          </div>
        </div>

        {/* Battery Charge % */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Şarj Seviyesi</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">
            %{power.batteryLevel}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span className="truncate">{power.timeToFullOrEmpty}</span>
          </div>
        </div>

      </div>

      {/* Visual Power Gauge Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Şarj Tüketim Dengesi:</span>
          <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (power.wattage / 35) * 100)}%` }}
            />
          </div>
        </div>
        <div className="text-slate-400 font-mono text-[11px]">
          Sağlık Durumu: <span className="text-emerald-400 font-semibold">{power.batteryHealth}</span>
        </div>
      </div>

    </div>
  );
};
