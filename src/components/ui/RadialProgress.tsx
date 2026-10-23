"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RadialProgressProps {
  value: number; // 0 to 100+
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  gradientId: string;
  gradientFrom: string;
  gradientTo: string;
  showPercentage?: boolean;
  className?: string;
}

export function RadialProgress({
  value,
  size = 140,
  strokeWidth = 10,
  label,
  sublabel,
  gradientId,
  gradientFrom,
  gradientTo,
  showPercentage = true,
  className,
}: RadialProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center select-none",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        </defs>

        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        {showPercentage && (
          <span className="text-2xl font-black tracking-tight text-white">
            {Math.round(value)}%
          </span>
        )}
        {label && (
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mt-0.5">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
