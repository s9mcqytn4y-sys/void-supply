import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputTeksBrutalisProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  pesanError?: string;
  petunjukBantuan?: string;
}

export const InputTeksBrutalis = React.forwardRef<HTMLInputElement, InputTeksBrutalisProps>(
  ({ className, type = "text", label, pesanError, petunjukBantuan, id, disabled, ...props }, ref) => {
    const inputId = id || React.useId();
    const statusWarnaClass = pesanError
      ? "border-rose-600 focus-visible:border-rose-500 focus-visible:ring-rose-500"
      : "border-zinc-800 focus-visible:border-white focus-visible:ring-white";

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-300"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full min-h-11 border bg-zinc-950 px-3 py-2 font-mono text-xs text-white placeholder:text-zinc-600 transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:opacity-40 disabled:cursor-not-allowed",
            statusWarnaClass,
            className
          )}
          {...props}
        />
        {pesanError ? (
          <p className="font-mono text-[11px] text-rose-400">{pesanError}</p>
        ) : petunjukBantuan ? (
          <p className="font-mono text-[10px] text-zinc-500">{petunjukBantuan}</p>
        ) : null}
      </div>
    );
  }
);

InputTeksBrutalis.displayName = "InputTeksBrutalis";
