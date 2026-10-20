"use server";

import * as query from "./pesanan-admin.query";
import * as lifecycle from "./pesanan-admin.lifecycle";
import * as fulfillment from "./pesanan-admin.fulfillment";

export async function ambilDaftarPesananAdminAction(
  ...args: Parameters<typeof query.ambilDaftarPesananAdminAction>
) {
  return query.ambilDaftarPesananAdminAction(...args);
}

export async function ambilDetailPesananAdminAction(
  ...args: Parameters<typeof query.ambilDetailPesananAdminAction>
) {
  return query.ambilDetailPesananAdminAction(...args);
}

export async function inquireMidtransStatusAction(
  ...args: Parameters<typeof lifecycle.inquireMidtransStatusAction>
) {
  return lifecycle.inquireMidtransStatusAction(...args);
}

export async function batalkanPesananAdminAction(
  ...args: Parameters<typeof lifecycle.batalkanPesananAdminAction>
) {
  return lifecycle.batalkanPesananAdminAction(...args);
}

export async function tambahCatatanOperasionalAction(
  ...args: Parameters<typeof lifecycle.tambahCatatanOperasionalAction>
) {
  return lifecycle.tambahCatatanOperasionalAction(...args);
}

export async function batchRequestPickupBiteshipAction(
  ...args: Parameters<typeof fulfillment.batchRequestPickupBiteshipAction>
) {
  return fulfillment.batchRequestPickupBiteshipAction(...args);
}

export type {
  ItemPesananAdmin,
  PesananAdminRow,
  DetailPesananAdminData,
} from "./pesanan-admin.query";
export type { HasilBatchFulfillment } from "./pesanan-admin.fulfillment";
