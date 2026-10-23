"use client";

import React, { useState, useEffect } from "react";
import { parseISO, differenceInSeconds } from "date-fns";
import { Clock } from "lucide-react";

interface CountdownClockProps {
  targetDate: string;
}

export function CountdownClock({ targetDate }: CountdownClockProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const calculateTime = () => {
      try {
        const target = parseISO(targetDate);
        const now = new Date();
        const diffSeconds = differenceInSeconds(target, now);

        if (diffSeconds <= 0) {
          const absDiff = Math.abs(diffSeconds);
          const days = Math.floor(absDiff / 86400);
          const hours = Math.floor((absDiff % 86400) / 3600);
          const minutes = Math.floor((absDiff % 3600) / 60);
          const seconds = absDiff % 60;
          setTimeLeft({ days, hours, minutes, seconds, isPast: true });
          return;
        }

        const days = Math.floor(diffSeconds / 86400);
        const hours = Math.floor((diffSeconds % 86400) / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);
        const seconds = diffSeconds % 60;
        setTimeLeft({ days, hours, minutes, seconds, isPast: false });
      } catch {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MINS", value: timeLeft.minutes },
    { label: "SECS", value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl glass-card border border-indigo-500/20 bg-gradient-to-br from-slate-900/90 to-indigo-950/30">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />
        <span className="text-xs font-bold tracking-wider text-indigo-300 uppercase">
          {timeLeft.isPast ? "Event Commenced" : "Time To Big Day"}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2.5 w-full">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 shadow-inner"
          >
            <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300 font-mono">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-[9px] font-semibold tracking-wider text-slate-400 mt-0.5">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
