import React, { useState, useRef } from 'react';
import { Flame, Monitor, Cpu, Battery, Zap, Move, X, Minimize2, Maximize2, ShieldAlert, PictureInPicture2 } from 'lucide-react';
import { AppMode, ThermalLevel, WidgetSettings } from '../types';
import { formatTemp } from '../utils/simulation';
import { soundEngine } from '../utils/audio';

interface FloatingWidgetProps {
  cpuTemp: number;
  batteryTemp: number;
  fps: number;
  wattage: number;
  thermalLevel: ThermalLevel;
  mode: AppMode;
  tempUnit: 'C' | 'F';
  settings: WidgetSettings;
  onUpdateSettings: (newSettings: Partial<WidgetSettings>) => void;
  onClose: () => void;
  onOpenApp?: () => void;
}

export const FloatingWidget: React.FC<FloatingWidgetProps> = ({
  cpuTemp,
  batteryTemp,
  fps,
  wattage,
  thermalLevel,
  mode,
  tempUnit,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX - (position?.x || 0),
      y: e.clientY - (position?.y || 0),
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      const newX = moveEvent.clientX - dragStart.current.x;
      const newY = moveEvent.clientY - dragStart.current.y;
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Picture-in-Picture window support if browser supports Document Picture-in-Picture API
  const handleLaunchPip = async () => {
    try {
      soundEngine.playClick(1000, 'sine');
      if ('documentPictureInPicture' in window) {
        const pipWindow = await (window as unknown as { documentPictureInPicture: { requestWindow: (options: { width: number; height: number }) => Promise<Window> } }).documentPictureInPicture.requestWindow({
          width: 300,
          height: 180,
        });

        pipWindow.document.body.innerHTML = `
          <div style="background: #090d16; color: white; font-family: monospace; padding: 16px; border-radius: 12px; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-weight: bold; color: #06b6d4; font-size: 14px;">🔥 Phone Heat Widget</div>
            <div style="font-size: 24px; font-weight: bold; color: #ef4444;">CPU: ${cpuTemp.toFixed(1)}°C</div>
            <div style="font-size: 18px; color: #38bdf8;">FPS: ${fps} FPS</div>
            <div style="font-size: 14px; color: #10b981;">Batarya: ${batteryTemp.toFixed(1)}°C</div>
          </div>
        `;
      } else {
        alert("Picture-in-Picture mini pencere modunu açmak için Chrome/Edge güncel sürümünü kullanabilirsiniz.");
      }
    } catch {
      // Ignore PIP errors
    }
  };

  // Compute fixed position style based on settings
  const getPositionClass = () => {
    if (position) return {}; // Use inline style for custom dragged position
    switch (settings.position) {
      case 'top-left':
        return { top: '80px', left: '20px' };
      case 'bottom-right':
        return { bottom: '20px', right: '20px' };
      case 'bottom-left':
        return { bottom: '20px', left: '20px' };
      case 'top-right':
      default:
        return { top: '80px', right: '20px' };
    }
  };

  const isOverheating = cpuTemp >= 45 || batteryTemp >= 43;

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 9999,
        opacity: settings.opacity,
        ...(position ? { left: `${position.x}px`, top: `${position.y}px` } : getPositionClass()),
      }}
      className={`select-none rounded-2xl border transition-all duration-200 shadow-2xl backdrop-blur-xl ${
        isOverheating
          ? 'bg-red-950/90 border-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.5)] animate-pulse'
          : mode === 'gaming'
          ? 'bg-slate-950/90 border-cyan-500/50 text-cyan-50 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
          : mode === 'eco'
          ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-50'
          : 'bg-slate-900/90 border-slate-700 text-slate-100'
      }`}
    >
      
      {/* Widget Header & Drag Bar */}
      <div
        onMouseDown={handleMouseDown}
        className="px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between cursor-move gap-2 bg-slate-950/50 rounded-t-2xl"
      >
        <div className="flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-slate-300">
            {mode === 'gaming' ? '🎮 GAMING HUD' : '🔥 HEAT MONITOR'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* PIP button */}
          <button
            onClick={handleLaunchPip}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Dış Pencerede / Masaüstünde Göster (Picture-in-Picture)"
          >
            <PictureInPicture2 className="w-3 h-3" />
          </button>

          {/* Minimize toggle */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            title={isMinimized ? 'Genişlet' : 'Küçült'}
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"
            title="Widgetı Kapat"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Widget Body */}
      {isMinimized ? (
        /* Minimized Compact Pill */
        <div className="px-3 py-2 flex items-center gap-3 text-xs font-mono font-extrabold">
          <div className="flex items-center gap-1 text-red-400">
            <Flame className="w-3.5 h-3.5" />
            <span>{formatTemp(cpuTemp, tempUnit)}</span>
          </div>
          <div className="flex items-center gap-1 text-cyan-300">
            <Monitor className="w-3.5 h-3.5" />
            <span>{fps} FPS</span>
          </div>
        </div>
      ) : (
        /* Full HUD Widget */
        <div className="p-3 space-y-2.5 w-48 text-xs font-mono">
          
          {/* CPU Temp */}
          {settings.showCpuTemp && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] flex items-center gap-1 font-sans">
                <Cpu className="w-3 h-3 text-red-400" /> CPU:
              </span>
              <span className={`font-bold ${cpuTemp >= 45 ? 'text-red-400 font-extrabold animate-pulse' : 'text-slate-100'}`}>
                {formatTemp(cpuTemp, tempUnit)}
              </span>
            </div>
          )}

          {/* FPS */}
          {settings.showFps && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] flex items-center gap-1 font-sans">
                <Monitor className="w-3 h-3 text-cyan-400" /> FPS:
              </span>
              <span className="font-bold text-cyan-300">
                {fps}
              </span>
            </div>
          )}

          {/* Battery Temp */}
          {settings.showBatteryTemp && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] flex items-center gap-1 font-sans">
                <Battery className="w-3 h-3 text-emerald-400" /> Batarya:
              </span>
              <span className="font-bold text-emerald-300">
                {formatTemp(batteryTemp, tempUnit)}
              </span>
            </div>
          )}

          {/* Wattage */}
          {settings.showWattage && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] flex items-center gap-1 font-sans">
                <Zap className="w-3 h-3 text-amber-400" /> Güç:
              </span>
              <span className="font-bold text-amber-400">
                {wattage.toFixed(1)}W
              </span>
            </div>
          )}

          {/* Position Quick Selector */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-sans">
            <span>Konum:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setPosition(null); onUpdateSettings({ position: 'top-right' }); }}
                className="px-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Sağ Üst
              </button>
              <button
                onClick={() => { setPosition(null); onUpdateSettings({ position: 'top-left' }); }}
                className="px-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Sol Üst
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
