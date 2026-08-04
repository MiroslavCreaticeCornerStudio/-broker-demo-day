import type { APIRoute } from 'astro';

export const prerender = false;

const CRM_ENDPOINT = import.meta.env.CRM_ENDPOINT || 'https://skyguru.ai/api/v1/public/leads';
const CRM_FORM_NAME = import.meta.env.CRM_FORM_NAME || 'Broker For a day';

/**
 * Receives the "Запази място" form and forwards it to SkyGuru CRM
 * (public leads endpoint, no auth — only `phone` is required there;
 * all other fields are accepted and optional).
 *
 * Payload mirrors the proven Webinar integration: flat keys (Laravel reads
 * individual inputs), `form` feeds SkyGuru's native "Форма" field with
 * `form_name` as a custom-field fallback, plus ad attribution passthrough
 * (fbclid/fbc/fbp, utm_*, landing_page, captured_at).
 */
export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400);
  }

  const trim = (v: unknown): string | undefined =>
    typeof v === 'string' && v.trim() ? v.trim() : undefined;

  const name = trim(body.name);
  const phone = trim(body.phone);
  const email = trim(body.email);

  if (!name || !phone || !email) {
    return json({ ok: false, error: 'Missing required fields' }, 422);
  }

  const payload: Record<string, unknown> = {
    name,
    phone,
    email,
    consent: true, // the form cannot be submitted without the consent checkbox
    message: trim(body.message),
    form: CRM_FORM_NAME,
    form_name: CRM_FORM_NAME,
    source: 'home2u-broker-za-1-den',
    // ad attribution / tracking (sent flat by the form's h2u_attribution capture)
    fbclid: trim(body.fbclid),
    fbc: trim(body.fbc),
    fbp: trim(body.fbp),
    gclid: trim(body.gclid),
    utm_source: trim(body.utm_source),
    utm_medium: trim(body.utm_medium),
    utm_campaign: trim(body.utm_campaign),
    utm_term: trim(body.utm_term),
    utm_content: trim(body.utm_content),
    landing_page: trim(body.landing_page) ?? trim(body.page),
    captured_at: trim(body.captured_at),
  };

  // Fallback: parse UTM / click ids from the page URL the form was submitted on.
  try {
    const pageUrl = new URL(typeof body.page === 'string' ? body.page : '');
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid']) {
      if (!payload[key]) {
        const value = pageUrl.searchParams.get(key);
        if (value) payload[key] = value;
      }
    }
  } catch {
    /* no page URL — skip UTM fallback */
  }

  // Drop empty values so we don't send a wall of nulls.
  for (const key of Object.keys(payload)) {
    const value = payload[key];
    if (value === undefined || value === null || value === '') delete payload[key];
  }

  const crmResponse = await fetch(CRM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!crmResponse.ok) {
    const detail = await crmResponse.text().catch(() => '');
    console.error('CRM lead failed:', crmResponse.status, detail);
    return json({ ok: false, error: 'CRM rejected the lead' }, 502);
  }

  return json({ ok: true });
};

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
