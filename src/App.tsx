import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ThermalOverviewCards } from './components/ThermalOverviewCards';
import { PowerMetrics } from './components/PowerMetrics';
import { FpsMonitor } from './components/FpsMonitor';
import { ThermalChart } from './components/ThermalChart';
import { CoolingAssistant } from './components/CoolingAssistant';
import { GamerTools } from './components/GamerTools';
import { FloatingWidget } from './components/FloatingWidget';
import { OverheatAlertBanner } from './components/OverheatAlertBanner';
import { SettingsModal } from './components/SettingsModal';

import {
  AppMode,
  ThermalLevel,
  TemperatureData,
  PowerData,
  PerformanceData,
  HistoricalHeatPoint,
  WidgetSettings,
  GamePreset,
} from './types';

import {
  getThermalLevel,
  MODE_CONFIGS,
  generateInitialHistory,
  getInitialMetrics,
} from './utils/simulation';

import { soundEngine } from './utils/audio';

export default function App() {
  // Primary State
  const [mode, setMode] = useState<AppMode>('gaming');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [highTempThreshold, setHighTempThreshold] = useState<number>(45);

  // Metrics
  const initial = getInitialMetrics('gaming');
  const [temps, setTemps] = useState<TemperatureData>(initial.temps);
  const [power, setPower] = useState<PowerData>(initial.power);
  const [perf, setPerf] = useState<PerformanceData>(initial.perf);
  const [history, setHistory] = useState<HistoricalHeatPoint[]>(() => generateInitialHistory('gaming'));

  // UI States
  const [isBoosting, setIsBoosting] = useState(false);
  const [crosshairEnabled, setCrosshairEnabled] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Floating Widget Settings
  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>({
    enabled: true,
    position: 'top-right',
    showCpuTemp: true,
    showBatteryTemp: true,
    showFps: true,
    showWattage: true,
    compact: false,
    opacity: 0.95,
  });

  // Calculate overall Thermal Level
  const thermalLevel = getThermalLevel(temps.cpu, temps.battery);
  const maxTemp = Math.max(temps.cpu, temps.battery);

  // Real Web Battery API Listener if supported
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as unknown as { getBattery: () => Promise<{ level: number; charging: boolean; addEventListener: (type: string, listener: () => void) => void }> })
        .getBattery()
        .then((battery) => {
          const updateBatteryInfo = () => {
            setPower((prev) => ({
              ...prev,
              batteryLevel: Math.round(battery.level * 100),
              charging: battery.charging,
            }));
          };
          updateBatteryInfo();
          battery.addEventListener('levelchange', updateBatteryInfo);
          battery.addEventListener('chargingchange', updateBatteryInfo);
        })
        .catch(() => {
          // Fallback to simulation
        });
    }
  }, []);

  // Mode Change Handler
  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    const cfg = MODE_CONFIGS[newMode];

    setTemps({
      cpu: cfg.targetTempCpu,
      gpu: cfg.targetTempGpu,
      battery: cfg.targetTempBat,
      ambient: 24.5,
      hotspot: +(cfg.targetTempGpu + 3.2).toFixed(1),
    });

    setPower((prev) => ({
      ...prev,
      wattage: cfg.wattage,
      voltage: cfg.voltage,
      amperage: cfg.amperage,
    }));

    setPerf((prev) => ({
      ...prev,
      fps: cfg.targetFps,
      targetFps: cfg.targetFps,
      refreshRate: cfg.refreshRate,
      gpuLoad: cfg.gpuLoad,
      cpuLoad: cfg.cpuLoad,
      ramUsedGb: newMode === 'gaming' ? 9.4 : newMode === 'normal' ? 5.2 : 3.1,
    }));
  };

  // Real-time Simulation Interval Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTemps((prev) => {
        const config = MODE_CONFIGS[mode];
        // Minor natural variance
        const cpuNoise = (Math.random() * 0.8 - 0.4);
        const gpuNoise = (Math.random() * 0.8 - 0.4);
        const batNoise = (Math.random() * 0.4 - 0.2);

        // Drift slowly toward mode target
        const newCpu = +Math.max(25, prev.cpu + (config.targetTempCpu - prev.cpu) * 0.1 + cpuNoise).toFixed(1);
        const newGpu = +Math.max(25, prev.gpu + (config.targetTempGpu - prev.gpu) * 0.1 + gpuNoise).toFixed(1);
        const newBat = +Math.max(24, prev.battery + (config.targetTempBat - prev.battery) * 0.05 + batNoise).toFixed(1);

        return {
          ...prev,
          cpu: newCpu,
          gpu: newGpu,
          battery: newBat,
          hotspot: +(newGpu + 3.2).toFixed(1),
        };
      });

      // Update wattage & FPS micro oscillations
      setPower((prev) => {
        const cfg = MODE_CONFIGS[mode];
        const wNoise = (Math.random() * 0.6 - 0.3);
        return {
          ...prev,
          wattage: +Math.max(1.5, prev.wattage + wNoise).toFixed(1),
        };
      });

      setPerf((prev) => {
        const fpsNoise = Math.round(Math.random() * 4 - 2);
        const currentFps = Math.min(prev.refreshRate, Math.max(20, prev.targetFps + fpsNoise));
        return {
          ...prev,
          fps: currentFps,
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [mode]);

  // Append data point to historical log every 10s
  useEffect(() => {
    const logInterval = setInterval(() => {
      const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setHistory((prev) => {
        const next = [...prev.slice(1)];
        next.push({
          time: nowLabel,
          cpu: temps.cpu,
          gpu: temps.gpu,
          battery: temps.battery,
          fps: perf.fps,
          watt: power.wattage,
        });
        return next;
      });
    }, 10000);

    return () => clearInterval(logInterval);
  }, [temps, perf.fps, power.wattage]);

  // Quick Boost Handler
  const handleQuickBoost = () => {
    setIsBoosting(true);
    soundEngine.playBoostSound();

    setTimeout(() => {
      setTemps((prev) => ({
        ...prev,
        cpu: Math.max(30, +(prev.cpu - 3.8).toFixed(1)),
        gpu: Math.max(29, +(prev.gpu - 4.2).toFixed(1)),
        battery: Math.max(28, +(prev.battery - 2.1).toFixed(1)),
      }));

      setPerf((prev) => ({
        ...prev,
        ramUsedGb: Math.max(3.0, +(prev.ramUsedGb - 2.4).toFixed(1)),
      }));

      setIsBoosting(false);
      soundEngine.playClick(1200, 'sine');
    }, 1500);
  };

  // Cooldown action drop
  const handleApplyCooling = (drop: number) => {
    setTemps((prev) => ({
      ...prev,
      cpu: Math.max(28, +(prev.cpu - drop).toFixed(1)),
      gpu: Math.max(28, +(prev.gpu - drop * 1.1).toFixed(1)),
      battery: Math.max(26, +(prev.battery - drop * 0.6).toFixed(1)),
    }));
  };

  // Select Game Preset
  const handleSelectGamePreset = (preset: GamePreset) => {
    if (preset.recommendedMode !== mode) {
      handleModeChange(preset.recommendedMode);
    }
    setTemps((prev) => ({
      ...prev,
      cpu: +(preset.estimatedHeat).toFixed(1),
      gpu: +(preset.estimatedHeat + 2.5).toFixed(1),
    }));
    setPerf((prev) => ({
      ...prev,
      targetFps: preset.targetFps,
      fps: preset.targetFps,
    }));
  };

  // Check if Overheat Alert should pop up
  const isOverheating = maxTemp >= highTempThreshold;

  return (
    <div className={`min-h-screen transition-colors duration-500 relative font-sans ${
      mode === 'gaming'
        ? 'bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950'
        : mode === 'eco'
        ? 'bg-emerald-950/40 text-emerald-50 bg-slate-950 selection:bg-emerald-500'
        : 'bg-slate-900 text-slate-100 selection:bg-blue-500'
    }`}>
      
      {/* Gamer Crosshair HUD Overlay */}
      {crosshairEnabled && (
        <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute w-full h-[1.5px] bg-cyan-400 opacity-80"></div>
            <div className="absolute h-full w-[1.5px] bg-cyan-400 opacity-80"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        mode={mode}
        onModeChange={handleModeChange}
        thermalLevel={thermalLevel}
        maxTemp={maxTemp}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          soundEngine.setSoundEnabled(next);
        }}
        tempUnit={tempUnit}
        onToggleUnit={() => setTempUnit(prev => prev === 'C' ? 'F' : 'C')}
        onOpenSettings={() => setShowSettingsModal(true)}
        onQuickBoost={handleQuickBoost}
        isBoosting={isBoosting}
        widgetEnabled={widgetSettings.enabled}
        onToggleWidget={() => setWidgetSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
      />

      {/* Overheat Alert Banner Modal */}
      {isOverheating && !alertDismissed && (
        <OverheatAlertBanner
          cpuTemp={temps.cpu}
          batteryTemp={temps.battery}
          tempUnit={tempUnit}
          threshold={highTempThreshold}
          onDismiss={() => setAlertDismissed(true)}
          onEmergencyCool={() => {
            handleApplyCooling(6.0);
            setAlertDismissed(true);
          }}
        />
      )}

      {/* Floating HUD Widget Overlay */}
      {widgetSettings.enabled && (
        <FloatingWidget
          cpuTemp={temps.cpu}
          batteryTemp={temps.battery}
          fps={perf.fps}
          wattage={power.wattage}
          thermalLevel={thermalLevel}
          mode={mode}
          tempUnit={tempUnit}
          settings={widgetSettings}
          onUpdateSettings={(newVal) => setWidgetSettings(prev => ({ ...prev, ...newVal }))}
          onClose={() => setWidgetSettings(prev => ({ ...prev, enabled: false }))}
        />
      )}

      {/* Dashboard Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Row 1: Thermal Overview Cards */}
        <ThermalOverviewCards
          temps={temps}
          tempUnit={tempUnit}
          mode={mode}
          highTempThreshold={highTempThreshold}
        />

        {/* Row 2: FPS & Gaming Monitor + Power Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FpsMonitor
            perf={perf}
            cpuTemp={temps.cpu}
            gpuTemp={temps.gpu}
            mode={mode}
            onRefreshRateChange={(hz) => {
              setPerf(prev => ({ ...prev, refreshRate: hz, targetFps: Math.min(hz, prev.targetFps) }));
            }}
          />

          <PowerMetrics
            power={power}
            mode={mode}
          />
        </div>

        {/* Row 3: Gamer Specialized Tools & Benchmarks */}
        <GamerTools
          mode={mode}
          onSelectGamePreset={handleSelectGamePreset}
          onSimulateHeat={(tempInc) => setTemps(prev => ({ ...prev, cpu: +(prev.cpu + tempInc).toFixed(1) }))}
          onCoolDown={handleApplyCooling}
          crosshairEnabled={crosshairEnabled}
          onToggleCrosshair={() => setCrosshairEnabled(!crosshairEnabled)}
        />

        {/* Row 4: 1-Hour Interactive Temperature Chart */}
        <ThermalChart
          history={history}
          tempUnit={tempUnit}
          mode={mode}
          highTempThreshold={highTempThreshold}
        />

        {/* Row 5: Cooling Assistant & Recommendations */}
        <CoolingAssistant
          cpuTemp={temps.cpu}
          batteryTemp={temps.battery}
          onApplyCooling={handleApplyCooling}
        />

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-300">Phone Heat</span> — Telefon Sıcaklık & Performans İzleme Merkezi
          </div>
          <div className="font-mono text-slate-400">
            FPS, CPU, GPU, Batarya & Soğutma Asistanı
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          highTempThreshold={highTempThreshold}
          onUpdateThreshold={setHighTempThreshold}
          tempUnit={tempUnit}
          onToggleUnit={() => setTempUnit(prev => prev === 'C' ? 'F' : 'C')}
          soundEnabled={soundEnabled}
          onToggleSound={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            soundEngine.setSoundEnabled(next);
          }}
          widgetSettings={widgetSettings}
          onUpdateWidgetSettings={(newVal) => setWidgetSettings(prev => ({ ...prev, ...newVal }))}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

    </div>
  );
}
