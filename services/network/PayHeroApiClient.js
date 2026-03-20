/**
 * PayHeroApiClient
 * Low-level HTTP client for the PayHero REST API.
 * Handles authentication, request building, and raw response parsing.
 *
 * Docs: https://docs.payhero.co.ke
 */

const PAYHERO_BASE_URL = process.env.NEXT_PUBLIC_PAYHERO_BASE_URL || 'https://backend.payhero.co.ke/api/v2';

// Basic-auth token: base64(username:password)
// Store as NEXT_PUBLIC_PAYHERO_AUTH_TOKEN in .env.local
// Generate: btoa('YOUR_USERNAME:YOUR_PASSWORD')
const PAYHERO_AUTH_TOKEN = process.env.NEXT_PUBLIC_PAYHERO_AUTH_TOKEN || '';

class PayHeroApiClient {
  constructor() {
    this.baseUrl = PAYHERO_BASE_URL;
    this.authToken = PAYHERO_AUTH_TOKEN;
  }

  /**
   * Build common request headers
   */
  _headers() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Basic ${this.authToken}`,
    };
  }

  /**
   * Generic POST request
   * @param {string} endpoint  - e.g. '/payments'
   * @param {object} body      - request payload
   * @returns {Promise<object>} parsed JSON response
   */
  async post(endpoint, body) {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        data?.message ||
        data?.error ||
        data?.detail ||
        `PayHero API error (${res.status})`;
      throw new PayHeroApiError(message, res.status, data);
    }

    return data;
  }

  /**
   * Generic GET request
   * @param {string} endpoint  - e.g. '/transaction-status/REF123'
   * @returns {Promise<object>} parsed JSON response
   */
  async get(endpoint) {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this._headers(),
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        data?.message ||
        data?.error ||
        data?.detail ||
        `PayHero API error (${res.status})`;
      throw new PayHeroApiError(message, res.status, data);
    }

    return data;
  }
}

/**
 * Custom error class for PayHero API errors
 */
export class PayHeroApiError extends Error {
  constructor(message, statusCode, raw) {
    super(message);
    this.name = 'PayHeroApiError';
    this.statusCode = statusCode;
    this.raw = raw;
  }
}

// Export singleton
const payHeroApiClient = new PayHeroApiClient();
export default payHeroApiClient;