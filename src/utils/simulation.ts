import { TemperatureData, PowerData, PerformanceData, HistoricalHeatPoint, AppMode, ThermalLevel } from '../types';

// Helper to determine thermal level
export function getThermalLevel(cpuTemp: number, batteryTemp: number): ThermalLevel {
  const maxTemp = Math.max(cpuTemp, batteryTemp);
  if (maxTemp >= 48) return 'critical';
  if (maxTemp >= 43) return 'hot';
  if (maxTemp >= 38) return 'warm';
  return 'normal';
}

// Convert Celsius to Fahrenheit if user toggles °F
export function formatTemp(celsius: number, unit: 'C' | 'F'): string {
  if (unit === 'F') {
    const f = (celsius * 9) / 5 + 32;
    return `${f.toFixed(1)}°F`;
  }
  return `${celsius.toFixed(1)}°C`;
}

// Base mode profile settings
export const MODE_CONFIGS: Record<AppMode, {
  name: string;
  icon: string;
  targetTempCpu: number;
  targetTempGpu: number;
  targetTempBat: number;
  targetFps: number;
  refreshRate: number;
  wattage: number;
  voltage: number;
  amperage: number;
  cpuLoad: number;
  gpuLoad: number;
  description: string;
}> = {
  gaming: {
    name: 'Gaming Mode',
    icon: 'Gamepad2',
    targetTempCpu: 47.8,
    targetTempGpu: 51.2,
    targetTempBat: 42.1,
    targetFps: 120,
    refreshRate: 120,
    wattage: 22.4,
    voltage: 4.35,
    amperage: 4100,
    cpuLoad: 88,
    gpuLoad: 94,
    description: 'Maksimum FPS, 120Hz ekran yenileme hızı ve ultra performans çipi aktif.',
  },
  normal: {
    name: 'Normal Mod',
    icon: 'Smartphone',
    targetTempCpu: 36.5,
    targetTempGpu: 35.8,
    targetTempBat: 34.2,
    targetFps: 60,
    refreshRate: 90,
    wattage: 9.8,
    voltage: 3.85,
    amperage: 1850,
    cpuLoad: 32,
    gpuLoad: 25,
    description: 'Dengeli pil ömrü, optimum sıcaklık seviyesi ve akıcı günlük kullanım.',
  },
  eco: {
    name: 'Eco Mod',
    icon: 'Leaf',
    targetTempCpu: 31.2,
    targetTempGpu: 30.5,
    targetTempBat: 30.0,
    targetFps: 45,
    refreshRate: 60,
    wattage: 4.2,
    voltage: 3.70,
    amperage: 950,
    cpuLoad: 14,
    gpuLoad: 10,
    description: 'Sıcaklığı en düşük seviyede tutar, pil ömrünü 2 katına çıkarır ve işlemci frekansını kısıtlar.',
  },
};

// Generate 1 hour worth of realistic historical heat logs (60 data points)
export function generateInitialHistory(mode: AppMode): HistoricalHeatPoint[] {
  const points: HistoricalHeatPoint[] = [];
  const now = new Date();
  const config = MODE_CONFIGS[mode];

  for (let i = 59; i >= 0; i--) {
    const pointTime = new Date(now.getTime() - i * 60 * 1000);
    const timeLabel = pointTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Introduce natural noise & heat build-up
    const noise = (Math.sin(i / 5) * 2.5) + (Math.cos(i / 2) * 1.5);
    const stressBump = i > 15 && i < 30 ? (mode === 'gaming' ? 6 : 2) : 0;

    const cpu = Math.max(28, +(config.targetTempCpu + noise + stressBump).toFixed(1));
    const gpu = Math.max(27, +(config.targetTempGpu + noise * 1.2 + stressBump * 1.1).toFixed(1));
    const battery = Math.max(26, +(config.targetTempBat + noise * 0.7 + stressBump * 0.5).toFixed(1));
    const fps = Math.min(config.targetFps, Math.max(24, Math.round(config.targetFps - (cpu > 46 ? 18 : 0) + (Math.random() * 4 - 2))));
    const watt = Math.max(2, +(config.wattage + (noise * 0.4)).toFixed(1));

    points.push({
      time: timeLabel,
      cpu,
      gpu,
      battery,
      fps,
      watt,
    });
  }

  return points;
}

// Initial State Generator
export function getInitialMetrics(mode: AppMode) {
  const cfg = MODE_CONFIGS[mode];
  
  const temps: TemperatureData = {
    cpu: cfg.targetTempCpu,
    gpu: cfg.targetTempGpu,
    battery: cfg.targetTempBat,
    ambient: 24.5,
    hotspot: +(cfg.targetTempGpu + 3.2).toFixed(1),
  };

  const power: PowerData = {
    wattage: cfg.wattage,
    voltage: cfg.voltage,
    amperage: cfg.amperage,
    charging: true,
    batteryLevel: 78,
    batteryHealth: 'Mükemmel',
    timeToFullOrEmpty: '38 dakika kaldı (%100 tam şarj)',
  };

  const perf: PerformanceData = {
    fps: cfg.targetFps,
    targetFps: cfg.targetFps,
    refreshRate: cfg.refreshRate,
    gpuLoad: cfg.gpuLoad,
    cpuLoad: cfg.cpuLoad,
    ramUsedGb: mode === 'gaming' ? 9.4 : mode === 'normal' ? 5.2 : 3.1,
    ramTotalGb: 12,
    pingMs: mode === 'gaming' ? 18 : 34,
    touchLatencyMs: mode === 'gaming' ? 8 : 24,
    throttlingActive: false,
  };

  return { temps, power, perf };
}
