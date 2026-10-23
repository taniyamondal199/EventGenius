import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "luxury"
    | "emerald";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "h-10 w-10 p-0 shrink-0",
    };

    const variantStyles = {
      primary:
        "bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-600/25 focus:ring-brand-500 border border-brand-500/30",
      secondary:
        "bg-slate-800 text-slate-100 hover:bg-slate-700/80 border border-slate-700/60 focus:ring-slate-500",
      outline:
        "border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/60 focus:ring-slate-500",
      ghost:
        "text-slate-300 hover:text-white hover:bg-slate-800/50 focus:ring-slate-500",
      destructive:
        "bg-rose-600/90 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/20 focus:ring-rose-500 border border-rose-500/40",
      luxury:
        "bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:opacity-95 border border-indigo-400/30",
      emerald:
        "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/25 focus:ring-emerald-500 border border-emerald-500/30",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
