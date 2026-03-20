/**
 * /api/payhero/callback
 *
 * PayHero POSTs payment results to this endpoint.
 * We update the user's subscription in Firebase Realtime Database.
 *
 * PayHero webhook payload shape:
 * {
 *   "status": "SUCCESS" | "FAILED",
 *   "external_reference": "EF-abc12345-gold-1234567890",
 *   "MpesaReceiptNumber": "QHX4K9LMNO",
 *   "Amount": 2577,
 *   "PhoneNumber": "254712345678",
 *   "TransactionDate": "2025-03-20T10:30:00Z",
 *   ...
 * }
 */

import { getDatabase, ref, get, update } from 'firebase/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    console.log('[PayHero Callback]', JSON.stringify(payload, null, 2));

    const status    = payload?.status || payload?.Status || '';
    const reference = payload?.external_reference || payload?.ExternalReference || '';
    const receipt   = payload?.MpesaReceiptNumber  || payload?.mpesa_receipt_number || '';
    const amount    = payload?.Amount || payload?.amount || 0;

    if (!reference) {
      return res.status(400).json({ message: 'Missing external_reference' });
    }

    // Reference format: EF-{userId8chars}-{planId}-{timestamp}
    // e.g. EF-abc12345-gold-1234567890
    const parts = reference.split('-');
    // parts: ['EF', userId8, planId, timestamp]
    if (parts.length < 4 || parts[0] !== 'EF') {
      console.warn('[PayHero Callback] Unrecognised reference format:', reference);
      return res.status(200).json({ message: 'Unrecognised reference, ignoring' });
    }

    // We can't reconstruct full userId from 8 chars alone — in production,
    // store reference → userId mapping in Firebase when STK push is initiated.
    // Here we look up by reference in a payments index.
    const db = getDatabase();
    const paymentIndexSnap = await get(ref(db, `paymentIndex/${reference.replace(/\//g, '_')}`));

    if (!paymentIndexSnap.exists()) {
      console.warn('[PayHero Callback] No payment index entry for reference:', reference);
      return res.status(200).json({ message: 'Reference not found in index' });
    }

    const { userId, planId } = paymentIndexSnap.val();

    if (status.toUpperCase() === 'SUCCESS') {
      await update(ref(db, `users/${userId}`), {
        subscription: {
          plan:        planId,
          activatedAt: Date.now(),
          status:      'active',
          isActivated: true,
          receipt:     receipt,
          amountPaid:  amount,
          reference:   reference,
        },
      });

      // Clean up index
      await update(ref(db, `paymentIndex`), {
        [reference.replace(/\//g, '_')]: null,
      });

      console.log(`[PayHero Callback] Subscription activated for user ${userId}, plan ${planId}`);
    } else {
      // Mark payment as failed in index so client can detect it
      await update(ref(db, `paymentIndex/${reference.replace(/\//g, '_')}`), {
        status: 'FAILED',
        failedAt: Date.now(),
      });

      console.log(`[PayHero Callback] Payment FAILED for reference ${reference}`);
    }

    // Always return 200 to PayHero so they don't retry
    return res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error('[PayHero Callback] Error:', err);
    // Still return 200 to prevent PayHero retries for server errors
    return res.status(200).json({ message: 'Internal error logged' });
  }
}