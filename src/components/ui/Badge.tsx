import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "destructive"
    | "outline"
    | "purple"
    | "indigo"
    | "cyan";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium rounded-full transition-colors border";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs font-semibold",
  };

  const variantStyles = {
    default:
      "bg-slate-800 text-slate-200 border-slate-700/60",
    secondary:
      "bg-slate-800/80 text-slate-300 border-slate-700/40",
    success:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
    destructive:
      "bg-rose-500/10 text-rose-400 border-rose-500/20",
    outline:
      "bg-transparent text-slate-300 border-slate-700",
    purple:
      "bg-purple-500/10 text-purple-300 border-purple-500/20",
    indigo:
      "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    cyan:
      "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  };

  return (
    <span
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
