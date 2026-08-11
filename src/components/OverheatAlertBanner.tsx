import React, { useEffect } from 'react';
import { AlertTriangle, Flame, Snowflake, X, Zap } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { formatTemp } from '../utils/simulation';

interface OverheatAlertBannerProps {
  cpuTemp: number;
  batteryTemp: number;
  tempUnit: 'C' | 'F';
  threshold: number;
  onDismiss: () => void;
  onEmergencyCool: () => void;
}

export const OverheatAlertBanner: React.FC<OverheatAlertBannerProps> = ({
  cpuTemp,
  batteryTemp,
  tempUnit,
  threshold,
  onDismiss,
  onEmergencyCool,
}) => {
  const maxTemp = Math.max(cpuTemp, batteryTemp);

  useEffect(() => {
    soundEngine.playOverheatAlarm();
  }, [maxTemp]);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-bounce">
      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-red-600 border-2 border-red-400 text-white shadow-[0_0_35px_rgba(239,68,68,0.7)] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/20 text-white animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black uppercase tracking-wider">
                🚨 TELEFON FAZLA ISINIYOR!
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-black/40 text-amber-300">
                {formatTemp(maxTemp, tempUnit)}
              </span>
            </div>
            <p className="text-xs text-red-100 mt-0.5">
              İşlemci veya batarya güvenli sıcaklık eşiğini ({formatTemp(threshold, tempUnit)}) aştı!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onEmergencyCool}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white text-red-600 font-extrabold text-xs uppercase hover:bg-red-50 shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Snowflake className="w-4 h-4 animate-spin" />
            <span>Hemen Soğut</span>
          </button>

          <button
            onClick={onDismiss}
            className="p-2 rounded-xl bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-colors"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
