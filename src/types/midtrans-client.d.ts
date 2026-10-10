declare module "midtrans-client" {
  export interface SnapOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  export interface SnapTransactionPayload {
    transaction_details: {
      order_id: string;
      gross_amount: number;
    };
    item_details?: Array<{
      id: string;
      price: number;
      quantity: number;
      name: string;
    }>;
    customer_details?: {
      first_name?: string;
      email?: string;
      phone?: string;
      billing_address?: Record<string, unknown>;
      shipping_address?: Record<string, unknown>;
    };
    callbacks?: {
      finish?: string;
      error?: string;
      pending?: string;
    };
  }

  export interface SnapTransactionResult {
    token: string;
    redirect_url: string;
  }

  export class Snap {
    constructor(options: SnapOptions);
    createTransaction(payload: SnapTransactionPayload): Promise<SnapTransactionResult>;
    createTransactionToken(payload: SnapTransactionPayload): Promise<string>;
    createTransactionRedirectUrl(payload: SnapTransactionPayload): Promise<string>;
  }

  export interface CoreApiOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  export class CoreApi {
    constructor(options: CoreApiOptions);
    charge(payload: Record<string, unknown>): Promise<Record<string, unknown>>;
  }

  const midtransClient: {
    Snap: typeof Snap;
    CoreApi: typeof CoreApi;
  };

  export default midtransClient;
}
