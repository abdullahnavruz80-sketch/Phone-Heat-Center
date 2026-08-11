import React, { useState } from 'react';
import { Snowflake, CheckCircle2, Shield, Sun, Layers, WifiOff, Smartphone, BatteryCharging, Wind, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';

interface CoolingAssistantProps {
  cpuTemp: number;
  batteryTemp: number;
  onApplyCooling: (dropAmount: number) => void;
}

interface ActionItem {
  id: string;
  title: string;
  desc: string;
  impact: number;
  icon: React.ReactNode;
  applied: boolean;
}

export const CoolingAssistant: React.FC<CoolingAssistantProps> = ({
  cpuTemp,
  batteryTemp,
  onApplyCooling,
}) => {
  const [actions, setActions] = useState<ActionItem[]>([
    {
      id: 'brightness',
      title: 'Ekran Parlaklığını Otomatik Düşür',
      desc: 'Ekran paneli en çok ısı üreten bileşendir. Parlaklığı %50 seviyesine kısıtlar.',
      impact: 2.1,
      icon: <Sun className="w-4 h-4 text-amber-400" />,
      applied: false,
    },
    {
      id: 'background_apps',
      title: 'Arka Plan RAM & İşlemleri Temizle',
      desc: 'Sistemde gereksiz çalışan 14 arka plan uygulamasını sonlandırır.',
      impact: 3.5,
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
      applied: false,
    },
    {
      id: 'refresh_rate',
      title: 'Yenileme Hızını 60Hz\'e Düşür',
      desc: 'Ekran çipinin yüksek frekansta çalışmasını durdurup grafik birimini rahatlatır.',
      impact: 1.8,
      icon: <Wind className="w-4 h-4 text-blue-400" />,
      applied: false,
    },
    {
      id: 'radios',
      title: '5G / GPS / Bluetooth Kapat',
      desc: 'Anten modüllerinin sürekli yüksek güç çekişini ve radyo ısınmasını durdurur.',
      impact: 1.5,
      icon: <WifiOff className="w-4 h-4 text-purple-400" />,
      applied: false,
    },
    {
      id: 'case',
      title: 'Telefon Kılıfını Çıkarın',
      desc: 'Silikon ve deri kılıflar ısıyı hapseder. Kılıfı çıkarıp sert bir yüzeye koyun.',
      impact: 2.8,
      icon: <Smartphone className="w-4 h-4 text-emerald-400" />,
      applied: false,
    },
    {
      id: 'unplug',
      title: 'Hızlı Şarj Kablosunu Çıkarın',
      desc: 'Şarj sırasında batarya kimyası ekstra ısı üretir. Şarja ara verin.',
      impact: 4.0,
      icon: <BatteryCharging className="w-4 h-4 text-red-400" />,
      applied: false,
    },
  ]);

  const [isTurboCooling, setIsTurboCooling] = useState(false);

  // Trigger Turbo Cooldown mode
  const handleTurboCool = () => {
    setIsTurboCooling(true);
    soundEngine.playBoostSound();
    soundEngine.startCoolingSound();

    // Ice particle effect
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#38bdf8', '#93c5fd', '#ffffff'],
    });

    let count = 0;
    const interval = setInterval(() => {
      count++;
      onApplyCooling(0.8);
      if (count >= 8) {
        clearInterval(interval);
        setIsTurboCooling(false);
        soundEngine.stopCoolingSound();
      }
    }, 800);
  };

  const handleToggleAction = (id: string, impact: number) => {
    setActions(prev => prev.map(a => {
      if (a.id === id) {
        const nextState = !a.applied;
        if (nextState) {
          soundEngine.playClick(1000, 'sine');
          onApplyCooling(impact);
        }
        return { ...a, applied: nextState };
      }
      return a;
    }));
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Snowflake className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Hızlı Soğutma Asistanı (Cooling Optimizer)</h3>
            <p className="text-xs text-slate-400">Telefonu En Hızlı Şekilde Soğutma Adımları & Turbo Fan</p>
          </div>
        </div>

        {/* Turbo Cool Button */}
        <button
          onClick={handleTurboCool}
          disabled={isTurboCooling}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg ${
            isTurboCooling
              ? 'bg-cyan-500 text-slate-950 animate-pulse shadow-cyan-500/40 scale-105'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20 hover:scale-105'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${isTurboCooling ? 'animate-spin' : ''}`} />
          <span>{isTurboCooling ? '❄️ Soğutuluyor (-6°C)...' : '🚀 Turbo Soğutma Başlat'}</span>
        </button>
      </div>

      {/* Recommended Actions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {actions.map((act) => (
          <div
            key={act.id}
            onClick={() => handleToggleAction(act.id, act.impact)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
              act.applied
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
              {act.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <h4 className="text-xs font-semibold truncate text-slate-200">{act.title}</h4>
                <span className="text-[11px] font-mono font-bold text-cyan-400 shrink-0">
                  -{act.impact}°C
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                {act.desc}
              </p>
            </div>

            <div className="shrink-0 self-center">
              <CheckCircle2 className={`w-5 h-5 transition-colors ${
                act.applied ? 'text-emerald-400' : 'text-slate-700'
              }`} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
