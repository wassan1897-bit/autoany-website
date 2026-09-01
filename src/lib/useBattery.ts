import { useEffect, useState } from "react";

type BatteryManager = EventTarget & {
  charging: boolean;
  level: number;
};

export function useBattery() {
  const [percent, setPercent] = useState<number | null>(null);
  const [charging, setCharging] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<BatteryManager>;
    };
    if (!nav.getBattery) return;

    let battery: BatteryManager | null = null;
    const sync = (b: BatteryManager) => {
      setPercent(Math.round(Math.min(1, Math.max(0, b.level)) * 100));
      setCharging(Boolean(b.charging));
    };

    let onLevel: (() => void) | undefined;
    let onCharge: (() => void) | undefined;

    nav.getBattery().then((b) => {
      battery = b;
      onLevel = () => sync(b);
      onCharge = () => sync(b);
      sync(b);
      b.addEventListener("levelchange", onLevel);
      b.addEventListener("chargingchange", onCharge);
    });

    return () => {
      if (!battery || !onLevel || !onCharge) return;
      battery.removeEventListener("levelchange", onLevel);
      battery.removeEventListener("chargingchange", onCharge);
    };
  }, []);

  return { percent, charging };
}
