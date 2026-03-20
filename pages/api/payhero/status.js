/**
 * pages/api/payhero/status.js
 *
 * Server-side API route that checks a PayHero transaction status.
 * Called when the user pastes their M-Pesa SMS and clicks "Confirm Payment".
 *
 * GET /api/payhero/status?reference=SKQ96C7K7H
 *
 * PayHero Transaction Status endpoint:
 *   GET https://backend.payhero.co.ke/api/v2/transaction-status?reference={reference}
 *
 * Response shape (per PayHero docs):
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
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { reference } = req.query;

  if (!reference) {
    return res.status(400).json({ message: 'Missing required query param: reference' });
  }

  // ── Read credentials from server-side env ─────────────────────────────────
  const authToken = process.env.PAYHERO_AUTH_TOKEN;

  if (!authToken) {
    console.error('[PayHero Status] Missing PAYHERO_AUTH_TOKEN in env');
    return res.status(500).json({ message: 'Payment service is not configured.' });
  }

  // ── Call PayHero transaction-status endpoint ───────────────────────────────
  try {
    const url = `https://backend.payhero.co.ke/api/v2/transaction-status?reference=${encodeURIComponent(reference)}`;

    const payheroRes = await fetch(url, {
      method:  'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authToken}`,
      },
    });

    const data = await payheroRes.json();

    console.log('[PayHero Status] Response for', reference, ':', JSON.stringify(data));

    if (!payheroRes.ok) {
      const errMsg = data?.message || data?.error || data?.detail || `PayHero error (${payheroRes.status})`;
      console.error('[PayHero Status] Error from PayHero:', errMsg);
      return res.status(payheroRes.status).json({ message: errMsg });
    }

    // Return the full PayHero response to the client
    return res.status(200).json(data);

  } catch (err) {
    console.error('[PayHero Status] Network error:', err);
    return res.status(500).json({ message: 'Failed to reach PayHero. Please try again.' });
  }
}