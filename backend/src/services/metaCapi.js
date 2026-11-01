// backend/src/services/metaCapi.js
// Meta Conversions API (CAPI) server-side event dispatcher

import crypto from 'crypto';

const sha = (v) =>
  v ? crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex') : undefined;

const phone = (p) => {
  const d = String(p || '').replace(/\D/g, '');
  return d.length === 10 ? '91' + d : d;
};

export async function sendCapi({
  eventName,
  eventId,
  sourceUrl = 'https://astroskulture.in',
  user = {},
  custom = {},
  ip,
  userAgent,
}) {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;

  if (!pixelId || !token) {
    console.log(`[CAPI] Skipped ${eventName} (META_PIXEL_ID or META_CAPI_TOKEN not configured)`);
    return;
  }

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: sourceUrl,
        action_source: 'website',
        user_data: {
          em: user.email ? [sha(user.email)] : undefined,
          ph: user.phone ? [sha(phone(user.phone))] : undefined,
          fn: user.firstName ? sha(user.firstName) : undefined,
          ln: user.lastName ? sha(user.lastName) : undefined,
          ct: user.city ? sha(user.city) : undefined,
          st: user.state ? sha(user.state) : undefined,
          zp: user.pincode ? sha(user.pincode) : undefined,
          country: sha('in'),
          external_id: user.id ? [sha(user.id)] : undefined,
          fbp: user.fbp || undefined,
          fbc: user.fbc || undefined,
          client_ip_address: ip,
          client_user_agent: userAgent,
        },
        custom_data: { currency: 'INR', ...custom },
      },
    ],
    ...(process.env.META_TEST_EVENT_CODE && {
      test_event_code: process.env.META_TEST_EVENT_CODE,
    }),
  };

  try {
    const url = `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${token}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[CAPI Error] status: ${res.status}`, errText);
    } else {
      const result = await res.json();
      console.log(`[CAPI Success] Sent ${eventName} (eventId: ${eventId})`, result);
    }
  } catch (error) {
    console.error('[CAPI Exception]', error.message);
  }
}
