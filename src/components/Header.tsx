import React from 'react';
import { Gamepad2, Smartphone, Leaf, Flame, Volume2, VolumeX, Settings, Zap, LayoutGrid, ShieldAlert } from 'lucide-react';
import { AppMode, ThermalLevel } from '../types';
import { soundEngine } from '../utils/audio';

interface HeaderProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  thermalLevel: ThermalLevel;
  maxTemp: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  tempUnit: 'C' | 'F';
  onToggleUnit: () => void;
  onOpenSettings: () => void;
  onQuickBoost: () => void;
  isBoosting: boolean;
  widgetEnabled: boolean;
  onToggleWidget: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  thermalLevel,
  maxTemp,
  soundEnabled,
  onToggleSound,
  tempUnit,
  onToggleUnit,
  onOpenSettings,
  onQuickBoost,
  isBoosting,
  widgetEnabled,
  onToggleWidget,
}) => {
  const getThermalBadge = () => {
    switch (thermalLevel) {
      case 'critical':
        return { text: '🚨 KRİTİK ISINMA', bg: 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse' };
      case 'hot':
        return { text: '🔥 YÜKSEK SICAKLIK', bg: 'bg-orange-500/20 text-orange-400 border-orange-500/50' };
      case 'warm':
        return { text: '⚠️ ILIK', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/50' };
      case 'normal':
      default:
        return { text: '❄️ NORMAL SICAKLIK', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' };
    }
  };

  const badge = getThermalBadge();

  return (
    <header className={`sticky top-0 z-30 backdrop-blur-xl border-b transition-colors duration-300 ${
      mode === 'gaming'
        ? 'bg-slate-950/90 border-cyan-500/30 text-slate-100 shadow-[0_4px_25px_rgba(6,182,212,0.15)]'
        : mode === 'eco'
        ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-50'
        : 'bg-slate-900/90 border-slate-800 text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo & Thermal Status */}
        <div className="flex items-center gap-3">
          <div className={`relative p-2 rounded-xl flex items-center justify-center transition-transform hover:scale-105 ${
            mode === 'gaming' ? 'bg-gradient-to-tr from-cyan-500 to-fuchsia-600 shadow-lg shadow-cyan-500/30' :
            mode === 'eco' ? 'bg-emerald-600' : 'bg-orange-500'
          }`}>
            <Flame className="w-6 h-6 text-white animate-bounce" />
            {thermalLevel === 'critical' && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Phone Heat
              </h1>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 hidden sm:inline-block">
                PRO V3.2
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Telefon Sıcaklık & Performans Takip Merkezi
            </p>
          </div>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-2xl border border-slate-700/60 shadow-inner">
          <button
            onClick={() => {
              soundEngine.playClick(900, 'sawtooth');
              onModeChange('gaming');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
              mode === 'gaming'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 font-semibold scale-105'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
            title="Gaming Mod: Maksimum Performans & 120Hz FPS"
          >
            <Gamepad2 className="w-4 h-4 text-cyan-300" />
            <span>Gaming</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick(700, 'sine');
              onModeChange('normal');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
              mode === 'normal'
                ? 'bg-slate-700 text-white shadow-md font-semibold scale-105'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
            title="Normal Mod: Günlük Dengeli Kullanım"
          >
            <Smartphone className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Normal</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick(500, 'sine');
              onModeChange('eco');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
              mode === 'eco'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-semibold scale-105'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
            title="Eco Mod: Düşük Sıcaklık & Maksimum Pil Ömrü"
          >
            <Leaf className="w-4 h-4 text-emerald-300" />
            <span>Eco</span>
          </button>
        </div>

        {/* Quick Actions & Utilities */}
        <div className="flex items-center gap-2">
          
          {/* Quick Boost Button */}
          <button
            onClick={onQuickBoost}
            disabled={isBoosting}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isBoosting
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
            }`}
            title="RAM Temizle & Soğutma Boost Yap"
          >
            <Zap className={`w-3.5 h-3.5 ${isBoosting ? 'animate-spin' : ''}`} />
            <span>{isBoosting ? 'Hızlandırılıyor...' : 'Quick Boost'}</span>
          </button>

          {/* Floating HUD Widget Toggle */}
          <button
            onClick={onToggleWidget}
            className={`p-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1 ${
              widgetEnabled
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={widgetEnabled ? 'Açık Üst Widget Devrede (Gizlemek için tıklayın)' : 'Sürekli Yüzen Widget Göster'}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden xl:inline">Widget</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title={soundEnabled ? 'Sesler Açık' : 'Sesler Kapalı'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* °C / °F Unit Toggle */}
          <button
            onClick={onToggleUnit}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
            title="Sıcaklık Birimi Değiştir (°C / °F)"
          >
            °{tempUnit}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Ayarlar & Alarm Eşik Muayenesi"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Mobile Status Bar Notice */}
      <div className="sm:hidden px-4 py-1 bg-slate-950/80 border-t border-slate-800/50 flex items-center justify-between text-[11px]">
        <div className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${badge.bg}`}>
          {badge.text}
        </div>
        <div className="text-slate-400 font-mono">
          En Yüksek: <span className="text-white font-bold">{maxTemp.toFixed(1)}°C</span>
        </div>
      </div>
    </header>
  );
};
