/**
 * PayHeroService
 * High-level façade used by UI components.
 *
 * Environment variables (.env.local):
 *   PAYHERO_AUTH_TOKEN   = WnFBaGZsbE1GS2hoaEx5S21hSU86b1YwM1oxV0w4dmoyOXRwOGJTaHFINVRBQ2RpNDB1S0Q0eUptaHBXNA==
 *   PAYHERO_CHANNEL_ID   = 5403
 *   NEXT_PUBLIC_APP_URL  = https://your-domain.com
 *
 * NOTE: Use server-side names (without NEXT_PUBLIC_) for the token and channel ID
 * so they are never exposed in the browser bundle. The STK push is made through
 * your Next.js API route (/api/payhero/initiate) which reads them server-side.
 */

import payHeroApiService, { TXN_STATUS } from './network/PayHeroApiService';

export const USD_TO_KES_RATE = 128.849;
export const usdToKes        = (usd) => Math.round(usd * USD_TO_KES_RATE);
export const formatKes       = (kes) => `KSh ${Number(kes).toLocaleString('en-KE')}`;
export { TXN_STATUS };

class PayHeroService {

  /**
   * Step 1 — Send STK push via your server-side API route.
   * Returns { reference, amountKes }.
   */
  async sendStkPush({ phone, amountUsd, userId, planId, planName }) {
    const amountKes = usdToKes(amountUsd);
    const reference = `EF-${userId.slice(0, 8)}-${planId}-${Date.now()}`;

    const callbackUrl =
      process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payhero/callback`
        : `${window.location.origin}/api/payhero/callback`;

    // Call our own server-side API route — keeps credentials off the client
    const res = await fetch('/api/payhero/initiate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ phone, amountKes, reference, planName, callbackUrl }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to send M-Pesa request.');

    return { reference, amountKes };
  }

  /**
   * Step 2 — Listen to Firebase until PayHero callback arrives.
   * Resolves with a ParsedTransactionResult.
   */
  waitForPayment(reference) {
    return payHeroApiService.pollFirebaseForResult(reference);
  }

  /**
   * Step 3 — Fetch live transaction status directly from PayHero API.
   *
   * Called when the user clicks "Confirm Payment" on the SMS paste step.
   * This makes a live call to:
   *   GET https://backend.payhero.co.ke/api/v2/transaction-status?reference={reference}
   *
   * The reference can be either:
   *   - The external_reference used when the STK push was initiated (e.g. EF-abc12345-gold-...)
   *   - The M-Pesa transaction code extracted from the pasted SMS (e.g. SKQ96C7K7H)
   *
   * Using the M-Pesa code from the SMS as the reference gives the most reliable
   * result because it directly matches PayHero's provider_reference field.
   *
   * @param {string} reference
   * @returns {Promise<ParsedTransactionResult>}
   */
  async fetchTransactionStatus(reference) {
    return payHeroApiService.queryTransactionStatus(reference);
  }

  /**
   * Step 3 (combined) — Extract M-Pesa code from pasted SMS, fetch live
   * status from PayHero using that code, then validate the full SMS.
   *
   * This is the main method called when the user clicks "Confirm Payment".
   *
   * @param {string} mpesaMessage     raw pasted SMS text
   * @param {object} params
   * @param {string} params.reference  original external_reference from sendStkPush
   * @param {number} params.amountKes  expected amount in KES
   *
   * @returns {Promise<{ valid: boolean, reason?: string, transactionResult?: ParsedTransactionResult }>}
   */
  async verifyWithLiveCheck(mpesaMessage, { reference, amountKes }) {
    // Try to extract the M-Pesa transaction code from the SMS first —
    // querying by the short M-Pesa code (e.g. SKQ96C7K7H) is more reliable
    // than the full external_reference because it directly matches provider_reference.
    const mpesaCodeMatch = mpesaMessage.match(/\b([A-Z0-9]{10})\b/);
    const queryRef = mpesaCodeMatch ? mpesaCodeMatch[1] : reference;

    let transactionResult;
    try {
      transactionResult = await payHeroApiService.queryTransactionStatus(queryRef);
    } catch (err) {
      // If the M-Pesa code lookup fails, fall back to the original reference
      if (mpesaCodeMatch && queryRef !== reference) {
        try {
          transactionResult = await payHeroApiService.queryTransactionStatus(reference);
        } catch {
          throw new Error('Could not verify payment with PayHero. Please try again or contact support.');
        }
      } else {
        throw err;
      }
    }

    const validation = payHeroApiService.validatePaymentMessage(mpesaMessage, {
      expectedAmountKsh: amountKes,
      transactionResult,
    });

    return {
      ...validation,
      transactionResult,
    };
  }

  /**
   * Validate an SMS against an already-fetched transaction result
   * (for cases where you have the result from the Firebase callback).
   */
  validateSmsMessage(mpesaMessage, { amountKes, transactionResult }) {
    return payHeroApiService.validatePaymentMessage(mpesaMessage, {
      expectedAmountKsh: amountKes,
      transactionResult,
    });
  }
}

const payHeroService = new PayHeroService();
export default payHeroService;