"use client";

import React from "react";
import { Toaster } from "sonner";

export function SonnerToaster() {
  return (
    <Toaster
      theme="dark"
      position="bottom-right"
      toastOptions={{
        className:
          "!bg-zinc-950 !border !border-zinc-800 !text-zinc-50 !font-sans !shadow-2xl !rounded-none !p-4 !text-xs",
        descriptionClassName: "!text-zinc-400 !font-mono !text-[11px] !mt-1",
        actionButtonStyle: {
          backgroundColor: "#fafafa",
          color: "#09090b",
          borderRadius: 0,
          fontWeight: 600,
          fontFamily: "monospace",
          fontSize: "11px",
        },
        cancelButtonStyle: {
          backgroundColor: "#27272a",
          color: "#fafafa",
          borderRadius: 0,
          fontFamily: "monospace",
          fontSize: "11px",
        },
      }}
      duration={3500}
    />
  );
}
