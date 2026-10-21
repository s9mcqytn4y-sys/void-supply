"use client";

import React from "react";
import { Toaster } from "sonner";

export function SonnerToaster() {
  return (
    <Toaster
      theme="dark"
      position="bottom-right"
      closeButton={true}
      offset={{ bottom: "5.5rem", right: "1.25rem" }}
      toastOptions={{
        className:
          "!bg-zinc-950 !border !border-zinc-850 !text-zinc-50 !font-sans !shadow-2xl !rounded-none !p-4 !text-xs !tracking-wide",
        descriptionClassName: "!text-zinc-400 !font-mono !text-[11px] !mt-1.5 !leading-relaxed",
        actionButtonStyle: {
          backgroundColor: "#ffffff",
          color: "#000000",
          borderRadius: 0,
          fontWeight: 700,
          fontFamily: "'SFMono-Regular', Consolas, monospace",
          fontSize: "11px",
          minHeight: "36px",
          padding: "0 12px",
        },
        cancelButtonStyle: {
          backgroundColor: "#27272a",
          color: "#ffffff",
          borderRadius: 0,
          fontFamily: "'SFMono-Regular', Consolas, monospace",
          fontSize: "11px",
          minHeight: "36px",
          padding: "0 12px",
        },
      }}
      duration={4000}
    />
  );
}
