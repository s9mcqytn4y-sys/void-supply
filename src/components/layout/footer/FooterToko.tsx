"use client";

import React from "react";
import { FooterBrand } from "./FooterBrand";
import { FooterQuickLinks } from "./FooterQuickLinks";
import { FooterPaymentPartners } from "./FooterPaymentPartners";
import { FooterLegalBar } from "./FooterLegalBar";

export function FooterToko() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 py-12 text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          <FooterBrand />
          <FooterQuickLinks />
          <FooterPaymentPartners />
        </div>
        <FooterLegalBar />
      </div>
    </footer>
  );
}
