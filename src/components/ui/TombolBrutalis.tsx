import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const varianTombol = cva(
  "inline-flex items-center justify-center font-mono font-semibold uppercase tracking-wider transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white",
  {
    variants: {
      varian: {
        primer: "border border-white bg-white text-black hover:bg-zinc-200 active:bg-zinc-300",
        sekunder: "border border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-500 hover:text-white active:bg-zinc-800",
        outline: "border border-zinc-800 bg-transparent text-zinc-300 hover:border-zinc-500 hover:text-white active:bg-zinc-900/60",
        bahaya: "border border-rose-600/60 bg-rose-950/60 text-rose-300 hover:bg-rose-900 hover:text-white active:bg-rose-800",
        ghost: "bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white",
      },
      ukuran: {
        default: "min-h-11 px-5 py-2.5 text-xs",
        sm: "min-h-9 px-3 py-1.5 text-[11px]",
        lg: "min-h-12 px-8 py-3 text-sm",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      varian: "primer",
      ukuran: "default",
    },
  }
);

export interface TombolBrutalisProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof varianTombol> {
  sedangMemuat?: boolean;
}

export const TombolBrutalis = React.forwardRef<HTMLButtonElement, TombolBrutalisProps>(
  ({ className, varian, ukuran, sedangMemuat = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || sedangMemuat}
        className={cn(varianTombol({ varian, ukuran, className }))}
        {...props}
      >
        {sedangMemuat ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>MEMPROSES...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

TombolBrutalis.displayName = "TombolBrutalis";
