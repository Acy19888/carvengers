import type { ServiceTier } from "../../types/models";
import type { PaymentMethod } from "../../constants/payment";
import { TIER_PRICES } from "../../constants/payment";

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  method: PaymentMethod;
  amount: number;
  error?: string;
}

/**
 * Payment service abstraction.
 *
 * MVP: Simulates payment processing.
 * Production: Replace with real Stripe/PayPal SDK calls.
 *
 * To integrate Stripe:
 * 1. npm install @stripe/stripe-react-native
 * 2. Set up Stripe account & get publishable key
 * 3. Create backend endpoint for payment intents
 * 4. Replace processPayment() with real Stripe flow
 *
 * To integrate PayPal:
 * 1. npm install @paypal/react-native-paypal
 * 2. Set up PayPal developer account
 * 3. Replace processPayment() with real PayPal flow
 */

/** Process a payment (mock for MVP) */
export async function processPayment(
  tier: ServiceTier,
  method: PaymentMethod,
): Promise<PaymentResult> {
  const amount = TIER_PRICES[tier];

  // Simulate payment processing
  await delay(2000);

  // Mock: always succeeds
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return {
    success: true,
    transactionId,
    method,
    amount,
  };
}

/** Validate that a payment method is available on this device */
export function isPaymentMethodAvailable(method: PaymentMethod): boolean {
  switch (method) {
    case "stripe":
      return true; // Credit card always available
    case "paypal":
      return true; // PayPal always available (opens browser)
    case "google_pay":
      // TODO: Check with Stripe SDK if Google Pay is available
      return true;
    case "apple_pay":
      // Only on iOS
      const { Platform } = require("react-native");
      return Platform.OS === "ios";
    default:
      return false;
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
