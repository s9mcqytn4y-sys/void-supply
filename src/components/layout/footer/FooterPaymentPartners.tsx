"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";
import { PaymentLogosRow, CourierLogosRow } from "@/components/ui/PaymentCourierBadges";

export function FooterPaymentPartners() {
  const { t } = useI18n();

  return (
    <div className="md:col-span-2 space-y-6">
      <div>
        <span className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase block mb-3">
          {t.footer.payment_methods}
        </span>
        <PaymentLogosRow />
      </div>

      <div>
        <span className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase block mb-3">
          {t.footer.courier_partners}
        </span>
        <CourierLogosRow />
      </div>
    </div>
  );
}
