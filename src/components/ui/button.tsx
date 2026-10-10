import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center font-mono font-semibold uppercase tracking-wider transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
  {
    variants: {
      variant: {
        primary:
          "bg-white text-black hover:bg-neutral-200 active:bg-neutral-300",
        secondary:
          "border border-neutral-700 bg-transparent text-neutral-200 hover:border-white hover:text-white active:bg-neutral-900",
        outline:
          "border border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-500 hover:text-white",
        ghost:
          "bg-transparent text-neutral-400 hover:bg-neutral-900 hover:text-white",
      },
      size: {
        default: "min-h-11 px-5 py-2.5 text-xs",
        sm: "min-h-9 px-3 py-1.5 text-[11px]",
        lg: "min-h-12 px-8 py-3 text-sm",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
