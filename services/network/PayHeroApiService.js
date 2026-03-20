/**
 * PayHeroApiService
 * Business-logic service that wraps PayHeroApiClient.
 *
 * Payment flow:
 *   1. initiateStkPush()  → PayHero sends STK prompt to user's phone
 *   2. User pays → PayHero POSTs to /api/payhero/callback → stored in Firebase
 *   3. pollFirebaseForResult() listens to Firebase until callback arrives
 *   4. User pastes M-Pesa SMS → queryTransactionStatus() fetches live status
 *      from PayHero GET /transaction-status?reference=...
 *   5. validatePaymentMessage() cross-checks SMS text against API response
 *
 * Transaction Status Response shape (per PayHero docs):
 * {
 *   "transaction_date": "2024-11-26T08:41:14.160604Z",
 *   "provider": "m-pesa",
 *   "success": true,
 *   "merchant": "Ron Doe",
 *   "payment_reference": "",
 *   "third_party_reference": "SKQ96C7K7H",   ← M-Pesa receipt code
 *   "status": "SUCCESS",
 *   "reference": "6b71cb8b-638d-4b6e-9c7c-b0334a641e3a",
 *   "CheckoutRequestID": "",
 *   "provider_reference": "SKQ96C7K7H"        ← M-Pesa receipt code (duplicate)
 * }
 */

import payHeroApiClient from './PayHeroApiClient';
import { getDatabase, ref, onValue, off, get } from 'firebase/database';

const CHANNEL_ID      = Number(process.env.NEXT_PUBLIC_PAYHERO_CHANNEL_ID) || 0;
const POLL_TIMEOUT_MS = 120_000; // 2 minutes

export const TXN_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILED:  'FAILED',
  PENDING: 'PENDING',
};

class PayHeroApiService {

  // ── 1. STK Push ─────────────────────────────────────────────────────────────

  /**
   * Initiate an M-Pesa STK push via PayHero.
   */
  async initiateStkPush({ phone, amountKsh, reference, description, callbackUrl }) {
    const payload = {
      amount:             amountKsh,
      phone_number:       this._normalizePhone(phone),
      channel_id:         CHANNEL_ID,
      provider:           'm-pesa',
      external_reference: reference,
      customer_name:      'EarnFlex User',
      description:        description || 'EarnFlex subscription activation',
      callback_url:       callbackUrl,
    };

    const data = await payHeroApiClient.post('/payments', payload);

    return {
      checkoutRequestId: data.CheckoutRequestID || data.checkout_request_id || '',
      reference,
      raw: data,
    };
  }

  // ── 2. Firebase polling (waits for webhook callback) ────────────────────────

  /**
   * Listen to Firebase for the PayHero webhook callback result.
   * The /api/payhero/callback route writes to: paymentCallbacks/{safeRef}
   *
   * Resolves with a parsed result when SUCCESS or FAILED arrives.
   * Rejects after 2 minutes — caller should then move to CONFIRM step anyway.
   */
  pollFirebaseForResult(reference) {
    return new Promise((resolve, reject) => {
      const db      = getDatabase();
      const safeRef = this._safeKey(reference);
      const dbRef   = ref(db, `paymentCallbacks/${safeRef}`);

      const timeout = setTimeout(() => {
        off(dbRef, 'value', listener);
        reject(new Error(
          'Waiting timed out. If M-Pesa deducted funds, paste your confirmation message below.'
        ));
      }, POLL_TIMEOUT_MS);

      const listener = onValue(dbRef, (snapshot) => {
        if (!snapshot.exists()) return;
        const result = this._parseCallbackData(snapshot.val());
        if (result.status === TXN_STATUS.SUCCESS || result.status === TXN_STATUS.FAILED) {
          clearTimeout(timeout);
          off(dbRef, 'value', listener);
          resolve(result);
        }
      });
    });
  }

  // ── 3. Direct API status check (via our server-side route) ─────────────────

