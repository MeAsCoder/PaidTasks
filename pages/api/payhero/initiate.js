// ─── Add this OUTSIDE the handler, at the top of the file ────────────────────
const recentRequests = new Map();
const COOLDOWN_SECONDS = 30;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { phone, amountKes, reference, planName, callbackUrl } = req.body;

  if (!phone || !amountKes || !reference) {
    return res.status(400).json({ message: 'Missing required fields: phone, amountKes, reference' });
  }

  const authToken  = process.env.PAYHERO_AUTH_TOKEN;
  const channelId  = Number(process.env.PAYHERO_CHANNEL_ID);

  if (!authToken || !channelId) {
    console.error('[PayHero Initiate] Missing PAYHERO_AUTH_TOKEN or PAYHERO_CHANNEL_ID in env');
    return res.status(500).json({ message: 'Payment service is not configured. Please contact support.' });
  }

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

  // ── ADD COOLDOWN GUARD HERE — after phone is normalised ───────────────────
  const now = Date.now();
  const lastRequest = recentRequests.get(normalizedPhone);

  if (lastRequest) {
    const secondsRemaining = COOLDOWN_SECONDS - Math.floor((now - lastRequest) / 1000);
    if (secondsRemaining > 0) {
      console.warn(`[PayHero Initiate] Cooldown active — ${secondsRemaining}s remaining for ${normalizedPhone}`);
      return res.status(429).json({
        message: `Please wait ${secondsRemaining} seconds before trying again.`,
        retryAfter: secondsRemaining,
      });
    }
  }

  // Record this attempt
  recentRequests.set(normalizedPhone, now);

  // Clean up entries older than 5 minutes to avoid memory leaks
  for (const [key, ts] of recentRequests.entries()) {
    if (now - ts > 5 * 60 * 1000) recentRequests.delete(key);
  }
  // ── END COOLDOWN GUARD ────────────────────────────────────────────────────

  const payload = {
    amount:             amountKes,
    phone_number:       normalizedPhone,
    channel_id:         channelId,
    provider:           'm-pesa',
    external_reference: reference,
    customer_name:      'HandShake AI User',
    description:        `HandShake AI ${planName || 'Subscription'} Activation`,
    callback_url:       callbackUrl,
  };

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
      // Remove cooldown on PayHero rejection so user can retry
      recentRequests.delete(normalizedPhone);
      const errMsg = data?.error_message || data?.message || data?.error || `PayHero error (${payheroRes.status})`;
      console.error('[PayHero Initiate] Error from PayHero:', errMsg, data);
      return res.status(payheroRes.status).json({ message: errMsg });
    }

    return res.status(200).json({
      success:           true,
      checkoutRequestId: data.CheckoutRequestID || data.checkout_request_id || '',
      reference,
      message:           'STK push sent. Check your phone.',
    });

  } catch (err) {
    recentRequests.delete(normalizedPhone); // Remove on network error so user can retry
    console.error('[PayHero Initiate] Network error:', err);
    return res.status(500).json({ message: 'Failed to reach PayHero. Please try again.' });
  }
}