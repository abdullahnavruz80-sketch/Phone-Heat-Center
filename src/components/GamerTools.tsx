import React, { useState, useEffect } from 'react';
import { Gamepad2, Flame, Crosshair, Zap, Activity, Cpu, RotateCcw, Target, ShieldCheck, Play, Check } from 'lucide-react';
import { GamePreset, AppMode } from '../types';
import { soundEngine } from '../utils/audio';

interface GamerToolsProps {
  mode: AppMode;
  onSelectGamePreset: (preset: GamePreset) => void;
  onSimulateHeat: (tempIncrease: number) => void;
  onCoolDown: (tempDrop: number) => void;
  crosshairEnabled: boolean;
  onToggleCrosshair: () => void;
}

const GAME_PRESETS: GamePreset[] = [
  { id: 'pubg', name: 'PUBG Mobile', icon: '🎯', targetFps: 90, estimatedHeat: 43.5, powerConsumption: '14.2W', recommendedMode: 'gaming' },
  { id: 'genshin', name: 'Genshin Impact', icon: '⚔️', targetFps: 60, estimatedHeat: 49.2, powerConsumption: '19.8W', recommendedMode: 'gaming' },
  { id: 'codm', name: 'Call of Duty: Mobile', icon: '💥', targetFps: 120, estimatedHeat: 44.1, powerConsumption: '16.5W', recommendedMode: 'gaming' },
  { id: 'wildrift', name: 'League of Legends: Wild Rift', icon: '🛡️', targetFps: 120, estimatedHeat: 41.0, powerConsumption: '12.0W', recommendedMode: 'gaming' },
  { id: 'fcmobile', name: 'EA Sports FC Mobile', icon: '⚽', targetFps: 90, estimatedHeat: 40.2, powerConsumption: '11.5W', recommendedMode: 'normal' },
];

export const GamerTools: React.FC<GamerToolsProps> = ({
  mode,
  onSelectGamePreset,
  onSimulateHeat,
  onCoolDown,
  crosshairEnabled,
  onToggleCrosshair,
}) => {
  // Stress Test state
  const [testing, setTesting] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testScore, setTestScore] = useState<number | null>(null);

  // Touch Latency Test state
  const [latencyTest, setLatencyTest] = useState<{
    status: 'idle' | 'waiting' | 'ready' | 'result';
    startTime: number;
    resultMs: number | null;
  }>({ status: 'idle', startTime: 0, resultMs: null });

  // Selected preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>('pubg');

  // Thermal Stress Test runner
  const handleStartStressTest = () => {
    setTesting(true);
    setTestProgress(0);
    setTestScore(null);
    soundEngine.playBoostSound();

    let prog = 0;
    const interval = setInterval(() => {
      prog += 10;
      setTestProgress(prog);
      onSimulateHeat(0.8); // Simulate heavy load heating up CPU

      if (prog >= 100) {
        clearInterval(interval);
        setTesting(false);
        const score = +(88 + Math.random() * 10).toFixed(1);
        setTestScore(score);
        soundEngine.playClick(1200, 'sine');
      }
    }, 400);
  };

  // Touch Latency Test handler
  const handleTouchTestClick = () => {
    if (latencyTest.status === 'idle' || latencyTest.status === 'result') {
      setLatencyTest({ status: 'waiting', startTime: 0, resultMs: null });
      const delay = 1000 + Math.random() * 2000;
      setTimeout(() => {
        setLatencyTest({ status: 'ready', startTime: performance.now(), resultMs: null });
        soundEngine.playClick(1000, 'triangle');
      }, delay);
    } else if (latencyTest.status === 'ready') {
      const ms = Math.round(performance.now() - latencyTest.startTime);
      setLatencyTest({ status: 'result', startTime: 0, resultMs: ms });
      soundEngine.playClick(1500, 'sine');
    }
  };

  return (
    <div className={`p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
      mode === 'gaming' ? 'bg-slate-900/90 border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.1)]' : 'bg-slate-900/60 border-slate-800'
    }`}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Gamer Özel Araçları & Oyun Profilleri</h3>
            <p className="text-xs text-slate-400">Termal Stres Testi, Oyun Presetleri & Nişangah Crosshair</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Game Presets Column */}
        <div className="lg:col-span-1 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>Popüler Oyun Profilleri</span>
          </h4>

          <div className="space-y-2">
            {GAME_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    setSelectedPresetId(preset.id);
                    onSelectGamePreset(preset);
                    soundEngine.playClick(900, 'sine');
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-slate-100 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{preset.icon}</span>
                    <div>
                      <div className="text-xs font-bold">{preset.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {preset.targetFps} FPS Target • {preset.powerConsumption}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-amber-400">
                      ~{preset.estimatedHeat}°C
                    </div>
                    {isSelected && <span className="text-[10px] text-cyan-400 font-semibold">Seçili</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Thermal Stress Test */}
        <div className="lg:col-span-1 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Termal Stres Testi</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">15s Burn In</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              İşlemci ve grafik kartını %100 yük altına sokarak telefonun ısınma kısıtlama dayanıklılığını ölçer.
            </p>

            {testing && (
              <div className="space-y-2 my-3">
                <div className="flex justify-between text-xs font-mono text-cyan-400">
                  <span>Yük Bindiriliyor...</span>
                  <span>%{testProgress}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-red-500 h-full transition-all duration-300"
                    style={{ width: `${testProgress}%` }}
                  />
                </div>
              </div>
            )}

            {testScore !== null && !testing && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 my-3 text-center">
                <div className="text-xs text-slate-400">Termal Kararlılık Skoru</div>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  %{testScore} <span className="text-xs font-normal text-slate-300">Yüksek Performans</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleStartStressTest}
            disabled={testing}
            className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              testing
                ? 'bg-slate-800 text-slate-500'
                : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-400 hover:to-red-500 shadow-md shadow-orange-500/20'
            }`}
          >
            <Play className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Test Sürüyor...' : 'Stres Testini Başlat'}</span>
          </button>
        </div>

        {/* Gamer HUD Crosshair & Touch Test */}
        <div className="lg:col-span-1 space-y-3">
          
          {/* Crosshair Overlay Switch */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-cyan-400" />
                <div>
                  <h5 className="text-xs font-bold text-slate-200">Ekran Nişangah HUD (Crosshair)</h5>
                  <p className="text-[10px] text-slate-400">Oyunlarda sabit nişangah gösterir</p>
                </div>
              </div>

              <button
                onClick={onToggleCrosshair}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  crosshairEnabled
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {crosshairEnabled ? 'Aktif' : 'Kapalı'}
              </button>
            </div>
          </div>

          {/* Touch Latency Tester */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Dokunmatik Gecikme Testi</span>
              </h5>
            </div>

            <button
              onClick={handleTouchTestClick}
              className={`w-full py-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                latencyTest.status === 'idle'
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  : latencyTest.status === 'waiting'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                  : latencyTest.status === 'ready'
                  ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400 animate-bounce'
                  : 'bg-slate-900 border-slate-800 text-slate-200'
              }`}
            >
              {latencyTest.status === 'idle' && <span>Test Etmek İçin Tıkla</span>}
              {latencyTest.status === 'waiting' && <span>Yeşil Olunca Hemen Tıkla...</span>}
              {latencyTest.status === 'ready' && <span>ŞİMDİ TIKLA!</span>}
              {latencyTest.status === 'result' && (
                <>
                  <span className="text-emerald-400 font-mono text-base font-extrabold">
                    {latencyTest.resultMs} ms
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Tekrar test etmek için tıkla</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
