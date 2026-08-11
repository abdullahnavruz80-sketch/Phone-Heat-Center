export type AppMode = 'gaming' | 'normal' | 'eco';

export type ThermalLevel = 'normal' | 'warm' | 'hot' | 'critical';

export interface TemperatureData {
  cpu: number;
  gpu: number;
  battery: number;
  ambient: number;
  hotspot: number;
}

export interface PowerData {
  wattage: number; // e.g. 18.5 W
  voltage: number; // e.g. 4.2 V
  amperage: number; // e.g. 2400 mA
  charging: boolean;
  batteryLevel: number; // percentage 0-100
  batteryHealth: 'Mükemmel' | 'İyi' | 'Isınmış' | 'Aşırı Gerilim' | 'Kritik';
  timeToFullOrEmpty: string; // e.g. "42 dk kaldı"
}

export interface PerformanceData {
  fps: number;
  targetFps: number;
  refreshRate: number; // 60, 90, 120, 144
  gpuLoad: number; // percentage
  cpuLoad: number; // percentage
  ramUsedGb: number;
  ramTotalGb: number;
  pingMs: number;
  touchLatencyMs: number;
  throttlingActive: boolean;
}

export interface HistoricalHeatPoint {
  time: string;
  cpu: number;
  gpu: number;
  battery: number;
  fps: number;
  watt: number;
}

export interface WidgetSettings {
  enabled: boolean;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'custom';
  customX?: number;
  customY?: number;
  showCpuTemp: boolean;
  showBatteryTemp: boolean;
  showFps: boolean;
  showWattage: boolean;
  compact: boolean;
  opacity: number; // 0.3 - 1.0
}

export interface CoolingAction {
  id: string;
  title: string;
  description: string;
  tempImpact: number; // °C drop
  icon: string;
  applied: boolean;
}

export interface GamePreset {
  id: string;
  name: string;
  icon: string;
  targetFps: number;
  estimatedHeat: number; // °C
  powerConsumption: string;
  recommendedMode: AppMode;
}
