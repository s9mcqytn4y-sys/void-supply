import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-neutral-700 bg-neutral-900/80 text-neutral-300",
        outline:
          "border-neutral-800 bg-transparent text-neutral-400",
        scarcity:
          "border-red-800/80 bg-red-950/60 text-red-300",
        soldout:
          "border-neutral-800 bg-neutral-950/90 text-neutral-500 line-through",
        exclusive:
          "border-white bg-white text-black font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
