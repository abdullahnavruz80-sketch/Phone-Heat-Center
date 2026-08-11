import React from 'react';
import { X, Settings, ShieldAlert, Volume2, LayoutGrid, RotateCcw, Sliders, Check } from 'lucide-react';
import { WidgetSettings, AppMode } from '../types';
import { soundEngine } from '../utils/audio';

interface SettingsModalProps {
  highTempThreshold: number;
  onUpdateThreshold: (val: number) => void;
  tempUnit: 'C' | 'F';
  onToggleUnit: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  widgetSettings: WidgetSettings;
  onUpdateWidgetSettings: (newSettings: Partial<WidgetSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  highTempThreshold,
  onUpdateThreshold,
  tempUnit,
  onToggleUnit,
  soundEnabled,
  onToggleSound,
  widgetSettings,
  onUpdateWidgetSettings,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-200">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Uygulama & İzleme Ayarları</h3>
              <p className="text-xs text-slate-400">Isınma Alarm Eşikleri, Widget & Ses Tercihleri</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-5 space-y-5 text-xs text-slate-300 max-h-[75vh] overflow-y-auto">
          
          {/* Overheat Alert Threshold */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-orange-400" />
                <span>Isınma Alarm Eşiği</span>
              </span>
              <span className="font-mono text-orange-400 font-extrabold text-sm">
                {highTempThreshold}°C
              </span>
            </div>
            <input
              type="range"
              min={40}
              max={55}
              step={1}
              value={highTempThreshold}
              onChange={(e) => onUpdateThreshold(Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Sıcaklık bu eşiği aştığında sesli ve görsel aşırı ısınma uyarısı devreye girer.
            </p>
          </div>

          {/* Unit & Sound Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Sıcaklık Birimi</div>
                <div className="text-[10px] text-slate-400">Santigrat veya Fahrenhayt</div>
              </div>
              <button
                onClick={onToggleUnit}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-mono font-bold text-cyan-300"
              >
                °{tempUnit}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Ses Efektleri</div>
                <div className="text-[10px] text-slate-400">Fan & Uyarı Sesleri</div>
              </div>
              <button
                onClick={() => {
                  onToggleSound();
                  soundEngine.playClick(800, 'sine');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  soundEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {soundEnabled ? 'Açık' : 'Kapalı'}
              </button>
            </div>
          </div>

          {/* Floating Widget Preferences */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <LayoutGrid className="w-4 h-4 text-cyan-400" />
              <span>Yüzen Widget (Floating HUD) Ayarları</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-slate-900 border border-slate-800">
                <input
                  type="checkbox"
                  checked={widgetSettings.showCpuTemp}
                  onChange={(e) => onUpdateWidgetSettings({ showCpuTemp: e.target.checked })}
                  className="accent-cyan-500"
                />
                <span>CPU Sıcaklığı</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-slate-900 border border-slate-800">
                <input
                  type="checkbox"
                  checked={widgetSettings.showFps}
                  onChange={(e) => onUpdateWidgetSettings({ showFps: e.target.checked })}
                  className="accent-cyan-500"
                />
                <span>FPS Sayacı</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-slate-900 border border-slate-800">
                <input
                  type="checkbox"
                  checked={widgetSettings.showBatteryTemp}
                  onChange={(e) => onUpdateWidgetSettings({ showBatteryTemp: e.target.checked })}
                  className="accent-cyan-500"
                />
                <span>Batarya Sıcaklığı</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-slate-900 border border-slate-800">
                <input
                  type="checkbox"
                  checked={widgetSettings.showWattage}
                  onChange={(e) => onUpdateWidgetSettings({ showWattage: e.target.checked })}
                  className="accent-cyan-500"
                />
                <span>Anlık Watt Gücü</span>
              </label>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-[11px] mb-1 text-slate-400">
                <span>Widget Şeffaflığı (Opacity):</span>
                <span className="font-mono text-cyan-300">{Math.round(widgetSettings.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.3}
                max={1.0}
                step={0.1}
                value={widgetSettings.opacity}
                onChange={(e) => onUpdateWidgetSettings({ opacity: Number(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-extrabold text-xs hover:bg-cyan-400 transition-colors"
          >
            Tamam & Kaydet
          </button>
        </div>

      </div>
    </div>
  );
};
