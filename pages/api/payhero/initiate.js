/**
 * pages/api/payhero/initiate.js
 *
 * Server-side API route that sends an M-Pesa STK Push via PayHero.
 * Runs on the server — credentials are NEVER exposed to the browser.
 *
 * POST /api/payhero/initiate
 * Body: { phone, amountKes, reference, planName, callbackUrl }
 *
 * PayHero STK Push endpoint:
 *   POST https://backend.payhero.co.ke/api/v2/payments
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { phone, amountKes, reference, planName, callbackUrl } = req.body;

  // ── Validate incoming fields ──────────────────────────────────────────────
  if (!phone || !amountKes || !reference) {
    return res.status(400).json({ message: 'Missing required fields: phone, amountKes, reference' });
  }

  // ── Read credentials from server-side env (no NEXT_PUBLIC_ prefix) ────────
  const authToken  = process.env.PAYHERO_AUTH_TOKEN;
  const channelId  = Number(process.env.PAYHERO_CHANNEL_ID);

  if (!authToken || !channelId) {
    console.error('[PayHero Initiate] Missing PAYHERO_AUTH_TOKEN or PAYHERO_CHANNEL_ID in env');
    return res.status(500).json({ message: 'Payment service is not configured. Please contact support.' });
  }

  // ── Normalise phone to 254XXXXXXXXX ────────────────────────────────────────
  const normalizePhone = (p) => {
    const d = String(p).replace(/\D/g, '');
    if (d.startsWith('254') && d.length === 12) return d;
    if (d.startsWith('0')   && d.length === 10) return `254${d.slice(1)}`;
    if (d.length === 9)                          return `254${d}`;
    throw new Error(`Invalid phone number format: ${p}`);
  };

  let normalizedPhone;
  try {
    normalizedPhone = normalizePhone(phone);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  // ── Build STK Push payload ─────────────────────────────────────────────────
  const payload = {
    amount:             amountKes,
    phone_number:       normalizedPhone,
    channel_id:         channelId,
    provider:           'm-pesa',
    external_reference: reference,
    customer_name:      'EarnFlex User',
    description:        `EarnFlex ${planName || 'Subscription'} Activation`,
    callback_url:       callbackUrl,
  };

  // ── POST to PayHero ────────────────────────────────────────────────────────
  try {
    const payheroRes = await fetch('https://backend.payhero.co.ke/api/v2/payments', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await payheroRes.json();

    console.log('[PayHero Initiate] Response:', JSON.stringify(data));

    if (!payheroRes.ok) {
      const errMsg = data?.message || data?.error || data?.detail || `PayHero error (${payheroRes.status})`;
      console.error('[PayHero Initiate] Error from PayHero:', errMsg, data);
      return res.status(payheroRes.status).json({ message: errMsg });
    }

    // Success — return checkout request ID to client
    return res.status(200).json({
      success:           true,
      checkoutRequestId: data.CheckoutRequestID || data.checkout_request_id || '',
      reference,
      message:           'STK push sent. Check your phone.',
    });

  } catch (err) {
    console.error('[PayHero Initiate] Network error:', err);
    return res.status(500).json({ message: 'Failed to reach PayHero. Please try again.' });
  }
}