  /**
   * Fetch live transaction status via our server-side Next.js API route.
   * The route proxies to: GET /transaction-status?reference={reference}
   *
   * The `reference` param accepts either:
   *   - The external_reference used when initiating the STK push
   *   - The M-Pesa receipt/transaction code extracted from the SMS (e.g. SKQ96C7K7H)
   *
   * @param {string} reference
   * @returns {Promise<ParsedTransactionResult>}
   */
  async queryTransactionStatus(reference) {
    const res = await fetch(
      `/api/payhero/status?reference=${encodeURIComponent(reference)}`
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || `Status check failed (${res.status})`);
    }

    return this._parseStatusResponse(data);
  }

  // ── 4. SMS Validation ────────────────────────────────────────────────────────

  /**
   * Validate a pasted M-Pesa SMS against the live PayHero transaction status.
   *
   * Checks (in order):
   *   1. API confirms status = "SUCCESS" and success = true
   *   2. M-Pesa receipt code (provider_reference / third_party_reference)
   *      is present in the pasted SMS
   *   3. KSh amount in SMS matches expected amount (±1 KES tolerance for rounding)
   *   4. Transaction date is within 30 minutes (not a recycled old message)
   *
   * @param {string} mpesaMessage        raw pasted SMS text
   * @param {object} params
   * @param {number} params.expectedAmountKsh
   * @param {ParsedTransactionResult} params.transactionResult  from queryTransactionStatus()
   *
   * @returns {{ valid: boolean, reason?: string }}
   */
  validatePaymentMessage(mpesaMessage, { expectedAmountKsh, transactionResult }) {
    const msg = (mpesaMessage || '').trim();

    if (!transactionResult) {
      return {
        valid:  false,
        reason: 'No payment record found. Please restart the payment process.',
      };
    }

    // ── Check 1: API status ────────────────────────────────────────────────────
    if (transactionResult.status !== TXN_STATUS.SUCCESS || !transactionResult.success) {
      return {
        valid:  false,
        reason: `Payment was not successful (status: ${transactionResult.status}). ` +
                'Please ensure your M-Pesa PIN was entered correctly and try again.',
      };
    }

    // ── Check 2: M-Pesa receipt code in SMS ───────────────────────────────────
    // PayHero returns the M-Pesa code in both provider_reference and third_party_reference
    const receipt = transactionResult.providerReference || transactionResult.thirdPartyReference;
    if (receipt) {
      if (!msg.toUpperCase().includes(receipt.toUpperCase())) {
        return {
          valid:  false,
          reason: `M-Pesa code ${receipt} was not found in your message. ` +
                  'Please paste the exact confirmation SMS you received after payment.',
        };
      }
    }

    // ── Check 3: Amount match ──────────────────────────────────────────────────
    // Matches: "Ksh1,285.00", "KSh 1285", "KSh1,285", "Ksh 1285.00"
    const amountMatch = msg.match(/(?:Ksh|KSh)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
    if (!amountMatch) {
      return {
        valid:  false,
        reason: 'Could not read a KSh amount from your message. ' +
                'Please paste the full M-Pesa confirmation SMS.',
      };
    }
    const paidAmount = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (Math.abs(paidAmount - expectedAmountKsh) > 1) {
      return {
        valid:  false,
        reason: `Amount mismatch — expected KSh ${expectedAmountKsh.toLocaleString()} ` +
                `but your message shows KSh ${paidAmount.toLocaleString()}. ` +
                'Please paste the correct confirmation SMS.',
      };
    }

    // ── Check 4: Freshness (within 30 minutes) ────────────────────────────────
    if (transactionResult.transactionDate) {
      const ageMs = Date.now() - new Date(transactionResult.transactionDate).getTime();
      if (ageMs > 30 * 60 * 1000) {
        return {
          valid:  false,
          reason: 'This payment confirmation is older than 30 minutes. ' +
                  'Please initiate a new payment.',
        };
      }
    }

    return { valid: true };
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  /**
   * Parse GET /transaction-status response into a normalised result.
   *
   * Raw response shape (PayHero docs):
   * {
   *   "transaction_date":      "2024-11-26T08:41:14.160604Z",
   *   "provider":              "m-pesa",
   *   "success":               true,
   *   "merchant":              "Ron Doe",
   *   "payment_reference":     "",
   *   "third_party_reference": "SKQ96C7K7H",
   *   "status":                "SUCCESS",
   *   "reference":             "6b71cb8b-638d-4b6e-9c7c-b0334a641e3a",
   *   "CheckoutRequestID":     "",
   *   "provider_reference":    "SKQ96C7K7H"
   * }
   *
   * @returns {ParsedTransactionResult}
   */
  _parseStatusResponse(data) {
    const rawStatus = data?.status || '';
    const isSuccess = data?.success === true && rawStatus.toUpperCase() === 'SUCCESS';

    return {
      // Core status
      status:               isSuccess ? TXN_STATUS.SUCCESS : TXN_STATUS.FAILED,
      success:              data?.success === true,

      // M-Pesa receipt codes — both fields carry the same value per PayHero docs
      providerReference:    data?.provider_reference    || '',  // "SKQ96C7K7H"
      thirdPartyReference:  data?.third_party_reference || '',  // "SKQ96C7K7H"
      paymentReference:     data?.payment_reference     || '',

      // Identifiers
      reference:            data?.reference             || '',  // external_reference echo
      checkoutRequestId:    data?.CheckoutRequestID     || '',

      // Metadata
      transactionDate:      data?.transaction_date      || null, // ISO string
      provider:             data?.provider              || '',
      merchant:             data?.merchant              || '',

      raw: data,
    };
  }

  /**
   * Parse Firebase-stored webhook callback payload (legacy, kept for
   * cases where direct API check fails).
   */
  _parseCallbackData(data) {
    const r          = data?.response || data || {};
    const rawStatus  = r?.Status || r?.status || '';
    const resultCode = r?.ResultCode ?? r?.result_code ?? -1;
    const isSuccess  =
      String(rawStatus).toLowerCase() === 'success' || Number(resultCode) === 0;

    return {
      status:              isSuccess ? TXN_STATUS.SUCCESS : TXN_STATUS.FAILED,
      success:             isSuccess,
      providerReference:   r?.MpesaReceiptNumber || r?.mpesa_receipt_number || '',
      thirdPartyReference: r?.MpesaReceiptNumber || r?.mpesa_receipt_number || '',
      paymentReference:    '',
      reference:           r?.ExternalReference  || r?.external_reference   || '',
      checkoutRequestId:   r?.CheckoutRequestID  || '',
      transactionDate:     r?.TransactionDate    || data?.receivedAt        || null,
      provider:            'mpesa',
      merchant:            '',
      raw: data,
    };
  }

  /** Replace Firebase-unsafe characters in keys */
  _safeKey(str) {
    return str.replace(/[.#$[\]/]/g, '_');
  }

  /** Normalise phone to 254XXXXXXXXX */
  _normalizePhone(phone) {
    const d = phone.replace(/\D/g, '');
    if (d.startsWith('254') && d.length === 12) return d;
    if (d.startsWith('0')   && d.length === 10) return `254${d.slice(1)}`;
    if (d.length === 9)                          return `254${d}`;
    throw new Error(`Invalid phone number: ${phone}. Use format 07XXXXXXXX.`);
  }
}

/**
 * @typedef {object} ParsedTransactionResult
 * @property {string}       status               - TXN_STATUS enum value
 * @property {boolean}      success              - raw success boolean from API
 * @property {string}       providerReference    - M-Pesa receipt code (e.g. SKQ96C7K7H)
 * @property {string}       thirdPartyReference  - same as providerReference
 * @property {string}       paymentReference
 * @property {string}       reference            - your external_reference echoed back
 * @property {string}       checkoutRequestId
 * @property {string|null}  transactionDate      - ISO timestamp
 * @property {string}       provider
 * @property {string}       merchant
 * @property {object}       raw                  - full original API response
 */

const payHeroApiService = new PayHeroApiService();
export default payHeroApiService;